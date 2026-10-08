import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { BUSINESS_INFO } from "../storeInfo";

const POLICY_TITLE = "Return & Refund Policy";
const UPDATED_ISO = "2026-10-08";

const RETURN_STEPS = [
  {
    title: "Request a return",
    description:
      "Contact our support team within 30 days of confirmed delivery and provide your order number and return reason.",
  },
  {
    title: "Receive authorization",
    description:
      "If approved, we will provide return instructions. Do not mail a product before authorization is provided.",
  },
  {
    title: "Ship the return",
    description:
      "Send the authorized product as instructed and retain your tracking number and shipping receipt.",
  },
  {
    title: "Refund processed",
    description:
      "After inspection and approval, the refund is issued to the original payment method within 5–7 business days.",
  },
];

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

const B = ({ children }) => <strong className="font-semibold text-ink">{children}</strong>;

const List = ({ children, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={`space-y-1.5 pl-5 text-sm ${ordered ? "list-decimal" : "list-disc"} marker:text-wine`}
    >
      {children}
    </Tag>
  );
};

const SupportContact = () => {
  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  return (
    <div className="grid justify-items-start gap-1">
      {BUSINESS_INFO.email && (
        <a
          href={`mailto:${BUSINESS_INFO.email}`}
          className="inline-flex min-h-11 max-w-full items-center gap-3 text-sm font-semibold text-ink transition-colors hover:text-wine"
        >
          <Mail size={16} aria-hidden="true" className="shrink-0 text-wine" />
          <span className="min-w-0 break-all">{BUSINESS_INFO.email}</span>
        </a>
      )}

      {BUSINESS_INFO.phoneDisplay && phoneHref && (
        <a
          href={`tel:${phoneHref}`}
          className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ink transition-colors hover:text-wine"
        >
          <Phone size={16} aria-hidden="true" className="shrink-0 text-wine" />
          <span>{BUSINESS_INFO.phoneDisplay}</span>
        </a>
      )}

      <Link
        to="/contact"
        className="group inline-flex min-h-11 items-center gap-3 text-sm font-bold text-wine"
      >
        Contact our team
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
};

const BusinessAddress = () => {
  const lines = [
    BUSINESS_INFO.addressLine1,
    BUSINESS_INFO.addressLine2,
    BUSINESS_INFO.country,
  ].filter(Boolean);

  return (
    <address className="grid gap-0.5 border-l-2 border-wine bg-chalk px-4 py-3 text-sm not-italic">
      <strong className="font-serif text-xl font-normal text-ink">
        {BUSINESS_INFO.businessName}
      </strong>
      {lines.map((line, index) => (
        <span key={`${index}-${line}`}>{line}</span>
      ))}
    </address>
  );
};

const ReturnPolicy = () => {
  const brand = BUSINESS_INFO.businessName;

  const hasAddress = Boolean(
    BUSINESS_INFO.addressLine1 ||
      BUSINESS_INFO.addressLine2 ||
      BUSINESS_INFO.country,
  );

  const supportSchedule = [
    BUSINESS_INFO.businessDays,
    [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const eligible = [
    "Unused and unworn",
    "Unwashed and unaltered",
    "Free from stains, odors, scratches, or customer-caused damage",
    "Original tags, accessories, and packaging are included",
    "Order number or proof of purchase is provided",
    "Return is requested within 30 days of confirmed delivery",
  ];

  const notEligible = [
    "Used, worn, washed, altered, or customer-damaged products",
    "Products missing tags, accessories, components, or original packaging",
    "Products showing misuse, improper cleaning, or ordinary wear",
    "Products returned more than 30 days after delivery",
    "Products mailed without authorization",
    `Products not purchased directly from ${brand}`,
  ];

  const sections = [
    {
      id: "eligibility",
      title: "Return eligibility",
      body: (
        <>
          <p>
            To qualify for a return, the product must be unused and unworn,
            unwashed and unaltered, free from stains, odors, scratches, or
            customer-caused damage, and returned with its original tags,
            accessories, and packaging.
          </p>
          <p>
            The return must also be accompanied by the order number or proof
            of purchase.
          </p>
          <p>
            Products returned without authorization or outside the return
            period may be refused.
          </p>
        </>
      ),
    },
    {
      id: "starting",
      title: "Starting a return",
      body: (
        <>
          <p>
            Before mailing a return, contact our support team using the
            following details:
          </p>
          <SupportContact />
          <p>Please provide:</p>
          <List>
            <li>Customer name.</li>
            <li>Order number.</li>
            <li>Product being returned.</li>
            <li>Reason for return.</li>
            <li>Photographs if the item is damaged, defective, or incorrect.</li>
          </List>
          <p>
            If approved, we will provide return instructions. Do not mail a
            product until return authorization has been provided.
          </p>
        </>
      ),
    },
    {
      id: "address",
      title: "Return address",
      body: (
        <>
          <p>
            {hasAddress
              ? "Authorized returns should be sent as instructed to:"
              : "Authorized returns should be sent to the address provided in our return instructions."}
          </p>
          {hasAddress && <BusinessAddress />}
          <p>
            The customer should retain the return tracking number and shipping
            receipt until the refund is completed.
          </p>
        </>
      ),
    },
    {
      id: "change-of-mind",
      title: "Change-of-mind returns",
      body: (
        <>
          <p>
            If a customer changes their mind, orders the wrong item, or no
            longer wants the product:
          </p>
          <List>
            <li>The customer is responsible for return-shipping costs.</li>
            <li>The return shipment should include tracking.</li>
            <li>{brand} is not responsible for a return lost before it reaches us.</li>
            <li>The product must satisfy all return-eligibility requirements.</li>
          </List>
        </>
      ),
    },
    {
      id: "damaged",
      title: "Damaged, defective, or incorrect products",
      body: (
        <>
          <p>
            A damaged, defective, or incorrect product should be reported
            within <B>48 hours of delivery</B>.
          </p>
          <p>The customer should provide photographs of:</p>
          <List>
            <li>The product.</li>
            <li>The packaging.</li>
            <li>The shipping label.</li>
            <li>The damaged or incorrect area.</li>
          </List>
          <p>
            After verification, {brand} will provide appropriate return
            instructions and cover reasonable return-shipping costs.
          </p>
        </>
      ),
    },
    {
      id: "exchanges",
      title: "Exchanges",
      body: (
        <>
          <p>
            We do <B>not offer direct exchanges</B>.
          </p>
          <p>
            A customer who wants another color, style, or product may return
            the eligible original product for a refund and place a separate
            order.
          </p>
        </>
      ),
    },
    {
      id: "fees",
      title: "Restocking fees",
      body: (
        <p>
          {brand} does <B>not charge a restocking fee</B> for an eligible
          return.
        </p>
      ),
    },
    {
      id: "non-returnable",
      title: "Non-returnable products",
      body: (
        <>
          <p>A return may be refused if the product:</p>
          <List>
            <li>Was used, worn, washed, altered, or damaged after delivery.</li>
            <li>Is missing tags, accessories, components, or original packaging.</li>
            <li>Shows signs of misuse, improper cleaning, or ordinary wear.</li>
            <li>Is returned more than 30 days after delivery.</li>
            <li>Was mailed without authorization.</li>
            <li>Was not purchased directly from {brand}.</li>
          </List>
          <p>
            These exclusions do not limit legal rights concerning defective or
            misrepresented products.
          </p>
        </>
      ),
    },
    {
      id: "inspection",
      title: "Return inspection",
      body: (
        <>
          <p>
            Returned products are inspected after receipt. We will notify the
            customer whether the return has been approved or rejected.
          </p>
          <p>
            If a return does not meet the stated conditions, we will explain
            the reason and may ask the customer to pay for shipment of the
            product back to them.
          </p>
        </>
      ),
    },
    {
      id: "refunds",
      title: "Refund timing",
      body: (
        <>
          <p>
            Approved refunds are issued to the{" "}
            <B>original payment method within 5–7 business days after inspection</B>
            .
          </p>
          <p>
            The customer’s bank or card issuer may require additional time to
            post the credit. {brand} does not control financial-institution
            posting times.
          </p>
          <p>
            Shipping charges paid for expedited or optional delivery services,
            if any, are not refundable unless the return resulted from our
            error or applicable law requires otherwise.
          </p>
        </>
      ),
    },
    {
      id: "missing-refunds",
      title: "Late or missing refunds",
      body: (
        <>
          <p>If an approved refund does not appear:</p>
          <List ordered>
            <li>Review the original payment account.</li>
            <li>Contact the bank or card issuer.</li>
            <li>Allow for the institution’s processing period.</li>
            <li>
              Contact{" "}
              {BUSINESS_INFO.email ? (
                <a href={`mailto:${BUSINESS_INFO.email}`} className={linkClass}>
                  {BUSINESS_INFO.email}
                </a>
              ) : (
                <Link to="/contact" className={linkClass}>
                  our support team
                </Link>
              )}{" "}
              if the refund still cannot be located.
            </li>
          </List>
        </>
      ),
    },
    {
      id: "undeliverable",
      title: "Refused and undeliverable orders",
      body: (
        <>
          <p>
            Packages returned because of refusal, an inaccurate address, or
            repeated failed delivery may be processed under this policy.
          </p>
          <p>
            Actual carrier costs caused by refusal or inaccurate customer
            information may be deducted from the refund where legally
            permitted.
          </p>
        </>
      ),
    },
    {
      id: "questions",
      title: "Charge and order questions",
      body: (
        <p>
          Contact us before initiating a payment dispute so we can investigate
          the order promptly. This request does not restrict any rights a
          customer may have through their card issuer or applicable law.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <>
          <BusinessAddress />
          <SupportContact />
          {supportSchedule && <p>Support Hours: {supportSchedule}</p>}
        </>
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
        <div className="relative mx-auto max-w-[1450px] px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-[clamp(40px,4vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/20 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="text-[#d9a9ae]">
              {brand} / {POLICY_TITLE}
            </span>
            <span className="text-paper/70">
              Last updated:{" "}
              <time dateTime={UPDATED_ISO} className="text-paper">
                {BUSINESS_INFO.policyLastUpdated}
              </time>
            </span>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Returns & refunds
              </p>
              <h1 className="mt-4 font-serif text-[clamp(50px,7.4vw,110px)] leading-[0.92] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">
                  A little
                </span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms]">
                  reconsideration.
                </em>
              </h1>
              <p className="mt-6 max-w-xl animate-rise text-sm leading-relaxed text-paper/75 [animation-delay:360ms]">
                {brand} accepts eligible returns requested within 30 days of
                confirmed delivery. Products must meet the return conditions
                described below.
              </p>
            </div>

            {/* 3D return-window card */}
            <div className="perspective-distant">
              <div className="animate-float-3d transform-3d">
                <div className="relative mx-auto max-w-[320px] animate-flip-up bg-paper p-7 text-ink shadow-[0_40px_70px_-35px_rgba(0,0,0,0.8)] [animation-delay:300ms]">
                  <span aria-hidden="true" className="pointer-events-none absolute inset-2.5 border border-dashed border-line" />
                  <span aria-hidden="true" className="absolute left-1/2 top-4 size-3 -translate-x-1/2 rounded-full border border-line bg-chalk" />
                  <p className="relative mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                    Return window
                  </p>
                  <p className="relative mt-1 flex items-baseline gap-2">
                    <strong className="font-serif text-[110px] font-normal leading-none">30</strong>
                    <span className="font-serif text-3xl italic text-wine">days</span>
                  </p>
                  <p className="relative mt-3 text-xs text-muted">
                    From confirmed delivery, subject to eligibility.
                  </p>
                  <a
                    href="#policy-starting"
                    className="group relative mt-5 flex min-h-11 items-center justify-between gap-3 border-t border-ink text-xs font-bold transition-colors hover:text-wine"
                  >
                    Start with authorization
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Conditions ============ */}
      <section
        id="conditions"
        aria-labelledby="conditions-title"
        className="mx-auto mt-14 max-w-[1450px] scroll-mt-28 px-4 sm:mt-20 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="conditions-title" className="font-serif text-[clamp(32px,3.6vw,52px)] leading-none">
            Check the <em className="text-wine">conditions.</em>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Before you begin</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            { heading: "Eligible for return", items: eligible, ok: true },
            { heading: "May not be eligible", items: notEligible, ok: false },
          ].map(({ heading, items, ok }, column) => (
            <div
              key={heading}
              style={{ animationDelay: `${column * 150}ms` }}
              className={`animate-fold-in p-6 sm:p-8 ${ok ? "bg-paper" : "bg-wine text-paper"}`}
            >
              <h3 className="flex items-center gap-3 font-serif text-[28px] leading-tight">
                <span
                  className={`grid size-9 place-items-center rounded-full ${
                    ok ? "bg-wine text-paper" : "bg-paper text-wine"
                  }`}
                >
                  {ok ? <Check size={17} aria-hidden="true" /> : <X size={17} aria-hidden="true" />}
                </span>
                {heading}
              </h3>
              <ul className={`mt-5 divide-y ${ok ? "divide-line" : "divide-paper/20"}`}>
                {items.map((item, index) => (
                  <li
                    key={item}
                    style={{ animationDelay: `${200 + index * 70 + column * 150}ms` }}
                    className={`flex animate-rise items-start gap-3 py-3 text-sm leading-relaxed ${
                      ok ? "text-muted" : "text-paper/85"
                    }`}
                  >
                    <span aria-hidden="true" className={ok ? "text-wine" : "text-[#e6c4c7]"}>
                      {ok ? "✓" : "✕"}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ============ Return journey ============ */}
      <section
        id="process"
        aria-labelledby="process-title"
        className="mx-auto mt-14 max-w-[1450px] scroll-mt-28 px-4 sm:mt-20 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="process-title" className="font-serif text-[clamp(32px,3.6vw,52px)] leading-none">
            The return <em className="text-wine">journey.</em>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">How to return an item</p>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {RETURN_STEPS.map((step, index) => (
            <li
              key={step.title}
              style={{ animationDelay: `${index * 130}ms` }}
              className="animate-fold-in perspective-distant"
            >
              <div className="group relative h-full origin-top bg-paper p-6 transition-transform duration-700 ease-soft hover:rotate-x-[8deg]">
                <span aria-hidden="true" className="pointer-events-none absolute inset-2 border border-dashed border-line transition-colors group-hover:border-wine/40" />
                <span className="relative font-serif text-5xl text-wine">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="relative mt-5 text-sm font-bold uppercase tracking-[0.12em]">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <nav aria-label="Return policy navigation" className="lg:sticky lg:top-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">The full policy</p>
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
                    {section.title}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <article ref={articleRef} aria-label="Return and refund policy" className="min-w-0 border-t border-ink">
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
              {brand} / {POLICY_TITLE}
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
              Our team can help
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              Need to start <em>a return?</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">
              Contact our support team before mailing your return.
            </p>
          </div>

          <Link
            to="/contact"
            className="group inline-flex min-h-14 w-full shrink-0 items-center justify-between gap-6 bg-paper px-6 py-4 text-sm font-semibold text-ink transition-colors hover:bg-chalk sm:w-auto"
          >
            Contact support
            <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicy;