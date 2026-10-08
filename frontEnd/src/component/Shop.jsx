import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ImageOff,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import { useCart } from "../component/CartContext";
import { API_BASE_URL } from "../config";
import { BUSINESS_INFO, CATEGORIES } from "../storeInfo";

const apiBase = API_BASE_URL.replace(/\/+$/, "");

/* ---------------- helpers ---------------- */

const getProductId = (product) => product?._id || product?.id || "";

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();
  if (/^https?:\/\//i.test(value)) return value;

  return `${apiBase}/${value.replace(/^\/+/, "")}`;
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

const isUnavailable = (product) => {
  const stock = Number(product?.stock);
  return (
    !Number.isFinite(stock) ||
    stock <= 0 ||
    String(product?.status || "").toLowerCase() === "out of stock"
  );
};

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const getCategoryName = (product) =>
  typeof product?.category === "string"
    ? product.category.trim()
    : product?.category?.name || "";

/* Finds a store category from a URL value (slug or name) */
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

/* ---------------- product card ---------------- */

const CardImage = ({ image, name, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const src = getImageUrl(image);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={name || `${BUSINESS_INFO.businessName} bedding`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`absolute inset-0 size-full object-cover ${className}`}
    />
  ) : (
    <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linen text-[10px] text-muted">
      <ImageOff size={28} strokeWidth={1.3} aria-hidden="true" />
      Image unavailable
    </span>
  );
};

const ProductCard = ({ product, index, wide, onAdd }) => {
  const id = getProductId(product);
  const unavailable = isUnavailable(product);
  const productLink = `/shop/${encodeURIComponent(id)}`;
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return undefined;
    const timer = window.setTimeout(() => setAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [added]);

  const handleAdd = () => {
    if (onAdd(product)) setAdded(true);
  };

  const status = unavailable
    ? "Out of stock"
    : product.status && product.status !== "Active"
      ? product.status
      : "";

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className={`group min-w-0 animate-rise ${wide ? "col-span-2" : ""}`}
    >
      <div className="relative overflow-hidden bg-linen">
        <div className={`relative ${wide ? "aspect-[2/1.25]" : "aspect-[4/5]"}`}>
          {id ? (
            <Link
              to={productLink}
              aria-label={`View ${product.name || "product"}`}
              className="absolute inset-0 block"
            >
              <span className="absolute inset-0 block transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.05]">
                <CardImage image={product.images?.[0]} name={product.name} />
              </span>
            </Link>
          ) : (
            <CardImage image={product.images?.[0]} name={product.name} />
          )}

          {/* number + status */}
          <span className="pointer-events-none absolute left-3 top-3 font-serif text-lg text-paper drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
            {pad(index + 1)}
          </span>
          {status && (
            <span className="pointer-events-none absolute right-3 top-3 bg-ink px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-paper">
              {status}
            </span>
          )}

          {/* slide-up add bar (desktop hover) */}
          {id && !unavailable && (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={
                added
                  ? `${product.name || "Product"} added to cart`
                  : `Add ${product.name || "product"} to cart`
              }
              className={`absolute inset-x-3 bottom-3 hidden min-h-12 items-center justify-between gap-3 px-4 text-[12px] font-bold transition-all duration-500 ease-soft md:flex ${
                added
                  ? "translate-y-0 bg-wine text-paper opacity-100"
                  : "translate-y-[140%] bg-paper text-ink opacity-0 hover:bg-wine hover:text-paper group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
              }`}
            >
              {added ? "Added to cart" : "Add to cart"}
              {added ? (
                <Check size={16} className="animate-scale-in" />
              ) : (
                <Plus size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-wine sm:text-[10px]">
            {getCategoryName(product) || "The collection"}
          </p>
          <h3 className="mt-1 break-words font-serif text-lg leading-tight sm:text-[22px]">
            {id ? (
              <Link to={productLink} className="transition-colors hover:text-wine">
                {product.name || "Product"}
              </Link>
            ) : (
              product.name || "Product"
            )}
          </h3>
          <p className="mt-1 text-xs font-semibold sm:text-sm">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* mobile add button */}
        {id && !unavailable && (
          <button
            type="button"
            onClick={handleAdd}
            aria-label={
              added
                ? `${product.name || "Product"} added to cart`
                : `Add ${product.name || "product"} to cart`
            }
            className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors md:hidden ${
              added ? "border-wine bg-wine text-paper" : "border-ink"
            }`}
          >
            {added ? <Check size={15} /> : <Plus size={15} />}
          </button>
        )}
      </div>
    </article>
  );
};

/* ---------------- page ---------------- */

const Shop = () => {
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortBy, setSortBy] = useState("newest");
  const [cartNotice, setCartNotice] = useState("");

  /* Keep the search box in sync with ?search= from the header */
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(`${apiBase}/api/products`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load products.");
        }

        if (!Array.isArray(data?.products)) {
          throw new Error("Product details are unavailable. Please try again.");
        }

        if (active) {
          setProducts(
            data.products.filter(
              (product) => product && typeof product === "object",
            ),
          );
        }
      } catch (error) {
        if (active && error?.name !== "AbortError") {
          setFetchError(
            error?.message || "Unable to load products. Please try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [retryCount]);

  useEffect(() => {
    if (!cartNotice) return undefined;
    const timer = setTimeout(() => setCartNotice(""), 2500);
    return () => clearTimeout(timer);
  }, [cartNotice]);

  /* Active category: a store category (by slug or name) or any other raw value */
  const storeCategory = findStoreCategory(categoryParam);
  const activeKey =
    categoryParam.toLowerCase() === "all"
      ? "all"
      : normalize(storeCategory ? storeCategory.name : categoryParam);
  const activeLabel =
    activeKey === "all"
      ? "All bedding"
      : storeCategory
        ? storeCategory.name
        : categoryParam;

  const categories = useMemo(() => {
    const list = CATEGORIES.map((category) => ({
      key: normalize(category.name),
      name: category.name,
      param: category.slug,
      image: category.image,
      count: 0,
    }));

    products.forEach((product) => {
      const name = getCategoryName(product);
      if (!name || name.toLowerCase() === "all") return;

      const known =
        findStoreCategory(name) && normalize(findStoreCategory(name).name);
      const key = known || normalize(name);
      const existing = list.find((item) => item.key === key);

      if (existing) {
        existing.count += 1;
      } else {
        list.push({ key, name, param: name, count: 1 });
      }
    });

    if (activeKey !== "all" && !list.some((item) => item.key === activeKey)) {
      list.push({
        key: activeKey,
        name: categoryParam,
        param: categoryParam,
        count: 0,
      });
    }

    return [
      { key: "all", name: "All bedding", param: "All", count: products.length },
      ...list,
    ];
  }, [products, activeKey, categoryParam]);

  const filteredProducts = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    const result = products.filter((product) => {
      const name = getCategoryName(product);
      const known = findStoreCategory(name);
      const productKey = known ? normalize(known.name) : normalize(name);

      const searchable = [product.name, name, product.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (activeKey === "all" || productKey === activeKey) &&
        (!search || searchable.includes(search))
      );
    });

    const price = (product) => {
      const value = Number(product.price);
      return Number.isFinite(value) ? value : 0;
    };

    const date = (product) => {
      const value = new Date(product.createdAt || 0).getTime();
      return Number.isFinite(value) ? value : 0;
    };

    return result.sort((a, b) => {
      if (sortBy === "price-low") return price(a) - price(b);
      if (sortBy === "price-high") return price(b) - price(a);
      if (sortBy === "name-az") {
        return String(a.name || "").localeCompare(String(b.name || ""));
      }
      return date(b) - date(a);
    });
  }, [products, activeKey, searchQuery, sortBy]);

  const selectCategory = (param) => {
    const nextParams = new URLSearchParams(searchParams);

    if (param === "All") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", param);
    }

    setSearchParams(nextParams, { preventScrollReset: true });
  };

  const updateSearch = (value) => {
    setSearchQuery(value);

    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set("search", value);
    } else {
      nextParams.delete("search");
    }
    setSearchParams(nextParams, { replace: true, preventScrollReset: true });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setSearchParams(new URLSearchParams(), { preventScrollReset: true });
  };

  const handleAddToCart = (product) => {
    const id = getProductId(product);
    if (!id || isUnavailable(product)) return false;

    addToCart({
      ...product,
      id,
      image: getImageUrl(product.images?.[0]),
    });

    setCartNotice(`${product.name || "Product"} added to cart.`);
    return true;
  };

  const hasFilters = searchQuery || activeKey !== "all";

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
      {/* ============ Editorial header ============ */}
      <header className="mx-auto grid max-w-[1600px] gap-8 px-4 pb-8 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:px-[clamp(40px,4vw,64px)] lg:pb-12">
        <div>
          <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
            <span className="h-px w-7 bg-wine" aria-hidden="true" />
            {BUSINESS_INFO.businessName} / The shop
          </p>
          <h1
            key={activeKey}
            className="mt-5 font-serif text-[clamp(52px,8vw,124px)] leading-[0.9] tracking-[-0.045em] perspective-distant"
          >
            {activeKey === "all" ? (
              <>
                <span className="inline-block animate-fold-in">The bed</span>{" "}
                <em className="inline-block animate-fold-in text-wine [animation-delay:150ms]">
                  edit.
                </em>
              </>
            ) : (
              <em className="inline-block animate-fold-in text-wine">
                {activeLabel}
              </em>
            )}
          </h1>
        </div>

        {/* Category coins */}
        <div className="flex gap-3 sm:gap-4">
          {CATEGORIES.map((category, index) => {
            const selected = activeKey === normalize(category.name);

            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => selectCategory(selected ? "All" : category.slug)}
                aria-pressed={selected}
                aria-label={`Show ${category.name}`}
                style={{ animationDelay: `${300 + index * 90}ms` }}
                className="group flex animate-flip-up flex-col items-center gap-2 perspective-distant"
              >
                <span
                  className={`relative block size-[64px] rounded-full border-2 transition-all duration-700 ease-soft transform-3d group-hover:rotate-y-180 sm:size-20 lg:size-[88px] ${
                    selected ? "border-wine shadow-[0_0_0_4px_rgba(125,48,58,0.18)]" : "border-paper"
                  }`}
                >
                  <img
                    src={category.image}
                    alt=""
                    className="absolute inset-0 size-full rounded-full object-cover backface-hidden"
                  />
                  <span className="absolute inset-0 grid rotate-y-180 place-items-center rounded-full bg-wine font-serif text-lg text-paper backface-hidden sm:text-xl">
                    {category.id}
                  </span>
                </span>
                <span
                  className={`max-w-[80px] text-center text-[10px] font-semibold leading-tight sm:max-w-[96px] ${
                    selected ? "text-wine" : "text-muted"
                  }`}
                >
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* ============ Sticky filter bar ============ */}
      <div className="sticky top-16 z-30 border-y border-ink bg-chalk/90 backdrop-blur-md xl:top-[72px]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-8 lg:flex-row lg:items-center lg:gap-6 lg:px-[clamp(40px,4vw,64px)]">
          <nav
            aria-label="Product categories"
            className="no-scrollbar -mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
          >
            {categories.map((category) => {
              const selected = activeKey === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => selectCategory(category.param)}
                  aria-pressed={selected}
                  aria-controls="shop-products"
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-all duration-300 ${
                    selected
                      ? "border-wine bg-wine text-paper"
                      : "border-line bg-paper hover:border-wine hover:text-wine"
                  }`}
                >
                  {category.name}
                  <span
                    className={`text-[10px] font-normal ${selected ? "text-paper/75" : "text-muted"}`}
                  >
                    {loading ? "…" : pad(category.count)}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 border-b border-ink transition-colors focus-within:border-wine lg:w-[240px] lg:flex-none">
              <Search size={15} aria-hidden="true" className="shrink-0" />
              <label htmlFor="shop-search" className="sr-only">
                Search products
              </label>
              <input
                id="shop-search"
                type="search"
                value={searchQuery}
                onChange={(event) => updateSearch(event.target.value)}
                placeholder="Find bedding…"
                className="min-h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-xs placeholder:text-muted sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateSearch("")}
                  aria-label="Clear search"
                  className="grid size-8 shrink-0 place-items-center transition-transform duration-300 hover:rotate-90 hover:text-wine"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <span className="relative shrink-0">
              <select
                id="shop-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-10 cursor-pointer appearance-none rounded-full border border-ink bg-paper py-2 pl-4 pr-8 text-xs font-semibold outline-none transition-colors hover:border-wine focus:border-wine"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A to Z</option>
              </select>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </span>
          </div>
        </div>
      </div>

      {/* ============ Results ============ */}
      <section
        id="shop-products"
        aria-labelledby="shop-results-title"
        aria-busy={loading}
        className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <h2
            id="shop-results-title"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="font-semibold uppercase tracking-[0.16em]"
          >
            {loading
              ? "Loading collection…"
              : fetchError
                ? "Collection unavailable"
                : `${pad(filteredProducts.length)} ${
                    filteredProducts.length === 1 ? "piece" : "pieces"
                  }${hasFilters ? ` · ${activeLabel}${searchQuery ? ` / “${searchQuery}”` : ""}` : ""}`}
          </h2>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex min-h-10 items-center gap-2 font-semibold transition-colors hover:text-wine"
            >
              Clear filters <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>

        {loading ? (
          <div
            role="status"
            aria-label="Loading products"
            className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="min-w-0">
                <div className="aspect-[4/5] animate-shimmer bg-[linear-gradient(110deg,var(--color-linen)_30%,var(--color-paper)_50%,var(--color-linen)_70%)] bg-[length:200%_100%]" />
                <div className="mt-3 h-3 w-1/3 bg-linen" />
                <div className="mt-2 h-5 w-3/4 bg-linen" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div
            role="alert"
            className="flex min-h-[340px] flex-col items-center justify-center border border-line bg-paper px-6 py-9 text-center"
          >
            <h3 className="font-serif text-3xl">We couldn’t load the collection.</h3>
            <p className="my-4 max-w-[420px] text-[13px] leading-relaxed text-muted">
              {fetchError}
            </p>
            <button
              type="button"
              onClick={() => setRetryCount((count) => count + 1)}
              className="min-h-12 bg-ink px-6 py-3 text-xs font-semibold text-paper transition-colors hover:bg-wine"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length ? (
          <div
            key={`${activeKey}-${sortBy}`}
            className="grid grid-flow-row-dense grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 md:gap-y-12 xl:grid-cols-4"
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={getProductId(product) || `product-${index}`}
                product={product}
                index={index}
                wide={index % 7 === 0 && filteredProducts.length > 3}
                onAdd={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[340px] flex-col items-center justify-center border border-dashed border-line bg-paper px-6 py-9 text-center">
            <Search size={28} aria-hidden="true" className="text-wine" />
            <h3 className="mt-5 font-serif text-3xl">Nothing matches just yet.</h3>
            <p className="my-4 max-w-[420px] text-[13px] leading-relaxed text-muted">
              Try another keyword or browse the full collection.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-12 bg-ink px-6 py-3 text-xs font-semibold text-paper transition-colors hover:bg-wine"
            >
              View all products
            </button>
          </div>
        )}

        {/* guidance strip */}
        <div className="mt-16 grid gap-6 border-t border-ink pt-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
              A little guidance
            </p>
            <p className="mt-2 max-w-lg font-serif text-2xl leading-snug sm:text-3xl">
              Review each product page for its current details, sizes and care
              information.
            </p>
          </div>
          <Link
            to="/contact"
            className="group inline-flex min-h-11 items-center gap-4 border-b border-ink text-xs font-bold transition-colors hover:border-wine hover:text-wine"
          >
            Ask our team
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      {/* Cart notice */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4"
      >
        {cartNotice && (
          <div className="pointer-events-auto flex max-w-full animate-rise flex-wrap items-center gap-3 border border-ink bg-paper px-5 py-4 text-xs shadow-[0_20px_40px_-20px_rgba(36,34,35,0.5)] sm:flex-nowrap sm:gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-wine text-paper">
              <Check size={15} aria-hidden="true" />
            </span>
            <span className="min-w-0 break-words">{cartNotice}</span>
            <Link
              to="/cart"
              className="inline-flex shrink-0 items-center gap-1.5 font-bold text-wine underline underline-offset-4"
            >
              <ShoppingCart size={14} aria-hidden="true" />
              View cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;