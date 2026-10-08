import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ImageOff,
  Minus,
  Plus,
  RotateCcw,
  ShoppingCart,
  Truck,
  X,
} from "lucide-react";

import { useCart } from "./CartContext";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO, CATEGORIES } from "../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");

const getProductId = (product) =>
  String(product?._id || product?.id || "");

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") return "—";

  const value = Number(price);

  return Number.isFinite(value) && value >= 0
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: BUSINESS_INFO.currency || "USD",
      }).format(value)
    : "—";
};

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const findStoreCategory = (value) => {
  const key = normalize(value);
  if (!key) return null;
  return (
    CATEGORIES.find(
      (category) =>
        normalize(category.slug) === key || normalize(category.name) === key,
    ) || null
  );
};

const pad = (number) => String(number).padStart(2, "0");

const canTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ProductImage = ({ image, alt, thumbnail = false }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading={thumbnail ? "lazy" : "eager"}
      onError={() => setFailed(true)}
      className="size-full object-cover"
    />
  ) : (
    <span className="flex size-full flex-col items-center justify-center gap-3 text-xs text-muted">
      <ImageOff size={thumbnail ? 20 : 36} aria-hidden="true" />
      {!thumbnail && <span>Image unavailable</span>}
    </span>
  );
};

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems = [] } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  const noticeTimer = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    clearTimeout(noticeTimer.current);
    setNotice("");
    setProduct(null);
    setActiveImage(0);
    setQuantity(1);
    setLoading(true);
    setErrorMessage("");

    const fetchProduct = async () => {
      try {
        if (!id) throw new Error("The product link is incomplete.");

        const response = await fetch(
          `${apiBase}/api/products/${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load this product.");
        }

        if (
          !data.product ||
          typeof data.product !== "object" ||
          Array.isArray(data.product) ||
          !getProductId(data.product)
        ) {
          throw new Error("Product details are unavailable.");
        }

        if (active) setProduct(data.product);
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setErrorMessage(error.message || "Unable to load this product.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [id, retryCount]);

  useEffect(() => {
    return () => clearTimeout(noticeTimer.current);
  }, []);

  const productId = getProductId(product);
  const rawStock = Number(product?.stock);
  const stock = Number.isFinite(rawStock)
    ? Math.max(0, Math.floor(rawStock))
    : 0;

  const inStock =
    stock > 0 &&
    String(product?.status || "").trim().toLowerCase() !== "out of stock";

  const alreadyInCart = cartItems.reduce((total, item) => {
    if (getProductId(item) !== productId) return total;

    const value = Number(item.quantity);
    return total + (Number.isFinite(value) ? Math.max(0, value) : 0);
  }, 0);

  const availableQuantity = inStock
    ? Math.max(0, Math.floor(stock - alreadyInCart))
    : 0;

  const selectedQuantity = availableQuantity
    ? Math.min(Math.max(1, quantity), availableQuantity)
    : 1;

  const canPurchase = Boolean(productId) && availableQuantity > 0;

  const images = Array.isArray(product?.images)
    ? product.images.filter(
        (image) => typeof image === "string" && image.trim(),
      )
    : [];

  if (!images.length && typeof product?.image === "string") {
    if (product.image.trim()) images.push(product.image);
  }

  const imageIndex = Math.min(activeImage, Math.max(0, images.length - 1));

  const changeImage = (direction) => {
    if (images.length < 2) return;

    setActiveImage(
      (current) => (current + direction + images.length) % images.length,
    );
  };

  const dismissNotice = () => {
    clearTimeout(noticeTimer.current);
    setNotice("");
  };

  const addSelectedItems = () => {
    if (!product || !canPurchase) return false;

    const cartProduct = {
      ...product,
      id: productId,
      price: Number(product.price),
      image: getImageUrl(images[0]),
    };

    // CartContext adds one unit per call.
    for (let index = 0; index < selectedQuantity; index += 1) {
      addToCart(cartProduct);
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!addSelectedItems()) return;

    clearTimeout(noticeTimer.current);
    setNotice(
      `${selectedQuantity} ${
        selectedQuantity === 1 ? "item" : "items"
      } added to cart.`,
    );
    setQuantity(1);

    noticeTimer.current = setTimeout(() => setNotice(""), 3000);
  };

  const handleBuyNow = () => {
    if (addSelectedItems()) navigate("/cart");
  };

  const handleStageMove = (event) => {
    const element = stageRef.current;
    if (!element || !canTilt()) return;

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.transform = `perspective(1400px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
  };

  const resetStage = () => {
    if (stageRef.current) stageRef.current.style.transform = "";
  };

  const specifications = [
    ["SKU", product?.sku],
    ["Material", product?.material],
    ["Weight", product?.weight],
  ];

  const categoryName =
    typeof product?.category === "string"
      ? product.category
      : product?.category?.name || "";
  const storeCategory = findStoreCategory(categoryName);

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      <div className="mx-auto w-full max-w-[1400px] px-4 pb-16 sm:px-8 sm:pb-24 lg:px-[clamp(40px,5vw,72px)]">
        {/* Top navigation */}
        <nav
          aria-label="Product navigation"
          className="flex min-h-[64px] items-center justify-between gap-5 border-b border-line text-[11px] sm:min-h-[72px]"
        >
          <Link
            to="/shop"
            className="group inline-flex min-h-11 items-center gap-2.5 font-semibold transition-colors hover:text-wine"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            Back to collection
          </Link>

          <span className="hidden min-w-0 truncate uppercase tracking-[0.16em] text-muted sm:block">
            <Link to="/shop" className="hover:text-wine">
              Shop
            </Link>
            {storeCategory && (
              <>
                {" / "}
                <Link
                  to={`/shop?category=${storeCategory.slug}`}
                  className="hover:text-wine"
                >
                  {storeCategory.name}
                </Link>
              </>
            )}
            {product?.name && <span className="text-ink"> / {product.name}</span>}
          </span>
        </nav>

        {loading ? (
          <div
            role="status"
            aria-label="Loading product details"
            className="grid gap-8 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:pt-12"
          >
            <div className="aspect-[4/5] animate-shimmer bg-[linear-gradient(110deg,var(--color-linen)_30%,var(--color-paper)_50%,var(--color-linen)_70%)] bg-[length:200%_100%] sm:aspect-[5/4]" />
            <div className="space-y-4 pt-4">
              <div className="h-3 w-1/4 bg-linen" />
              <div className="h-12 w-4/5 bg-linen" />
              <div className="h-6 w-1/4 bg-linen" />
              <div className="h-28 w-full bg-linen" />
              <div className="h-14 w-full bg-linen" />
            </div>
          </div>
        ) : errorMessage || !product ? (
          <div
            role="alert"
            className="mx-auto mt-10 flex min-h-[420px] max-w-2xl animate-fold-in flex-col items-center justify-center border border-line bg-paper px-6 py-12 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full border border-wine text-wine">
              <ShoppingCart size={24} aria-hidden="true" />
            </span>
            <h1 className="mt-6 font-serif text-4xl sm:text-5xl">
              Product <em className="text-wine">unavailable</em>
            </h1>
            <p className="mt-4 max-w-[420px] text-sm leading-relaxed text-muted">
              {errorMessage || "This product is currently unavailable."}
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
              <button
                type="button"
                onClick={() => setRetryCount((value) => value + 1)}
                className="min-h-12 bg-ink px-7 py-3 text-xs font-semibold text-paper transition-colors hover:bg-wine"
              >
                Try again
              </button>

              <Link
                to="/shop"
                className="group inline-flex min-h-11 items-center gap-3 border-b border-ink text-xs font-semibold transition-colors hover:border-wine hover:text-wine"
              >
                Browse the collection
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ============ Gallery + purchase ============ */}
            <div className="grid items-start gap-8 pt-6 sm:pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:pt-12">
              {/* Gallery */}
              <section aria-label="Product image gallery" className="min-w-0">
                <div
                  className="animate-scale-in perspective-distant"
                  onMouseMove={handleStageMove}
                  onMouseLeave={resetStage}
                >
                  <div
                    ref={stageRef}
                    className="relative transition-transform duration-500 ease-out will-change-transform"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-linen sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]">
                      <div key={imageIndex} className="size-full animate-flip-up">
                        <ProductImage
                          image={images[imageIndex]}
                          alt={`${product.name || "Product"} — view ${imageIndex + 1}`}
                        />
                      </div>

                      <span className="absolute left-3 top-3 bg-chalk/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-wine backdrop-blur-sm sm:left-5 sm:top-5">
                        MM / {pad(imageIndex + 1)}
                      </span>

                      {product.isFeatured && (
                        <span className="absolute right-3 top-3 bg-wine px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-paper sm:right-5 sm:top-5">
                          Featured
                        </span>
                      )}

                      {images.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 border border-line bg-paper/95 p-1 backdrop-blur-sm sm:bottom-5">
                          <button
                            type="button"
                            onClick={() => changeImage(-1)}
                            aria-label="Previous product image"
                            className="grid size-10 place-items-center transition-colors hover:bg-wine hover:text-paper sm:size-11"
                          >
                            <ChevronLeft size={19} aria-hidden="true" />
                          </button>

                          <span
                            aria-live="polite"
                            aria-atomic="true"
                            className="min-w-14 text-center text-[11px] tracking-[0.14em]"
                          >
                            {pad(imageIndex + 1)}
                            <span className="text-muted"> / </span>
                            {pad(images.length)}
                          </span>

                          <button
                            type="button"
                            onClick={() => changeImage(1)}
                            aria-label="Next product image"
                            className="grid size-10 place-items-center transition-colors hover:bg-wine hover:text-paper sm:size-11"
                          >
                            <ChevronRight size={19} aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:mt-4 sm:gap-3">
                    {images.map((image, index) => {
                      const selected = imageIndex === index;

                      return (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveImage(index)}
                          aria-label={`Show product image ${index + 1}`}
                          aria-pressed={selected}
                          className={`relative size-[72px] shrink-0 overflow-hidden border-2 bg-linen transition-all duration-300 sm:size-20 ${
                            selected
                              ? "-translate-y-1 border-wine"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <ProductImage image={image} alt="" thumbnail />
                          <span
                            aria-hidden="true"
                            className="absolute bottom-1 left-1 bg-chalk/90 px-1 text-[8px] font-bold"
                          >
                            {pad(index + 1)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Purchase panel */}
              <section
                aria-labelledby="product-title"
                className="min-w-0 lg:sticky lg:top-28"
              >
                <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
                  <span className="h-px w-6 bg-wine" aria-hidden="true" />
                  {categoryName || "The collection"}
                </p>

                <h1
                  id="product-title"
                  className="mt-4 animate-fold-in break-words font-serif text-[clamp(36px,4.4vw,60px)] leading-[1.02] tracking-[-0.02em] [animation-delay:100ms]"
                >
                  {product.name || "Product"}
                </h1>

                <div className="mt-5 flex animate-rise flex-wrap items-center justify-between gap-4 border-y border-line py-4 [animation-delay:200ms]">
                  <p className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                    {formatPrice(product.price)}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs text-muted">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${
                        inStock ? "animate-pulse bg-success" : "bg-line"
                      }`}
                    />
                    {inStock ? "In stock" : "Out of stock"}
                  </span>
                </div>

                {product.description && (
                  <p className="mt-5 line-clamp-4 animate-rise text-sm leading-relaxed text-muted [animation-delay:260ms]">
                    {product.description}
                  </p>
                )}

                <div className="mt-7 animate-rise [animation-delay:320ms]">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      id="quantity-label"
                      className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    >
                      Quantity
                    </span>

                    <div
                      role="group"
                      aria-labelledby="quantity-label"
                      className="flex items-center border border-ink"
                    >
                      <button
                        type="button"
                        disabled={!canPurchase || selectedQuantity <= 1}
                        onClick={() =>
                          setQuantity(Math.max(1, selectedQuantity - 1))
                        }
                        aria-label="Decrease quantity"
                        className="grid size-11 place-items-center transition-colors hover:bg-linen disabled:opacity-40"
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>

                      <span
                        key={selectedQuantity}
                        aria-live="polite"
                        className="min-w-10 animate-scale-in text-center text-sm font-semibold"
                      >
                        {selectedQuantity}
                      </span>

                      <button
                        type="button"
                        disabled={
                          !canPurchase || selectedQuantity >= availableQuantity
                        }
                        onClick={() =>
                          setQuantity(
                            Math.min(availableQuantity, selectedQuantity + 1),
                          )
                        }
                        aria-label="Increase quantity"
                        className="grid size-11 place-items-center transition-colors hover:bg-linen disabled:opacity-40"
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      disabled={!canPurchase}
                      onClick={handleAddToCart}
                      className="group relative flex min-h-14 items-center justify-between gap-4 overflow-hidden bg-wine px-6 py-4 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-wine-dark disabled:bg-muted disabled:opacity-60"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                      />
                      <span className="relative">
                        {!inStock
                          ? "Out of stock"
                          : !availableQuantity
                            ? "Available stock in cart"
                            : "Add to cart"}
                      </span>
                      <ShoppingCart
                        size={18}
                        aria-hidden="true"
                        className="relative transition-transform duration-300 group-hover:-translate-y-0.5"
                      />
                    </button>

                    <button
                      type="button"
                      disabled={!canPurchase}
                      onClick={handleBuyNow}
                      className="group flex min-h-14 items-center justify-between gap-4 border border-ink px-6 py-4 text-sm font-semibold transition-colors duration-300 hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                    >
                      Buy it now
                      <ArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </button>
                  </div>

                  {inStock && !availableQuantity && (
                    <Link
                      to="/cart"
                      className="group mt-4 inline-flex min-h-11 items-center gap-3 border-b border-wine text-xs font-semibold text-wine"
                    >
                      Review this item in your cart
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </div>

                {/* Service notes */}
                <ul
                  aria-label="Shipping and returns information"
                  className="mt-8 divide-y divide-line border-y border-line"
                >
                  {[
                    {
                      icon: Truck,
                      title: "Free standard shipping",
                      text: "On eligible orders within the contiguous United States.",
                    },
                    {
                      icon: Clock3,
                      title: "1–2 business-day processing",
                      text: "Standard transit is generally 3–7 business days after processing.",
                    },
                    {
                      icon: RotateCcw,
                      title: "30-day returns",
                      text: "Eligible items may be returned within 30 days of confirmed delivery, in accordance with our Return and Refund Policy.",
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <li key={title} className="group flex gap-4 py-4">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-wine transition-transform duration-500 group-hover:rotate-y-180 transform-3d">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{title}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {text}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* ============ Details ============ */}
            <section
              aria-labelledby="details-title"
              className="mt-16 grid gap-10 border-t border-ink pt-10 sm:mt-24 sm:pt-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
                  About this piece
                </p>
                <h2
                  id="details-title"
                  className="mt-4 font-serif text-[clamp(34px,4vw,56px)] leading-[1.04]"
                >
                  The details <em>that matter.</em>
                </h2>
                <p className="mt-6 max-w-[640px] whitespace-pre-line text-[15px] leading-[1.85] text-muted">
                  {product.description || "A description has not been provided."}
                </p>
              </div>

              {/* Care-label specifications */}
              <div className="perspective-distant">
                <div className="relative origin-top bg-paper p-6 shadow-[0_30px_50px_-35px_rgba(36,34,35,0.6)] transition-transform duration-700 ease-soft hover:rotate-x-[6deg] sm:p-8">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2.5 border border-dashed border-line"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-4 size-3 -translate-x-1/2 rounded-full border border-line bg-chalk"
                  />

                  <h3 className="relative mt-4 text-center text-[11px] font-bold uppercase tracking-[0.22em]">
                    Product specifications
                  </h3>

                  <dl className="relative mt-6 border-t border-line text-sm">
                    {specifications.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-5 border-b border-line py-3.5"
                      >
                        <dt className="font-semibold">{label}</dt>
                        <dd className="min-w-0 break-words text-right text-muted">
                          {value !== null &&
                          value !== undefined &&
                          String(value).trim()
                            ? String(value)
                            : "Not provided"}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <p className="relative mt-5 text-center font-serif text-lg italic text-wine">
                    {BUSINESS_INFO.businessName} ✳
                  </p>
                </div>
              </div>
            </section>

            {/* ============ More ============ */}
            <footer className="mt-16 grid items-end gap-6 bg-wine px-6 py-10 text-paper sm:mt-24 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-10 sm:py-12">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
                  {BUSINESS_INFO.businessName}
                </p>
                <h2 className="mt-3 font-serif text-[clamp(32px,3.6vw,50px)] leading-[1.05]">
                  Find your <em>next layer.</em>
                </h2>
              </div>

              <Link
                to={storeCategory ? `/shop?category=${storeCategory.slug}` : "/shop"}
                className="group inline-flex min-h-11 w-fit items-center gap-6 border-b border-paper pb-1 text-sm font-semibold"
              >
                {storeCategory ? `More ${storeCategory.name}` : "Explore the collection"}
                <ArrowUpRight
                  size={19}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </Link>
            </footer>
          </>
        )}
      </div>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      >
        {notice && (
          <div className="pointer-events-auto flex max-w-full animate-rise flex-wrap items-center gap-3 border border-ink bg-paper px-5 py-4 text-xs shadow-[0_20px_40px_-20px_rgba(36,34,35,0.5)] sm:flex-nowrap sm:gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-wine text-paper">
              <Check size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words">{notice}</span>
            <Link
              to="/cart"
              className="shrink-0 font-bold text-wine underline underline-offset-4"
            >
              View cart
            </Link>
            <button
              type="button"
              onClick={dismissNotice}
              aria-label="Dismiss cart notification"
              className="grid size-8 shrink-0 place-items-center transition-transform duration-300 hover:rotate-90"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDetails;