import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ImageOff,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { API_BASE_URL } from "../../config";
import {
  BUSINESS_INFO,
  CATEGORIES as STORE_CATEGORIES,
  STORAGE_KEYS,
} from "../../storeInfo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
const API_URL = `${apiBase}/api/products`;
const MAX_IMAGES = 4;

/* The 4 Modmila categories come from storeInfo.js — product.category must match these names exactly */
const CATEGORIES = STORE_CATEGORIES.map((category) => category.name);

const INITIAL_FORM = {
  name: "",
  category: CATEGORIES[0] || "",
  price: "",
  stock: "",
  sku: "",
  material: "",
  weight: "",
  description: "",
  isFeatured: false,
};

const getId = (product) => String(product?._id || product?.id || "");

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

const getImageUrl = (image) => {
  if (typeof image !== "string" || !image.trim()) return "";

  const value = image.trim();

  return /^https?:\/\//i.test(value)
    ? value
    : `${apiBase}/${value.replace(/^\/+/, "")}`;
};

const getStatus = (product) => {
  const status = String(product.status || "").trim();

  if (["Active", "Low Stock", "Out of Stock"].includes(status)) {
    return status;
  }

  const stock = numeric(product.stock);
  return stock <= 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "Active";
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

  return { Authorization: `Bearer ${token}` };
};


const ProductImage = ({ image, name, className = "" }) => {
  const src = getImageUrl(image);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return src && !failed ? (
    <img
      src={src}
      alt={name || "Product"}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  ) : (
    <ImageOff size={26} aria-hidden="true" className="text-muted" />
  );
};

const STOCK_BADGE = {
  Active: "bg-success/15 text-success",
  "Low Stock": "bg-sand text-ink",
  "Out of Stock": "bg-danger/10 text-danger",
};

const eyebrowClass = "text-[10px] font-bold uppercase tracking-[0.2em] text-wine";
const inputClass =
  "min-h-12 w-full min-w-0 border border-line bg-paper px-3 text-base text-ink outline-none transition-colors placeholder:text-sm placeholder:text-muted focus:border-ink aria-[invalid=true]:border-danger sm:text-sm";
const secondaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-line bg-paper px-5 text-xs font-semibold text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2.5 bg-ink px-5 text-xs font-semibold text-paper transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-50";

