import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, ChevronDown, ImageOff, Plus } from "lucide-react";

import { API_BASE_URL } from "../config";
import { useCart } from "./CartContext";
import storeInfo, { CATEGORIES } from "../storeInfo";

const SERVER_URL = API_BASE_URL.replace(/\/+$/, "");
const API_URL = `${SERVER_URL}/api/products`;
const HOME_LIMIT = 12;

/* ---------------- helpers ---------------- */

const getProductId = (product) => product?._id || product?.id;

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const source = image.trim();

  if (/^https?:\/\//i.test(source)) return source;

  return `${SERVER_URL}/${source.replace(/^\/+/, "")}`;
};

const getCategory = (product) => {
  if (typeof product?.category === "string" && product.category.trim()) {
    return product.category.trim();
  }

  return product?.category?.name || "Bedding";
};

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const matchesCategory = (product, category) => {
  const value = normalize(getCategory(product));
  return value === normalize(category.name) || value === normalize(category.slug);
};

const getPriceValue = (product) => {
  const value = Number(product?.price);
  return Number.isFinite(value) ? value : null;
};

const getPrice = (product) => {
  const value = getPriceValue(product);
  return value === null ? "" : `${storeInfo.currencySymbol}${value.toFixed(2)}`;
};

const getDetail = (product) => {
  const detail = [product?.color, product?.material].filter(Boolean).join(" / ");
  if (detail) return detail;

  const text = typeof product?.description === "string" ? product.description : "";
  return text.replace(/\s+/g, " ").trim();
};

const pad = (number) => String(number).padStart(2, "0");

/* Same rule as the Shop page */
const isOutOfStock = (product) => {
  const stock = Number(product?.stock);
  return (
    !Number.isFinite(stock) ||
    stock <= 0 ||
    String(product?.status || "").toLowerCase() === "out of stock"
  );
};

const canTilt = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 3D tilt that follows the pointer (desktop only) */
const useTilt = (max = 8) => {
  const ref = useRef(null);

  const onMouseMove = (event) => {
    const element = ref.current;
    if (!element || !canTilt()) return;

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
};

/* Reveals content on scroll — "fold" gives a 3D unfolding entrance */
const Reveal = ({
  as: Tag = "div",
  className = "",
  delay = 0,
  fold = false,
  children,
  ...rest
}) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window)) {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hidden = fold
    ? "opacity-0 [transform:perspective(1200px)_rotateX(-22deg)_translateY(48px)]"
    : "opacity-0 [transform:translateY(32px)]";
  const visible = fold
    ? "opacity-100 [transform:perspective(1200px)_rotateX(0deg)_translateY(0)]"
    : "opacity-100 [transform:translateY(0)]";

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`origin-top transition-[opacity,transform] duration-1000 ease-soft ${
        shown ? visible : hidden
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const ProductImage = ({ product, className = "", eager = false }) => {
  const source = getImageUrl(product?.images?.[0]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [source]);

  if (!source || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-linen text-muted ${className}`}
        role="img"
        aria-label="Product image unavailable"
      >
        <ImageOff size={36} strokeWidth={1.3} className="opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={source}
      alt={product?.name || `${storeInfo.businessName} bedding`}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      onError={() => setFailed(true)}
      className={className}
    />
  );
};

/* ---------------- product card ---------------- */

