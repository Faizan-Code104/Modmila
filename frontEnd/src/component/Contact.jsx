import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import {
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

import { BUSINESS_INFO } from "../storeInfo";

const EMPTY_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const MESSAGE_LIMIT = 2000;

const inputClass =
  "peer block min-h-[52px] w-full min-w-0 border-0 border-b border-line bg-transparent px-1 py-3 text-base text-ink outline-none transition-[border-color,background-color] duration-300 placeholder:text-[13px] placeholder:text-muted focus:border-wine focus:bg-wine-soft/40";

const FieldLabel = ({ htmlFor, number, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-2 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em]"
  >
    <span className="font-serif text-sm font-normal normal-case tracking-normal text-wine">
      {number}
    </span>
    {children}
  </label>
);

const Contact = () => {
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const sendingRef = useRef(false);

  const supportTime = [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone]
    .filter(Boolean)
    .join(" ");

  const addressLines = [
    BUSINESS_INFO.addressLine1,
    BUSINESS_INFO.addressLine2,
    BUSINESS_INFO.country,
  ].filter(Boolean);

  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sendingRef.current) return;

    setSuccessMessage("");
    setErrorMessage("");

    if (!event.currentTarget.reportValidity()) return;

    const values = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value.trim()]),
    );

    if (Object.values(values).some((value) => !value)) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setErrorMessage(
        BUSINESS_INFO.email || BUSINESS_INFO.phoneDisplay
          ? "The message form is currently unavailable. Please use the contact details on this page."
          : "The message form is currently unavailable. Please try again later.",
      );
      return;
    }

    sendingRef.current = true;
    setIsSubmitting(true);

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: values.name,
          from_email: values.email,
          subject: values.subject,
          message: values.message,
        },
        { publicKey },
      );

      setSuccessMessage(
        "Your message has been sent. Our support team will get back to you as soon as possible.",
      );
      setFormData({ ...EMPTY_FORM });
    } catch {
      setErrorMessage(
        BUSINESS_INFO.email
          ? "We couldn't send your message. Please try again or email us directly."
          : "We couldn't send your message. Please try again.",
      );
    } finally {
      sendingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const contactRows = [
    {
      Icon: Mail,
      title: "Email us",
      value: BUSINESS_INFO.email,
      href: BUSINESS_INFO.email ? `mailto:${BUSINESS_INFO.email}` : "",
      note: "We usually respond within 24 hours during business days.",
    },
    {
      Icon: Phone,
      title: "Give us a call",
      value: BUSINESS_INFO.phoneDisplay && phoneHref ? BUSINESS_INFO.phoneDisplay : "",
      href: BUSINESS_INFO.phoneDisplay && phoneHref ? `tel:${phoneHref}` : "",
      note: "Available during our business hours.",
    },
    {
      Icon: Clock3,
      title: "Our hours",
      value: BUSINESS_INFO.businessDays,
      note: supportTime,
    },
    {
      Icon: MapPin,
      title: "Business location",
      address: addressLines,
    },
  ];

  const messageProgress = Math.min(
    100,
    (formData.message.length / MESSAGE_LIMIT) * 100,
  );

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      <div className="grid lg:min-h-[calc(100dvh-120px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* ============ Care desk (dark panel) ============ */}
        <section
          aria-labelledby="contact-title"
          className="relative overflow-hidden bg-ink px-5 pb-14 pt-12 text-paper sm:px-8 sm:pt-16 lg:px-[clamp(40px,5vw,82px)] lg:py-20"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -top-40 size-[420px] animate-[spin_50s_linear_infinite] rounded-full border border-dashed border-sand/15"
          />

          <div className="relative lg:sticky lg:top-32">
            <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae] sm:text-[11px]">
              <span className="h-px w-7 bg-[#d9a9ae]" aria-hidden="true" />
              {BUSINESS_INFO.businessName} / The care desk
            </p>

            <h1
              id="contact-title"
              className="mt-7 font-serif text-[clamp(52px,6.6vw,96px)] leading-[0.95] tracking-[-0.04em] perspective-distant"
            >
              <span className="block animate-fold-in [animation-delay:100ms]">
                A question?
              </span>
              <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:260ms]">
                Let&apos;s talk.
              </em>
            </h1>

            <p className="mt-6 max-w-[420px] animate-rise text-[15px] leading-relaxed text-paper/75 [animation-delay:400ms]">
              A little help with your order, a detail about a product, or
              something else on your mind. We&apos;re here to listen.
            </p>

            <a
              href="#contact-message-form"
              className="group mt-6 inline-flex min-h-11 animate-rise items-center gap-4 border-b border-paper/60 text-[13px] font-bold [animation-delay:480ms] lg:hidden"
            >
              Write us a note
              <ArrowDown
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-y-1"
              />
            </a>

            {/* Contact rows */}
            <ul className="mt-10 border-t border-paper/20 perspective-distant sm:mt-12">
              {contactRows.map(({ Icon, title, value, href, note, address }, index) => (
                <li
                  key={title}
                  style={{ animationDelay: `${520 + index * 110}ms` }}
                  className="group grid animate-fold-in grid-cols-[44px_minmax(0,1fr)] gap-4 perspective-distant border-b border-paper/20 py-5"
                >
                  <span className="grid size-11 place-items-center rounded-full border border-paper/30 text-[#d9a9ae] transition-all duration-700 ease-soft transform-3d group-hover:rotate-y-180 group-hover:border-[#d9a9ae] group-hover:bg-[#d9a9ae] group-hover:text-ink">
                    <Icon size={17} strokeWidth={1.4} aria-hidden="true" />
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-paper/60">
                      {title}
                    </h2>

                    {value &&
                      (href ? (
                        <a
                          href={href}
                          className="mt-1 inline-flex min-h-8 items-center gap-2 break-all font-serif text-xl transition-colors hover:text-[#d9a9ae] sm:text-2xl"
                        >
                          {value}
                          <ArrowUpRight
                            size={15}
                            aria-hidden="true"
                            className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </a>
                      ) : (
                        <strong className="mt-1 block font-serif text-xl font-normal sm:text-2xl">
                          {value}
                        </strong>
                      ))}

                    {address && address.length > 0 && (
                      <address className="mt-1 font-serif text-lg not-italic leading-snug sm:text-xl">
                        {address.map((line, lineIndex) => (
                          <React.Fragment key={`${lineIndex}-${line}`}>
                            {lineIndex > 0 && <br />}
                            {line}
                          </React.Fragment>
                        ))}
                      </address>
                    )}

                    {note && (
                      <p className="mt-1 text-xs leading-relaxed text-paper/60">
                        {note}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============ Letter (form) ============ */}
        <section
          aria-labelledby="contact-form-title"
          className="relative px-4 py-12 sm:px-8 sm:py-16 lg:px-[clamp(32px,4.5vw,72px)] lg:py-20"
        >
          <div className="mx-auto max-w-[720px] perspective-[1600px]">
            <div className="relative origin-top animate-fold-in bg-paper shadow-[0_40px_80px_-50px_rgba(36,34,35,0.7)] [animation-delay:250ms]">
              {/* stitched border */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-3 border border-dashed border-line"
              />

              {/* Letter top */}
              <div className="relative flex items-start justify-between gap-6 px-6 pb-6 pt-9 sm:px-10 sm:pt-12">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    A note to our team
                  </p>
                  <h2
                    id="contact-form-title"
                    className="mt-3 font-serif text-[clamp(34px,4vw,52px)] leading-[1.02]"
                  >
                    How can we <em>help?</em>
                  </h2>
                </div>

                {/* Postage stamp */}
                <span
                  aria-hidden="true"
                  className="group relative grid size-16 shrink-0 rotate-6 place-items-center border-2 border-dashed border-wine/50 bg-wine-soft text-wine transition-transform duration-700 ease-soft hover:rotate-0 sm:size-20 perspective-distant"
                >
                  <span className="grid place-items-center transition-transform duration-700 transform-3d group-hover:rotate-y-180">
                    <Mail size={26} strokeWidth={1.2} />
                  </span>
                  <span className="absolute -bottom-2 -right-2 bg-paper px-1 text-[8px] font-bold uppercase tracking-[0.16em]">
                    MM
                  </span>
                </span>
              </div>

              <form
                id="contact-message-form"
                onSubmit={handleSubmit}
                aria-busy={isSubmitting}
                className="relative scroll-mt-28 px-6 pb-8 sm:px-10 sm:pb-10"
              >
                <fieldset
                  disabled={isSubmitting}
                  className="m-0 min-w-0 border-0 p-0 transition-opacity disabled:opacity-60"
                >
                  <legend className="sr-only">
                    Your contact details and message
                  </legend>

                  <div className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
                    <div className="min-w-0">
                      <FieldLabel htmlFor="contact-name" number="01">
                        Your name
                      </FieldLabel>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        maxLength={80}
                        placeholder="Full name"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0">
                      <FieldLabel htmlFor="contact-email" number="02">
                        Email address
                      </FieldLabel>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={120}
                        placeholder="you@example.com"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <FieldLabel htmlFor="contact-subject" number="03">
                        What&apos;s it about?
                      </FieldLabel>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        maxLength={120}
                        placeholder="An order, a product, or a general question"
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="min-w-0 sm:col-span-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <FieldLabel htmlFor="contact-message" number="04">
                          Your message
                        </FieldLabel>
                        <span
                          id="contact-message-count"
                          className="whitespace-nowrap text-[10px] text-muted"
                        >
                          {formData.message.length} / {MESSAGE_LIMIT}
                        </span>
                      </div>

                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        maxLength={MESSAGE_LIMIT}
                        placeholder="Tell us a little more..."
                        rows={6}
                        required
                        aria-describedby="contact-message-count"
                        className={`${inputClass} min-h-[170px] resize-y leading-[1.8]`}
                      />
                      <span aria-hidden="true" className="block h-0.5 bg-linen">
                        <span
                          style={{ width: `${messageProgress}%` }}
                          className="block h-full bg-wine transition-[width] duration-300"
                        />
                      </span>
                    </div>
                  </div>
                </fieldset>

                {successMessage && (
                  <div
                    role="status"
                    className="mt-7 flex animate-flip-up items-start gap-3 border border-success/40 bg-success/10 p-4 text-success"
                  >
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 animate-scale-in" />
                    <p className="text-[13px] leading-relaxed">{successMessage}</p>
                  </div>
                )}

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-7 flex animate-flip-up items-start gap-3 border border-danger/40 bg-danger/10 p-4 text-danger"
                  >
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p className="text-[13px] leading-relaxed">{errorMessage}</p>
                  </div>
                )}

                <div className="mt-8 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-[290px] text-[11px] leading-relaxed text-muted">
                    Include your order number if your question is about an
                    existing order.
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex min-h-14 items-center justify-between gap-10 overflow-hidden bg-wine px-6 py-4 text-[13px] font-bold text-paper transition-colors duration-300 hover:bg-wine-dark disabled:cursor-wait disabled:opacity-70"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
                    />
                    <span className="relative">
                      {isSubmitting ? "Sending your note…" : "Send your note"}
                    </span>
                    {isSubmitting ? (
                      <Loader2 size={18} className="relative animate-spin" />
                    ) : (
                      <Send
                        size={18}
                        strokeWidth={1.5}
                        className="relative transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1.5 group-hover:-rotate-12"
                      />
                    )}
                  </button>
                </div>
              </form>

              {/* Signature */}
              <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line px-6 py-5 sm:px-10">
                <span className="text-[11px] text-muted">
                  A little care goes a long way.
                </span>
                <strong className="font-serif text-2xl font-normal italic text-wine">
                  {BUSINESS_INFO.businessName}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;