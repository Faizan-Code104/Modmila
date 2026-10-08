import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";
import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const POLICY_TITLE = "Order Cancellation Policy";
const UPDATED_ISO = "2026-10-08";

const REQUEST_ITEMS = [
  "Customer name",
  "Order number",
  "Email address used for the order",
  "Reason for cancellation",
];

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

const B = ({ children }) => <strong className="font-semibold text-ink">{children}</strong>;

/* 3D flip sign — before / after shipment */
const FlipSign = () => (
  <div aria-hidden="true" className="group mx-auto w-full max-w-[320px] animate-fade-in perspective-[1400px] [animation-delay:300ms]">
    <div className="animate-float-3d transform-3d">
      <div className="relative aspect-square transition-transform duration-[1.1s] ease-soft transform-3d group-hover:rotate-y-180">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-paper p-6 text-center text-ink shadow-[0_40px_60px_-30px_rgba(0,0,0,0.8)] backface-hidden">
          <span className="pointer-events-none absolute inset-3 border border-dashed border-line" />
          <span className="grid size-16 place-items-center rounded-full bg-wine text-paper">
            <Check size={30} />
          </span>
          <span className="font-serif text-3xl leading-tight">
            Before
            <br />
            <em className="text-wine">it ships.</em>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
            Cancellation possible
          </span>
        </div>
        <div className="absolute inset-0 flex rotate-y-180 flex-col items-center justify-center gap-4 bg-wine p-6 text-center text-paper shadow-[0_40px_60px_-30px_rgba(0,0,0,0.8)] backface-hidden">
          <span className="pointer-events-none absolute inset-3 border border-dashed border-paper/30" />
          <span className="grid size-16 place-items-center rounded-full bg-paper text-wine">
            <RotateCcw size={28} />
          </span>
          <span className="font-serif text-3xl leading-tight">
            After
            <br />
            <em>it ships.</em>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
            Return &amp; Refund Policy applies
          </span>
        </div>
      </div>
    </div>
  </div>
);

const OrderCancellationPolicy = () => {
  const brandName = BUSINESS_INFO.businessName;
  const fullAddress = getFullAddress();

  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  const supportTime = [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone]
    .filter(Boolean)
    .join(" ");

  const supportSchedule = [BUSINESS_INFO.businessDays, supportTime]
    .filter(Boolean)
    .join(", ");

  const sections = [
    {
      id: "requests",
      title: "Cancellation requests",
      body: (
        <>
          <p>
            Customers may request an order cancellation before the order has
            shipped.
          </p>
          <p>
            To request cancellation, contact{" "}
            {BUSINESS_INFO.email ? (
              <a href={`mailto:${BUSINESS_INFO.email}`} className={linkClass}>
                {BUSINESS_INFO.email}
              </a>
            ) : (
              <Link to="/contact" className={linkClass}>
                our customer support team
              </Link>
            )}{" "}
            as soon as possible and include:
          </p>
          <ul className="grid gap-x-6 gap-y-1.5 pl-5 text-sm marker:text-wine [list-style:disc] sm:grid-cols-2">
            {REQUEST_ITEMS.map((item) => (
              <li key={item}>{item}.</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "fulfillment",
      title: "Fulfillment and shipment",
      body: (
        <>
          <p>
            We cannot guarantee cancellation after an order has entered
            fulfillment.
          </p>
          <p>
            Once tracking has been issued or the order has shipped, the
            customer must follow our{" "}
            <Link to="/return-policy" className={linkClass}>
              Return and Refund Policy
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      id: "refunds",
      title: "Cancellation refunds",
      body: (
        <>
          <p>
            Approved cancellations are refunded to the original payment
            method.
          </p>
          <p>
            The refund is generally submitted within <B>5–7 business days</B>,
            although the customer’s bank may require additional posting time.
          </p>
        </>
      ),
    },
    {
      id: "by-business",
      title: `Cancellations by ${brandName}`,
      body: (
        <p>
          If {brandName} cancels an order because of unavailable inventory, a
          pricing error, delivery restrictions, payment problems, or suspected
          fraud, any collected payment for the canceled products will be
          returned to the original payment method.
        </p>
      ),
    },
    {
      id: "address",
      title: "Shipping address changes",
      body: (
        <>
          <p>
            Shipping-address changes are also available only before shipment
            and cannot be guaranteed after fulfillment begins.
          </p>
          <p>
            Customers should contact us immediately if an address correction
            is needed.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <div className="grid justify-items-start gap-1.5 border border-line bg-chalk p-5">
          <strong className="font-serif text-2xl font-normal text-ink">{brandName}</strong>

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

          {supportSchedule && <p>Hours: {supportSchedule}</p>}
          {fullAddress && <address className="not-italic">{fullAddress}</address>}

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
    ["Cancellation window", "Before shipment"],
    ["Refund method", "Original payment method"],
    ["Refund submission", "5–7 business days"],
  ];

  const reminders = [
    {
      Icon: Clock3,
      title: "Request early",
      text: "Contact us as soon as possible before the order enters shipment or tracking is issued.",
    },
    {
      Icon: ArrowUpRight,
      title: "Before shipment",
      text: "Cancellation and address-change requests are available only before shipment and cannot be guaranteed after fulfillment begins.",
    },
    {
      Icon: RotateCcw,
      title: "Refund",
      text: "Approved cancellations are refunded to the original payment method.",
    },
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
            <span className="text-[#d9a9ae]">{brandName} / Customer care</span>
            <Link
              to="/contact"
              className="group inline-flex min-h-10 items-center gap-2 text-paper/70 transition-colors hover:text-paper"
            >
              Contact our team
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="mt-10 grid items-center gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Order cancellation policy
              </p>
              <h1 className="mt-4 font-serif text-[clamp(52px,8vw,118px)] leading-[0.92] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">A change</span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[10%]">
                  of plans.
                </em>
              </h1>
              <p className="mt-7 max-w-xl animate-rise text-[15px] leading-relaxed text-paper/75 [animation-delay:360ms]">
                Customers may request an order cancellation before the order
                has shipped. Cancellation requests should be submitted as soon
                as possible.
              </p>
              <p className="mt-5 inline-flex animate-rise items-center gap-3 border border-paper/25 px-3 py-2 text-[11px] [animation-delay:420ms]">
                <span className="uppercase tracking-[0.16em] text-paper/60">Last updated</span>
                <time dateTime={UPDATED_ISO} className="font-semibold">
                  {BUSINESS_INFO.policyLastUpdated}
                </time>
              </p>
            </div>

            <div>
              <FlipSign />
              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-paper/50">
                Hover the sign
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============ At a glance — hang tags ============ */}
      <section
        aria-label="Cancellation summary"
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

      {/* ============ Reminders ============ */}
      <section
        aria-labelledby="reminders-title"
        className="mx-auto mt-14 max-w-[1450px] px-4 sm:mt-20 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="reminders-title" className="font-serif text-[clamp(32px,3.6vw,52px)] leading-none">
            Before <em className="text-wine">it ships.</em>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">At a glance</p>
        </div>

        <ol className="mt-8 grid gap-6 md:grid-cols-3 md:gap-4">
          {reminders.map(({ Icon, title, text }, index) => (
            <li
              key={title}
              style={{ animationDelay: `${index * 140}ms` }}
              className="group grid animate-rise grid-cols-[48px_minmax(0,1fr)] gap-4 border-t border-ink pt-5"
            >
              <span className="grid size-12 place-items-center rounded-full border border-wine text-wine transition-all duration-500 transform-3d group-hover:rotate-y-180 group-hover:bg-wine group-hover:text-paper">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <nav aria-label="Cancellation policy sections" className="lg:sticky lg:top-28">
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

        <article ref={articleRef} aria-label="Order cancellation policy" className="min-w-0 border-t border-ink">
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
              Need to cancel an order?
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              Let us <em>know.</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">
              Contact us as soon as possible before your order ships.
            </p>
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

export default OrderCancellationPolicy;