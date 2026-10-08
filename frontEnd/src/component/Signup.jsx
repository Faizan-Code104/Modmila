import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { API_BASE_URL } from "../config";
import { BUSINESS_INFO, CATEGORIES } from "../storeInfo";
import Logo from "./Logo";

const apiBase = String(API_BASE_URL || "").replace(/\/+$/, "");

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const Signup = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const requestRef = useRef(null);
  const redirectRef = useRef(null);
  const mountedRef = useRef(true);
  const submittingRef = useRef(false);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stackOpen, setStackOpen] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
      clearTimeout(redirectRef.current);
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

    if (!formData.name.trim()) {
      nextErrors.name = "Name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.terms) {
      nextErrors.terms = "Please accept the Terms & Conditions and Privacy Policy.";
    }

    setErrors(nextErrors);

    const firstInvalidField = Object.keys(nextErrors)[0];

    if (firstInvalidField) {
      formRef.current?.elements.namedItem(firstInvalidField)?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current || successMessage) return;

    setServerError("");

    if (!validateForm()) return;

    submittingRef.current = true;
    setIsSubmitting(true);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create your account. Please try again.",
        );
      }

      if (!mountedRef.current) return;

      setSuccessMessage(
        `Your ${BUSINESS_INFO.businessName} account has been created successfully.`,
      );

      setFormData(initialForm);
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);

      redirectRef.current = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      if (mountedRef.current && error.name !== "AbortError") {
        setServerError(
          error.message || "Unable to create your account. Please try again.",
        );
      }
    } finally {
      submittingRef.current = false;

      if (mountedRef.current) {
        setIsSubmitting(false);
      }

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full name",
      type: "text",
      placeholder: "Enter your full name",
      autoComplete: "name",
      full: true,
    },
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      autoComplete: "email",
      full: true,
    },
    {
      name: "password",
      label: "Password",
      type: showPassword ? "text" : "password",
      placeholder: "Minimum 6 characters",
      autoComplete: "new-password",
      visible: showPassword,
      toggle: () => setShowPassword((current) => !current),
    },
    {
      name: "confirmPassword",
      label: "Confirm password",
      type: showConfirmPassword ? "text" : "password",
      placeholder: "Re-enter your password",
      autoComplete: "new-password",
      visible: showConfirmPassword,
      toggle: () => setShowConfirmPassword((current) => !current),
    },
  ];

  /* bottom layer first so 01 sits on top */
  const stack = [...CATEGORIES].reverse();

  return (
    <main className="min-h-dvh overflow-x-clip bg-chalk font-sans text-ink">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* ============ Form panel (left) ============ */}
        <div className="flex min-w-0 flex-col px-5 sm:px-10 lg:px-[clamp(40px,6vw,96px)]">
          <nav
            aria-label="Account navigation"
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
            <div className="mx-auto w-full max-w-[560px]">
              <header>
                <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                  <span className="h-px w-6 bg-wine" aria-hidden="true" />
                  Your room starts here
                </p>

                <h1 className="mt-5 font-serif text-[clamp(46px,5.4vw,76px)] leading-[0.96] tracking-[-0.03em] perspective-distant">
                  <span className="inline-block animate-fold-in [animation-delay:100ms]">
                    A little more
                  </span>{" "}
                  <em className="inline-block animate-fold-in text-wine [animation-delay:240ms]">
                    you.
                  </em>
                </h1>

                <p className="mt-4 max-w-md animate-rise text-sm text-muted [animation-delay:320ms]">
                  Create your {BUSINESS_INFO.businessName} account for a
                  faster, more convenient shopping experience.
                </p>
              </header>

              <section
                aria-labelledby="signup-form-title"
                className="mt-9 animate-rise [animation-delay:400ms]"
              >
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-ink pb-4">
                  <h2
                    id="signup-form-title"
                    className="flex items-baseline gap-3 font-serif text-3xl"
                  >
                    <span aria-hidden="true" className="font-sans text-[11px] font-bold text-wine">
                      01
                    </span>
                    Create your account
                  </h2>

                  <p className="text-[11px] text-muted">
                    Already registered?{" "}
                    <Link to="/login" className="font-bold text-wine underline underline-offset-4">
                      Sign in
                    </Link>
                  </p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="mb-6 animate-flip-up break-words border border-danger/30 bg-danger/10 px-4 py-3.5 text-xs leading-relaxed text-danger"
                  >
                    {serverError}
                  </div>
                )}

                {successMessage ? (
                  <div className="flex animate-flip-up flex-col items-center py-4 text-center">
                    <span
                      aria-hidden="true"
                      className="grid size-16 animate-spin-y place-items-center rounded-full bg-wine text-paper"
                    >
                      <Check size={28} />
                    </span>

                    <h3 className="mt-5 font-serif text-3xl">You’re all set.</h3>

                    <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">
                      {successMessage}
                    </p>

                    <p className="mb-6 mt-1 text-xs text-muted">
                      Taking you to sign in…
                    </p>

                    <Link
                      to="/login"
                      className="flex min-h-[54px] w-full items-center justify-between gap-5 bg-ink px-5 py-4 text-[13px] font-semibold text-paper transition-colors hover:bg-wine"
                    >
                      Continue to sign in
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    noValidate
                    aria-busy={isSubmitting}
                  >
                    <fieldset
                      disabled={isSubmitting}
                      className="m-0 min-w-0 border-0 p-0"
                    >
                      <legend className="sr-only">Registration details</legend>

                      <div className="grid gap-5 sm:grid-cols-2">
                        {fields.map((field, index) => (
                          <div
                            key={field.name}
                            style={{ animationDelay: `${450 + index * 80}ms` }}
                            className={`min-w-0 animate-rise ${field.full ? "sm:col-span-2" : ""}`}
                          >
                            <label
                              htmlFor={`signup-${field.name}`}
                              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em]"
                            >
                              {field.label}
                            </label>

                            <div
                              className={`flex min-w-0 items-center border bg-paper transition-[border-color,box-shadow] duration-300 focus-within:border-wine focus-within:shadow-[0_0_0_3px_rgba(125,48,58,0.12)] ${
                                errors[field.name] ? "border-danger" : "border-line"
                              }`}
                            >
                              <input
                                id={`signup-${field.name}`}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name]}
                                onChange={handleChange}
                                autoComplete={field.autoComplete}
                                placeholder={field.placeholder}
                                required
                                minLength={
                                  field.name === "name"
                                    ? 2
                                    : field.toggle
                                      ? 6
                                      : undefined
                                }
                                autoCapitalize={
                                  field.name === "email" || field.toggle
                                    ? "none"
                                    : "words"
                                }
                                spellCheck={field.name === "name"}
                                aria-invalid={Boolean(errors[field.name])}
                                aria-describedby={
                                  errors[field.name]
                                    ? `signup-${field.name}-error`
                                    : field.name === "password"
                                      ? "signup-password-hint"
                                      : undefined
                                }
                                className="min-h-[54px] w-full min-w-0 bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-xs placeholder:text-muted"
                              />

                              {field.toggle && (
                                <button
                                  type="button"
                                  onClick={field.toggle}
                                  aria-label={`${field.visible ? "Hide" : "Show"} ${
                                    field.name === "confirmPassword"
                                      ? "confirm password"
                                      : "password"
                                  }`}
                                  aria-pressed={field.visible}
                                  aria-controls={`signup-${field.name}`}
                                  className="mr-1 grid size-11 shrink-0 place-items-center text-muted transition-colors hover:text-wine"
                                >
                                  <span
                                    key={field.visible ? "hide" : "show"}
                                    className="animate-spin-y"
                                  >
                                    {field.visible ? (
                                      <EyeOff size={18} aria-hidden="true" />
                                    ) : (
                                      <Eye size={18} aria-hidden="true" />
                                    )}
                                  </span>
                                </button>
                              )}
                            </div>

                            {errors[field.name] ? (
                              <p
                                id={`signup-${field.name}-error`}
                                className="mt-2 animate-fade-in text-[11px] text-danger"
                              >
                                {errors[field.name]}
                              </p>
                            ) : field.name === "password" ? (
                              <p
                                id="signup-password-hint"
                                className="mt-2 text-[11px] text-muted"
                              >
                                Use at least 6 characters.
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 border-t border-line pt-5">
                        <div className="flex items-start gap-3 text-xs leading-relaxed">
                          <input
                            id="signup-terms"
                            name="terms"
                            type="checkbox"
                            checked={formData.terms}
                            onChange={handleChange}
                            required
                            aria-invalid={Boolean(errors.terms)}
                            aria-describedby={
                              errors.terms ? "signup-terms-error" : undefined
                            }
                            className="mt-0.5 size-4 shrink-0 accent-wine"
                          />

                          <div>
                            <label htmlFor="signup-terms" className="cursor-pointer">
                              I agree to the
                            </label>{" "}
                            <Link
                              to="/terms-and-conditions"
                              className="font-semibold text-wine underline underline-offset-4"
                            >
                              Terms &amp; Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              to="/privacy-policy"
                              className="font-semibold text-wine underline underline-offset-4"
                            >
                              Privacy Policy
                            </Link>
                            .
                          </div>
                        </div>

                        {errors.terms && (
                          <p
                            id="signup-terms-error"
                            className="mt-2 animate-fade-in text-[11px] text-danger"
                          >
                            {errors.terms}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col-reverse items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-[220px] text-[11px] leading-relaxed text-muted">
                          Your account, ready for your next favourite.
                        </p>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="group relative flex min-h-[56px] items-center justify-between gap-8 overflow-hidden bg-wine px-6 py-4 text-[13px] font-semibold text-paper transition-colors duration-300 hover:bg-wine-dark disabled:opacity-65"
                        >
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                          />
                          {isSubmitting ? (
                            <>
                              <span className="relative">Creating account…</span>
                              <Loader2
                                size={18}
                                className="relative animate-spin"
                                aria-hidden="true"
                              />
                            </>
                          ) : (
                            <>
                              <span className="relative">Create account</span>
                              <ArrowUpRight
                                size={19}
                                aria-hidden="true"
                                className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </fieldset>
                  </form>
                )}
              </section>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs">
                <span className="text-muted">
                  Already part of {BUSINESS_INFO.businessName}?
                </span>

                <Link
                  to="/login"
                  className="group inline-flex min-h-11 items-center gap-2 font-bold transition-colors hover:text-wine"
                >
                  Sign in to your account
                  <ArrowUpRight
                    size={16}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
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

        {/* ============ Visual panel (right) — 3D layer stack ============ */}
        <aside
          aria-hidden="true"
          onMouseEnter={() => setStackOpen(true)}
          onMouseLeave={() => setStackOpen(false)}
          className="relative hidden overflow-hidden bg-wine lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14"
        >
          <span className="pointer-events-none absolute -right-24 -top-24 size-[460px] animate-[spin_50s_linear_infinite] rounded-full border border-dashed border-paper/20" />

          <p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-[#e6c4c7]">
            {BUSINESS_INFO.businessName} / Build your bed
          </p>

          <div className="relative mx-auto h-[520px] w-full max-w-[520px] animate-fade-in perspective-[1600px]">
            {/* no opacity animation on this 3D layer — it would flatten the stack */}
            <div className="relative size-full transform-3d [transform:rotateX(55deg)_rotateZ(-35deg)]">
              {stack.map((category, index) => (
                <div
                  key={category.slug}
                  style={{
                    transform: `translateZ(${index * (stackOpen ? 80 : 42)}px)`,
                    transitionDelay: `${index * 60}ms`,
                  }}
                  className="absolute inset-[10%] transition-transform duration-1000 ease-soft"
                >
                  <div
                    style={{ animationDelay: `${200 + index * 160}ms` }}
                    className="relative size-full animate-rise overflow-hidden border-[6px] border-paper bg-paper shadow-[0_30px_40px_-20px_rgba(0,0,0,0.6)]"
                  >
                    <img
                      src={category.image}
                      alt=""
                      className="size-full object-cover"
                    />
                    <span className="absolute left-2 top-2 bg-chalk/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-ink">
                      {category.id} · {category.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative max-w-md font-serif text-[clamp(34px,3.2vw,50px)] leading-[1.02] text-paper">
            Good rooms are
            <br />
            <em className="text-[#e6c4c7]">built in layers.</em>
          </p>
        </aside>
      </div>
    </main>
  );
};

export default Signup;