import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ImageOff,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import { BUSINESS_INFO, STORAGE_KEYS } from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
const API_URL = `${apiBase}/api/orders`;

const STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const getId = (order) => String(order?._id || order?.id || "");

const numeric = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric(value));

const timestamp = (value) => {
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value) =>
  value && timestamp(value)
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

const customerName = (order) => {
  const address = order.shippingAddress || {};
  const name = `${address.firstName || ""} ${address.lastName || ""}`.trim();

  return name || order.user?.name || "Guest";
};

const customerEmail = (order) =>
  order.shippingAddress?.email || order.user?.email || "";

const shippingAddress = (order) => {
  const address = order.shippingAddress || {};

  return [
    address.address,
    address.apartment,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const orderItems = (order) =>
  Array.isArray(order?.items)
    ? order.items.filter((item) => item && typeof item === "object")
    : [];

const itemCount = (order) =>
  orderItems(order).reduce(
    (sum, item) => sum + Math.max(0, numeric(item.quantity)),
    0
  );

const orderStatus = (order) => {
  const raw = String(order.status || "").trim();

  if (raw.toLowerCase() === "canceled") return "Cancelled";

  return (
    STATUSES.find((status) => status.toLowerCase() === raw.toLowerCase()) ||
    raw ||
    "Unknown"
  );
};

const authHeaders = () => {
  let token;

  try {
    token = localStorage.getItem(STORAGE_KEYS.token);
  } catch {
    throw new Error("Unable to access your login. Please sign in again.");
  }

  if (!token?.trim()) {
    throw new Error("Please sign in with an admin account.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/* Colour per fulfillment status (matches the dashboard) */
const STATUS_STYLE = {
  Pending: { dot: "#c9b28f", badge: "bg-sand/60 text-ink" },
  Processing: { dot: "#8a5a5f", badge: "bg-wine-soft text-wine" },
  Shipped: { dot: "#2b2523", badge: "bg-ink text-paper" },
  Delivered: { dot: "#4f7a5a", badge: "bg-success/15 text-success" },
  Cancelled: { dot: "#a33a3a", badge: "bg-danger/10 text-danger" },
};

const statusStyle = (status) =>
  STATUS_STYLE[status] || { dot: "#b9b0a6", badge: "bg-linen text-muted" };

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyle(status).badge}`}
  >
    <span className="size-1.5 rounded-full" style={{ background: statusStyle(status).dot }} />
    {status}
  </span>
);

const FLOW = ["Pending", "Processing", "Shipped", "Delivered"];

const ItemImage = ({ image }) => {
  const value = typeof image === "string" ? image.trim() : "";
  const src = value
    ? /^https?:\/\//i.test(value)
      ? value
      : `${apiBase}/${value.replace(/^\/+/, "")}`
    : "";

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="grid h-[62px] w-[54px] shrink-0 place-items-center overflow-hidden bg-linen text-muted">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain p-1"
        />
      ) : (
        <ImageOff size={20} aria-hidden="true" />
      )}
    </div>
  );
};

const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-wine";
const fieldClass =
  "min-h-12 w-full min-w-0 border border-line bg-paper px-3 text-base text-ink outline-none transition-colors focus:border-ink sm:text-sm";


const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedId, setSelectedId] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [notice, setNotice] = useState("");

  const detailRef = useRef(null);
  const mountedRef = useRef(true);
  const mutationRef = useRef(null);
  const mutationLock = useRef(false);
  const selectionRef = useRef("");

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      mutationRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(API_URL, {
          headers: authHeaders(),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load orders.");
        }

        if (!Array.isArray(data.orders)) {
          throw new Error("The orders response is incomplete.");
        }

        if (active) {
          setOrders(
            data.orders.filter(
              (order) => order && typeof order === "object" && getId(order)
            )
          );
          setLoaded(true);
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setFetchError(error.message || "Unable to load orders.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const selectedOrder = orders.find((order) => getId(order) === selectedId);

  const selectedStatus = selectedOrder ? orderStatus(selectedOrder) : "";

  useEffect(() => {
    setDraftStatus(selectedStatus);
  }, [selectedId, selectedStatus]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = orders.filter((order) => {
      const searchable = [
        order.orderNumber,
        customerName(order),
        customerEmail(order),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchable.includes(query)) &&
        (statusFilter === "All" || orderStatus(order) === statusFilter)
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "Highest") {
        return numeric(b.totalAmount) - numeric(a.totalAmount);
      }

      if (sortBy === "Lowest") {
        return numeric(a.totalAmount) - numeric(b.totalAmount);
      }

      if (sortBy === "Items") return itemCount(b) - itemCount(a);

      return timestamp(b.createdAt) - timestamp(a.createdAt);
    });
  }, [orders, searchTerm, statusFilter, sortBy]);

  const summary = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => orderStatus(order) === "Pending").length,
      processing: orders.filter(
        (order) => orderStatus(order) === "Processing"
      ).length,
      delivered: orders.filter(
        (order) => orderStatus(order) === "Delivered"
      ).length,
      value: orders
        .filter((order) => orderStatus(order) !== "Cancelled")
        .reduce((sum, order) => sum + numeric(order.totalAmount), 0),
    }),
    [orders]
  );

  const openOrder = (order) => {
    const orderId = getId(order);

    selectionRef.current = orderId;
    setSelectedId(orderId);
    setDraftStatus(orderStatus(order));
    setUpdateError("");
    setNotice("");

    requestAnimationFrame(() => {
      detailRef.current?.focus();

      if (window.matchMedia("(max-width: 1000px)").matches) {
        detailRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
      }
    });
  };

  const closeOrder = () => {
    selectionRef.current = "";
    setSelectedId("");
    setUpdateError("");
    setNotice("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSortBy("Newest");
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (
      mutationLock.current ||
      loading ||
      !selectedOrder ||
      !STATUSES.includes(draftStatus) ||
      draftStatus === selectedStatus
    ) {
      return;
    }

    const orderId = getId(selectedOrder);
    const controller = new AbortController();

    mutationRef.current = controller;
    mutationLock.current = true;
    setUpdating(true);
    setUpdateError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(orderId)}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          signal: controller.signal,
          body: JSON.stringify({ status: draftStatus }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order status.");
      }

      if (!data.order || getId(data.order) !== orderId) {
        throw new Error(
          "The update response is incomplete. Refresh to check the current status."
        );
      }

      if (!mountedRef.current) return;

      setOrders((current) =>
        current.map((order) =>
          getId(order) === orderId ? data.order : order
        )
      );

      if (selectionRef.current === orderId) {
        setNotice("Order status updated successfully.");
      }
    } catch (error) {
      if (
        mountedRef.current &&
        error.name !== "AbortError" &&
        selectionRef.current === orderId
      ) {
        setUpdateError(error.message || "Unable to update order status.");
      }
    } finally {
      mutationLock.current = false;

      if (mountedRef.current) setUpdating(false);

      if (mutationRef.current === controller) {
        mutationRef.current = null;
      }
    }
  };

  const stats = [
    ["Total orders", summary.total],
    ["Pending", summary.pending],
    ["Processing", summary.processing],
    ["Delivered", summary.delivered],
  ];

  const filterOptions = [
    "All",
    ...STATUSES,
    ...new Set(
      orders.map(orderStatus).filter((status) => !STATUSES.includes(status))
    ),
  ];

  const drawerOpen = Boolean(selectedId);

  /* drawer: Escape closes, page behind does not scroll */
  useEffect(() => {
    if (!drawerOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") closeOrder();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen]);

  const statusCount = (status) =>
    status === "All"
      ? orders.length
      : orders.filter((order) => orderStatus(order) === status).length;

  const flowIndex = FLOW.indexOf(selectedStatus);

  return (
    <div className="min-w-0 font-sans text-ink">
      {/* ============ Heading ============ */}
      <header className="flex flex-col items-start justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className={`${eyebrowClass} animate-rise`}>
            {BUSINESS_INFO.businessName} / Admin
          </p>
          <h1 className="mt-2 font-serif text-[clamp(38px,5vw,64px)] leading-[0.95] tracking-[-0.03em] perspective-distant">
            <span className="inline-block animate-fold-in [animation-delay:80ms]">Order</span>{" "}
            <em className="inline-block animate-fold-in text-wine [animation-delay:200ms]">desk.</em>
          </h1>
          <p className="mt-3 animate-rise text-sm text-muted [animation-delay:260ms]">
            Review purchases and manage fulfillment from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setRefreshCount((count) => count + 1)}
          disabled={loading || updating}
          className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          {loading ? "Loading…" : "Refresh orders"}
        </button>
      </header>

      {fetchError && (
        <div className="mt-5 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-5 py-4 text-sm text-danger" role="alert">
          {fetchError}
          {loaded && <p className="mt-1.5 text-xs">The list shows the last successfully loaded data.</p>}
        </div>
      )}

      {/* ============ Pipeline summary ============ */}
      <section aria-label="Order totals" className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {stats.map(([label, value], index) => (
            <div
              key={label}
              style={{ animationDelay: `${index * 90}ms` }}
              className="group relative min-w-0 animate-rise bg-paper p-5 text-center"
            >
              <span className="relative mx-auto grid size-9 place-items-center rounded-full border border-line bg-chalk font-serif text-sm text-wine transition-transform duration-700 group-hover:[transform:rotateY(360deg)]">
                {index + 1}
              </span>
              <strong className="mt-3 block font-serif text-4xl font-normal leading-none [overflow-wrap:anywhere]">
                {loaded ? value.toLocaleString() : "—"}
              </strong>
              <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden bg-ink p-6 text-paper">
          <span aria-hidden="true" className="absolute -right-10 -top-10 size-36 rotate-12 bg-wine/60" />
          <span className="relative block text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
            Non-cancelled order value
          </span>
          <strong className="relative mt-3 block font-serif text-[clamp(34px,4vw,48px)] font-normal leading-none [overflow-wrap:anywhere]">
            {loaded ? money(summary.value) : "—"}
          </strong>
        </div>
      </section>

      {/* ============ Tools ============ */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex min-w-0 items-center gap-3 border border-line bg-paper px-4 transition-colors focus-within:border-ink">
          <Search size={18} aria-hidden="true" className="shrink-0 text-muted" />
          <label htmlFor="orders-search" className="sr-only">
            Search by order number, customer or email
          </label>
          <input
            id="orders-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Order number, customer or email…"
            className="min-h-14 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-sm placeholder:text-muted"
          />
        </div>

        <div className="flex flex-col justify-center border border-line bg-paper px-4 py-1.5 transition-colors focus-within:border-ink">
          <label htmlFor="orders-sort" className="text-[10px] uppercase tracking-[0.16em] text-muted">
            Sort by
          </label>
          <select
            id="orders-sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="min-h-8 w-full bg-transparent text-base text-ink outline-none sm:text-sm"
          >
            <option value="Newest">Newest</option>
            <option value="Highest">Highest value</option>
            <option value="Lowest">Lowest value</option>
            <option value="Items">Most units</option>
          </select>
        </div>
      </div>

      {/* status chips (same filter as before, shown as tabs) */}
      <div role="group" aria-label="Status" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {filterOptions.map((status) => {
          const active = statusFilter === status;

          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(status)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-4 text-xs font-semibold transition-all duration-300 ${
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-line bg-paper text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {status !== "All" && (
                <span className="size-2 rounded-full" style={{ background: statusStyle(status).dot }} />
              )}
              {status}
              {loaded && <span className={`text-[10px] ${active ? "text-paper/60" : "text-muted/70"}`}>{statusCount(status)}</span>}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-14 items-center justify-between gap-4 text-xs text-muted">
        <span role="status" aria-live="polite">
          {loading
            ? "Loading orders…"
            : loaded
            ? `${filteredOrders.length} of ${orders.length} orders`
            : "Orders unavailable"}
        </span>

        {(searchTerm || statusFilter !== "All" || sortBy !== "Newest") && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline underline-offset-4 hover:text-wine"
          >
            <X size={14} aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      {/* ============ Orders list ============ */}
      <section aria-label="Customer orders" aria-busy={loading} className="min-w-0 border border-line bg-paper">
        {/* desktop column labels */}
        <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_130px_minmax(0,0.8fr)_120px] gap-5 border-b border-line bg-linen/50 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted lg:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span className="text-right">Total</span>
          <span className="sr-only">Actions</span>
        </div>

        {loading && !loaded ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted" role="status">
            <Loader2 size={28} className="animate-spin text-wine" aria-hidden="true" />
            <p>Loading customer orders…</p>
          </div>
        ) : !loaded ? (
          <div className="flex min-h-64 items-center justify-center p-8 text-center text-sm text-muted">
            <p>Refresh to load your orders.</p>
          </div>
        ) : !filteredOrders.length ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center text-sm text-muted">
            <p>{orders.length ? "No matching orders." : "No orders yet."}</p>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine"
              >
                View all orders
              </button>
            )}
          </div>
        ) : (
          <ul>
            {filteredOrders.map((order, index) => {
              const orderId = getId(order);
              const selected = selectedId === orderId;

              return (
                <li
                  key={orderId}
                  style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
                  className={`group relative grid animate-rise grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-line px-5 py-4 transition-colors last:border-b-0 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_130px_minmax(0,0.8fr)_120px] lg:gap-5 ${
                    selected ? "bg-wine-soft/60" : "hover:bg-chalk"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-[3px] origin-top bg-wine transition-transform duration-500 ${
                      selected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
                    }`}
                  />

                  <div className="min-w-0">
                    <strong className="block text-sm font-semibold [overflow-wrap:anywhere]">{order.orderNumber || "Order"}</strong>
                    <span className="text-[11px] text-muted">
                      {itemCount(order)} units · {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="justify-self-end lg:order-3 lg:justify-self-start">
                    <StatusBadge status={orderStatus(order)} />
                  </div>

                  <div className="min-w-0 lg:order-2">
                    <h2 className="text-sm font-semibold [overflow-wrap:anywhere]">{customerName(order)}</h2>
                    <p className="text-[11px] text-muted [overflow-wrap:anywhere]">{customerEmail(order) || "Email not provided"}</p>
                  </div>

                  <strong className="justify-self-end font-serif text-xl font-normal lg:order-4">
                    {money(order.totalAmount)}
                  </strong>

                  <button
                    type="button"
                    onClick={() => openOrder(order)}
                    aria-label={`View ${order.orderNumber || "order"} details`}
                    aria-pressed={selected}
                    className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 border border-line px-4 text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper lg:order-5 lg:col-span-1"
                  >
                    Details
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ============ Detail drawer ============ */}
      <button
        type="button"
        aria-label="Close order details"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeOrder}
        className={`fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-[520px] perspective-[1600px] ${drawerOpen ? "" : "pointer-events-none"}`}>
        <section
          ref={detailRef}
          tabIndex={-1}
          aria-labelledby="orders-detail-title"
          aria-hidden={!drawerOpen}
          className={`flex h-full origin-right flex-col bg-paper shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.5)] outline-none transition-all duration-500 ease-drape ${
            drawerOpen
              ? "visible [transform:rotateY(0deg)] opacity-100"
              : "invisible [transform:rotateY(-35deg)_translateX(40%)] opacity-0"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line bg-ink px-5 py-5 text-paper sm:px-6">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">Order details</p>
              <h2 id="orders-detail-title" className="mt-1 truncate font-serif text-3xl">
                {selectedOrder?.orderNumber || "Review an order"}
              </h2>
            </div>

            {selectedId && (
              <button
                type="button"
                onClick={closeOrder}
                aria-label="Close order details"
                className="grid size-11 shrink-0 place-items-center border border-paper/20 transition-colors hover:bg-paper hover:text-ink"
              >
                <X size={19} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {!selectedOrder ? (
              <div className="flex min-h-64 items-center justify-center p-8 text-center text-sm text-muted">
                <p>
                  {selectedId
                    ? "This order is no longer in the loaded list."
                    : "Select Details on an order to review its items and shipping information."}
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4 text-xs text-muted">
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                  <StatusBadge status={selectedStatus} />
                </div>

                {/* progress thread */}
                {selectedStatus !== "Cancelled" && (
                  <ol aria-hidden="true" className="relative mt-6 grid grid-cols-4">
                    <span className="absolute left-[12.5%] right-[12.5%] top-[9px] h-0.5 bg-line" />
                    <span
                      className="absolute left-[12.5%] top-[9px] h-0.5 bg-wine transition-[width] duration-700 ease-soft"
                      style={{ width: `${Math.max(0, flowIndex) * 25}%` }}
                    />
                    {FLOW.map((step, index) => {
                      const done = flowIndex >= index;

                      return (
                        <li key={step} className="relative grid justify-items-center gap-2 text-center">
                          <span
                            className={`size-5 rounded-full border-2 transition-colors duration-500 ${
                              done ? "border-wine bg-wine" : "border-line bg-paper"
                            }`}
                          />
                          <span className={`text-[10px] font-semibold ${done ? "text-ink" : "text-muted"}`}>{step}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <form onSubmit={handleStatusUpdate} className="mt-6 border border-line bg-chalk p-4">
                  <label htmlFor="orders-update-status" className="mb-2 block text-xs font-semibold">
                    Fulfillment status
                  </label>

                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <select
                      id="orders-update-status"
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value)}
                      disabled={updating || loading}
                      className={`${fieldClass} flex-1`}
                    >
                      {!STATUSES.includes(selectedStatus) && (
                        <option value={selectedStatus}>{selectedStatus}</option>
                      )}
                      {STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      disabled={
                        updating ||
                        loading ||
                        draftStatus === selectedStatus ||
                        !STATUSES.includes(draftStatus)
                      }
                      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updating && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                      {updating ? "Saving…" : "Save status"}
                    </button>
                  </div>

                  {updateError && (
                    <p className="mt-3 text-xs text-danger" role="alert">
                      {updateError}
                    </p>
                  )}

                  <p className="text-xs text-success empty:hidden [&:not(:empty)]:mt-3" role="status" aria-live="polite">
                    {notice}
                  </p>
                </form>

                <div className="mt-2 grid gap-0 sm:grid-cols-2 sm:gap-6">
                  <div className="border-b border-line py-5 sm:border-b-0">
                    <h3 className={eyebrowClass}>Customer</h3>
                    <p className="mt-2 text-sm font-semibold [overflow-wrap:anywhere]">{customerName(selectedOrder)}</p>
                    {customerEmail(selectedOrder) && (
                      <p className="text-sm text-muted [overflow-wrap:anywhere]">{customerEmail(selectedOrder)}</p>
                    )}
                    {selectedOrder.shippingAddress?.phone && (
                      <p className="text-sm text-muted">{selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>

                  <div className="py-5">
                    <h3 className={eyebrowClass}>Shipping address</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                      {shippingAddress(selectedOrder) || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-line pt-5">
                  <h3 className={eyebrowClass}>Ordered items</h3>

                  {!orderItems(selectedOrder).length ? (
                    <p className="mt-3 text-sm text-muted">No item details provided.</p>
                  ) : (
                    <ul className="mt-2">
                      {orderItems(selectedOrder).map((item, index) => (
                        <li key={index} className="flex flex-wrap items-center gap-3 border-b border-dashed border-line py-3 last:border-b-0 min-[400px]:flex-nowrap">
                          <ItemImage
                            image={
                              item.image ||
                              item.product?.images?.[0] ||
                              item.product?.image
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold leading-snug [overflow-wrap:anywhere]">
                              {item.name || item.product?.name || "Product"}
                            </h4>
                            <p className="mt-0.5 text-xs text-muted">
                              {numeric(item.quantity)} × {money(item.price)}
                            </p>
                          </div>
                          <strong className="ml-auto text-sm font-semibold">
                            {money(numeric(item.price) * numeric(item.quantity))}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedOrder && (
            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-ink bg-linen px-5 py-4 sm:px-6">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Order total</span>
              <strong className="font-serif text-3xl font-normal">{money(selectedOrder.totalAmount)}</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Orders;