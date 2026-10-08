import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { API_BASE_URL } from "../config";
import { BUSINESS_INFO, CATEGORIES, STORAGE_KEYS } from "../storeInfo";
import Logo from "./Logo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");
const REMEMBERED_EMAIL_KEY = STORAGE_KEYS.rememberedEmail;

const getRememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";
  } catch {
    return "";
  }
};

const getRedirect = (from) => {
  const candidate =
    typeof from === "string"
      ? from
      : from && typeof from.pathname === "string"
        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
        : "/";

  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    /[\\\u0000-\u001f]/.test(candidate) ||
    /^\/(?:login|signup)(?:[/?#]|$)/i.test(candidate)
  ) {
    return "/";
  }

  return candidate;
};

const inputWrapClass = (hasError) =>
  `flex min-w-0 items-center border bg-paper transition-[border-color,box-shadow] duration-300 focus-within:border-wine focus-within:shadow-[0_0_0_3px_rgba(125,48,58,0.12)] ${
    hasError ? "border-danger" : "border-line"
  }`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = getRedirect(location.state?.from);

  const formRef = useRef(null);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);
  const requestRef = useRef(null);
  const redirectTimer = useRef(null);

  const [formData, setFormData] = useState(() => {
    const email = getRememberedEmail();

    return {
      email,
      password: "",
      rememberEmail: Boolean(email),
    };
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    const firstField = Object.keys(nextErrors)[0];

    if (firstField) {
      formRef.current?.elements.namedItem(firstField)?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current || success) return;

    setServerError("");

    if (!validateForm()) return;

    submittingRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    requestRef.current = controller;

    const email = formData.email.trim().toLowerCase();

    try {
      const response = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to sign in. Please check your details and try again.",
        );
      }

      if (
        typeof data.token !== "string" ||
        !data.token.trim() ||
        !data.user ||
        typeof data.user !== "object" ||
        Array.isArray(data.user)
      ) {
        throw new Error("The server returned an incomplete login response.");
      }

      if (!mountedRef.current) return;

      try {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
        localStorage.setItem(STORAGE_KEYS.token, data.token);
      } catch {
        try {
          localStorage.removeItem(STORAGE_KEYS.user);
          localStorage.removeItem(STORAGE_KEYS.token);
        } catch {
          // Storage may be blocked by the browser.
        }

        throw new Error(
          "Your browser could not save this login. Please allow site storage and try again.",
        );
      }

      try {
        if (formData.rememberEmail) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
      } catch {
        // Remembering the email is optional.
      }

      setSuccess(true);
      setShowPassword(false);
      setFormData((current) => ({ ...current, password: "" }));

      redirectTimer.current = setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 700);
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setServerError(
          error instanceof TypeError
            ? "Unable to connect right now. Please try again."
            : error.message || "Unable to sign in. Please try again.",
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) setLoading(false);

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  };

  return (
    <main className="min-h-dvh overflow-x-clip bg-chalk font-sans text-ink">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ============ Visual panel ============ */}
        <aside
          aria-hidden="true"
          className="relative hidden overflow-hidden bg-ink lg:block"
        >
          <img
            src="/hero-banner.png"
            alt=""
            className="absolute inset-0 size-full animate-slow-zoom object-cover opacity-80"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/20" />

          {/* floating 3D fabric cards */}
          <div className="absolute inset-0 perspective-[1400px]">
            {CATEGORIES.slice(0, 3).map((category, index) => (
              <div
                key={category.slug}
                className={`absolute w-40 xl:w-48 ${
                  index === 0
                    ? "left-[12%] top-[16%]"
                    : index === 1
                      ? "right-[12%] top-[30%]"
                      : "bottom-[30%] left-[30%]"
                }`}
              >
                <div
                  style={{ animationDelay: `${index * -3}s` }}
                  className="animate-float-3d transform-3d"
                >
                  <div
                    style={{ animationDelay: `${300 + index * 180}ms` }}
                    className="animate-flip-up border-[6px] border-paper bg-paper shadow-[0_40px_60px_-25px_rgba(0,0,0,0.8)]"
                  >
                    <img
                      src={category.image}
                      alt=""
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <p className="pt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-ink">
                      Layer {category.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute inset-x-10 bottom-10 text-paper xl:inset-x-14 xl:bottom-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6c4c7]">
              {BUSINESS_INFO.businessName} / Members
            </p>
            <p className="mt-3 max-w-md font-serif text-[clamp(36px,3.4vw,52px)] leading-[1.02]">
              Stay a little longer.
              <br />
              <em className="text-[#e6c4c7]">Make yourself at home.</em>
            </p>
          </div>
        </aside>

        {/* ============ Form panel ============ */}
        <div className="flex min-w-0 flex-col px-5 sm:px-10 lg:px-[clamp(40px,6vw,96px)]">
          <nav
            aria-label="Login navigation"
            className="flex min-h-[76px] items-center justify-between gap-4 border-b border-line sm:min-h-[88px]"
          >
            <Link to="/" aria-label={`${BUSINESS_INFO.businessName} home`}>
              <Logo size="sm" />
            </Link>

            <Link
              to="/shop"
              className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-[11px] font-semibold transition-colors hover:text-wine"
            >
              <ArrowLeft
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back to shopping
            </Link>
          </nav>

          <div className="flex flex-1 flex-col justify-center py-10 sm:py-14">
            <div className="mx-auto w-full max-w-[460px]">
              <header>
                <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                  <span className="h-px w-6 bg-wine" aria-hidden="true" />
                  Your account / Welcome back
                </p>

                <h1 className="mt-5 font-serif text-[clamp(44px,5vw,68px)] leading-[0.98] tracking-[-0.03em] perspective-distant">
                  <span className="block animate-fold-in [animation-delay:100ms]">
                    Pick up where
                  </span>
                  <em className="block animate-fold-in text-wine [animation-delay:240ms]">
                    you left off.
                  </em>
                </h1>

                <p className="mt-4 animate-rise text-sm text-muted [animation-delay:320ms]">
                  Sign in to your {BUSINESS_INFO.businessName} account to
                  continue.
                </p>
              </header>

              <section
                aria-labelledby="login-title"
                className="mt-9 animate-rise [animation-delay:400ms]"
              >
                <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-ink pb-4">
                  <h2 id="login-title" className="font-serif text-3xl">
                    Sign in
                  </h2>
                  <span className="text-[11px] text-muted">
                    Good to see you again.
                  </span>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mb-6 animate-flip-up break-words border border-danger/30 bg-danger/10 px-4 py-3.5 text-xs leading-relaxed text-danger"
                  >
                    {serverError}
                  </div>
                )}

                {success ? (
                  <div className="flex animate-flip-up flex-col items-center py-4 text-center">
                    <span
                      aria-hidden="true"
                      className="grid size-16 animate-spin-y place-items-center rounded-full bg-wine text-paper"
                    >
                      <Check size={28} />
                    </span>

                    <h3 className="mt-5 font-serif text-3xl">
                      You’re signed in.
                    </h3>

                    <p
                      role="status"
                      aria-live="polite"
                      className="mb-6 mt-2 text-xs text-muted"
                    >
                      Login successful. Redirecting…
                    </p>

                    <Link
                      to={redirectTo}
                      className="flex min-h-[54px] w-full items-center justify-between gap-5 bg-ink px-5 py-4 text-[13px] font-semibold text-paper transition-colors hover:bg-wine"
                    >
                      Continue
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={loading}
                  >
                    <fieldset
                      disabled={loading}
                      className="m-0 min-w-0 border-0 p-0"
                    >
                      <legend className="sr-only">Login details</legend>

                      <div>
                        <label
                          htmlFor="login-email"
                          className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
                        >
                          Email address
                        </label>

                        <div className={inputWrapClass(errors.email)}>
                          <input
                            id="login-email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={
                              errors.email ? "login-email-error" : undefined
                            }
                            className="min-h-[54px] w-full min-w-0 bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-xs placeholder:text-muted"
                          />
                        </div>

                        {errors.email && (
                          <p
                            id="login-email-error"
                            className="mt-2 animate-fade-in text-[11px] text-danger"
                          >
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div className="mt-5">
                        <label
                          htmlFor="login-password"
                          className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
                        >
                          Password
                        </label>

                        <div className={inputWrapClass(errors.password)}>
                          <input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            autoCapitalize="none"
                            spellCheck={false}
                            required
                            minLength={6}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={
                              errors.password ? "login-password-error" : undefined
                            }
                            className="min-h-[54px] w-full min-w-0 bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-xs placeholder:text-muted"
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            aria-pressed={showPassword}
                            aria-controls="login-password"
                            className="mr-1 grid size-11 shrink-0 place-items-center text-muted transition-colors hover:text-wine"
                          >
                            <span
                              key={showPassword ? "hide" : "show"}
                              className="animate-spin-y"
                            >
                              {showPassword ? (
                                <EyeOff size={18} aria-hidden="true" />
                              ) : (
                                <Eye size={18} aria-hidden="true" />
                              )}
                            </span>
                          </button>
                        </div>

                        {errors.password && (
                          <p
                            id="login-password-error"
                            className="mt-2 animate-fade-in text-[11px] text-danger"
                          >
                            {errors.password}
                          </p>
                        )}
                      </div>

                      <label className="my-4 flex min-h-11 cursor-pointer items-center gap-3 text-xs text-muted">
                        <input
                          name="rememberEmail"
                          type="checkbox"
                          checked={formData.rememberEmail}
                          onChange={handleChange}
                          className="size-4 shrink-0 accent-wine"
                        />
                        Remember my email on this device
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex min-h-[56px] w-full items-center justify-between gap-5 overflow-hidden bg-wine px-5 py-4 text-[13px] font-semibold text-paper transition-colors duration-300 hover:bg-wine-dark disabled:opacity-65"
                      >
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                        />
                        <span className="relative">
                          {loading ? "Signing in…" : "Sign in"}
                        </span>

                        {loading ? (
                          <Loader2
                            size={18}
                            className="relative animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          <ArrowUpRight
                            size={19}
                            aria-hidden="true"
                            className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        )}
                      </button>
                    </fieldset>
                  </form>
                )}

                <div className="group mt-8 flex items-center justify-between gap-5 border border-line bg-paper p-5 transition-colors duration-300 hover:border-wine">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                      New here?
                    </p>
                    <p className="mt-1 font-serif text-xl">
                      Make yourself at home.
                    </p>
                  </div>

                  <Link
                    to="/signup"
                    className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-bold transition-colors hover:text-wine"
                  >
                    Create account
                    <ArrowUpRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
                  An account is not required to continue as a guest during
                  checkout.
                </p>
              </section>
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-5 text-[11px] text-muted">
            <span>
              © {new Date().getFullYear()} {BUSINESS_INFO.businessName}. All
              rights reserved.
            </span>

            <div className="flex gap-6">
              <Link
                to="/privacy-policy"
                className="inline-flex min-h-11 items-center hover:text-wine"
              >
                Privacy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="inline-flex min-h-11 items-center hover:text-wine"
              >
                Terms
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
};

export default Login;