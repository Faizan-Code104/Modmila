import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  ImageOff,
  Loader2,
  Package,
  Search,
  Truck,
  XCircle,
} from "lucide-react";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO } from "../storeInfo";

const STATUS_STEPS = [
  { key: "Pending", title: "Order placed", icon: Package },
  { key: "Processing", title: "Processing", icon: CheckCircle2 },
  { key: "Shipped", title: "Shipped", icon: Truck },
  { key: "Delivered", title: "Delivered", icon: CheckCircle2 },
];

const apiBase = API_BASE_URL.replace(/\/+$/, "");

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);
  return Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: BUSINESS_INFO.currency || "USD",
      }).format(amount)
    : "—";
};

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();
  if (/^https?:\/\//i.test(value)) return value;

  return `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const ProductImage = ({ image, name }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(image);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="grid size-16 shrink-0 place-items-center overflow-hidden bg-linen text-muted sm:size-20">
      {src && !failed ? (
        <img
          src={src}
          alt={name || "Ordered product"}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <ImageOff size={22} aria-label="Product image unavailable" />
      )}
    </div>
  );
};

/* A 3D parcel built from six CSS faces */
const Parcel = () => {
  const size = "size-[180px] sm:size-[220px]";
  const face =
    "absolute inset-0 border border-[#c9b9a6] bg-[#e4d6c4] [backface-visibility:hidden]";
  const half = "[--half:90px] sm:[--half:110px]";

  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto ${size} ${half} perspective-[1200px]`}
    >
      <div className="relative size-full animate-float-3d transform-3d">
        <div
          className={`relative size-full transition-transform duration-[1.4s] ease-soft transform-3d [transform:rotateX(-22deg)_rotateY(-38deg)] hover:[transform:rotateX(-30deg)_rotateY(140deg)]`}
        >
          {/* front */}
          <div className={`${face} [transform:translateZ(var(--half))]`}>
            <span className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-wine/80" />
            <span className="absolute bottom-4 left-4 bg-paper px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-ink shadow-sm">
              MM / {BUSINESS_INFO.businessName}
            </span>
          </div>
          {/* back */}
          <div className={`${face} [transform:rotateY(180deg)_translateZ(var(--half))]`}>
            <span className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-wine/80" />
          </div>
          {/* right */}
          <div className={`${face} bg-[#d8c7b2] [transform:rotateY(90deg)_translateZ(var(--half))]`}>
            <span className="absolute left-4 top-4 font-serif text-3xl italic text-wine/80">
              ✳
            </span>
            <span className="absolute bottom-4 right-4 text-[9px] font-bold uppercase tracking-[0.2em] text-ink/70">
              Handle with care
            </span>
          </div>
          {/* left */}
          <div className={`${face} bg-[#d8c7b2] [transform:rotateY(-90deg)_translateZ(var(--half))]`} />
          {/* top */}
          <div className={`${face} bg-[#efe3d3] [transform:rotateX(90deg)_translateZ(var(--half))]`}>
            <span className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 bg-wine/80" />
          </div>
          {/* bottom */}
          <div className={`${face} [transform:rotateX(-90deg)_translateZ(var(--half))]`} />
        </div>
      </div>
      <span className="absolute -bottom-10 left-1/2 h-6 w-3/4 -translate-x-1/2 rounded-[50%] bg-ink/20 blur-md" />
    </div>
  );
};

