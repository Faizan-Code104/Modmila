import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users as UsersIcon,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import storeInfo, { STORAGE_KEYS } from "../../storeInfo";

const USERS_API_URL = `${API_BASE_URL}/api/users`;
const ORDERS_API_URL = `${API_BASE_URL}/api/orders`;

const getId = (value) => {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(value?._id || value?.id || "");
};

const getText = (value, fallback = "") =>
  typeof value === "string" ? value : fallback;

const getAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const getTimestamp = (value) => {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const formatDate = (value) => {
  if (!getTimestamp(value)) return "—";

  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(getAmount(value));

const isCancelled = (order) =>
  ["cancelled", "canceled"].includes(
    getText(order?.status).trim().toLowerCase()
  );

const getRole = (user) => {
  const role = getText(user?.role).trim().toLowerCase();

  if (role === "admin") return "Admin";
  if (!role || role === "user" || role === "customer") return "Customer";

  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getInitials = (name) =>
  getText(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";


const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-wine";

/* Order status colours (matches Dashboard + Orders) */
const STATUS_DOT = {
  pending: "#c9b28f",
  processing: "#8a5a5f",
  shipped: "#2b2523",
  delivered: "#4f7a5a",
  cancelled: "#a33a3a",
  canceled: "#a33a3a",
};

const statusDot = (status) =>
  STATUS_DOT[getText(status).trim().toLowerCase()] || "#b9b0a6";

const RoleBadge = ({ role, tone = "light" }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] [overflow-wrap:anywhere] ${
      role === "Admin"
        ? "bg-wine text-paper"
        : tone === "dark"
          ? "bg-paper/15 text-paper"
          : "bg-linen text-ink"
    }`}
  >
    {role === "Admin" && <ShieldCheck size={12} aria-hidden="true" />}
    {role}
  </span>
);

/* Card that tilts in 3D with the mouse (desktop only) */
const TiltCard = ({ children, strength = 1 }) => {
  const ref = useRef(null);

  const handleMove = (event) => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.transform = `rotateX(${-y * 10 * strength}deg) rotateY(${x * 12 * strength}deg)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div onMouseMove={handleMove} onMouseLeave={handleLeave} className="h-full perspective-[1200px]">
      <div ref={ref} className="h-full transform-3d transition-transform duration-500 ease-soft">
        {children}
      </div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshCount, setRefreshCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [selectedId, setSelectedId] = useState("");

  const profileHeadingRef = useRef(null);
  const directoryHeadingRef = useRef(null);
  const previousSelectionRef = useRef("");

  const brandName = storeInfo.businessName;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem(STORAGE_KEYS.token);

        if (!token) {
          throw new Error("Please sign in with your admin account.");
        }

        const headers = { Authorization: `Bearer ${token}` };

        const fetchCollection = async (url, field, label) => {
          const response = await fetch(url, {
            headers,
            signal: controller.signal,
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(
              data?.message || `Unable to load ${label}. Please try again.`
            );
          }

          if (!Array.isArray(data?.[field])) {
            throw new Error(`The ${label} response is invalid.`);
          }

          return data[field].filter(
            (item) =>
              item && typeof item === "object" && !Array.isArray(item)
          );
        };

        const results = await Promise.allSettled([
          fetchCollection(USERS_API_URL, "users", "users"),
          fetchCollection(ORDERS_API_URL, "orders", "orders"),
        ]);

        if (!active) return;

        const failure = results.find((result) => result.status === "rejected");

        if (failure) throw failure.reason;

        setUsers(results[0].value.filter((user) => getId(user)));
        setOrders(results[1].value);
        setHasLoaded(true);
      } catch (error) {
        if (active && error?.name !== "AbortError") {
          setErrorMessage(error?.message || "Unable to load account activity.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
      controller.abort();
    };
  }, [refreshCount]);

  const userDirectory = useMemo(() => {
    const activity = new Map();

    orders.forEach((order) => {
      const userId = getId(order.user);
      if (!userId) return;

      if (!activity.has(userId)) activity.set(userId, []);
      activity.get(userId).push(order);
    });

    return users.map((user) => {
      const userOrders = [...(activity.get(getId(user)) || [])].sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt)
      );

      return {
        ...user,
        accountId: getId(user),
        roleLabel: getRole(user),
        userOrders,
        orderCount: userOrders.length,
        orderValue: userOrders.reduce(
          (total, order) =>
            total + (isCancelled(order) ? 0 : getAmount(order.totalAmount)),
          0
        ),
      };
    });
  }, [users, orders]);

  const roleOptions = useMemo(
    () => [
      "All",
      "Customer",
      "Admin",
      ...Array.from(new Set(userDirectory.map((user) => user.roleLabel))).filter(
        (role) => role !== "Customer" && role !== "Admin"
      ),
    ],
    [userDirectory]
  );

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    const result = userDirectory.filter((user) => {
      const matchesSearch =
        !search ||
        getText(user.name).toLowerCase().includes(search) ||
        getText(user.email).toLowerCase().includes(search);

      return (
        matchesSearch &&
        (roleFilter === "All" || user.roleLabel === roleFilter)
      );
    });

    result.sort((a, b) => {
      if (sortBy === "Highest Value") return b.orderValue - a.orderValue;
      if (sortBy === "Most Orders") return b.orderCount - a.orderCount;
      if (sortBy === "A-Z") {
        return getText(a.name).localeCompare(getText(b.name));
      }

      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });

    return result;
  }, [userDirectory, searchTerm, roleFilter, sortBy]);

  const selectedUser = useMemo(
    () => userDirectory.find((user) => user.accountId === selectedId),
    [userDirectory, selectedId]
  );

  useEffect(() => {
    if (hasLoaded && selectedId && !selectedUser) setSelectedId("");
  }, [hasLoaded, selectedId, selectedUser]);

  useEffect(() => {
    const previousId = previousSelectionRef.current;
    previousSelectionRef.current = selectedId;

    if (!selectedId && !previousId) return;

    const frame = requestAnimationFrame(() => {
      const heading = selectedId
        ? profileHeadingRef.current
        : directoryHeadingRef.current;

      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: "start", behavior: "auto" });
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  const totalOrderValue = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total + (isCancelled(order) ? 0 : getAmount(order.totalAmount)),
        0
      ),
    [orders]
  );

  const customerCount = userDirectory.filter(
    (user) => user.roleLabel === "Customer"
  ).length;

  const adminCount = userDirectory.filter(
    (user) => user.roleLabel === "Admin"
  ).length;

  const filtersActive =
    searchTerm.trim() || roleFilter !== "All" || sortBy !== "Newest";

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setSortBy("Newest");
  };


  const refreshButton = (
    <button
      type="button"
      disabled={loading}
      onClick={() => setRefreshCount((count) => count + 1)}
      className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2.5 border border-line bg-paper px-5 text-xs font-semibold text-ink transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-55 sm:w-auto"
    >
      <RefreshCw size={15} aria-hidden="true" className={loading ? "animate-spin" : ""} />
      {loading ? "Refreshing…" : "Refresh"}
    </button>
  );

  const roleCount = (role) =>
    role === "All"
      ? userDirectory.length
      : userDirectory.filter((user) => user.roleLabel === role).length;

  return (
    <div className="min-w-0 font-sans text-ink">
      {selectedUser ? (
        <>
          <button
            type="button"
            onClick={() => setSelectedId("")}
            className="group mb-5 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-ink hover:text-wine"
          >
            <ArrowLeft size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1" />
            Back to directory
          </button>

          <header className="flex flex-col items-start justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
            <div>
              <p className={`${eyebrowClass} animate-rise`}>{brandName} / Account profile</p>
              <h1
                ref={profileHeadingRef}
                tabIndex={-1}
                className="mt-2 scroll-mt-28 font-serif text-[clamp(38px,5vw,64px)] leading-[0.95] tracking-[-0.03em] outline-none perspective-distant"
              >
                <span className="inline-block animate-fold-in">Account</span>{" "}
                <em className="inline-block animate-fold-in text-wine [animation-delay:120ms]">overview</em>
              </h1>
              <p className="mt-3 text-sm text-muted">Registration details and linked order activity.</p>
            </div>
            {refreshButton}
          </header>
        </>
      ) : (
        <header className="flex flex-col items-start justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <p className={`${eyebrowClass} animate-rise`}>{brandName} / Administration</p>
            <h1
              ref={directoryHeadingRef}
              tabIndex={-1}
              className="mt-2 scroll-mt-28 font-serif text-[clamp(38px,5vw,64px)] leading-[0.95] tracking-[-0.03em] outline-none perspective-distant"
            >
              <span className="inline-block animate-fold-in">People</span>{" "}
              <em className="inline-block animate-fold-in text-wine [animation-delay:120ms]">&amp; accounts</em>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted">
              Explore registered accounts and their activity across the store.
            </p>
          </div>
          {refreshButton}
        </header>
      )}

      {errorMessage && (
        <div className="mt-5 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-5 py-4 text-sm text-danger" role="alert">
          {errorMessage}
          {hasLoaded && " Previously loaded data is still displayed."}
        </div>
      )}

      {selectedUser ? (
        /* ============ Profile ============ */
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]" aria-busy={loading}>
          <aside className="animate-rise lg:sticky lg:top-28">
            {/* membership card */}
            <TiltCard strength={1.3}>
              <div className="relative overflow-hidden bg-ink p-6 text-paper shadow-[0_40px_60px_-35px_rgba(0,0,0,0.7)] sm:p-7">
                <span aria-hidden="true" className="absolute -right-16 -top-16 size-48 rounded-full border border-dashed border-sand/25" />
                <span aria-hidden="true" className="absolute -bottom-10 -left-10 size-32 rotate-12 bg-wine/40" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="grid size-20 place-items-center rounded-full bg-wine font-serif text-3xl text-paper ring-4 ring-paper/10" aria-hidden="true">
                    {getInitials(selectedUser.name)}
                  </div>
                  <span className="font-serif text-xl italic text-paper/40">{brandName}</span>
                </div>

                <h2 className="relative mt-6 font-serif text-3xl leading-tight [overflow-wrap:anywhere]">
                  {getText(selectedUser.name) || "Unnamed account"}
                </h2>
                <p className="relative mt-1 text-sm text-paper/60 [overflow-wrap:anywhere]">
                  {getText(selectedUser.email) || "Email not provided"}
                </p>
                <div className="relative mt-4">
                  <RoleBadge role={selectedUser.roleLabel} tone="dark" />
                </div>

                <dl className="relative mt-7">
                  {[
                    [Mail, "Email address", getText(selectedUser.email) || "—"],
                    [CalendarDays, "Registered on", formatDate(selectedUser.createdAt)],
                    [null, "Account ID", selectedUser.accountId],
                  ].map(([Icon, label, value]) => (
                    <div key={label} className="border-t border-paper/15 py-4">
                      <dt className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-paper/50">
                        {Icon && <Icon size={13} aria-hidden="true" />}
                        {label}
                      </dt>
                      <dd className="mt-1.5 text-sm [overflow-wrap:anywhere]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </TiltCard>
          </aside>

          <div className="min-w-0 animate-rise border border-line bg-paper [animation-delay:120ms]">
            <div className="grid grid-cols-2 gap-px border-b border-line bg-line">
              <div className="bg-paper p-5 sm:p-6">
                <small className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Total orders</small>
                <strong className="mt-2 block font-serif text-[clamp(34px,4vw,48px)] font-normal leading-none">
                  {selectedUser.orderCount}
                </strong>
              </div>
              <div className="bg-linen/60 p-5 sm:p-6">
                <small className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Non-cancelled order value</small>
                <strong className="mt-2 block font-serif text-[clamp(28px,4vw,48px)] font-normal leading-none [overflow-wrap:anywhere]">
                  {formatMoney(selectedUser.orderValue)}
                </strong>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <h2 className="font-serif text-2xl sm:text-[28px]">Order history</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Order value excludes cancelled orders and does not confirm
                payment collection.
              </p>

              {selectedUser.userOrders.length > 0 ? (
                <ol className="relative mt-6 border-l border-line pl-6">
                  {selectedUser.userOrders.map((order, index) => (
                    <li
                      key={getId(order) || `order-${index}`}
                      style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
                      className="relative animate-rise pb-5 last:pb-0"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -left-[31px] top-4 size-3 rounded-full ring-4 ring-paper"
                        style={{ background: statusDot(order.status) }}
                      />
                      <article className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border border-line p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink">
                        <div className="min-w-0">
                          <strong className="block text-sm font-semibold [overflow-wrap:anywhere]">
                            {order.orderNumber != null
                              ? String(order.orderNumber)
                              : getId(order) || "Order"}
                          </strong>
                          <small className="mt-1 block text-[11px] text-muted">{formatDate(order.createdAt)}</small>
                        </div>
                        <div className="text-right">
                          <strong className="block font-serif text-xl font-normal">{formatMoney(order.totalAmount)}</strong>
                          <small className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-muted">
                            <span className="size-1.5 rounded-full" style={{ background: statusDot(order.status) }} />
                            {getText(order.status) || "Unknown status"}
                          </small>
                        </div>
                      </article>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-6 flex min-h-56 flex-col items-center justify-center gap-2 border border-dashed border-line p-8 text-center text-muted">
                  <ShoppingBag size={28} aria-hidden="true" className="text-wine" />
                  <h2 className="font-serif text-2xl text-ink">No linked orders</h2>
                  <p className="text-sm">This account has no linked order activity yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ============ Overview ============ */}
          <div aria-label="Account summary" className="mt-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
            {[
              ["Registered accounts", hasLoaded ? users.length : "—"],
              ["Customers", hasLoaded ? customerCount : "—"],
              ["Administrators", hasLoaded ? adminCount : "—"],
              ["All non-cancelled order value", hasLoaded ? formatMoney(totalOrderValue) : "—"],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{ animationDelay: `${index * 80}ms` }}
                className={`min-w-0 animate-rise p-5 ${index === 3 ? "bg-ink text-paper" : "bg-paper"}`}
              >
                <small className={`block text-[10px] font-bold uppercase tracking-[0.16em] ${index === 3 ? "text-[#d9a9ae]" : "text-muted"}`}>
                  {label}
                </small>
                <strong className="mt-2 block font-serif text-[clamp(28px,3vw,40px)] font-normal leading-none [overflow-wrap:anywhere]">
                  {value}
                </strong>
              </div>
            ))}
          </div>

          {/* ============ Controls ============ */}
          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="flex min-w-0 items-center gap-3 border border-line bg-paper px-4 transition-colors focus-within:border-ink">
              <Search size={17} aria-hidden="true" className="shrink-0 text-muted" />
              <input
                type="search"
                aria-label="Search accounts by name or email"
                placeholder="Find a person by name or email"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="min-h-14 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-sm placeholder:text-muted"
              />
            </div>

            <label className="flex flex-col justify-center border border-line bg-paper px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted transition-colors focus-within:border-ink">
              Sort by
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-8 w-full bg-transparent text-base normal-case tracking-normal text-ink outline-none sm:text-sm"
              >
                <option value="Newest">Newest accounts</option>
                <option value="Highest Value">Highest order value</option>
                <option value="Most Orders">Most orders</option>
                <option value="A-Z">Name: A–Z</option>
              </select>
            </label>
          </div>

          <div role="group" aria-label="Filter by account role" className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {roleOptions.map((role) => {
              const active = roleFilter === role;

              return (
                <button
                  key={role}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setRoleFilter(role)}
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 border px-4 text-xs font-semibold transition-all duration-300 ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-line bg-paper text-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  {role === "All" ? "All accounts" : role}
                  {hasLoaded && (
                    <span className={`text-[10px] ${active ? "text-paper/60" : "text-muted/70"}`}>
                      {roleCount(role)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex min-h-14 items-center justify-between gap-3 text-xs text-muted">
            <span role="status">
              {hasLoaded
                ? `${filteredUsers.length} of ${users.length} accounts${
                    loading ? " · Refreshing…" : ""
                  }`
                : loading
                  ? "Loading accounts…"
                  : "Account data unavailable"}
            </span>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4 hover:text-wine"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* ============ Directory ============ */}
          {loading && !hasLoaded ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 border border-dashed border-line bg-paper p-8 text-center text-sm text-muted" role="status">
              <Loader2 size={30} className="animate-spin text-wine" aria-hidden="true" />
              <p>Loading accounts and order activity…</p>
            </div>
          ) : !hasLoaded ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
              <UsersIcon size={30} aria-hidden="true" className="text-wine" />
              <h2 className="font-serif text-2xl text-ink">Accounts could not be loaded</h2>
              <p>Use Refresh to try again.</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
              <UsersIcon size={30} aria-hidden="true" className="text-wine" />
              <h2 className="font-serif text-2xl text-ink">
                {users.length === 0 ? "No registered accounts" : "No matching accounts"}
              </h2>
              <p>
                {users.length === 0
                  ? "Registered users will appear here."
                  : "Try another name, email address or role filter."}
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-3 inline-flex min-h-11 items-center bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 xl:grid-cols-3" aria-busy={loading}>
              {filteredUsers.map((user, index) => {
                const admin = user.roleLabel === "Admin";

                return (
                  <li
                    key={user.accountId}
                    style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
                    className="animate-rise"
                  >
                    <TiltCard>
                      <article className="group flex h-full flex-col overflow-hidden border border-line bg-paper transition-shadow duration-500 hover:shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45)]">
                        {/* card band */}
                        <div className={`relative h-20 overflow-hidden ${admin ? "bg-wine" : "bg-ink"}`}>
                          <span aria-hidden="true" className="absolute -right-6 -top-10 size-28 rounded-full border border-dashed border-paper/25 transition-transform duration-[1.5s] group-hover:rotate-90" />
                          <span className="absolute left-5 top-4 font-serif text-sm italic text-paper/50">{brandName}</span>
                          <div className="absolute right-4 top-4">
                            <RoleBadge role={user.roleLabel} tone="dark" />
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col px-5 pb-5">
                          <div
                            aria-hidden="true"
                            className="-mt-8 grid size-16 place-items-center rounded-full bg-linen font-serif text-2xl text-ink ring-4 ring-paper transition-transform duration-700 group-hover:[transform:rotateY(360deg)]"
                          >
                            {getInitials(user.name)}
                          </div>

                          <h2 className="mt-3 font-serif text-2xl leading-tight [overflow-wrap:anywhere]">
                            {getText(user.name) || "Unnamed account"}
                          </h2>
                          <p className="mt-0.5 text-xs text-muted [overflow-wrap:anywhere]">
                            {getText(user.email) || "Email not provided"}
                          </p>

                          <div className="my-4 grid grid-cols-[1fr_1.5fr] gap-4 border-y border-line py-4">
                            <div>
                              <small className="block text-[10px] uppercase tracking-[0.14em] text-muted">Orders</small>
                              <strong className="mt-1 block font-serif text-2xl font-normal">{user.orderCount}</strong>
                            </div>
                            <div className="min-w-0">
                              <small className="block text-[10px] uppercase tracking-[0.14em] text-muted">Non-cancelled value</small>
                              <strong className="mt-1 block font-serif text-2xl font-normal [overflow-wrap:anywhere]">
                                {formatMoney(user.orderValue)}
                              </strong>
                            </div>
                          </div>

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-muted">Joined {formatDate(user.createdAt)}</span>
                            <button
                              type="button"
                              aria-label={`View profile for ${getText(user.name) || "this account"}`}
                              onClick={() => setSelectedId(user.accountId)}
                              className="group/btn inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-ink hover:text-wine"
                            >
                              View profile
                              <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Users;