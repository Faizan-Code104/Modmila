import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Search,
  User,
  X,
} from "lucide-react";

import { useCart } from "./CartContext";
import storeInfo, { CATEGORIES } from "../storeInfo";

const navigation = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Collection", path: "/categories" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const footerLinks = [
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Shipping", path: "/shipping-policy" },
  { name: "Returns", path: "/return-policy" },
  { name: "FAQ", path: "/faqs" },
  { name: "Privacy", path: "/privacy-policy" },
  { name: "Terms", path: "/terms-and-conditions" },
  { name: "Payment", path: "/payment-policy" },
  { name: "Cancellation", path: "/order-cancellation-policy" },
  { name: "Cookies", path: "/cookie-policy" },
  { name: "Track order", path: "/track-order" },
];

const topNotes = [
  "The bedding edit",
  "Made for the room you call yours",
  "Layer by layer",
  "Comfort in composition",
];

/* Sewn "M" mark — the top stroke draws itself in like a stitch */
const BrandMark = ({ className = "" }) => (
  <svg
    viewBox="0 0 70 70"
    aria-hidden="true"
    className={`fill-none stroke-wine [stroke-linecap:round] [stroke-linejoin:round] ${className}`}
  >
    <path
      pathLength="1"
      d="M7 52V17c0-3 4-5 7-2l20 19 21-19c3-3 7-1 7 2v35"
      className="animate-stitch [stroke-dasharray:1] [stroke-width:2.6]"
    />
    <path
      d="M7 52c7-12 15-12 27 1C46 40 55 40 62 52"
      className="animate-fade-in [animation-delay:900ms] [stroke-dasharray:3_3.5] [stroke-width:2.2]"
    />
    <path
      d="M14 58h42"
      className="animate-fade-in stroke-ink [animation-delay:1200ms] [stroke-width:2.2]"
    />
  </svg>
);

