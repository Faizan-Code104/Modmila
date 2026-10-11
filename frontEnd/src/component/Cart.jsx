import React, { useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ImageOff,
  Minus,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext";
import storeInfo, { CATEGORIES } from "../storeInfo";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: storeInfo.currency || "USD",
  }).format(Number(value) || 0);

const pad = (number) => String(number).padStart(2, "0");

const STEPS = ["Cart", "Details", "Review"];

const CartImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  if (!src || failedSource === src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linen text-[10px] text-muted">
        <ImageOff size={26} strokeWidth={1.2} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name || `${storeInfo.businessName} bedding`}
      loading="lazy"
      onError={() => setFailedSource(src)}
      className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-105"
    />
  );
};

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal } = useCart();
  const receiptRef = useRef(null);

  const items = cartItems || [];

  const getQuantity = (item) =>
    Math.max(1, Math.floor(Number(item.quantity) || 1));

  const totalItems = items.reduce(
    (total, item) => total + getQuantity(item),
    0,
  );

  const subtotal = Number(cartSubtotal) || 0;
  const shipping = 0;
  const total = subtotal + shipping;

  const handleQuantity = (item, change) => {
    updateQuantity(item.id, Math.max(1, getQuantity(item) + change));
  };

  const handleReceiptMove = (event) => {
    const element = receiptRef.current;
    if (
      !element ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.transform = `perspective(1200px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  };

  const resetReceipt = () => {
    if (receiptRef.current) receiptRef.current.style.transform = "";
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
      {/* ============ Progress bar ============ */}
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]">
          <Link
            to="/shop"
            className="group inline-flex min-h-11 shrink-0 items-center gap-1.5 text-xs font-semibold transition-colors hover:text-wine"
          >
            <ChevronLeft
              size={17}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="hidden sm:inline">Back to collection</span>
            <span className="sm:hidden">Shop</span>
          </Link>

          <ol aria-label="Checkout progress" className="flex items-center gap-2 sm:gap-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-2 sm:gap-3">
                <span
                  aria-current={index === 0 ? "step" : undefined}
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    index === 0 ? "text-wine" : "text-muted"
                  }`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full text-[10px] ${
                      index === 0
                        ? "bg-wine text-paper shadow-[0_0_0_4px_rgba(125,48,58,0.15)]"
                        : "border border-line"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="hidden sm:inline">{step}</span>
                </span>
                {index < STEPS.length - 1 && (
                  <span aria-hidden="true" className="h-px w-5 bg-line sm:w-10" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]">
        {items.length === 0 ? (
          /* ============ Empty cart ============ */
          <section className="flex flex-col items-center py-14 text-center sm:py-20">
            <div
              aria-hidden="true"
              className="relative h-[260px] w-full max-w-[420px] perspective-[1400px] sm:h-[320px]"
            >
              <div className="absolute inset-0 animate-float-3d transform-3d">
                {CATEGORIES.slice(0, 3).map((category, index) => (
                  <div
                    key={category.slug}
                    style={{
                      transform: `translateZ(${index * 40}px) rotate(${(index - 1) * 9}deg) translateX(${(index - 1) * 70}px)`,
                    }}
                    className="absolute inset-x-[30%] inset-y-[6%]"
                  >
                    <div
                      style={{ animationDelay: `${index * 140}ms` }}
                      className="size-full animate-flip-up border-[6px] border-paper bg-paper shadow-[0_30px_50px_-25px_rgba(36,34,35,0.6)]"
                    >
                      <img src={category.image} alt="" className="size-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
              Your collection starts here
            </p>
            <h1 className="mt-4 font-serif text-[clamp(46px,6vw,84px)] leading-[0.95] tracking-[-0.03em]">
              Your cart is <em className="text-wine">resting.</em>
            </h1>
            <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-muted">
              Your cart is empty. Discover the layers that fit your room, your
              routine and your personal style.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  className="rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-semibold transition-colors hover:border-wine hover:text-wine"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <Link
              to="/shop"
              className="group mt-6 inline-flex min-h-14 items-center gap-8 bg-ink px-7 py-4 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-wine"
            >
              Explore bedding
              <ArrowUpRight
                size={19}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </section>
        ) : (
          <div className="grid items-start gap-10 pt-9 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-[clamp(32px,4vw,64px)]">
            {/* ============ Items ============ */}
            <section aria-labelledby="cart-title" className="min-w-0">
              <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    The pieces you picked
                  </p>
                  <h1
                    id="cart-title"
                    className="mt-3 font-serif text-[clamp(48px,6vw,88px)] leading-[0.95] tracking-[-0.03em] perspective-distant"
                  >
                    <span className="inline-block animate-fold-in">Your</span>{" "}
                    <em className="inline-block animate-fold-in text-wine [animation-delay:140ms]">
                      cart.
                    </em>
                  </h1>
                </div>
                <p className="text-xs text-muted">
                  <strong
                    key={totalItems}
                    className="inline-block animate-scale-in font-serif text-2xl font-normal text-ink"
                  >
                    {totalItems}
                  </strong>{" "}
                  {totalItems === 1 ? "piece" : "pieces"} · {items.length}{" "}
                  {items.length === 1 ? "style" : "styles"}
                </p>
              </header>

              <div className="mt-8 grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item, index) => {
                  const quantity = getQuantity(item);

                  return (
                    <article
                      key={item.id}
                      style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
                      className="group min-w-0 animate-rise"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden bg-linen">
                        <Link
                          to={`/shop/${item.id}`}
                          aria-label={`View ${item.name}`}
                          className="absolute inset-0 block"
                        >
                          <CartImage src={item.image} name={item.name} />
                        </Link>

                        <span className="pointer-events-none absolute left-3 top-3 font-serif text-lg text-paper drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                          {pad(index + 1)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur-sm transition-all duration-300 hover:rotate-12 hover:bg-wine hover:text-paper"
                        >
                          <Trash2 size={15} strokeWidth={1.6} />
                        </button>

                        {/* quantity stepper overlay */}
                        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between bg-paper/95 backdrop-blur-sm">
                          <button
                            type="button"
                            disabled={quantity <= 1}
                            onClick={() => handleQuantity(item, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="grid size-11 place-items-center transition-colors hover:bg-linen disabled:opacity-35"
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            key={quantity}
                            aria-live="polite"
                            aria-atomic="true"
                            className="animate-scale-in text-sm font-semibold"
                          >
                            Qty {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantity(item, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="grid size-11 place-items-center transition-colors hover:bg-linen"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 truncate text-[9px] font-bold uppercase tracking-[0.18em] text-wine sm:text-[10px]">
                        {item.category || `${storeInfo.businessName} collection`}
                      </p>
                      <h2 className="mt-1 break-words font-serif text-xl leading-tight sm:text-[22px]">
                        <Link
                          to={`/shop/${item.id}`}
                          className="transition-colors hover:text-wine"
                        >
                          {item.name}
                        </Link>
                      </h2>
                      <div className="mt-1.5 flex items-baseline justify-between gap-3 text-xs">
                        <span className="text-muted">{formatPrice(item.price)} each</span>
                        <strong className="text-sm font-semibold">
                          {formatPrice(Number(item.price) * quantity)}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link
                to="/shop"
                className="group mt-12 flex items-center justify-between gap-6 border-y border-ink py-6 transition-colors hover:text-wine"
              >
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    There is more to discover
                  </span>
                  <span className="mt-1 block font-serif text-2xl sm:text-3xl">
                    Find your <em>next layer.</em>
                  </span>
                </span>
                <span className="grid size-12 shrink-0 place-items-center rounded-full border border-current transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight size={22} strokeWidth={1.4} />
                </span>
              </Link>
            </section>

            {/* ============ Receipt summary ============ */}
            <aside
              aria-labelledby="receipt-title"
              className="min-w-0 lg:sticky lg:top-28"
              onMouseMove={handleReceiptMove}
              onMouseLeave={resetReceipt}
            >
              <div className="animate-flip-up [animation-delay:200ms]">
                <div
                  ref={receiptRef}
                  className="transition-transform duration-500 ease-out will-change-transform"
                >
                  <div className="bg-paper px-6 pb-6 pt-7 shadow-[0_30px_60px_-40px_rgba(36,34,35,0.7)] sm:px-7">
                    <div className="text-center">
                      <p className="text-lg font-semibold lowercase tracking-[-0.085em]">
                        {storeInfo.businessName}
                        <span className="text-wine">✳</span>
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">
                        Ready when you are
                      </p>
                    </div>

                    <h2
                      id="receipt-title"
                      className="mt-6 border-y border-dashed border-line py-3 text-center font-serif text-2xl"
                    >
                      Make them <em className="text-wine">yours.</em>
                    </h2>

                    <ul className="mt-4 space-y-2.5 text-xs">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-baseline gap-2">
                          <span className="min-w-0 truncate">{item.name}</span>
                          <span className="shrink-0 text-muted">× {getQuantity(item)}</span>
                          <span
                            aria-hidden="true"
                            className="mx-1 min-w-4 flex-1 border-b border-dotted border-line"
                          />
                          <span className="shrink-0 font-semibold">
                            {formatPrice(Number(item.price) * getQuantity(item))}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <dl className="mt-5 grid gap-2.5 border-t border-dashed border-line pt-4 text-xs">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">
                          Subtotal · {totalItems} {totalItems === 1 ? "item" : "items"}
                        </dt>
                        <dd className="font-semibold">{formatPrice(subtotal)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">Shipping</dt>
                        <dd className="font-semibold text-success">Free</dd>
                      </div>
                    </dl>

                    <div
                      aria-live="polite"
                      aria-atomic="true"
                      className="mt-4 flex items-end justify-between gap-4 border-t-2 border-ink pt-4"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
                        Order total
                      </span>
                      <strong
                        key={total}
                        className="animate-rise break-words font-serif text-[34px] font-normal leading-none"
                      >
                        {formatPrice(total)}
                      </strong>
                    </div>

                    <Link
                      to="/checkout"
                      className="group relative mt-6 flex min-h-14 items-center justify-between gap-4 overflow-hidden bg-wine px-5 py-4 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-wine-dark"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                      />
                      <span className="relative">Proceed to checkout</span>
                      <ArrowRight
                        size={18}
                        className="relative transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
                      Review your items and quantities before checkout.
                    </p>

                    <div className="mt-5 flex items-start gap-3 border-t border-dashed border-line pt-4">
                      <Truck size={20} strokeWidth={1.4} className="mt-0.5 shrink-0 text-wine" />
                      <div>
                        <strong className="text-xs">Free U.S. shipping</strong>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                          No shipping charge added to this order.
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-center text-[9px] uppercase tracking-[0.3em] text-muted">
                      Chosen with a little intention
                    </p>
                  </div>

                  {/* scalloped tear-off edge */}
                  <div
                    aria-hidden="true"
                    className="h-3 bg-[radial-gradient(circle_at_8px_0,var(--color-paper)_7px,transparent_7.5px)] bg-[length:16px_12px] bg-repeat-x"
                  />
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;