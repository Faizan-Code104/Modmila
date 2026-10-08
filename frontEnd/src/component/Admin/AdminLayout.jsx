import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  Store,
  BarChart3,
  User,
  ArrowUpRight,
} from "lucide-react";

import Logo from "../Logo";
import { BUSINESS_INFO, STORAGE_KEYS } from "../../storeInfo";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Users", path: "/admin/users", icon: Users },
];

const managementItems = [
  { name: "Analytics", icon: BarChart3, hover: "group-hover:scale-110" },
  { name: "Settings", icon: Settings, hover: "group-hover:rotate-45" },
];

/* Reads the signed-in admin from storage (falls back to a generic label) */
const readAdmin = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || "null");
    if (saved && typeof saved === "object") {
      return {
        name: saved.name || saved.fullName || saved.username || "Admin User",
        email: saved.email || "",
      };
    }
  } catch {
    // Browser storage may be unavailable.
  }

  return { name: "Admin User", email: "" };
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin] = useState(readAdmin);

  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const initial = admin.name.trim().charAt(0).toUpperCase() || "A";

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }

    return location.pathname.startsWith(path);
  };

  const currentPage =
    menuItems.find((item) => isActive(item.path))?.name || "Management Panel";

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.token);
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.adminToken);
    } catch {
      // Browser storage may be unavailable.
    }

    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  /* close menus on route change */
  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* profile dropdown: close on outside click / Escape */
  useEffect(() => {
    if (!profileOpen) return undefined;

    const onPointer = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  /* sidebar drawer: lock scroll + Escape on mobile */
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-chalk font-sans text-ink">
      {/* mobile overlay */}
      <button
        type="button"
        aria-label="Close sidebar"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* ============ Sidebar ============ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col overflow-hidden bg-ink text-paper transition-transform duration-500 ease-drape lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* decorative stitched ring */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-28 size-72 animate-[spin_50s_linear_infinite] rounded-full border border-dashed border-sand/15"
        />

        <div className="relative flex h-20 shrink-0 items-center justify-between border-b border-paper/10 px-6">
          <Link to="/admin" onClick={closeSidebar} aria-label={`${BUSINESS_INFO.businessName} admin home`}>
            <Logo size="md" tone="light" />
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeSidebar}
            className="flex size-10 items-center justify-center text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav aria-label="Admin" className="no-scrollbar relative flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper/40">
            Administration
          </p>

          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li
                  key={item.name}
                  style={{ animationDelay: `${index * 70}ms` }}
                  className="animate-rise"
                >
                  <Link
                    to={item.path}
                    onClick={closeSidebar}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex min-h-12 items-center gap-3 overflow-hidden px-4 text-sm font-semibold transition-colors duration-300 ${
                      active ? "text-ink" : "text-paper/65 hover:text-paper"
                    }`}
                  >
                    {/* sliding fill */}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-0 origin-left bg-paper transition-transform duration-500 ease-drape ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 w-[3px] bg-wine transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />

                    <Icon
                      size={19}
                      strokeWidth={active ? 2.2 : 1.8}
                      className={`relative transition-transform duration-300 ${
                        active ? "text-wine" : "group-hover:translate-x-0.5"
                      }`}
                    />
                    <span className="relative">{item.name}</span>
                    <span className="relative ml-auto text-[10px] font-normal opacity-50">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-paper/40">
            Management
          </p>

          <ul className="space-y-1">
            {managementItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <button
                    type="button"
                    className="group flex min-h-12 w-full items-center gap-3 px-4 text-sm font-semibold text-paper/65 transition-colors duration-300 hover:bg-paper/10 hover:text-paper"
                  >
                    <Icon size={19} strokeWidth={1.8} className={`transition-transform duration-300 ${item.hover}`} />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="relative shrink-0 border-t border-paper/10 p-4">
          <Link
            to="/"
            onClick={closeSidebar}
            className="group flex min-h-12 items-center gap-3 px-4 text-sm font-semibold text-paper/65 transition-colors hover:bg-paper/10 hover:text-paper"
          >
            <Store size={19} strokeWidth={1.8} />
            <span>View Store</span>
            <ArrowUpRight
              size={15}
              className="ml-auto transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>

          <div className="mt-2 flex items-center gap-3 bg-paper/5 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-wine font-serif text-lg text-paper">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{admin.name}</p>
              <p className="truncate text-xs text-paper/50">{admin.email || "Administrator"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============ Main column ============ */}
      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:h-20 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(true)}
                className="flex size-10 shrink-0 items-center justify-center bg-linen text-ink transition-colors hover:bg-sand lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                  {BUSINESS_INFO.businessName} Admin
                </p>
                <h1 key={currentPage} className="truncate animate-rise font-serif text-2xl leading-tight text-ink sm:text-[28px]">
                  {currentPage}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                aria-label="Search"
                className="flex size-10 items-center justify-center text-muted transition-colors hover:bg-linen hover:text-ink"
              >
                <Search size={19} />
              </button>

              <button
                type="button"
                aria-label="Notifications"
                className="relative flex size-10 items-center justify-center text-muted transition-colors hover:bg-linen hover:text-ink"
              >
                <Bell size={19} />
                <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-wine ring-2 ring-paper" />
              </button>

              <div className="mx-1 hidden h-8 w-px bg-line sm:block" />

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 transition-colors hover:bg-linen"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-ink font-serif text-base text-paper">
                    {initial}
                  </div>
                  <div className="hidden max-w-[140px] text-left md:block">
                    <p className="truncate text-xs font-bold text-ink">{admin.name}</p>
                    <p className="text-[10px] text-muted">Administrator</p>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`hidden text-muted transition-transform duration-300 md:block ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* dropdown folds down in 3D */}
                <div className="pointer-events-none absolute right-0 top-[calc(100%+8px)] perspective-[900px]">
                  <div
                    role="menu"
                    className={`w-56 origin-top border border-line bg-paper p-2 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] transition-all duration-300 ease-soft ${
                      profileOpen
                        ? "pointer-events-auto visible [transform:rotateX(0deg)] opacity-100"
                        : "pointer-events-none invisible [transform:rotateX(-70deg)] opacity-0"
                    }`}
                  >
                    <div className="border-b border-line px-3 pb-3 pt-1 md:hidden">
                      <p className="truncate text-sm font-bold">{admin.name}</p>
                      <p className="text-[11px] text-muted">Administrator</p>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 px-3 text-sm font-semibold text-muted transition-colors hover:bg-linen hover:text-ink"
                    >
                      <User size={17} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 px-3 text-sm font-semibold text-muted transition-colors hover:bg-linen hover:text-ink"
                    >
                      <Settings size={17} />
                      Settings
                    </button>

                    <div className="my-1 border-t border-line" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex min-h-11 w-full items-center gap-3 px-3 text-sm font-semibold text-danger transition-colors hover:bg-wine-soft"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          <section className="mx-auto max-w-[1600px]">{children}</section>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;