const ProductCard = ({ product, index }) => {
  const id = getProductId(product);
  const tilt = useTilt(7);
  const detail = getDetail(product);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = isOutOfStock(product);

  useEffect(() => {
    if (!added) return undefined;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  const handleAdd = () => {
    if (soldOut) return;
    addToCart({
      ...product,
      id,
      image: getImageUrl(product?.images?.[0]),
    });
    setAdded(true);
  };

  return (
    <Reveal
      as="article"
      fold
      delay={(index % 3) * 110}
      className="min-w-0 lg:[&:nth-child(3n+2)]:mt-[34px]"
    >
      <div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className="group relative transition-transform duration-300 ease-out will-change-transform"
      >
        <Link
          to={`/shop/${id}`}
          className="relative block aspect-[6/5] overflow-hidden bg-linen"
        >
          <ProductImage
            product={product}
            className="size-full object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.06]"
          />

          <span className="absolute left-2.5 top-2.5 bg-chalk/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-ink backdrop-blur-sm sm:left-3.5 sm:top-3.5 sm:text-[10px]">
            {getCategory(product)}
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        {soldOut ? (
          <span className="absolute bottom-2.5 right-2.5 bg-ink px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-paper sm:bottom-3.5 sm:right-3.5 sm:text-[10px]">
            Sold out
          </span>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={
              added
                ? `${product?.name || "Product"} added to cart`
                : `Add ${product?.name || "product"} to cart`
            }
            className={`group/add absolute bottom-2.5 right-2.5 flex h-9 min-w-9 items-center justify-center gap-2 rounded-full px-2.5 shadow-[0_8px_20px_-8px_rgba(36,34,35,0.5)] transition-all duration-500 sm:bottom-3.5 sm:right-3.5 sm:h-11 sm:min-w-11 ${
              added
                ? "bg-wine text-paper"
                : "bg-paper text-ink hover:bg-wine hover:text-paper"
            }`}
          >
            {added ? (
              <>
                <Check size={17} strokeWidth={2} className="animate-scale-in" />
                <span className="hidden animate-fade-in pr-1 text-[11px] font-bold sm:inline">
                  Added
                </span>
              </>
            ) : (
              <Plus
                size={18}
                strokeWidth={1.6}
                className="transition-transform duration-500 group-hover/add:rotate-90"
              />
            )}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3 sm:mt-4">
        <h3 className="min-w-0 font-serif text-lg leading-tight sm:text-2xl lg:text-[26px]">
          <Link to={`/shop/${id}`} className="transition-colors hover:text-wine">
            {product?.name || `${storeInfo.businessName} bedding`}
          </Link>
        </h3>
        <strong className="shrink-0 pt-0.5 text-xs font-bold sm:pt-1 sm:text-sm">
          {getPrice(product)}
        </strong>
      </div>

      {detail && (
        <p className="mt-1 line-clamp-1 text-[11px] text-muted sm:mt-2 sm:text-xs">
          {detail}
        </p>
      )}
    </Reveal>
  );
};

const SkeletonCard = ({ index }) => (
  <div className={`min-w-0 ${index % 3 === 1 ? "lg:mt-[34px]" : ""}`}>
    <div className="aspect-[6/5] animate-shimmer bg-[linear-gradient(110deg,var(--color-linen)_30%,var(--color-chalk)_50%,var(--color-linen)_70%)] bg-[length:200%_100%]" />
    <div className="mt-4 h-5 w-3/4 bg-linen" />
    <div className="mt-2 h-3 w-1/3 bg-linen" />
  </div>
);

/* ---------------- page ---------------- */

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeLayer, setActiveLayer] = useState(CATEGORIES[0].slug);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState("featured");

  const stageTilt = useTilt(4);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data = await response.json();

        if (isMounted) {
          setProducts(Array.isArray(data?.products) ? data.products : []);
        }
      } catch (error) {
        if (isMounted && error.name !== "AbortError") {
          setProducts([]);
          setLoadError(
            "Products are temporarily unavailable. Please try again later.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const validProducts = useMemo(
    () => products.filter((product) => getProductId(product)),
    [products],
  );

  const counts = useMemo(() => {
    const result = { all: validProducts.length };
    CATEGORIES.forEach((category) => {
      result[category.slug] = validProducts.filter((product) =>
        matchesCategory(product, category),
      ).length;
    });
    return result;
  }, [validProducts]);

  const visibleProducts = useMemo(() => {
    const category = CATEGORIES.find((item) => item.slug === activeFilter);
    const list = category
      ? validProducts.filter((product) => matchesCategory(product, category))
      : [...validProducts];

    if (sort === "low") {
      list.sort((a, b) => (getPriceValue(a) ?? 0) - (getPriceValue(b) ?? 0));
    } else if (sort === "high") {
      list.sort((a, b) => (getPriceValue(b) ?? 0) - (getPriceValue(a) ?? 0));
    } else {
      list.sort(
        (a, b) =>
          (new Date(b?.createdAt || 0).getTime() || 0) -
          (new Date(a?.createdAt || 0).getTime() || 0),
      );
    }

    return list;
  }, [validProducts, activeFilter, sort]);

  const shownProducts = visibleProducts.slice(0, HOME_LIMIT);
  const layer =
    CATEGORIES.find((item) => item.slug === activeLayer) || CATEGORIES[0];
  const layerIndex = CATEGORIES.indexOf(layer);

  const chooseLayer = (slug) => {
    setActiveLayer(slug);
    setActiveFilter(slug);
  };

  const chooseFilter = (slug) => {
    setActiveFilter(slug);
    if (slug !== "all") setActiveLayer(slug);
  };

  const filters = [
    { slug: "all", name: "All" },
    ...CATEGORIES.map(({ slug, name }) => ({ slug, name })),
  ];

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      {/* ============ 01 / THE ROOM EDIT ============ */}
      <section
        id="room"
        aria-labelledby="room-title"
        className="relative grid lg:min-h-[calc(100dvh-120px)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
      >
        <div className="relative z-10 flex flex-col justify-center px-5 pb-12 pt-11 sm:px-8 lg:py-20 lg:pl-[clamp(40px,6vw,82px)] lg:pr-10">
          <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="h-px w-7 bg-wine" aria-hidden="true" />
            01 / The room edit
          </p>

          <h1
            id="room-title"
            className="mt-8 font-serif text-[clamp(52px,7.3vw,104px)] leading-[0.95] tracking-[-0.04em] perspective-distant lg:mt-14"
          >
            <span className="block animate-fold-in [animation-delay:100ms]">
              A softer
            </span>
            <em className="block animate-fold-in [animation-delay:260ms]">
              kind of living.
            </em>
          </h1>

          <p className="mt-6 max-w-[330px] animate-rise text-[15px] leading-relaxed text-muted [animation-delay:420ms]">
            Beautiful bedding for the everyday. Start with one layer, then make
            it yours.
          </p>

          <div
            role="group"
            aria-label="Choose a bedding layer"
            className="mt-10 max-w-[420px] border-t border-line"
          >
            {CATEGORIES.map((category, index) => {
              const active = category.slug === activeLayer;

              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => chooseLayer(category.slug)}
                  style={{ animationDelay: `${500 + index * 90}ms` }}
                  className={`group grid min-h-[56px] w-full animate-rise grid-cols-[42px_1fr_auto] items-center border-b border-line text-left transition-colors sm:min-h-[59px] sm:grid-cols-[52px_1fr_auto] ${
                    active ? "text-wine" : "hover:text-wine"
                  }`}
                >
                  <span className="text-[11px] tracking-[0.1em] text-muted">
                    {category.id}
                  </span>
                  <span className="font-serif text-[26px] leading-none transition-transform duration-500 group-hover:translate-x-1.5 sm:text-[30px]">
                    {category.name}
                  </span>
                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className={`transition-transform duration-500 ${
                      active
                        ? "-translate-y-0.5 translate-x-0.5 rotate-0"
                        : "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <Link
            to={`/shop?category=${layer.slug}`}
            className="group mt-7 inline-flex w-fit min-w-[172px] animate-rise items-center justify-between gap-8 border-b border-wine pb-3 text-[13px] font-bold text-wine [animation-delay:900ms]"
          >
            Explore {layer.name.toLowerCase()}
            <ArrowUpRight
              size={15}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Room stage */}
        <div className="relative min-h-[340px] sm:min-h-[460px] lg:min-h-0 lg:py-7 lg:pr-[27px]">
          <div className="relative size-full min-h-[inherit] animate-scale-in">
          <div
            ref={stageTilt.ref}
            onMouseMove={stageTilt.onMouseMove}
            onMouseLeave={stageTilt.onMouseLeave}
            className="absolute inset-0 overflow-hidden transition-transform duration-500 ease-out will-change-transform"
          >
            <img
              src="/hero-banner.png"
              alt="A modern bedroom with layered ivory and oxblood bedding"
              fetchPriority="high"
              className="absolute inset-0 size-full animate-slow-zoom object-cover"
            />

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent"
            />

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-paper sm:inset-x-6 sm:bottom-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Room {pad(layerIndex + 1)}
              </span>
              <span className="text-xs font-semibold">
                Calm is a color palette.
              </span>
            </div>

            <span className="absolute right-4 top-4 bg-chalk px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:right-7 sm:top-7">
              MM / {pad(layerIndex + 1)}
            </span>
          </div>
          </div>

          {/* Floating 3D layer swatch */}
          <div className="pointer-events-none absolute bottom-14 right-4 z-20 w-24 perspective-distant sm:bottom-16 sm:w-32 lg:-left-16 lg:bottom-24 lg:right-auto lg:w-44">
            <div className="animate-float-3d transform-3d">
              <figure
                key={layer.slug}
                className="animate-flip-up border-[6px] border-paper bg-paper shadow-[0_30px_50px_-25px_rgba(36,34,35,0.7)] sm:border-8"
              >
                <img
                  src={layer.image}
                  alt=""
                  className="aspect-[4/5] w-full object-cover"
                />
                <figcaption className="px-1 pb-0.5 pt-2 text-[8px] font-bold uppercase leading-tight tracking-[0.16em] text-ink sm:text-[9px]">
                  Layer {layer.id}
                  <span className="mt-0.5 block font-serif text-xs normal-case tracking-normal text-wine sm:text-sm">
                    {layer.name}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1.5 hidden origin-bottom-left -rotate-90 text-[10px] uppercase tracking-[0.2em] text-muted lg:block"
        >
          {storeInfo.businessName} / Comfort in composition
        </span>
      </section>

      {/* ============ 02 / POINT OF VIEW ============ */}
      <section
        id="story"
        aria-label={`The ${storeInfo.businessName} point of view`}
        className="px-4 pb-16 pt-6 sm:px-8 sm:pb-24 lg:px-[55px] lg:pb-[110px] lg:pt-[42px]"
      >
        <Reveal
          fold
          className="grid overflow-hidden lg:min-h-[360px] lg:grid-cols-[minmax(0,0.36fr)_minmax(0,0.64fr)]"
        >
          <div className="group relative min-h-[240px] overflow-hidden sm:min-h-[320px]">
            <img
              src="/about.png"
              alt="Detail of folded ivory bedding with an oxblood throw"
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1.6s] ease-soft group-hover:scale-105"
            />
          </div>

          <div className="relative flex flex-col justify-center bg-wine px-6 py-12 text-paper sm:px-12 lg:px-[82px] lg:py-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
              Designed to come home to
            </span>

            <p className="mt-7 font-serif text-[clamp(38px,4.4vw,62px)] leading-[1.02]">
              Every layer changes
              <br />
              the <em>feeling</em> of a room.
            </p>

            <a
              href="#collection"
              className="group mt-9 inline-flex w-fit min-w-[143px] items-center justify-between gap-8 border-b border-paper pb-3 text-[13px] font-bold"
            >
              Find your layer
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </a>

            <span className="mt-10 text-right text-[10px] uppercase tracking-[0.2em] text-paper/80 lg:absolute lg:bottom-5 lg:right-5 lg:mt-0">
              A quieter kind of statement / 02
            </span>
          </div>
        </Reveal>
      </section>

      {/* ============ 03 / THE COLLECTION ============ */}
      <section
        id="collection"
        aria-labelledby="collection-title"
        className="bg-paper px-4 py-16 sm:px-8 sm:py-24 lg:px-[82px] lg:py-[110px]"
      >
        <div className="mx-auto max-w-[1440px]">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
                The collection /{" "}
                {loading ? "loading" : `${pad(validProducts.length)} pieces`}
              </p>
              <h2
                id="collection-title"
                className="mt-5 font-serif text-[clamp(46px,6.5vw,92px)] leading-[0.95] tracking-[-0.04em]"
              >
                Choose what
                <br />
                <em>feels like home.</em>
              </h2>
            </div>

            <p className="max-w-[250px] text-[15px] leading-relaxed text-muted">
              Good rooms are built in layers. Explore the pieces one at a time.
            </p>
          </Reveal>

          {/* Tools */}
          <div className="mt-12 flex flex-col gap-4 border-b border-ink pb-3 lg:mt-16 lg:flex-row lg:items-end lg:justify-between">
            <div
              role="group"
              aria-label="Filter products"
              className="no-scrollbar -mx-4 flex gap-6 overflow-x-auto px-4 sm:mx-0 sm:gap-9 sm:px-0"
            >
              {filters.map((filter) => {
                const active = activeFilter === filter.slug;

                return (
                  <button
                    key={filter.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => chooseFilter(filter.slug)}
                    className={`relative shrink-0 whitespace-nowrap pb-2 text-sm transition-colors ${
                      active ? "font-bold text-wine" : "text-muted hover:text-ink"
                    }`}
                  >
                    {filter.name}
                    <sup className="ml-1.5 text-[9px] font-normal">
                      {pad(counts[filter.slug] || 0)}
                    </sup>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-wine transition-transform duration-500 ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-6 lg:justify-end">
              <label className="flex items-center gap-3 text-sm">
                <span className="font-bold">Sort</span>
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="min-w-[150px] cursor-pointer appearance-none bg-transparent py-1 pr-7 text-sm outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                  </select>
                  <ChevronDown
                    size={15}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
                  />
                </span>
              </label>

              <p aria-live="polite" className="text-xs text-muted">
                {loading
                  ? "Loading pieces"
                  : `Showing ${shownProducts.length} of ${visibleProducts.length} ${
                      visibleProducts.length === 1 ? "piece" : "pieces"
                    }`}
              </p>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              role="status"
              aria-label="Loading products"
              className="mt-9 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-[19px] lg:gap-y-14"
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} index={index} />
              ))}
            </div>
          ) : loadError ? (
            <div
              role="alert"
              className="mt-9 border border-line bg-chalk px-6 py-14 text-center"
            >
              <p className="text-sm leading-7 text-muted">{loadError}</p>
              <Link
                to="/shop"
                className="mt-6 inline-flex min-h-12 items-center gap-4 bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-wine"
              >
                Visit shop
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          ) : !visibleProducts.length ? (
            <div className="mt-9 border border-dashed border-line px-6 py-14 text-center">
              <h3 className="font-serif text-3xl">
                {validProducts.length
                  ? "Nothing in this layer yet"
                  : "Collection coming soon"}
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
                {validProducts.length
                  ? "New pieces are on their way. Explore another layer in the meantime."
                  : `Products are being prepared for the ${storeInfo.businessName} collection. Please check back soon.`}
              </p>
              {!!validProducts.length && (
                <button
                  type="button"
                  onClick={() => chooseFilter("all")}
                  className="mt-6 inline-flex min-h-11 items-center border-b border-wine text-sm font-bold text-wine"
                >
                  Show all pieces
                </button>
              )}
            </div>
          ) : (
            <>
              <div
                key={`${activeFilter}-${sort}`}
                className="mt-9 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-[19px] lg:gap-y-14"
              >
                {shownProducts.map((product, index) => (
                  <ProductCard
                    key={getProductId(product)}
                    product={product}
                    index={index}
                  />
                ))}
              </div>

              {visibleProducts.length > HOME_LIMIT && (
                <div className="mt-14 flex justify-center">
                  <Link
                    to={
                      activeFilter === "all"
                        ? "/shop"
                        : `/shop?category=${activeFilter}`
                    }
                    className="group inline-flex min-h-12 items-center gap-6 bg-ink px-7 py-4 text-sm font-semibold text-paper transition-colors duration-300 hover:bg-wine"
                  >
                    View all {visibleProducts.length} pieces
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;