/* Product card — tilts slightly in 3D on hover (desktop) */
const TiltCard = ({ children }) => {
  const ref = useRef(null);

  const handleMove = (event) => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.transform = `rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateZ(0)`;
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [featuredFilter, setFeaturedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");

  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [uploads, setUploads] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formRef = useRef(null);
  const headingRef = useRef(null);
  const uploadUrls = useRef(new Set());
  const mountedRef = useRef(true);
  const mutationRef = useRef(null);
  const mutationLock = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      mutationRef.current?.abort();
      uploadUrls.current.forEach((url) => URL.revokeObjectURL(url));
      uploadUrls.current.clear();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await fetch(API_URL, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load products.");
        }

        if (!Array.isArray(data.products)) {
          throw new Error("The products response is incomplete.");
        }

        if (active) {
          setProducts(
            data.products.filter(
              (product) =>
                product && typeof product === "object" && getId(product)
            )
          );
          setLoaded(true);
        }
      } catch (error) {
        if (active && error.name !== "AbortError") {
          setFetchError(error.message || "Unable to load products.");
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
  }, [refreshCount]);

  const categories = useMemo(
    () => [
      ...new Set([
        ...CATEGORIES,
        ...products.map((product) => product.category).filter(Boolean),
      ]),
    ],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = products.filter((product) => {
      const text = [product.name, product.category, product.sku]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!query || text.includes(query)) &&
        (categoryFilter === "All" || product.category === categoryFilter) &&
        (statusFilter === "All" || getStatus(product) === statusFilter) &&
        (featuredFilter === "All" ||
          (featuredFilter === "Featured"
            ? product.isFeatured === true
            : product.isFeatured !== true))
      );
    });

    return result.sort((a, b) => {
      if (sortBy === "price-low") return numeric(a.price) - numeric(b.price);
      if (sortBy === "price-high") return numeric(b.price) - numeric(a.price);
      if (sortBy === "stock-low") return numeric(a.stock) - numeric(b.stock);
      if (sortBy === "featured") {
        return Number(b.isFeatured === true) - Number(a.isFeatured === true);
      }
      return timestamp(b.createdAt) - timestamp(a.createdAt);
    });
  }, [
    products,
    searchTerm,
    categoryFilter,
    statusFilter,
    featuredFilter,
    sortBy,
  ]);

  const releaseUploads = () => {
    uploadUrls.current.forEach((url) => URL.revokeObjectURL(url));
    uploadUrls.current.clear();
    setUploads([]);
  };

  const resetForm = () => {
    releaseUploads();
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const openCreate = () => {
    resetForm();
    setActionError("");
    setSuccessMessage("");
    setCreating(true);

    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const closeCreate = () => {
    if (mutationLock.current) return;

    resetForm();
    setCreating(false);
    setActionError("");

    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({ ...current, [name]: "" }));
    setActionError("");
  };

  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    let message = "";

    if (uploads.length + files.length > MAX_IMAGES) {
      message = `You can upload a maximum of ${MAX_IMAGES} images.`;
    } else if (
      files.some(
        (file) =>
          !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            file.type
          )
      )
    ) {
      message = "Only JPG, JPEG, PNG and WEBP images are allowed.";
    } else if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      message = "Each image must be 5MB or less.";
    }

    if (message) {
      setErrors((current) => ({ ...current, images: message }));
      return;
    }

    const additions = files.map((file) => {
      const url = URL.createObjectURL(file);
      uploadUrls.current.add(url);
      return { file, url };
    });

    setUploads((current) => [...current, ...additions]);
    setErrors((current) => ({ ...current, images: "" }));
  };

  const removeImage = (index) => {
    const upload = uploads[index];

    if (upload) {
      URL.revokeObjectURL(upload.url);
      uploadUrls.current.delete(upload.url);
    }

    setUploads((current) => current.filter((_, position) => position !== index));
    setErrors((current) => ({ ...current, images: "" }));
  };

  const validateForm = () => {
    const next = {};

    if (formData.name.trim().length < 3) {
      next.name = "Product name must be at least 3 characters.";
    }

    if (!formData.category) next.category = "Select a category.";

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      next.price = "Enter a price greater than zero.";
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      next.stock = "Enter a whole stock quantity of zero or more.";
    }

    ["sku", "material", "weight"].forEach((field) => {
      if (!formData[field].trim()) {
        next[field] = `${field === "sku" ? "SKU" : field[0].toUpperCase() + field.slice(1)} is required.`;
      }
    });

    if (formData.description.trim().length < 10) {
      next.description = "Description must be at least 10 characters.";
    }

    if (!uploads.length) next.images = "Add at least one product image.";

    setErrors(next);

    const firstField = Object.keys(next)[0];

    if (firstField) {
      const field = formRef.current?.elements.namedItem(firstField);
      field?.focus({ preventScroll: true });
      field?.scrollIntoView?.({ behavior: "smooth", block: "center" });
      return false;
    }

    return true;
  };

  const createProduct = async (event) => {
    event.preventDefault();

    if (mutationLock.current || !validateForm()) return;

    const controller = new AbortController();
    mutationRef.current = controller;
    mutationLock.current = true;
    setSubmitting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const body = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        body.append(
          key,
          typeof value === "string" ? value.trim() : String(value)
        );
      });

      uploads.forEach(({ file }) => body.append("images", file));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: authHeaders(),
        signal: controller.signal,
        body,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to create product.");
      }

      if (!data.product || !getId(data.product)) {
        throw new Error(
          "The creation response is incomplete. Refresh inventory before trying again."
        );
      }

      if (!mountedRef.current) return;

      setProducts((current) => [
        data.product,
        ...current.filter((product) => getId(product) !== getId(data.product)),
      ]);

      resetForm();
      setCreating(false);
      setSuccessMessage("Product created successfully.");
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setActionError(
          error instanceof TypeError
            ? "Could not reach the server. Check that the backend is running and that this site's URL is in FRONTEND_URL on the backend."
            : error.message || "Unable to create product."
        );
      }
    } finally {
      mutationLock.current = false;
      if (mountedRef.current) setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteProduct || mutationLock.current || loading) return;

    const productId = getId(deleteProduct);
    const controller = new AbortController();

    mutationRef.current = controller;
    mutationLock.current = true;
    setDeleting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(productId)}`,
        {
          method: "DELETE",
          headers: authHeaders(),
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      if (!mountedRef.current) return;

      setProducts((current) =>
        current.filter((product) => getId(product) !== productId)
      );
      setDeleteProduct(null);
      setSuccessMessage("Product deleted successfully.");
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setActionError(error.message || "Unable to delete product.");
      }
    } finally {
      mutationLock.current = false;
      if (mountedRef.current) setDeleting(false);
    }
  };

  const fields = [
    ["name", "Product name", "text", "Enter product name"],
    ["price", "Price (USD)", "number", "0.00"],
    ["stock", "Stock quantity", "number", "0"],
    ["sku", "SKU", "text", "MM-DUV-001"],
    ["material", "Material", "text", "Enter actual material"],
    ["weight", "Weight", "text", "Enter weight with unit"],
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setStatusFilter("All");
    setFeaturedFilter("All");
    setSortBy("latest");
  };

  const cancelDelete = () => {
    if (deleting) return;
    setDeleteProduct(null);
    setActionError("");
  };

  /* delete dialog: Escape cancels */
  useEffect(() => {
    if (!deleteProduct) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") cancelDelete();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteProduct, deleting]);

  const previewImage = uploads[0]?.url || "";
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="min-w-0 font-sans text-ink">
      {/* ============ Heading ============ */}
      <header className="flex flex-col items-start justify-between gap-5 border-b border-line pb-6 sm:flex-row sm:items-end">
        <div>
          <p className={`${eyebrowClass} animate-rise`}>
            {BUSINESS_INFO.businessName} / Inventory
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            key={creating ? "create" : "list"}
            className="mt-2 font-serif text-[clamp(38px,5vw,64px)] leading-[0.95] tracking-[-0.03em] outline-none perspective-distant"
          >
            {creating ? (
              <>
                <span className="inline-block animate-fold-in">A new</span>{" "}
                <em className="inline-block animate-fold-in text-wine [animation-delay:120ms]">addition.</em>
              </>
            ) : (
              <>
                <span className="inline-block animate-fold-in">Your</span>{" "}
                <em className="inline-block animate-fold-in text-wine [animation-delay:120ms]">collection.</em>
              </>
            )}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {creating
              ? "Add product details, stock and photography."
              : "Manage your products, inventory and featured pieces."}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
          {creating ? (
            <button type="button" onClick={closeCreate} disabled={submitting} className={`${secondaryButton} flex-1 sm:flex-none`}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back to inventory
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRefreshCount((count) => count + 1)}
                disabled={loading || deleting}
                className={`${secondaryButton} flex-1 sm:flex-none`}
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
                Refresh
              </button>
              <button type="button" onClick={openCreate} disabled={deleting} className={`${primaryButton} group flex-1 sm:flex-none`}>
                <Plus size={17} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90" />
                Add product
              </button>
            </>
          )}
        </div>
      </header>

      {fetchError && (
        <div className="mt-5 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-5 py-4 text-sm text-danger [overflow-wrap:anywhere]" role="alert">
          {fetchError}
        </div>
      )}

      {actionError && (
        <div className="mt-5 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-5 py-4 text-sm text-danger [overflow-wrap:anywhere]" role="alert">
          {actionError}
        </div>
      )}

      <div role="status" aria-live="polite">
        {successMessage && (
          <p className="mt-5 flex animate-rise items-center gap-2 border border-success/30 border-l-4 border-l-success bg-success/10 px-5 py-4 text-sm text-ink">
            <Check size={16} aria-hidden="true" className="text-success" />
            {successMessage}
          </p>
        )}
      </div>

      {creating ? (
        /* ============ Create product ============ */
        <form ref={formRef} onSubmit={createProduct} noValidate className="mt-6">
          <fieldset disabled={submitting} className="m-0 min-w-0 border-0 p-0">
            <legend className="sr-only">New product details</legend>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid min-w-0 gap-5">
                {/* 01 — information */}
                <section className="animate-rise border border-line bg-paper p-5 sm:p-7">
                  <div className="mb-6 flex items-baseline gap-4 border-b border-line pb-4">
                    <span className="font-serif text-3xl text-wine">01</span>
                    <h2 className="font-serif text-2xl sm:text-[28px]">Product information</h2>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {fields.map(([name, label, type, placeholder]) => (
                      <div key={name} className="min-w-0">
                        <label htmlFor={`products-${name}`} className="mb-2 block text-xs font-semibold">
                          {label}
                        </label>
                        <input
                          id={`products-${name}`}
                          name={name}
                          type={type}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={placeholder}
                          min={type === "number" ? 0 : undefined}
                          step={name === "price" ? "0.01" : name === "stock" ? "1" : undefined}
                          required
                          aria-invalid={Boolean(errors[name])}
                          aria-describedby={errors[name] ? `products-${name}-error` : undefined}
                          className={inputClass}
                        />
                        {errors[name] && (
                          <p id={`products-${name}-error`} className="mt-1.5 text-xs text-danger">
                            {errors[name]}
                          </p>
                        )}
                      </div>
                    ))}

                    {/* category as selectable tiles */}
                    <div className="min-w-0 sm:col-span-2">
                      <label htmlFor="products-category" className="mb-2 block text-xs font-semibold">
                        Category
                      </label>
                      <select
                        id="products-category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(errors.category)}
                        className={inputClass}
                      >
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>

                      <div aria-hidden="true" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {STORE_CATEGORIES.map((category) => {
                          const active = formData.category === category.name;

                          return (
                            <button
                              key={category.slug}
                              type="button"
                              tabIndex={-1}
                              onClick={() =>
                                handleChange({ target: { name: "category", value: category.name, type: "select-one" } })
                              }
                              className={`group relative overflow-hidden border text-left transition-all duration-300 ${
                                active ? "border-wine ring-2 ring-wine/30" : "border-line hover:border-ink"
                              }`}
                            >
                              <span className="block aspect-[4/3] overflow-hidden bg-linen">
                                <img
                                  src={category.image}
                                  alt=""
                                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              </span>
                              <span className={`block px-2.5 py-2 text-[11px] font-semibold leading-tight ${active ? "bg-wine text-paper" : "bg-paper"}`}>
                                {category.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {errors.category && <p className="mt-1.5 text-xs text-danger">{errors.category}</p>}
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <label htmlFor="products-description" className="mb-2 block text-xs font-semibold">
                        Description
                      </label>
                      <textarea
                        id="products-description"
                        name="description"
                        rows={6}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the actual product and its details…"
                        required
                        aria-invalid={Boolean(errors.description)}
                        aria-describedby={errors.description ? "products-description-error" : undefined}
                        className={`${inputClass} resize-y py-3`}
                      />
                      {errors.description && (
                        <p id="products-description-error" className="mt-1.5 text-xs text-danger">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* 02 — photography */}
                <section className="animate-rise border border-line bg-paper p-5 [animation-delay:120ms] sm:p-7">
                  <div className="mb-4 flex items-baseline gap-4 border-b border-line pb-4">
                    <span className="font-serif text-3xl text-wine">02</span>
                    <h2 className="font-serif text-2xl sm:text-[28px]">Photography &amp; visibility</h2>
                  </div>

                  <p className="mb-5 text-xs leading-relaxed text-muted">
                    The first image is the main product image. Upload up to four
                    JPG, PNG or WEBP images, 5MB each.
                  </p>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {uploads.map((upload, index) => (
                      <div key={upload.url} className="relative aspect-square min-w-0 animate-scale-in bg-linen">
                        <img src={upload.url} alt={`Product preview ${index + 1}`} className="size-full object-contain p-2" />
                        <span className={`absolute bottom-2 left-2 px-2 py-1 text-[10px] font-semibold ${index === 0 ? "bg-wine text-paper" : "bg-paper"}`}>
                          {index === 0 ? "Main image" : `View ${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-1.5 top-1.5 grid size-11 place-items-center border border-line bg-paper text-ink transition-colors hover:border-danger hover:text-danger"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </div>
                    ))}

                    {uploads.length < MAX_IMAGES && (
                      <label
                        htmlFor="products-images"
                        className="group grid aspect-square cursor-pointer place-items-center border border-dashed border-line bg-chalk text-center transition-colors hover:border-wine has-[:disabled]:cursor-not-allowed"
                      >
                        <span className="grid justify-items-center gap-2 px-2">
                          <ImagePlus size={24} aria-hidden="true" className="text-wine transition-transform duration-300 group-hover:-translate-y-1" />
                          <span className="text-[11px] font-semibold">Add images</span>
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="mt-4 min-w-0">
                    <label htmlFor="products-images" className="mb-2 block text-xs font-semibold">
                      Product images · {uploads.length}/{MAX_IMAGES}
                    </label>
                    <input
                      id="products-images"
                      name="images"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImages}
                      disabled={submitting || uploads.length >= MAX_IMAGES}
                      aria-invalid={Boolean(errors.images)}
                      aria-describedby={errors.images ? "products-images-error" : undefined}
                      className="block w-full min-w-0 text-xs text-muted file:mr-3 file:min-h-10 file:cursor-pointer file:border file:border-line file:bg-linen file:px-3 file:text-xs file:font-semibold file:text-ink disabled:opacity-50"
                    />
                    {errors.images && (
                      <p id="products-images-error" className="mt-1.5 text-xs text-danger">
                        {errors.images}
                      </p>
                    )}
                  </div>

                  <label className="mt-6 flex cursor-pointer items-start gap-3 border border-line bg-chalk p-4 transition-colors hover:border-ink">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="mt-0.5 size-[18px] shrink-0 accent-wine"
                    />
                    <span>
                      <strong className="block text-sm font-semibold">Show in Featured Pieces</strong>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        Keep this product in its category and also feature it on
                        the homepage.
                      </span>
                    </span>
                  </label>
                </section>
              </div>

              {/* live preview */}
              <aside className="xl:sticky xl:top-28">
                <p className={eyebrowClass}>Live preview</p>
                <div className="mt-3 animate-rise [animation-delay:200ms]">
                  <TiltCard>
                    <div className="border border-line bg-paper">
                      <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-linen">
                        {previewImage ? (
                          <img src={previewImage} alt="" className="size-full object-contain p-4" />
                        ) : (
                          <ImagePlus size={30} aria-hidden="true" className="text-muted" />
                        )}
                        {formData.isFeatured && (
                          <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-wine px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-paper">
                            <Star size={11} aria-hidden="true" /> Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wine">{formData.category}</p>
                        <p className="mt-1 font-serif text-2xl leading-tight [overflow-wrap:anywhere]">
                          {formData.name.trim() || "Product name"}
                        </p>
                        <div className="mt-3 flex items-end justify-between gap-3 border-t border-line pt-3">
                          <strong className="font-serif text-2xl font-normal">
                            {formData.price ? money(formData.price) : "$0.00"}
                          </strong>
                          <span className="text-[11px] text-muted">
                            {formData.stock === "" ? "—" : numeric(formData.stock)} in stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={closeCreate} disabled={submitting} className={secondaryButton}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className={primaryButton}>
                    {submitting && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
                    {submitting ? "Creating…" : "Create product"}
                  </button>
                </div>

                {/* feedback next to the button, so it is never missed */}
                {actionError ? (
                  <p role="alert" className="mt-3 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger [overflow-wrap:anywhere]">
                    {actionError}
                  </p>
                ) : errorCount > 0 ? (
                  <p role="alert" className="mt-3 border border-danger/30 border-l-4 border-l-danger bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
                    Please fix {errorCount} highlighted {errorCount === 1 ? "field" : "fields"} before creating the product.
                  </p>
                ) : null}
              </aside>
            </div>
          </fieldset>
        </form>
      ) : (
        <>
          {/* ============ Summary ============ */}
          <section aria-label="Inventory summary" className="mt-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
            {[
              ["Total products", products.length],
              ["Active", products.filter((product) => getStatus(product) === "Active").length],
              ["Low stock", products.filter((product) => getStatus(product) === "Low Stock").length],
              ["Featured", products.filter((product) => product.isFeatured === true).length],
            ].map(([label, count], index) => (
              <div
                key={label}
                style={{ animationDelay: `${index * 80}ms` }}
                className={`animate-rise p-5 ${index === 0 ? "bg-ink text-paper" : "bg-paper"}`}
              >
                <span className={`block text-[10px] font-bold uppercase tracking-[0.16em] ${index === 0 ? "text-[#d9a9ae]" : "text-muted"}`}>
                  {label}
                </span>
                <strong className="mt-2 block font-serif text-4xl font-normal leading-none">{loaded ? count : "—"}</strong>
              </div>
            ))}
          </section>

          {/* category shelf — quick filter */}
          <div className="no-scrollbar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
            {STORE_CATEGORIES.map((category) => {
              const active = categoryFilter === category.name;
              const count = products.filter((product) => product.category === category.name).length;

              return (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategoryFilter(active ? "All" : category.name)}
                  className={`group flex min-w-[220px] items-center gap-3 border p-2 text-left transition-all duration-300 sm:min-w-0 ${
                    active ? "border-wine bg-wine text-paper" : "border-line bg-paper hover:border-ink"
                  }`}
                >
                  <span className="size-14 shrink-0 overflow-hidden bg-linen perspective-[400px]">
                    <img
                      src={category.image}
                      alt=""
                      className="size-full object-cover transition-transform duration-700 group-hover:[transform:rotateY(18deg)_scale(1.1)]"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{category.name}</span>
                    <span className={`text-[11px] ${active ? "text-paper/70" : "text-muted"}`}>
                      {loaded ? `${count} products` : "—"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ============ Tools ============ */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-[minmax(0,1.7fr)_repeat(3,minmax(0,1fr))]">
            <div className="flex min-w-0 items-center gap-3 border border-line bg-paper px-4 transition-colors focus-within:border-ink sm:col-span-3 xl:col-span-1">
              <Search size={18} aria-hidden="true" className="shrink-0 text-muted" />
              <label htmlFor="products-search" className="sr-only">
                Search products
              </label>
              <input
                id="products-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, category or SKU…"
                className="min-h-14 w-full min-w-0 bg-transparent text-base text-ink outline-none placeholder:text-sm placeholder:text-muted"
              />
            </div>

            {[
              ["category", "Category", categoryFilter, setCategoryFilter, ["All", ...categories]],
              ["status", "Stock status", statusFilter, setStatusFilter, ["All", "Active", "Low Stock", "Out of Stock"]],
              ["featured", "Visibility", featuredFilter, setFeaturedFilter, ["All", "Featured", "Not Featured"]],
            ].map(([key, label, value, setter, options]) => (
              <div key={key} className="flex min-w-0 flex-col justify-center border border-line bg-paper px-4 py-1.5 transition-colors focus-within:border-ink">
                <label htmlFor={`products-filter-${key}`} className="text-[10px] uppercase tracking-[0.16em] text-muted">
                  {label}
                </label>
                <select
                  id={`products-filter-${key}`}
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  className="min-h-8 w-full min-w-0 bg-transparent text-base text-ink outline-none sm:text-sm"
                >
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start justify-between gap-3 py-4 text-xs text-muted sm:flex-row sm:items-center">
            <span role="status" aria-live="polite">
              {loading ? "Loading inventory…" : `${filteredProducts.length} products shown`}
            </span>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
              <label htmlFor="products-sort">Sort by</label>
              <select
                id="products-sort"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-11 border border-line bg-paper px-3 text-base text-ink outline-none focus:border-ink sm:text-sm"
              >
                <option value="latest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock-low">Lowest stock</option>
                <option value="featured">Featured first</option>
              </select>
            </div>
          </div>

          {/* ============ Product grid ============ */}
          <section aria-label="Products" aria-busy={loading}>
            {loading && !loaded ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 border border-line bg-paper p-8 text-center text-sm text-muted" role="status">
                <Loader2 size={28} className="animate-spin text-wine" aria-hidden="true" />
                <p>Loading your collection…</p>
              </div>
            ) : !filteredProducts.length ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4 border border-dashed border-line bg-paper p-8 text-center text-sm text-muted">
                <p>{fetchError && !loaded ? "Inventory could not load." : "No matching products."}</p>
                <button type="button" onClick={clearFilters} className={secondaryButton}>
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredProducts.map((product, index) => {
                  const status = getStatus(product);

                  return (
                    <li
                      key={getId(product)}
                      style={{ animationDelay: `${Math.min(index, 11) * 50}ms` }}
                      className="animate-rise"
                    >
                      <TiltCard>
                        <article className="group flex h-full flex-col border border-line bg-paper transition-shadow duration-500 hover:shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45)]">
                          <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-linen">
                            <ProductImage
                              image={product.images?.[0]}
                              name={product.name}
                              className="size-full object-contain p-4 transition-transform duration-700 ease-soft group-hover:scale-105"
                            />

                            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                              <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${STOCK_BADGE[status] || "bg-linen text-muted"}`}>
                                {status}
                              </span>
                              {product.isFeatured === true && (
                                <span className="inline-flex items-center gap-1 bg-wine px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-paper">
                                  <Star size={11} aria-hidden="true" /> Featured
                                </span>
                              )}
                            </div>

                            {/* actions slide in */}
                            <div className="absolute bottom-3 right-3 flex gap-2 transition-all duration-300 lg:translate-y-3 lg:opacity-0 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                              <Link
                                to={`/shop/${encodeURIComponent(getId(product))}`}
                                aria-label={`View ${product.name || "product"}`}
                                className="grid size-11 place-items-center border border-line bg-paper text-ink transition-colors hover:bg-ink hover:text-paper"
                              >
                                <ArrowUpRight size={18} aria-hidden="true" />
                              </Link>
                              <button
                                type="button"
                                disabled={deleting}
                                onClick={() => {
                                  setDeleteProduct(product);
                                  setActionError("");
                                  setSuccessMessage("");
                                }}
                                aria-label={`Delete ${product.name || "product"}`}
                                className="grid size-11 place-items-center border border-line bg-paper text-ink transition-colors hover:border-danger hover:bg-danger hover:text-paper disabled:opacity-50"
                              >
                                <Trash2 size={17} aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wine">
                              {product.category || "Uncategorised"}
                            </p>
                            <h2 className="mt-1 font-serif text-xl leading-tight [overflow-wrap:anywhere]">
                              {product.name || "Product"}
                            </h2>
                            <p className="mb-3 mt-1 text-[11px] text-muted [overflow-wrap:anywhere]">
                              SKU: {product.sku || "Not provided"}
                            </p>

                            <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
                              <strong className="font-serif text-2xl font-normal">{money(product.price)}</strong>
                              <span className="text-[11px] text-muted">{numeric(product.stock)} in stock</span>
                            </div>
                          </div>
                        </article>
                      </TiltCard>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* ============ Delete dialog ============ */}
          {deleteProduct && (
            <div className="fixed inset-0 z-[80] grid place-items-center p-4">
              <button
                type="button"
                aria-label="Cancel delete"
                onClick={cancelDelete}
                className="absolute inset-0 animate-fade-in bg-ink/60 backdrop-blur-sm"
              />
              <div className="relative w-full max-w-md perspective-[1000px]">
                <section
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="products-delete-title"
                  className="animate-flip-up border-t-4 border-danger bg-paper p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-danger/10 text-danger">
                    <Trash2 size={20} aria-hidden="true" />
                  </span>
                  <h2 id="products-delete-title" className="mt-4 font-serif text-3xl leading-tight [overflow-wrap:anywhere]">
                    Delete {deleteProduct.name}?
                  </h2>
                  <p className="mt-2 text-sm text-danger">This action cannot be undone.</p>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button type="button" disabled={deleting} onClick={cancelDelete} className={secondaryButton}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={deleting || loading}
                      onClick={confirmDelete}
                      className="inline-flex min-h-12 items-center justify-center gap-2 bg-danger px-5 text-xs font-semibold text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                      {deleting ? "Deleting…" : "Delete product"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;