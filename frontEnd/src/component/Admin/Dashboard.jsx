import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import { BUSINESS_INFO, STORAGE_KEYS } from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");

const STATUS_ORDER = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number(value));

const timestamp = (value) => {
  const date = new Date(value || 0).getTime();
  return Number.isFinite(date) ? date : 0;
};

const formatDate = (value) => {
  if (!value || !timestamp(value)) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return value ? String(value) : "";
};

const getStatus = (order) => {
  const raw = String(order.status || "").trim();
  return (
    STATUS_ORDER.find(
      (status) => status.toLowerCase() === raw.toLowerCase()
    ) || raw || "Unknown"
  );
};

const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(
    String(order.status || "").trim().toLowerCase()
  );

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const getCustomer = (order) => {
  const address = order.shippingAddress || {};
  const name = `${address.firstName || ""} ${address.lastName || ""}`.trim();

  return name || order.user?.name || "Guest";
};

const getOrderSummary = (order) => {
  const items = Array.isArray(order.items) ? order.items : [];

  if (!items.length) return "No item details";

  const firstName = items[0]?.name || "Product";

  return items.length > 1
    ? `${firstName} +${items.length - 1} more`
    : firstName;
};

const getChange = (current, previous) => {
  if (previous === 0) {
    return current > 0
      ? "No previous-month baseline"
      : "No change this month";
  }

  const change = ((current - previous) / previous) * 100;

  return `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs. previous month`;
};


/* Colour per fulfillment status (used by the ring + list + badges) */
const STATUS_STYLE = {
  Pending: { color: "#c9b28f", badge: "bg-sand/60 text-ink" },
  Processing: { color: "#8a5a5f", badge: "bg-wine-soft text-wine" },
  Shipped: { color: "#2b2523", badge: "bg-ink text-paper" },
  Delivered: { color: "#4f7a5a", badge: "bg-success/15 text-success" },
  Cancelled: { color: "#a33a3a", badge: "bg-danger/10 text-danger" },
};

const statusStyle = (status) =>
  STATUS_STYLE[status] || { color: "#b9b0a6", badge: "bg-linen text-muted" };

const ProductThumbnail = ({ image, rank }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="grid h-[70px] w-[62px] shrink-0 place-items-center overflow-hidden bg-linen font-serif text-lg text-wine">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <span>{String(rank).padStart(2, "0")}</span>
      )}
    </div>
  );
};