const Layout = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);

  const openMenu = () => {
    menuRef.current?.showModal();
    document.body.style.overflow = "hidden";
    setMenuOpen(true);
  };

  const closeMenu = () => {
    menuRef.current?.close();
  };

  const handleMenuClosed = () => {
    document.body.style.overflow = "";
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();

    if (!query) return;

    navigate(`/shop?search=${encodeURIComponent(query)}`);
    closeMenu();
  };

  useEffect(() => {
    menuRef.current?.close();
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const handleResize = () => {
      if (desktop.matches) menuRef.current?.close();
    };

    desktop.addEventListener("change", handleResize);
    return () => desktop.removeEventListener("change", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "";
    };
  }, []);

  const scrollToTop = () =>
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });

  return (
    <div className="min-h-screen bg-chalk font-sans text-ink">
      <a
        href="#main-content"
        className="sr-only z-[100] bg-ink px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* TOP NOTE — moving ribbon */}
      <div className="overflow-hidden bg-wine text-paper">
        <div className="flex w-max animate-marquee items-center py-2 hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex shrink-0 items-center"
            >
              {topNotes.map((note) => (
                <span
                  key={note}
                  className="flex items-center gap-6 px-6 text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]"
                >
                  {note}
                  <span aria-hidden="true" className="text-sm">
                    ✳
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header
        className={`sticky top-0 z-40 border-b border-line transition-[background-color,box-shadow] duration-300 ${
          scrolled
            ? "bg-chalk/85 shadow-[0_12px_30px_-24px_rgba(36,34,35,0.6)] backdrop-blur-md"
            : "bg-chalk"
        }`}
      >
        <div
          className={`mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 transition-[height] duration-300 sm:px-6 lg:px-10 ${
            scrolled ? "h-16 xl:h-[72px]" : "h-[68px] xl:h-[88px]"
          }`}
        >
          {/* Left: desktop nav / mobile menu button */}
          <div className="flex min-w-0 items-center">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label="Open navigation"
              aria-haspopup="dialog"
              aria-controls="modmila-navigation"
              aria-expanded={menuOpen}
              onClick={openMenu}
              className="group -ml-2 flex h-11 w-11 flex-col items-start justify-center gap-1.5 px-2 xl:hidden"
            >
              <span className="h-px w-6 bg-ink transition-all duration-300 group-hover:w-4 group-hover:bg-wine" />
              <span className="h-px w-4 bg-ink transition-all duration-300 group-hover:w-6 group-hover:bg-wine" />
            </button>

            <nav
              aria-label="Main navigation"
              className="hidden min-w-0 items-center gap-7 xl:flex"
            >
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={`group relative inline-flex min-h-11 items-center gap-1 text-[13px] font-semibold transition-colors ${
                    isActive(item.path) ? "text-wine" : "hover:text-wine"
                  }`}
                >
                  {item.name}
                  {item.path === "/shop" && (
                    <ArrowUpRight
                      size={13}
                      className="text-wine transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 bottom-2 h-px origin-left bg-wine transition-transform duration-300 ${
                      isActive(item.path)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          <Link
            to="/"
            aria-label={`${storeInfo.businessName} home`}
            className="group flex shrink-0 items-center gap-2 perspective-midrange"
          >
            <BrandMark className="size-7 transition-transform duration-700 transform-3d group-hover:rotate-y-180 sm:size-8 xl:size-9" />
            <span className="text-2xl font-semibold lowercase leading-none tracking-[-0.085em] sm:text-[28px] xl:text-[31px]">
              {storeInfo.businessName}
            </span>
          </Link>

          {/* Right: search, account, cart, help */}
          <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
            <form
              onSubmit={handleSearch}
              role="search"
              className="group hidden h-11 w-[170px] items-center border-b border-line transition-colors focus-within:border-wine md:flex 2xl:w-[210px]"
            >
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search bedding..."
                aria-label="Search products"
                className="h-full min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex h-11 w-9 shrink-0 items-center justify-center transition-colors hover:text-wine"
              >
                <Search size={17} strokeWidth={1.8} />
              </button>
            </form>

            <Link
              to="/login"
              aria-label="My account"
              className="hidden h-11 w-11 items-center justify-center transition-colors hover:text-wine sm:flex"
            >
              <User size={19} strokeWidth={1.6} />
            </Link>

            <Link
              to="/cart"
              aria-label={`Shopping cart with ${cartCount || 0} items`}
              className="group inline-flex min-h-11 items-center gap-2.5 text-[13px] font-semibold transition-colors hover:text-wine"
            >
              <span className="hidden sm:inline">Cart</span>
              <span
                key={cartCount || 0}
                className="grid size-7 animate-scale-in place-items-center rounded-full border border-ink text-xs transition-colors group-hover:border-wine group-hover:bg-wine group-hover:text-paper"
              >
                {cartCount || 0}
              </span>
            </Link>

            <Link
              to="/faqs"
              className="hidden min-h-11 items-center px-2 text-[13px] font-semibold transition-colors hover:text-wine xl:inline-flex"
            >
              Help
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE AND TABLET NAVIGATION */}
      <dialog
        ref={menuRef}
        id="modmila-navigation"
        aria-labelledby="modmila-menu-title"
        className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[min(100%,440px)] max-w-full overflow-y-auto overscroll-contain border-0 bg-chalk p-0 text-ink backdrop:bg-ink/60 backdrop:backdrop-blur-[3px] open:animate-drawer-in"
        onClose={handleMenuClosed}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;

          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          ) {
            closeMenu();
          }
        }}
      >
        <div className="flex min-h-full flex-col p-5 sm:p-8">
          <div className="mb-7 flex items-center justify-between gap-4 border-b border-dashed border-line pb-5">
            <h2
              id="modmila-menu-title"
              className="flex items-center gap-2 text-2xl font-semibold lowercase tracking-[-0.085em]"
            >
              <BrandMark className="size-7" />
              {storeInfo.businessName}
            </h2>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-all duration-300 hover:rotate-90 hover:border-wine hover:text-wine"
            >
              <X size={20} strokeWidth={1.6} />
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            role="search"
            className="mb-6 flex min-h-12 border border-line bg-paper transition-colors focus-within:border-wine"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search bedding..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex w-12 shrink-0 items-center justify-center hover:text-wine"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>
          </form>

          {/* key re-runs the 3D fold animation each time the menu opens */}
          <nav
            key={menuOpen ? "open" : "closed"}
            aria-label="Mobile navigation"
            className="perspective-distant"
          >
            {navigation.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                aria-current={isActive(item.path) ? "page" : undefined}
                style={{ animationDelay: `${120 + index * 70}ms` }}
                className={`group flex min-h-16 animate-fold-in items-center justify-between gap-4 border-b border-line px-1 font-serif text-[28px] leading-none transition-colors ${
                  isActive(item.path) ? "text-wine" : "hover:text-wine"
                }`}
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-muted">
                    0{index + 1}
                  </span>
                  {item.name}
                </span>
                <ArrowUpRight
                  size={20}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </nav>

          <div className="mt-7">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Shop by layer
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.slug}
                  to={`/shop?category=${category.slug}`}
                  onClick={closeMenu}
                  className="border border-line bg-paper px-3 py-3 text-xs font-semibold leading-snug transition-colors hover:border-wine hover:text-wine"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-8">
            <Link
              to="/login"
              onClick={closeMenu}
              className="flex min-h-12 items-center justify-center gap-3 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-wine"
            >
              <User size={17} />
              My account
            </Link>

            <Link
              to="/track-order"
              onClick={closeMenu}
              className="mt-3 flex min-h-12 items-center justify-center border border-ink px-5 py-3 text-sm font-semibold transition-colors hover:border-wine hover:text-wine"
            >
              Track your order
            </Link>
          </div>
        </div>
      </dialog>

      {/* PAGE CONTENT */}
      <main id="main-content" tabIndex={-1} className="min-w-0 outline-none">
        {children}
      </main>

      {/* FOOTER — folded care label */}
      <footer
        id="help"
        className="relative scroll-mt-20 overflow-hidden bg-ink px-5 pb-[25px] pt-20 text-paper sm:px-[clamp(20px,6vw,104px)] sm:pt-[90px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-7 bg-chalk opacity-[0.98] [clip-path:polygon(0_0,100%_0,50%_100%)]"
        />

        <div className="mx-auto max-w-[1600px]">
          <div className="grid items-end gap-10 pb-[70px] md:grid-cols-2 md:gap-[30px] lg:grid-cols-[1fr_1fr_auto] lg:pb-[105px]">
            <Link
              to="/"
              aria-label={`${storeInfo.businessName} home`}
              className="w-fit animate-rise text-[clamp(40px,5vw,84px)] font-semibold lowercase leading-none tracking-[-0.09em]"
            >
              {storeInfo.businessName}
              <span
                aria-hidden="true"
                className="ml-2 inline-block animate-[spin_16s_linear_infinite] align-top text-xl tracking-normal text-[#d9a9ae]"
              >
                ✳
              </span>
            </Link>

            <p className="m-0 animate-rise font-serif text-[clamp(32px,3.3vw,54px)] leading-[1.05] [animation-delay:150ms]">
              Stay a little longer.
              <br />
              <em>Make yourself at home.</em>
            </p>

            <button
              type="button"
              onClick={scrollToTop}
              className="group w-fit border-b border-[#a79792] pb-2.5 text-[13px] transition-colors hover:border-[#d9a9ae] hover:text-[#d9a9ae] md:col-start-2 lg:col-start-auto"
            >
              Back to top{" "}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:-translate-y-1"
              >
                ↑
              </span>
            </button>
          </div>

          <div className="flex flex-col items-start gap-[25px] border-t border-[#746d6a] pt-6 text-[11px] tracking-[0.1em] md:flex-row md:items-center md:justify-between">
            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap gap-x-[25px] gap-y-[15px]"
            >
              {footerLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-xs tracking-[0.02em] text-paper transition-colors duration-200 hover:text-[#d9a9ae]"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <span className="whitespace-nowrap uppercase">
              © {new Date().getFullYear()} {storeInfo.businessName}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;