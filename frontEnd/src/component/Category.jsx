import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ImageOff } from "lucide-react";

import { API_BASE_URL } from "../config";
import storeInfo, { CATEGORIES } from "../storeInfo";

/* Extra copy for this page, keyed by category slug */
const CATEGORY_COPY = {
  "duvet-cover-sets": {
    subtitle: "The layer everyone sees.",
    mood: "Sets the mood of the room",
    description:
      "Duvet cover sets in calm, modern finishes — the top layer that changes how the whole bedroom feels.",
  },
  "quilts-coverlets": {
    subtitle: "Light, stitched warmth.",
    mood: "For every season",
    description:
      "Quilts and coverlets with stitched, textured surfaces. Layer them over a duvet or use them on their own.",
  },
  "sheet-sets": {
    subtitle: "Where rest begins.",
    mood: "The foundation layer",
    description:
      "Sheet sets made to feel smooth and easy against the skin — the first layer of a well-made bed.",
  },
  "shams-bed-skirts": {
    subtitle: "The finishing details.",
    mood: "Tailored and complete",
    description:
      "Pillow shams and bed skirts that tidy the edges and finish the bed with a considered, tailored look.",
  },
};

const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");

const getCategoryName = (product) =>
  typeof product?.category === "string"
    ? product.category
    : product?.category?.name || "";

const matchesCategory = (product, category) => {
  const value = normalize(getCategoryName(product));
  return value === normalize(category.name) || value === normalize(category.slug);
};

const createShopLink = (slug) => `/shop?category=${encodeURIComponent(slug)}`;

const pad = (number) => String(number).padStart(2, "0");