const OrderTracking = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const requestRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleTrackOrder = async (event) => {
    event.preventDefault();
    if (requestRef.current) return;

    const value = trackingNumber.trim().toUpperCase();

    setError("");
    setOrder(null);
    setCopied(false);
    setCopyError("");
    clearTimeout(copyTimerRef.current);

    if (!value) {
      setError("Please enter your order number.");
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);

    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20000);

    try {
      const response = await fetch(
        `${apiBase}/api/orders/track/${encodeURIComponent(value)}`,
        { signal: controller.signal },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "We couldn't find an order with this number. Please check and try again.",
        );
      }

      if (
        !data?.order ||
        typeof data.order !== "object" ||
        Array.isArray(data.order)
      ) {
        throw new Error(
          "Order details are unavailable right now. Please try again.",
        );
      }

      if (!controller.signal.aborted) {
        setOrder(data.order);
      }
    } catch (fetchError) {
      if (timedOut) {
        setError("The request took too long. Please try again.");
      } else if (fetchError?.name !== "AbortError") {
        setError(
          fetchError?.message ||
            "Unable to retrieve this order right now. Please try again.",
        );
      }
    } finally {
      clearTimeout(timeout);

      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleCopyOrderNumber = async () => {
    if (!order?.orderNumber) return;

    setCopyError("");

    try {
      await navigator.clipboard.writeText(String(order.orderNumber));
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError("Couldn't copy. Please select the order number manually.");
    }
  };

  const status = String(order?.status || "").trim();
  const isCancelled = status.toLowerCase() === "cancelled";
  const currentStepIndex = STATUS_STEPS.findIndex(
    (step) => step.key.toLowerCase() === status.toLowerCase(),
  );

  const destination = [order?.shippingAddress?.city, order?.shippingAddress?.state]
    .filter(Boolean)
    .join(", ");

  const items = Array.isArray(order?.items) ? order.items : [];

  const supportHref = BUSINESS_INFO.email
    ? `mailto:${BUSINESS_INFO.email}?subject=${encodeURIComponent(
        `${BUSINESS_INFO.businessName} Order Support - ${order?.orderNumber || ""}`,
      )}`
    : "";

  const progressPercent =
    currentStepIndex >= 0 ? (currentStepIndex / (STATUS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
      {/* ============ Hero: search + 3D parcel ============ */}
      <section
        aria-label="Order tracking"
        aria-busy={loading}
        className="mx-auto grid max-w-[1450px] items-center gap-12 px-4 pb-14 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:px-[clamp(40px,4vw,64px)] lg:pb-20"
      >
        <div className="min-w-0">
          <div className="flex animate-rise flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="text-wine">{BUSINESS_INFO.businessName} / Order care</span>
            <Link
              to="/contact"
              className="group inline-flex min-h-10 items-center gap-2 text-muted transition-colors hover:text-wine"
            >
              Need a hand?
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <p className="mt-9 animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-muted [animation-delay:80ms]">
            Track your order
          </p>
          <h1 className="mt-3 font-serif text-[clamp(50px,7vw,104px)] leading-[0.93] tracking-[-0.04em] perspective-distant">
            <span className="block animate-fold-in [animation-delay:120ms]">
              From our door
            </span>
            <em className="block animate-fold-in text-wine [animation-delay:260ms]">
              to yours.
            </em>
          </h1>
          <p className="mt-5 max-w-md animate-rise text-[15px] leading-relaxed text-muted [animation-delay:380ms]">
            Enter the order number from your confirmation to see the latest
            available status.
          </p>

          <form
            onSubmit={handleTrackOrder}
            className="mt-8 animate-rise [animation-delay:460ms]"
          >
            <label
              htmlFor="track-order-number"
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
            >
              Order number
            </label>
            <div
              className={`flex flex-col border bg-paper shadow-[0_24px_50px_-35px_rgba(36,34,35,0.6)] transition-[border-color,box-shadow] duration-300 focus-within:border-wine focus-within:shadow-[0_24px_50px_-28px_rgba(125,48,58,0.5)] sm:flex-row ${
                error ? "border-danger" : "border-ink"
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Package size={19} aria-hidden="true" className="shrink-0 text-wine" />
                <input
                  id="track-order-number"
                  type="text"
                  value={trackingNumber}
                  onChange={(event) => {
                    setTrackingNumber(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your order number"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={120}
                  disabled={loading}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "track-error" : "track-input-help"}
                  className="min-h-[60px] w-full min-w-0 bg-transparent text-base uppercase tracking-wide outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex min-h-[60px] items-center justify-center gap-3 overflow-hidden bg-wine px-7 text-[13px] font-bold text-paper transition-colors duration-300 hover:bg-wine-dark disabled:cursor-wait disabled:opacity-70"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                />
                {loading ? (
                  <Loader2 size={18} className="relative animate-spin" aria-hidden="true" />
                ) : (
                  <Search size={18} className="relative" aria-hidden="true" />
                )}
                <span className="relative">{loading ? "Searching…" : "Track order"}</span>
              </button>
            </div>
            <p id="track-input-help" className="mt-2 text-[11px] text-muted">
              Use the order number exactly as shown in your confirmation.
            </p>
          </form>

          {error && (
            <div
              id="track-error"
              role="alert"
              className="mt-5 flex animate-flip-up items-start gap-3 border border-danger/30 bg-danger/10 p-4 text-danger"
            >
              <XCircle size={19} aria-hidden="true" className="mt-0.5 shrink-0" />
              <p className="text-[13px] leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="relative py-10 lg:py-0">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-line sm:size-[420px]"
          />
          <Parcel />
          <p className="relative mt-16 text-center text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
            Hover the parcel · Every order, carefully packed
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]">
        {/* ============ Loading ============ */}
        {loading && (
          <div
            role="status"
            className="flex min-h-[200px] animate-fade-in flex-col items-center justify-center gap-4 border-y border-line"
          >
            <span className="relative block h-1 w-48 overflow-hidden bg-linen">
              <span className="absolute inset-y-0 left-0 w-1/3 animate-[marquee_1.2s_linear_infinite] bg-wine" />
            </span>
            <p className="text-sm text-muted">Looking up your order…</p>
          </div>
        )}

        {/* ============ Guide (no order yet) ============ */}
        {!order && !loading && (
          <section
            aria-labelledby="track-guide-title"
            className="border-t border-ink pt-10"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2
                id="track-guide-title"
                className="font-serif text-[clamp(32px,3.6vw,52px)] leading-none"
              >
                Stay in <em className="text-wine">the loop.</em>
              </h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                A few simple steps
              </p>
            </div>

            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                ["Find your number", "Check your existing order confirmation."],
                ["Check the progress", "View the current stage and latest available update."],
                ["Talk to our team", "Contact support if your order needs attention."],
              ].map(([title, text], index) => (
                <li
                  key={title}
                  style={{ animationDelay: `${index * 120}ms` }}
                  className="group relative animate-fold-in bg-paper p-6 transition-transform duration-500 hover:-translate-y-1"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2 border border-dashed border-line"
                  />
                  <span className="relative font-serif text-4xl text-wine">
                    0{index + 1}
                  </span>
                  <h3 className="relative mt-4 text-sm font-bold uppercase tracking-[0.12em]">
                    {title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ============ Result ============ */}
        {order && (
          <section className="animate-fold-in border border-ink bg-paper">
            {/* heading */}
            <div className="grid gap-6 border-b border-line p-5 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                  Latest order status
                </p>
                <h2 className="mt-3 font-serif text-[clamp(32px,3.8vw,54px)] leading-[1.02]">
                  {isCancelled
                    ? "This order was cancelled."
                    : currentStepIndex === 3
                      ? "Your order has arrived."
                      : currentStepIndex >= 0
                        ? "Here’s where it stands."
                        : "Your order update."}
                </h2>
                <span
                  className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${
                    isCancelled ? "bg-danger/10 text-danger" : "bg-wine text-paper"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1.5 rounded-full ${isCancelled ? "bg-danger" : "animate-pulse bg-paper"}`}
                  />
                  {status || "Status unavailable"}
                </span>
              </div>

              <div className="md:text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  Order number
                </p>
                <div className="mt-2 flex items-center gap-2 md:justify-end">
                  <strong className="break-all font-serif text-2xl font-normal">
                    {order.orderNumber || "—"}
                  </strong>
                  {order.orderNumber && (
                    <button
                      type="button"
                      onClick={handleCopyOrderNumber}
                      aria-label="Copy order number"
                      className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                        copied
                          ? "border-success bg-success text-paper"
                          : "border-line hover:border-wine hover:text-wine"
                      }`}
                    >
                      {copied ? <Check size={16} className="animate-scale-in" /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
                <p role="status" className="mt-1 min-h-4 text-[11px] text-muted">
                  {copied ? "Order number copied." : copyError}
                </p>
              </div>
            </div>

            {/* metadata */}
            <dl className="grid border-b border-line sm:grid-cols-3">
              {[
                ["Placed on", formatDateTime(order.createdAt)],
                ["Destination", destination || "—"],
                ["Latest update", formatDateTime(order.updatedAt)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`p-5 sm:px-8 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
                >
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1.5 font-serif text-xl">{value}</dd>
                </div>
              ))}
            </dl>

            {/* progress */}
            <section
              aria-labelledby="track-progress-title"
              className="border-b border-line p-5 sm:p-8"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                Delivery progress
              </p>
              <h3 id="track-progress-title" className="mt-2 font-serif text-3xl">
                The journey so far.
              </h3>

              {isCancelled ? (
                <div className="mt-6 flex items-start gap-3 border border-danger/30 bg-danger/10 p-5 text-danger">
                  <XCircle size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed">
                    This order was cancelled and will not be delivered. Contact
                    support if you believe this is a mistake.
                  </p>
                </div>
              ) : currentStepIndex < 0 ? (
                <p className="mt-6 text-sm text-muted">
                  A delivery stage is not available for this status. Contact our
                  team for more details.
                </p>
              ) : (
                <div className="relative mt-10">
                  {/* track line (horizontal on md+, vertical on mobile) */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-5 left-5 top-5 w-px bg-line md:bottom-auto md:left-[12.5%] md:right-[12.5%] md:top-5 md:h-px md:w-auto"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 hidden h-px origin-left bg-wine transition-[width] duration-[1.4s] ease-soft md:left-[12.5%] md:block"
                    style={{ width: `${progressPercent * 0.75}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-5 w-px bg-wine transition-[height] duration-[1.4s] ease-soft md:hidden"
                    style={{ height: `calc(${progressPercent}% - 40px)` }}
                  />
                  {/* moving truck (desktop) */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-7 hidden -translate-x-1/2 text-wine transition-[left] duration-[1.4s] ease-soft md:block"
                    style={{ left: `calc(12.5% + ${progressPercent * 0.75}%)` }}
                  >
                    <Truck size={20} className="animate-[float-3d_3s_ease-in-out_infinite]" />
                  </span>

                  <ol className="relative grid gap-7 md:grid-cols-4 md:gap-4">
                    {STATUS_STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isCurrent = index === currentStepIndex;
                      const isPast = index < currentStepIndex;

                      return (
                        <li
                          key={step.key}
                          aria-current={isCurrent ? "step" : undefined}
                          style={{ animationDelay: `${index * 160}ms` }}
                          className="flex animate-rise items-start gap-4 md:flex-col md:items-center md:text-center"
                        >
                          <span
                            className={`relative grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                              isPast
                                ? "border-wine bg-wine text-paper"
                                : isCurrent
                                  ? "scale-110 border-wine bg-paper text-wine shadow-[0_0_0_6px_rgba(125,48,58,0.14)]"
                                  : "border-line bg-paper text-muted"
                            }`}
                          >
                            {isPast ? (
                              <Check size={18} aria-hidden="true" />
                            ) : (
                              <Icon size={18} aria-hidden="true" />
                            )}
                          </span>
                          <div className="md:mt-3">
                            <h4
                              className={`text-sm font-bold ${
                                isCurrent || isPast ? "text-ink" : "text-muted"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="mt-0.5 text-xs text-muted">
                              {isCurrent
                                ? index === 3
                                  ? "Completed"
                                  : "Current stage"
                                : isPast
                                  ? "Completed"
                                  : "Not reached yet"}
                            </p>
                            {index === 0 && (
                              <time className="mt-0.5 block text-[11px] text-muted">
                                {formatDateTime(order.createdAt)}
                              </time>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </section>

            {/* purchase */}
            <section aria-labelledby="track-purchase-title" className="p-5 sm:p-8">
              <div className="flex items-end justify-between gap-4 border-b border-dashed border-line pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    Your purchase
                  </p>
                  <h3 id="track-purchase-title" className="mt-2 font-serif text-3xl">
                    Inside your order.
                  </h3>
                </div>
                <span className="text-xs text-muted">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>

              {items.length ? (
                <ul className="divide-y divide-line">
                  {items.map((item, index) => (
                    <li
                      key={`${item.product || item._id || "item"}-${index}`}
                      style={{ animationDelay: `${index * 80}ms` }}
                      className="flex animate-rise items-center gap-4 py-4"
                    >
                      <ProductImage image={item.image} name={item.name} />
                      <div className="min-w-0 flex-1">
                        <h4 className="break-words font-serif text-lg leading-tight sm:text-xl">
                          {item.name || "Ordered product"}
                        </h4>
                        <span className="text-xs text-muted">
                          Quantity: {item.quantity ?? "—"}
                        </span>
                      </div>
                      <div className="shrink-0 text-right">
                        <small className="block text-[10px] uppercase tracking-[0.14em] text-muted">
                          Unit price
                        </small>
                        <strong className="text-sm font-semibold">
                          {formatMoney(item.price)}
                        </strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Item details are not available for this order.
                </p>
              )}

              <div className="mt-2 flex items-end justify-between gap-4 border-t-2 border-ink pt-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                  Order total
                </span>
                <strong className="font-serif text-[32px] font-normal leading-none">
                  {formatMoney(order.totalAmount)}
                </strong>
              </div>
            </section>
          </section>
        )}

        {/* ============ Support ============ */}
        <footer className="mt-12 flex flex-col items-start justify-between gap-6 bg-ink p-6 text-paper sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
              We’re here to help
            </p>
            <h3 className="mt-2 font-serif text-[clamp(28px,3vw,42px)] leading-tight">
              A question about <em className="text-[#d9a9ae]">your order?</em>
            </h3>
            <p className="mt-2 text-sm text-paper/70">
              If anything looks incorrect, our support team can help.
            </p>
          </div>

          {supportHref ? (
            <a
              href={supportHref}
              className="group inline-flex min-h-14 shrink-0 items-center gap-6 bg-wine px-6 py-4 text-sm font-semibold transition-colors hover:bg-wine-dark"
            >
              Contact support
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          ) : (
            <Link
              to="/contact"
              className="group inline-flex min-h-14 shrink-0 items-center gap-6 bg-wine px-6 py-4 text-sm font-semibold transition-colors hover:bg-wine-dark"
            >
              Contact support
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
};

export default OrderTracking;