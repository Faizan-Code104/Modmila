import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock3,
  ImageOff,
  MapPin,
  Truck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "./CartContext";
import storeInfo, { STORAGE_KEYS } from "../storeInfo";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: storeInfo.currency || "USD",
  }).format(Number(value) || 0);

const readSavedEmail = () => {
  if (typeof window === "undefined") return "";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEYS.user);

    if (!saved) return "";

    const user = JSON.parse(saved);

    if (typeof user?.email === "string" && user.email.trim()) {
      return user.email;
    }
  } catch {
    // Saved account details are unavailable.
  }

  return "";
};

const STEPS = [
  { label: "Contact", Icon: User },
  { label: "Delivery", Icon: MapPin },
  { label: "Review", Icon: Check },
];

const CheckoutImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  return src && failedSource !== src ? (
    <img
      src={src}
      alt={name || `${storeInfo.businessName} bedding`}
      onError={() => setFailedSource(src)}
      loading="lazy"
      className="size-full object-cover"
    />
  ) : (
    <div className="grid size-full place-items-center text-muted">
      <ImageOff size={18} strokeWidth={1.3} />
    </div>
  );
};

const Field = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  required = false,
  readOnly = false,
  inputMode,
  pattern,
  full = false,
}) => (
  <div className={`relative min-w-0 ${full ? "sm:col-span-2" : ""}`}>
    <input
      id={`checkout-${name}`}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
      inputMode={inputMode}
      pattern={pattern}
      className="peer min-h-[60px] w-full min-w-0 border border-line bg-paper px-4 pb-2.5 pt-6 text-base text-ink outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-transparent focus:border-wine focus:shadow-[0_0_0_3px_rgba(125,48,58,0.12)] read-only:bg-linen read-only:text-muted user-invalid:border-danger"
    />
    {/* floating label */}
    <label
      htmlFor={`checkout-${name}`}
      className="pointer-events-none absolute left-4 top-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted transition-all duration-300 peer-placeholder-shown:top-[21px] peer-placeholder-shown:text-[13px] peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-wine"
    >
      {label}
      {!required && !readOnly && (
        <span className="text-[9px] font-normal normal-case tracking-normal opacity-80">
          Optional
        </span>
      )}
    </label>
  </div>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal } = useCart();

  const [step, setStep] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const sectionTitleRef = useRef(null);
  const shouldFocusStep = useRef(false);

  const [formData, setFormData] = useState(() => ({
    firstName: "",
    lastName: "",
    email: readSavedEmail(),
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  }));

  const items = cartItems || [];
  const subtotal = Number(cartSubtotal) || 0;
  const shipping = 0;
  const total = subtotal + shipping;

  const totalItems = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0,
  );

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  useEffect(() => {
    if (shouldFocusStep.current) {
      sectionTitleRef.current?.focus();
      shouldFocusStep.current = false;
    }
  }, [step]);

  const changeStep = (nextStep) => {
    shouldFocusStep.current = true;
    setStep(nextStep);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) return;

    changeStep(Math.min(step + 1, 2));
  };

  if (items.length === 0) return null;

  const OrderLines = () => (
    <>
      <ul className="space-y-4">
        {items.map((item) => {
          const id = item.id || item._id;
          const quantity = Number(item.quantity) || 1;

          return (
            <li key={id} className="flex items-center gap-3">
              <Link
                to={`/shop/${id}`}
                aria-label={`View ${item.name}`}
                className="relative block size-16 shrink-0 bg-linen"
              >
                <span className="block size-full overflow-hidden">
                  <CheckoutImage src={item.image} name={item.name} />
                </span>
                <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-wine text-[10px] font-bold text-paper">
                  {quantity}
                </span>
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[9px] font-bold uppercase tracking-[0.16em] text-wine">
                  {item.category || `${storeInfo.businessName} collection`}
                </p>
                <p className="truncate font-serif text-base leading-tight">
                  <Link to={`/shop/${id}`} className="hover:text-wine">
                    {item.name}
                  </Link>
                </p>
                <span className="text-[11px] text-muted">Quantity: {quantity}</span>
              </div>
              <strong className="shrink-0 text-sm font-semibold">
                {money(Number(item.price) * quantity)}
              </strong>
            </li>
          );
        })}
      </ul>

      <dl className="mt-5 grid gap-2.5 border-t border-dashed border-line pt-4 text-xs">
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Subtotal</dt>
          <dd className="font-semibold">{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted">Shipping</dt>
          <dd className="font-semibold text-success">Free</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-end justify-between gap-3 border-t-2 border-ink pt-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
          Order total
        </span>
        <strong className="break-words font-serif text-[32px] font-normal leading-none">
          {money(total)}
        </strong>
      </div>
    </>
  );

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
      {/* ============ Progress bar (continues from cart) ============ */}
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]">
          <Link
            to="/cart"
            className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold transition-colors hover:text-wine"
          >
            <ChevronLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            Back to cart
          </Link>

          <ol aria-label="Checkout progress" className="flex items-center gap-2 sm:gap-3">
            {["Cart", "Details", "Review"].map((label, index) => {
              const position = step === 2 ? 2 : 1;
              const complete = index < position;
              const current = index === position;

              return (
                <li key={label} className="flex items-center gap-2 sm:gap-3">
                  <span
                    aria-current={current ? "step" : undefined}
                    className={`flex items-center gap-2 text-[11px] font-semibold ${
                      current || complete ? "text-wine" : "text-muted"
                    }`}
                  >
                    <span
                      className={`grid size-6 place-items-center rounded-full text-[10px] transition-all duration-500 ${
                        complete
                          ? "bg-wine text-paper"
                          : current
                            ? "bg-wine text-paper shadow-[0_0_0_4px_rgba(125,48,58,0.15)]"
                            : "border border-line"
                      }`}
                    >
                      {complete ? <Check size={12} className="animate-scale-in" /> : index + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </span>
                  {index < 2 && (
                    <span aria-hidden="true" className="relative h-px w-5 bg-line sm:w-10">
                      <span
                        className={`absolute inset-0 origin-left bg-wine transition-transform duration-700 ease-soft ${
                          index < position ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] items-start gap-8 px-4 pt-6 sm:px-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-[clamp(32px,4vw,64px)] lg:px-[clamp(40px,4vw,64px)]">
        {/* ============ Mobile summary toggle ============ */}
        <div className="border border-ink bg-paper lg:hidden">
          <button
            type="button"
            aria-expanded={summaryOpen}
            aria-controls="mobile-order-summary"
            onClick={() => setSummaryOpen((open) => !open)}
            className="flex min-h-14 w-full items-center justify-between gap-4 px-4 text-sm"
          >
            <span className="flex items-center gap-2 font-semibold text-wine">
              {summaryOpen ? "Hide" : "Show"} order summary
              <ChevronDown
                size={16}
                className={`transition-transform duration-500 ${summaryOpen ? "rotate-180" : ""}`}
              />
            </span>
            <strong className="font-serif text-xl font-normal">{money(total)}</strong>
          </button>
          <div
            id="mobile-order-summary"
            className={`grid transition-[grid-template-rows] duration-500 ease-soft ${
              summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="border-t border-line p-4 pt-5">
                <OrderLines />
              </div>
            </div>
          </div>
        </div>

        {/* ============ Main form ============ */}
        <section className="min-w-0">
          <header>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
              A little closer to yours
            </p>
            <h1 className="mt-3 font-serif text-[clamp(44px,5.4vw,80px)] leading-[0.95] tracking-[-0.03em] perspective-distant">
              <span className="inline-block animate-fold-in">The final</span>{" "}
              <em className="inline-block animate-fold-in text-wine [animation-delay:140ms]">
                details.
              </em>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Review your selection and delivery details. Online orders and
              payments are not yet available.
            </p>
          </header>

          <div
            role="note"
            className="mt-7 flex items-start gap-3 border-l-2 border-wine bg-wine-soft px-4 py-3.5"
          >
            <Clock3 size={17} strokeWidth={1.5} className="mt-0.5 shrink-0 text-wine" />
            <p className="text-[11px] leading-relaxed">
              <strong className="block font-bold">Online checkout is coming soon.</strong>
              These details are for review only. No order is placed and no
              payment is collected.
            </p>
          </div>

          {/* Segmented step tabs */}
          <div
            aria-label="Your details, in three steps"
            className="relative mt-8 grid grid-cols-3 border border-ink bg-paper"
          >
            <span
              aria-hidden="true"
              style={{ transform: `translateX(${step * 100}%)` }}
              className="absolute inset-y-0 left-0 w-1/3 bg-ink transition-transform duration-500 ease-soft"
            />
            {STEPS.map(({ label, Icon }, index) => {
              const reachable = index < step;
              const current = index === step;

              return (
                <button
                  key={label}
                  type="button"
                  disabled={!reachable}
                  onClick={() => changeStep(index)}
                  aria-current={current ? "step" : undefined}
                  className={`relative flex min-h-14 items-center justify-center gap-2 text-xs font-semibold transition-colors duration-500 disabled:cursor-default sm:text-sm ${
                    current ? "text-paper" : reachable ? "text-wine hover:underline" : "text-muted"
                  }`}
                >
                  {reachable ? (
                    <Check size={14} className="animate-scale-in" />
                  ) : (
                    <Icon size={14} strokeWidth={1.6} />
                  )}
                  <span className="hidden min-[400px]:inline">{label}</span>
                  <span className="min-[400px]:hidden">{String(index + 1).padStart(2, "0")}</span>
                </button>
              );
            })}
          </div>

          <div className="perspective-[1600px]">
            <div
              key={step}
              className="origin-top animate-flip-up border border-t-0 border-line bg-paper p-5 sm:p-8"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                Step {String(step + 1).padStart(2, "0")}
              </p>
              <h2
                ref={sectionTitleRef}
                tabIndex={-1}
                className="mb-7 mt-1.5 font-serif text-[clamp(28px,2.8vw,38px)] leading-tight outline-none"
              >
                {step === 0
                  ? "First, a little about you."
                  : step === 1
                    ? "Next, your delivery details."
                    : "Everything in one place."}
              </h2>

              {step < 2 ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {step === 0 ? (
                      <>
                        <Field
                          name="firstName"
                          label="First name"
                          autoComplete="given-name"
                          placeholder="First name"
                          required
                          value={formData.firstName}
                          onChange={handleChange}
                        />
                        <Field
                          name="lastName"
                          label="Last name"
                          autoComplete="family-name"
                          placeholder="Last name"
                          required
                          value={formData.lastName}
                          onChange={handleChange}
                        />
                        <Field
                          name="email"
                          label="Email address"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <Field
                          name="phone"
                          label="Phone number"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+1 555 000 0000"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </>
                    ) : (
                      <>
                        <Field
                          name="address"
                          label="Street address"
                          autoComplete="address-line1"
                          placeholder="Street address"
                          required
                          full
                          value={formData.address}
                          onChange={handleChange}
                        />
                        <Field
                          name="apartment"
                          label="Apartment, suite, etc."
                          autoComplete="address-line2"
                          placeholder="Apartment or suite"
                          full
                          value={formData.apartment}
                          onChange={handleChange}
                        />
                        <Field
                          name="city"
                          label="City"
                          autoComplete="address-level2"
                          placeholder="City"
                          required
                          value={formData.city}
                          onChange={handleChange}
                        />
                        <Field
                          name="state"
                          label="State"
                          autoComplete="address-level1"
                          placeholder="State"
                          required
                          value={formData.state}
                          onChange={handleChange}
                        />
                        <Field
                          name="postalCode"
                          label="ZIP code"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          pattern="[0-9]{5}(-[0-9]{4})?"
                          placeholder="10001 or 10001-1234"
                          required
                          value={formData.postalCode}
                          onChange={handleChange}
                        />
                        <Field
                          name="country"
                          label="Country"
                          autoComplete="country-name"
                          readOnly
                          value={formData.country}
                          onChange={handleChange}
                        />
                      </>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {step === 1 ? (
                      <button
                        type="button"
                        onClick={() => changeStep(0)}
                        className="group inline-flex min-h-11 items-center justify-center gap-2 px-2 text-xs font-semibold transition-colors hover:text-wine"
                      >
                        <ArrowLeft
                          size={16}
                          className="transition-transform duration-300 group-hover:-translate-x-1"
                        />
                        Back
                      </button>
                    ) : (
                      <span className="hidden text-[11px] text-muted sm:block">
                        {totalItems} {totalItems === 1 ? "piece" : "pieces"} ·{" "}
                        {money(total)}
                      </span>
                    )}

                    <button
                      type="submit"
                      className="group relative flex min-h-[56px] items-center justify-between gap-8 overflow-hidden bg-wine px-6 py-4 text-xs font-bold text-paper transition-colors duration-300 hover:bg-wine-dark"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                      />
                      <span className="relative">
                        {step === 0 ? "Continue to delivery" : "Review details"}
                      </span>
                      <ArrowRight
                        size={18}
                        className="relative transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "Contact",
                        target: 0,
                        Icon: User,
                        lines: [
                          `${formData.firstName} ${formData.lastName}`,
                          formData.email,
                          formData.phone,
                        ],
                      },
                      {
                        title: "Delivery address",
                        target: 1,
                        Icon: MapPin,
                        lines: [
                          formData.address,
                          formData.apartment,
                          `${formData.city}, ${formData.state} ${formData.postalCode}`,
                          formData.country,
                        ],
                      },
                    ].map(({ title, target, Icon, lines }, index) => (
                      <section
                        key={title}
                        style={{ animationDelay: `${200 + index * 120}ms` }}
                        className="relative animate-rise border border-line bg-chalk p-5"
                      >
                        <div className="mb-3 flex items-center justify-between gap-4">
                          <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                            <Icon size={15} className="text-wine" />
                            {title}
                          </h3>
                          <button
                            type="button"
                            onClick={() => changeStep(target)}
                            className="min-h-10 px-1 text-xs font-semibold text-wine underline underline-offset-4"
                          >
                            Edit
                          </button>
                        </div>

                        {lines.filter(Boolean).map((line, lineIndex) => (
                          <p
                            key={`${title}-${lineIndex}`}
                            className="my-0.5 break-words text-[13px] text-muted"
                          >
                            {line}
                          </p>
                        ))}
                      </section>
                    ))}
                  </div>

                  <div className="my-6 flex animate-rise items-start gap-4 bg-wine-soft p-5 [animation-delay:450ms]">
                    <Clock3 size={22} strokeWidth={1.4} className="mt-0.5 shrink-0 text-wine" />
                    <div>
                      <h3 className="text-sm font-bold">Payment is not available yet.</h3>
                      <p className="mt-2 text-xs leading-relaxed">
                        {storeInfo.businessName} is completing its online
                        payment setup. Your order has not been submitted.
                        These details are not saved when you leave this page.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/cart"
                    className="group flex min-h-[56px] items-center justify-between gap-6 bg-ink px-6 py-4 text-xs font-bold text-paper transition-colors duration-300 hover:bg-wine"
                  >
                    Return to cart
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3">
            <Truck size={20} strokeWidth={1.4} className="mt-0.5 shrink-0 text-wine" />
            <div>
              <strong className="text-xs">United States delivery</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                Free U.S. shipping is shown in your order review.
              </p>
            </div>
          </div>
        </section>

        {/* ============ Desktop receipt ============ */}
        <aside
          aria-labelledby="checkout-order-title"
          className="hidden min-w-0 lg:sticky lg:top-28 lg:block"
        >
          <div className="animate-flip-up [animation-delay:200ms]">
            <div className="bg-paper px-6 pb-6 pt-7 shadow-[0_30px_60px_-40px_rgba(36,34,35,0.7)]">
              <div className="mb-5 flex items-end justify-between gap-3 border-b border-dashed border-line pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    Your selection
                  </p>
                  <h2 id="checkout-order-title" className="mt-1 font-serif text-2xl">
                    {totalItems} {totalItems === 1 ? "lovely piece" : "lovely pieces"}.
                  </h2>
                </div>
                <Link
                  to="/cart"
                  className="group inline-flex min-h-10 items-center gap-1.5 text-[11px] font-bold text-wine"
                >
                  Edit cart
                  <ArrowRight
                    size={13}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <OrderLines />

              <p className="mt-6 text-center text-lg font-semibold lowercase tracking-[-0.085em]">
                {storeInfo.businessName}
                <span className="text-wine">✳</span>
              </p>
            </div>
            <div
              aria-hidden="true"
              className="h-3 bg-[radial-gradient(circle_at_8px_0,var(--color-paper)_7px,transparent_7.5px)] bg-[length:16px_12px] bg-repeat-x"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;