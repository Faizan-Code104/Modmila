import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail, Phone } from "lucide-react";
import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const POLICY_TITLE = "Payment Policy";
const UPDATED_ISO = "2026-10-08";

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

const B = ({ children }) => <strong className="font-semibold text-ink">{children}</strong>;

/* 3D payment card — flips on hover */
const PaymentCard = ({ brandName }) => (
  <div aria-hidden="true" className="group mx-auto w-full max-w-[340px] animate-fade-in perspective-[1400px] [animation-delay:300ms]">
    <div className="animate-float-3d transform-3d">
      <div className="relative aspect-[1.586/1] transition-transform duration-[1.1s] ease-soft transform-3d group-hover:rotate-y-180">
        {/* front */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-wine via-wine-dark to-ink p-6 text-paper shadow-[0_40px_60px_-30px_rgba(0,0,0,0.8)] backface-hidden">
          <span className="absolute -right-16 -top-16 size-48 rounded-full border border-paper/15" />
          <div className="relative flex items-start justify-between">
            <span className="text-lg font-semibold lowercase tracking-[-0.085em]">
              {brandName}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
              USD
            </span>
          </div>
          <span className="relative block h-8 w-11 rounded-md bg-gradient-to-br from-[#e6c4c7] to-sand" />
          <div className="relative flex items-end justify-between">
            <span className="font-mono text-sm tracking-[0.25em] text-paper/80">•••• •••• •••• ✳✳✳✳</span>
            <span className="font-serif text-sm italic text-[#e6c4c7]">secure</span>
          </div>
        </div>
        {/* back */}
        <div className="absolute inset-0 flex rotate-y-180 flex-col justify-center overflow-hidden rounded-2xl bg-ink text-paper shadow-[0_40px_60px_-30px_rgba(0,0,0,0.8)] backface-hidden">
          <span className="h-10 w-full bg-paper/80" />
          <p className="px-6 pt-5 text-[10px] uppercase leading-relaxed tracking-[0.18em] text-paper/70">
            Online electronic payments only · One-time purchases
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PaymentPolicy = () => {
  const brandName = BUSINESS_INFO.businessName;
  const fullAddress = getFullAddress();

  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  const supportSchedule = [
    BUSINESS_INFO.businessDays,
    [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const sections = [
    {
      id: "methods",
      label: "Payment methods",
      title: "Online payments only",
      body: (
        <>
          <p>
            {brandName} accepts online electronic payments only through the
            payment methods displayed at checkout.
          </p>
          <p>We do not accept:</p>
          <ul className="space-y-1.5 pl-5 text-sm marker:text-wine [list-style:disc]">
            <li>Cash on Delivery.</li>
            <li>Payment by cash through the mail.</li>
            <li>Personal checks.</li>
            <li>Telephone collection of complete payment-card details.</li>
          </ul>
        </>
      ),
    },
    {
      id: "status",
      label: "Current status",
      title: "Current payment status",
      body: (
        <>
          <p>
            {brandName} is currently completing its secure online payment
            setup.
          </p>
          <div className="border-l-2 border-wine bg-wine-soft px-5 py-4">
            <p>
              Until an active payment method is displayed at checkout and
              payment is successfully authorized, no completed online purchase
              will be accepted and no card payment will be collected through
              the website.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "currency",
      label: "Currency",
      title: "Currency",
      body: (
        <>
          <p>
            All product prices and transactions are stated in{" "}
            <B>United States dollars (USD)</B>.
          </p>
          <p>
            Applicable sales tax will be calculated and disclosed at checkout
            where required.
          </p>
        </>
      ),
    },
    {
      id: "processing",
      label: "Processing",
      title: "Payment processing",
      body: (
        <>
          <p>
            Once online payments are activated, transactions will be processed
            by an authorized third-party payment processor.
          </p>
          <p>
            {brandName} will not intentionally store complete card numbers or
            card security codes on its own systems. Customers should never send
            complete card information through email, contact forms, or
            voicemail.
          </p>
        </>
      ),
    },
    {
      id: "authorization",
      label: "Authorization",
      title: "Authorization",
      body: (
        <>
          <p>
            Submitting payment authorizes the payment processor to verify and
            charge the selected payment method for the total amount displayed
            at checkout.
          </p>
          <p>
            An authorization does not guarantee acceptance. Orders remain
            subject to payment approval, inventory availability, fraud review,
            and order confirmation.
          </p>
        </>
      ),
    },
    {
      id: "purchases",
      label: "Purchases",
      title: "One-time purchases",
      body: (
        <>
          <p>
            {brandName} sells products through one-time purchases. We do not
            automatically enroll product customers in recurring subscriptions.
          </p>
          <p>
            Any future recurring service would require separate, clear
            disclosure and express customer authorization before billing.
          </p>
        </>
      ),
    },
    {
      id: "descriptor",
      label: "Billing descriptor",
      title: "Billing descriptor",
      body: (
        <>
          <p>
            Once payment processing is activated, the exact processor-approved
            billing descriptor will be displayed at checkout or in the order
            confirmation.
          </p>
          <p>
            The descriptor will identify the charge as associated with{" "}
            {brandName}.
          </p>
        </>
      ),
    },
    {
      id: "declined",
      label: "Declined payments",
      title: "Declined payments",
      body: (
        <>
          <p>
            A payment may be declined by the card issuer, payment processor, or
            fraud-prevention system. Customers should verify their information
            or contact their financial institution.
          </p>
          <p>{brandName} does not control issuer decline decisions.</p>
        </>
      ),
    },
    {
      id: "refunds",
      label: "Refunds",
      title: "Refunds",
      body: (
        <p>
          Approved refunds are returned to the original payment method in
          accordance with our{" "}
          <Link to="/return-policy" className={linkClass}>
            Return and Refund Policy
          </Link>
          .
        </p>
      ),
    },
    {
      id: "contact",
      label: "Contact",
      title: "Contact",
      body: (
        <div className="grid justify-items-start gap-2 border border-line bg-chalk p-5">
          <strong className="font-serif text-2xl font-normal text-ink">{brandName}</strong>

          {BUSINESS_INFO.email && (
            <a
              href={`mailto:${BUSINESS_INFO.email}`}
              className="inline-flex min-h-11 max-w-full items-center gap-3 text-sm text-ink transition-colors hover:text-wine"
            >
              <Mail size={17} aria-hidden="true" className="shrink-0 text-wine" />
              <span className="min-w-0 break-all">
                <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Email</small>
                <span className="font-semibold">{BUSINESS_INFO.email}</span>
              </span>
            </a>
          )}

          {BUSINESS_INFO.phoneDisplay && phoneHref && (
            <a
              href={`tel:${phoneHref}`}
              className="inline-flex min-h-11 items-center gap-3 text-sm text-ink transition-colors hover:text-wine"
            >
              <Phone size={17} aria-hidden="true" className="shrink-0 text-wine" />
              <span>
                <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Phone</small>
                <span className="font-semibold">{BUSINESS_INFO.phoneDisplay}</span>
              </span>
            </a>
          )}

          {supportSchedule && <p>Hours: {supportSchedule}</p>}
          {fullAddress && <address className="not-italic">{fullAddress}</address>}

          <Link
            to="/contact"
            className="group inline-flex min-h-11 items-center gap-3 border-b border-wine text-sm font-bold text-wine"
          >
            Contact our team
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      ),
    },
  ];

  /* reading progress + active section */
  const articleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const onScroll = () => {
      const element = articleRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const total = bounds.height - window.innerHeight * 0.6;
      const value = total > 0 ? (-bounds.top + window.innerHeight * 0.3) / total : 0;
      setProgress(Math.min(1, Math.max(0, value)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id.replace("policy-", ""));
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );

    articleRef.current
      ?.querySelectorAll("section[id^='policy-']")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const facts = [
    ["Payment type", "Online electronic payments"],
    ["Currency", "United States dollars (USD)"],
    ["Purchases", "One-time purchases"],
  ];

  return (
    <div id="policy-top" className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
      {/* reading progress */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-wine transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />

      {/* ============ Hero ============ */}
      <header className="relative overflow-hidden bg-ink text-paper">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 size-[520px] animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-sand/15"
        />
        <div className="relative mx-auto max-w-[1450px] px-4 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14 lg:px-[clamp(40px,4vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/20 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="text-[#d9a9ae]">{brandName} / Website information</span>
            <span className="text-paper/70">
              Updated{" "}
              <time dateTime={UPDATED_ISO} className="text-paper">
                {BUSINESS_INFO.policyLastUpdated}
              </time>
            </span>
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Payment information
              </p>
              <h1 className="mt-4 font-serif text-[clamp(56px,8.4vw,124px)] leading-[0.9] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">Payment</span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[10%]">
                  Policy.
                </em>
              </h1>
              <p className="mt-7 max-w-xl animate-rise text-sm leading-relaxed text-paper/75 [animation-delay:360ms]">
                {brandName} accepts online electronic payments only through the
                payment methods displayed at checkout. Our online payment setup
                is currently being completed.
              </p>
            </div>

            <div>
              <PaymentCard brandName={brandName} />
              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-paper/50">
                Hover the card
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Key facts ============ */}
      <section
        aria-label="Payment overview"
        className="mx-auto -mt-10 max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {facts.map(([label, value], index) => (
            <div
              key={label}
              style={{ animationDelay: `${300 + index * 120}ms` }}
              className="animate-fold-in perspective-distant"
            >
              <div className="relative origin-top bg-paper p-6 shadow-[0_24px_40px_-28px_rgba(36,34,35,0.6)] transition-transform duration-700 ease-soft hover:rotate-x-[10deg]">
                <span aria-hidden="true" className="pointer-events-none absolute inset-2 border border-dashed border-line" />
                <span aria-hidden="true" className="absolute left-1/2 top-3.5 size-3 -translate-x-1/2 rounded-full border border-line bg-chalk" />
                <p className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">{label}</p>
                <p className="relative mt-2 font-serif text-[24px] leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <nav aria-label="Payment policy sections" className="lg:sticky lg:top-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">Explore the policy</p>
          <ol className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:overflow-visible lg:border-l lg:border-line lg:px-0">
            {sections.map((section, index) => {
              const active = activeId === section.id;

              return (
                <li key={section.id} className="shrink-0">
                  <a
                    href={`#policy-${section.id}`}
                    className={`relative flex min-h-10 items-center gap-3 whitespace-nowrap rounded-full border px-4 text-xs transition-all duration-300 lg:rounded-none lg:border-0 lg:py-2 lg:pl-5 lg:pr-0 lg:whitespace-normal ${
                      active
                        ? "border-wine bg-wine text-paper lg:bg-transparent lg:font-bold lg:text-wine"
                        : "border-line bg-paper text-muted hover:text-ink lg:bg-transparent"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-px top-0 hidden h-full w-0.5 origin-top bg-wine transition-transform duration-500 lg:block ${
                        active ? "scale-y-100" : "scale-y-0"
                      }`}
                    />
                    <span className="text-[10px] opacity-70">{String(index + 1).padStart(2, "0")}</span>
                    {section.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <article ref={articleRef} aria-label="Payment policy" className="min-w-0 border-t border-ink">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={`policy-${section.id}`}
              aria-labelledby={`policy-title-${section.id}`}
              className="grid scroll-mt-28 gap-3 border-b border-line py-8 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-6 sm:py-10"
            >
              <span
                aria-hidden="true"
                className={`font-serif text-4xl leading-none transition-colors duration-500 ${
                  activeId === section.id ? "text-wine" : "text-line"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 space-y-4 text-[15px] leading-[1.85] text-muted [overflow-wrap:anywhere]">
                <h2
                  id={`policy-title-${section.id}`}
                  className="font-serif text-[clamp(26px,2.6vw,36px)] leading-tight text-ink"
                >
                  {section.title}
                </h2>
                {section.body}
              </div>
            </section>
          ))}

          <footer className="flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] uppercase tracking-[0.16em] text-muted">
            <span>
              {brandName} / {POLICY_TITLE}
            </span>
            <a href="#policy-top" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink hover:text-wine">
              Back to top
              <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-1" />
            </a>
          </footer>
        </article>
      </div>

      {/* ============ Help ============ */}
      <section
        aria-labelledby="policy-help-title"
        className="mx-auto mt-14 max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col items-start justify-between gap-6 bg-wine p-6 text-paper sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
              A little assistance
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              Have a <em>payment question?</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">Contact our support team for assistance.</p>
          </div>

          <Link
            to="/contact"
            className="group inline-flex min-h-14 w-full shrink-0 items-center justify-between gap-6 bg-paper px-6 py-4 text-sm font-semibold text-ink transition-colors hover:bg-chalk sm:w-auto"
          >
            Contact us
            <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PaymentPolicy;