const PanelImage = ({ src, name }) => {
  const [failedSource, setFailedSource] = useState(null);

  if (!src || failedSource === src) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linen text-xs text-muted">
        <ImageOff size={32} strokeWidth={1.2} />
        <span>Collection image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} collection`}
      onError={() => setFailedSource(src)}
      className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-soft group-hover:scale-105"
    />
  );
};

const Category = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [activeCategoryId, setActiveCategoryId] = useState(CATEGORIES[0].slug);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const baseUrl = String(API_BASE_URL).replace(/\/+$/, "");

        const response = await fetch(`${baseUrl}/api/products`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load collection counts.");
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        const productList = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
            ? data.products
            : null;

        if (!productList) {
          throw new Error("Unexpected product response.");
        }

        setProducts(productList);
      } catch {
        if (controller.signal.aborted) return;

        setError(
          "Collection counts are unavailable. You can still browse every category.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [requestVersion]);

  const categories = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        ...CATEGORY_COPY[category.slug],
        count: products.filter((product) => matchesCategory(product, category))
          .length,
      })),
    [products],
  );

  const totalProducts = categories.reduce(
    (total, category) => total + category.count,
    0,
  );

  const getCountText = (count) => {
    if (loading) return "Loading pieces…";
    if (error) return "Explore collection";

    return `${pad(count)} ${count === 1 ? "piece" : "pieces"}`;
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      {/* ============ Heading row ============ */}
      <header className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 pb-8 pt-10 sm:px-8 sm:pt-14 lg:flex-row lg:items-end lg:justify-between lg:px-[clamp(40px,4vw,64px)] lg:pb-10">
        <div>
          <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
            <span className="h-px w-7 bg-wine" aria-hidden="true" />
            {storeInfo.businessName} / The collection
          </p>
          <h1 className="mt-5 font-serif text-[clamp(46px,6.4vw,96px)] leading-[0.95] tracking-[-0.04em] perspective-distant">
            <span className="inline-block animate-fold-in [animation-delay:100ms]">
              Four layers.
            </span>{" "}
            <em className="inline-block animate-fold-in text-wine [animation-delay:250ms]">
              One calm room.
            </em>
          </h1>
        </div>

        <div className="max-w-[320px] animate-rise [animation-delay:350ms]">
          <p className="text-sm leading-relaxed text-muted">
            Hover or tap a layer to open it, then step inside to see every
            piece.
          </p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
            {loading
              ? "Loading the collection…"
              : error
                ? "Four layers to explore"
                : `${pad(totalProducts)} ${
                    totalProducts === 1 ? "piece" : "pieces"
                  } across four layers`}
          </p>
        </div>
      </header>

      {/* ============ Expanding panels ============ */}
      <section
        aria-label="Explore bedding categories"
        className="mx-auto max-w-[1600px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col gap-3 lg:h-[min(76vh,720px)] lg:flex-row">
          {categories.map((category, index) => {
            const isActive = category.slug === activeCategoryId;

            return (
              <article
                key={category.slug}
                onMouseEnter={() => setActiveCategoryId(category.slug)}
                onFocus={() => setActiveCategoryId(category.slug)}
                style={{ animationDelay: `${300 + index * 120}ms` }}
                className={`group relative min-h-[96px] animate-fold-in overflow-hidden bg-ink text-paper transition-[flex-grow,min-height] duration-700 ease-soft lg:min-h-0 ${
                  isActive
                    ? "min-h-[440px] sm:min-h-[520px] lg:flex-[4_1_0%]"
                    : "lg:flex-[1_1_0%]"
                }`}
              >
                <PanelImage src={category.image} name={category.name} />

                <span
                  aria-hidden="true"
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive
                      ? "bg-gradient-to-t from-ink/90 via-ink/25 to-transparent"
                      : "bg-ink/60"
                  }`}
                />

                {/* Collapsed state (desktop): vertical label */}
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`panel-${category.slug}`}
                  onClick={() => setActiveCategoryId(category.slug)}
                  className={`absolute inset-0 z-10 flex w-full items-center justify-between gap-4 px-5 text-left transition-opacity duration-500 lg:flex-col lg:items-start lg:justify-between lg:py-6 ${
                    isActive ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#e6c4c7]">
                    {category.id}
                  </span>
                  <span className="font-serif text-2xl lg:rotate-180 lg:whitespace-nowrap lg:text-3xl lg:[writing-mode:vertical-rl]">
                    {category.name}
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" className="lg:hidden" />
                </button>

                {/* Expanded state */}
                <div
                  id={`panel-${category.slug}`}
                  className={`absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-500 sm:p-8 lg:p-10 ${
                    isActive
                      ? "opacity-100 delay-200"
                      : "pointer-events-none opacity-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="bg-chalk px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                      Layer {category.id}
                    </span>
                    <span className="text-right text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e6c4c7]">
                      {getCountText(category.count)}
                    </span>
                  </div>

                  <div
                    key={isActive ? "open" : "closed"}
                    className="max-w-[560px] perspective-distant"
                  >
                    <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6c4c7] [animation-delay:200ms]">
                      {category.mood}
                    </p>
                    <h2 className="mt-3 origin-bottom animate-fold-in font-serif text-[clamp(40px,4.6vw,72px)] leading-[0.98] [animation-delay:250ms]">
                      {category.name}
                    </h2>
                    <p className="mt-2 animate-rise font-serif text-xl italic text-[#e6c4c7] [animation-delay:320ms]">
                      {category.subtitle}
                    </p>
                    <p className="mt-4 max-w-md animate-rise text-sm leading-relaxed text-paper/80 [animation-delay:380ms]">
                      {category.description}
                    </p>

                    <Link
                      to={createShopLink(category.slug)}
                      className="group/link relative mt-6 inline-flex min-h-14 animate-rise items-center gap-8 overflow-hidden bg-wine px-6 py-4 text-[13px] font-bold transition-colors duration-300 [animation-delay:440ms] hover:bg-wine-dark"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover/link:translate-x-[420%]"
                      />
                      <span className="relative">Explore {category.name}</span>
                      <ArrowRight
                        size={18}
                        aria-hidden="true"
                        className="relative transition-transform duration-300 group-hover/link:translate-x-1.5"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {error && (
          <div
            role="status"
            className="mt-5 flex flex-col items-start justify-between gap-4 border border-line bg-paper px-5 py-4 sm:flex-row sm:items-center"
          >
            <p className="text-xs leading-relaxed text-muted">{error}</p>
            <button
              type="button"
              onClick={() => setRequestVersion((version) => version + 1)}
              disabled={loading}
              className="min-h-11 shrink-0 border border-ink px-4 py-2.5 text-[11px] font-bold transition-colors hover:border-wine hover:text-wine disabled:cursor-wait disabled:opacity-50"
            >
              {loading ? "Retrying…" : "Retry counts"}
            </button>
          </div>
        )}
      </section>

      {/* ============ Layer index ribbon ============ */}
      <section
        aria-label="All layers"
        className="mt-16 border-y border-ink bg-paper sm:mt-24"
      >
        <div className="mx-auto grid max-w-[1600px] sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              to={createShopLink(category.slug)}
              className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden border-line p-6 transition-colors duration-500 hover:text-paper sm:p-8 ${
                index > 0 ? "border-t sm:border-t-0" : ""
              } ${index % 2 === 1 ? "sm:border-l" : ""} ${
                index > 1 ? "sm:border-t lg:border-t-0" : ""
              } ${index > 0 ? "lg:border-l" : ""}`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom scale-y-0 bg-wine transition-transform duration-500 ease-soft group-hover:scale-y-100"
              />
              <span className="relative flex items-center justify-between text-[11px] font-bold tracking-[0.2em] text-wine transition-colors group-hover:text-[#e6c4c7]">
                {category.id}
                <span className="font-normal normal-case tracking-normal">
                  {getCountText(category.count)}
                </span>
              </span>
              <span className="relative mt-8 flex items-end justify-between gap-3">
                <span className="font-serif text-[28px] leading-tight">
                  {category.name}
                </span>
                <ArrowUpRight
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:rotate-45"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ Closing ============ */}
      <section className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-6 px-4 py-14 sm:px-8 sm:py-20 md:flex-row md:items-end lg:px-[clamp(40px,4vw,64px)]">
        <h2 className="max-w-[640px] font-serif text-[clamp(34px,4vw,58px)] leading-[1.02]">
          Good rooms are built in layers.{" "}
          <em className="text-wine">Start with one.</em>
        </h2>

        <Link
          to="/shop"
          className="group inline-flex min-h-12 shrink-0 items-center gap-6 border-b border-ink text-[13px] font-bold transition-colors hover:border-wine hover:text-wine"
        >
          Shop the whole collection
          <ArrowUpRight
            size={19}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </Link>
      </section>
    </div>
  );
};

export default Category;