/* Card that tilts in 3D with the mouse (desktop only) */
const TiltCard = ({ className = "", children }) => {
  const ref = useRef(null);

  const handleMove = (event) => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.transform = `rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div onMouseMove={handleMove} onMouseLeave={handleLeave} className="perspective-[1400px]">
      <div ref={ref} className={`transform-3d transition-transform duration-500 ease-soft ${className}`}>
        {children}
      </div>
    </div>
  );
};

const panelClass = "min-w-0 border border-line bg-paper";
const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-wine";

const SectionHeading = ({ eyebrow, title, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-6">
    <div>
      <p className={eyebrowClass}>{eyebrow}</p>
      <h2 className="mt-1 font-serif text-2xl leading-tight text-ink sm:text-[28px]">{title}</h2>
    </div>
    {children}
  </div>
);

const TextLink = ({ to, children }) => (
  <Link
    to={to}
    className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-semibold text-ink hover:text-wine"
  >
    {children}
    <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </Link>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        let token;

        try {
          token = localStorage.getItem(STORAGE_KEYS.token);
        } catch {
          throw new Error("Unable to access your login. Please sign in again.");
        }

        if (!token?.trim()) {
          throw new Error("Please sign in with an admin account.");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const results = await Promise.allSettled(
          ["products", "orders", "users"].map(async (resource) => {
            const response = await fetch(`${apiBase}/api/${resource}`, {
              headers,
              signal: controller.signal,
            });

            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                body.message ||
                  (response.status === 401 || response.status === 403
                    ? "Your admin access could not be verified. Please sign in again."
                    : `Unable to load ${resource}.`)
              );
            }

            if (!Array.isArray(body[resource])) {
              throw new Error(`The ${resource} response is incomplete.`);
            }

            return body[resource].filter(
              (item) => item && typeof item === "object"
            );
          })
        );

        const failed = results.find((result) => result.status === "rejected");
        if (failed) throw failed.reason;

        if (active) {
          setData({
            products: results[0].value,
            orders: results[1].value,
            users: results[2].value,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setErrorMessage(error.message || "Unable to load dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const overview = useMemo(() => {
    if (!data) return null;

    const { orders, products, users, updatedAt } = data;
    const year = updatedAt.getFullYear();
    const month = updatedAt.getMonth();
    const previous = new Date(year, month - 1, 1);

    const inMonth = (item, targetYear, targetMonth) => {
      if (!item.createdAt || !timestamp(item.createdAt)) return false;

      const date = new Date(item.createdAt);

      return (
        date.getFullYear() === targetYear &&
        date.getMonth() === targetMonth
      );
    };

    const countCurrent = (items) =>
      items.filter((item) => inMonth(item, year, month)).length;

    const countPrevious = (items) =>
      items.filter((item) =>
        inMonth(item, previous.getFullYear(), previous.getMonth())
      ).length;

    const eligibleOrders = orders.filter((order) => !isCancelled(order));
    const customers = users.filter(
      (user) => String(user.role || "").toLowerCase() !== "admin"
    );

    const totalValue = eligibleOrders.reduce(
      (sum, order) => sum + number(order.totalAmount),
      0
    );

    const currentValue = eligibleOrders
      .filter((order) => inMonth(order, year, month))
      .reduce((sum, order) => sum + number(order.totalAmount), 0);

    const previousValue = eligibleOrders
      .filter((order) =>
        inMonth(order, previous.getFullYear(), previous.getMonth())
      )
      .reduce((sum, order) => sum + number(order.totalAmount), 0);

    const months = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(year, month - 11 + index, 1);

      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        year: date.getFullYear(),
        month: date.getMonth(),
        label: date.toLocaleDateString("en-US", { month: "short" }),
        fullLabel: date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        value: 0,
      };
    });

    eligibleOrders.forEach((order) => {
      if (!order.createdAt || !timestamp(order.createdAt)) return;

      const date = new Date(order.createdAt);
      const bucket = months.find(
        (item) =>
          item.year === date.getFullYear() &&
          item.month === date.getMonth()
      );

      if (bucket) bucket.value += number(order.totalAmount);
    });

    const maxValue = Math.max(...months.map((item) => item.value), 1);
    const periodValue = months.reduce((sum, item) => sum + item.value, 0);

    const statusNames = [
      ...STATUS_ORDER,
      ...new Set(
        orders.map(getStatus).filter((status) => !STATUS_ORDER.includes(status))
      ),
    ];

    const statuses = statusNames.map((status) => {
      const count = orders.filter((order) => getStatus(order) === status).length;

      return {
        status,
        count,
        percent: orders.length ? (count / orders.length) * 100 : 0,
      };
    });

    const productMap = new Map(
      products.map((product) => [getId(product), product])
    );
    const sales = new Map();

    eligibleOrders.forEach((order) => {
      const items = Array.isArray(order.items) ? order.items : [];

      items.forEach((item) => {
        if (!item || typeof item !== "object") return;

        const productId = getId(item.product);
        const key = productId || String(item.name || "Unknown product");
        const product = productMap.get(productId);
        const entry = sales.get(key) || {
          key,
          name: product?.name || item.name || "Product",
          category: product?.category || "Uncategorised",
          image: product?.images?.[0] || item.image || "",
          units: 0,
          value: 0,
        };

        const quantity = Math.max(0, number(item.quantity));
        entry.units += quantity;
        entry.value += number(item.price) * quantity;
        sales.set(key, entry);
      });
    });

    return {
      totalValue,
      currentValue,
      periodValue,
      average: eligibleOrders.length
        ? totalValue / eligibleOrders.length
        : 0,
      valueChange: getChange(currentValue, previousValue),
      months: months.map((item) => ({
        ...item,
        height: Math.max(0, (item.value / maxValue) * 100),
      })),
      statuses,
      recentOrders: [...orders]
        .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
        .slice(0, 5),
      topProducts: [...sales.values()]
        .sort((a, b) => b.value - a.value)
        .slice(0, 4),
      stats: [
        {
          title: "Orders",
          value: orders.length,
          change: getChange(countCurrent(orders), countPrevious(orders)),
          Icon: ShoppingCart,
          href: "/admin/orders",
        },
        {
          title: "Products",
          value: products.length,
          change: getChange(countCurrent(products), countPrevious(products)),
          Icon: Package,
          href: "/admin/products",
        },
        {
          title: "Customers",
          value: customers.length,
          change: getChange(countCurrent(customers), countPrevious(customers)),
          Icon: Users,
          href: "/admin/users",
        },
      ],
    };
  }, [data]);

  /* bars + rings grow in after each successful load */
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    if (!overview) return undefined;
    setGrown(false);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => setGrown(true))
    );
    return () => cancelAnimationFrame(frame);
  }, [overview]);

  /* conic-gradient ring for fulfillment status */
  const ring = useMemo(() => {
    if (!overview) return "";
    let start = 0;
    const stops = overview.statuses
      .filter((row) => row.count > 0)
      .map((row) => {
        const end = start + row.percent;
        const stop = `${statusStyle(row.status).color} ${start}% ${end}%`;
        start = end;
        return stop;
      });
    return stops.length
      ? `conic-gradient(${stops.join(", ")})`
      : "conic-gradient(var(--color-linen) 0% 100%)";
  }, [overview]);

  const totalOrders = overview
    ? overview.statuses.reduce((sum, row) => sum + row.count, 0)
    : 0;

  return (
    <div className="min-w-0 font-sans text-ink">
      {/* ============ Heading ============ */}
      <header className="flex flex-col items-start justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className={`${eyebrowClass} animate-rise`}>
            {BUSINESS_INFO.businessName} / Admin
          </p>
          <h1 className="mt-2 font-serif text-[clamp(38px,5vw,64px)] leading-[0.95] tracking-[-0.03em] perspective-distant">
            <span className="inline-block animate-fold-in [animation-delay:80ms]">Store</span>{" "}
            <em className="inline-block animate-fold-in text-wine [animation-delay:200ms]">overview.</em>
          </h1>
          <p className="mt-3 animate-rise text-sm text-muted [animation-delay:260ms]">
            Your orders, collection and customers at a glance.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
          <button
            type="button"
            disabled={loading}
            onClick={() => setRefreshCount((value) => value + 1)}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 border border-line bg-paper px-5 text-xs font-semibold text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {loading ? "Loading…" : "Refresh"}
          </button>

          <Link
            to="/shop"
            className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine sm:flex-none"
          >
            View store
            <ArrowUpRight size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {errorMessage && (
        <div className="mt-5 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-5 py-4 text-sm text-danger" role="alert">
          {errorMessage}
          {data && <p className="mt-1.5 text-xs">The figures below show the last successful update.</p>}
        </div>
      )}

      {!data ? (
        <div
          className="mt-6 flex min-h-[360px] flex-col items-center justify-center gap-4 border border-dashed border-line bg-paper p-8 text-center text-sm text-muted"
          role={loading ? "status" : undefined}
        >
          {loading ? (
            <>
              <div aria-hidden="true" className="perspective-[600px]">
                <div className="grid size-16 place-items-center bg-ink text-paper [transform:rotateX(35deg)_rotateZ(-20deg)]">
                  <Loader2 size={26} className="animate-spin" />
                </div>
              </div>
              <p>Loading your store overview…</p>
            </>
          ) : (
            <p>Dashboard figures will appear once the data loads successfully.</p>
          )}
        </div>
      ) : (
        <div className={`transition-opacity duration-300 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          <div className="flex flex-wrap justify-end gap-2 py-4 text-[11px] text-muted">
            <span>Last updated</span>
            <time dateTime={data.updatedAt.toISOString()} className="font-semibold text-ink">
              {data.updatedAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </time>
          </div>

          {/* ============ Bento: value + stats ============ */}
          <section aria-label="Store totals" className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <TiltCard className="h-full">
              <div className="relative h-full overflow-hidden bg-ink p-6 text-paper sm:p-8">
                {/* floating folded swatches */}
                <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 hidden size-44 sm:block">
                  <span className="absolute inset-0 rotate-12 bg-wine/70 [transform:translateZ(30px)_rotate(12deg)]" />
                  <span className="absolute inset-6 -rotate-6 bg-sand/40" />
                  <span className="absolute inset-12 rotate-3 border border-dashed border-paper/40" />
                </div>

                <p className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
                  All-time order value
                </p>
                <h2 className="relative mt-4 font-serif text-[clamp(40px,5.5vw,72px)] leading-none tracking-[-0.03em] [overflow-wrap:anywhere]">
                  {money(overview.totalValue)}
                </h2>
                <p className="relative mt-4 max-w-md text-xs leading-relaxed text-paper/60">
                  Total of non-cancelled orders; this is not a confirmed
                  payment or net-profit figure.
                </p>

                <div className="relative mt-8 grid grid-cols-1 gap-5 border-t border-paper/15 pt-6 min-[400px]:grid-cols-2">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-paper/50">This month</span>
                    <strong className="mt-1 block font-serif text-3xl font-normal [overflow-wrap:anywhere]">
                      {money(overview.currentValue)}
                    </strong>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.16em] text-paper/50">Average order value</span>
                    <strong className="mt-1 block font-serif text-3xl font-normal [overflow-wrap:anywhere]">
                      {money(overview.average)}
                    </strong>
                  </div>
                </div>

                <p className="relative mt-5 inline-flex bg-paper/10 px-3 py-1.5 text-[11px] text-[#e6c4c7]">
                  {overview.valueChange}
                </p>
              </div>
            </TiltCard>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {overview.stats.map(({ title, value, change, Icon, href }, index) => (
                <Link
                  to={href}
                  key={title}
                  style={{ animationDelay: `${index * 90}ms` }}
                  className="group relative flex animate-rise items-center gap-4 overflow-hidden border border-line bg-paper p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-wine transition-transform duration-500 group-hover:scale-y-100"
                  />
                  <span className="grid size-12 shrink-0 place-items-center bg-linen text-wine transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{title}</span>
                    <strong className="block font-serif text-4xl font-normal leading-tight">{value.toLocaleString()}</strong>
                    <p className="text-[11px] text-muted">{change}</p>
                  </div>
                  <ArrowUpRight size={17} aria-hidden="true" className="ml-auto shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-wine" />
                </Link>
              ))}
            </div>
          </section>

          {/* ============ Monthly chart ============ */}
          <section className={`${panelClass} mt-4`}>
            <SectionHeading eyebrow="Monthly activity" title="Order value over time">
              <div className="text-left sm:text-right">
                <strong className="block font-serif text-2xl font-normal">{money(overview.periodValue)}</strong>
                <span className="text-[11px] text-muted">Last 12 months · non-cancelled orders</span>
              </div>
            </SectionHeading>

            <div className="no-scrollbar overflow-x-auto px-5 pb-6 pt-8 sm:px-6">
              <div className="grid min-w-[640px] grid-cols-12 gap-3" aria-label="Monthly order values">
                {overview.months.map((month, index) => (
                  <div key={month.key} className="group min-w-0 text-center">
                    <div className="relative flex h-52 items-end border-b border-line bg-[repeating-linear-gradient(to_top,transparent_0,transparent_51px,var(--color-line)_52px)]">
                      <span className="pointer-events-none absolute inset-x-0 -top-1 z-10 -translate-y-full whitespace-nowrap bg-ink px-1.5 py-1 text-[10px] text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {money(month.value)}
                      </span>
                      <div
                        style={{
                          height: grown ? `${month.height}%` : "0%",
                          transitionDelay: `${index * 45}ms`,
                        }}
                        className={`w-full transition-[height] duration-700 ease-soft group-hover:brightness-125 ${
                          index === overview.months.length - 1
                            ? "bg-wine"
                            : index % 2
                              ? "bg-sand"
                              : "bg-ink"
                        }`}
                      />
                    </div>
                    <span className="mt-2.5 block text-[11px] text-muted">{month.label}</span>
                    <span className="mt-0.5 block text-[10px] text-ink [overflow-wrap:anywhere]">{money(month.value)}</span>
                    <span className="sr-only">{month.fullLabel}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ============ Recent orders ============ */}
          <section className={`${panelClass} mt-4`}>
            <SectionHeading eyebrow="Latest activity" title="Recent orders">
              <TextLink to="/admin/orders">All orders</TextLink>
            </SectionHeading>

            {!overview.recentOrders.length ? (
              <p className="px-6 py-10 text-center text-sm text-muted">No orders have been placed yet.</p>
            ) : (
              <ul>
                {overview.recentOrders.map((order, index) => {
                  const status = getStatus(order);

                  return (
                    <li
                      key={getId(order) || index}
                      style={{ animationDelay: `${index * 70}ms` }}
                      className="grid animate-rise grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-chalk sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_120px_minmax(90px,0.6fr)_44px] md:gap-5"
                    >
                      <div className="min-w-0">
                        <strong className="block text-sm font-semibold [overflow-wrap:anywhere]">{order.orderNumber || "Order"}</strong>
                        <span className="text-[11px] text-muted">{formatDate(order.createdAt)}</span>
                      </div>

                      <span className={`justify-self-end px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] md:order-3 md:justify-self-start ${statusStyle(status).badge}`}>
                        {status}
                      </span>

                      <div className="min-w-0 md:order-2">
                        <strong className="block text-sm font-semibold [overflow-wrap:anywhere]">{getCustomer(order)}</strong>
                        <span className="text-[11px] text-muted [overflow-wrap:anywhere]">{getOrderSummary(order)}</span>
                      </div>

                      <strong className="justify-self-end font-serif text-xl font-normal md:order-4">
                        {money(order.totalAmount)}
                      </strong>

                      <Link
                        to="/admin/orders"
                        aria-label={`Open orders to review ${order.orderNumber || "this order"}`}
                        className="hidden size-11 place-items-center border border-line transition-colors hover:border-ink hover:bg-ink hover:text-paper md:order-5 md:grid"
                      >
                        <ArrowUpRight size={18} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ============ Status + top products ============ */}
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <section className={panelClass}>
              <SectionHeading eyebrow="Order distribution" title="Fulfillment status" />

              <div className="grid items-center gap-6 p-5 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-6">
                {/* 3D tilted ring */}
                <div aria-hidden="true" className="mx-auto perspective-[700px]">
                  <div
                    style={{ background: ring }}
                    className={`relative grid size-40 place-items-center rounded-full shadow-[0_24px_30px_-18px_rgba(0,0,0,0.45)] transition-transform duration-1000 ease-soft hover:[transform:rotateX(0deg)] ${
                      grown ? "[transform:rotateX(28deg)]" : "[transform:rotateX(28deg)_rotateZ(-180deg)_scale(0.6)]"
                    }`}
                  >
                    <div className="grid size-24 place-items-center rounded-full bg-paper text-center">
                      <div>
                        <strong className="block font-serif text-3xl font-normal leading-none">{totalOrders}</strong>
                        <span className="text-[9px] uppercase tracking-[0.18em] text-muted">Orders</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {overview.statuses.map((row) => (
                    <div key={row.status}>
                      <div className="mb-1.5 flex justify-between gap-3 text-xs">
                        <span className="flex items-center gap-2">
                          <span className="size-2.5 rounded-full" style={{ background: statusStyle(row.status).color }} />
                          {row.status}
                        </span>
                        <strong className="font-semibold">
                          {row.count} <span className="font-normal text-muted"> / {row.percent.toFixed(0)}%</span>
                        </strong>
                      </div>
                      <div className="h-1.5 bg-linen" aria-hidden="true">
                        <span
                          className="block h-full transition-[width] duration-1000 ease-soft"
                          style={{
                            width: grown ? `${row.percent}%` : "0%",
                            background: statusStyle(row.status).color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={panelClass}>
              <SectionHeading eyebrow="Ranked by order item value" title="Top products">
                <TextLink to="/admin/products">Manage</TextLink>
              </SectionHeading>

              {!overview.topProducts.length ? (
                <p className="px-6 py-10 text-center text-sm text-muted">
                  Products will appear here when order activity is available.
                </p>
              ) : (
                <ol>
                  {overview.topProducts.map((product, index) => (
                    <li
                      key={product.key}
                      className="group flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 transition-colors last:border-b-0 hover:bg-chalk sm:flex-nowrap sm:px-6"
                    >
                      <span className="w-6 shrink-0 font-serif text-2xl text-line transition-colors group-hover:text-wine">
                        {index + 1}
                      </span>
                      <ProductThumbnail image={product.image} rank={index + 1} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-snug [overflow-wrap:anywhere]">{product.name}</h3>
                        <p className="mt-0.5 text-[11px] text-wine">{product.category}</p>
                        <span className="text-[11px] text-muted">{product.units.toLocaleString()} units ordered</span>
                      </div>
                      <strong className="ml-auto font-serif text-xl font-normal">{money(product.value)}</strong>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px] text-muted">
            <span>{BUSINESS_INFO.businessName} / Store management</span>
            <div className="flex gap-5">
              <Link to="/admin/products" className="inline-flex min-h-11 items-center hover:text-wine">Products</Link>
              <Link to="/admin/orders" className="inline-flex min-h-11 items-center hover:text-wine">Orders</Link>
              <Link to="/admin/users" className="inline-flex min-h-11 items-center hover:text-wine">Customers</Link>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};

export default Dashboard;