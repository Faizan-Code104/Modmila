import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const POLICY_TITLE = "Shipping Policy";
const UPDATED_ISO = "2026-10-08";

const JOURNEY = [
  {
    icon: Package,
    title: "Order accepted",
    description:
      "After payment authorization and order acceptance, your order enters processing.",
  },
  {
    icon: Clock3,
    title: "Order processing",
    description:
      "Orders are normally processed within 1–2 business days, excluding weekends and federal holidays.",
  },
  {
    icon: Truck,
    title: "In transit",
    description:
      "After processing, standard delivery normally takes 3–7 business days through a recognized third-party carrier.",
  },
  {
    icon: MapPin,
    title: "Delivery",
    description:
      "Your order is delivered to the complete and accurate shipping address provided during checkout.",
  },
];

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

const SupportLink = () =>
  BUSINESS_INFO.email ? (
    <a href={`mailto:${BUSINESS_INFO.email}`} className={linkClass}>
      {BUSINESS_INFO.email}
    </a>
  ) : (
    <Link to="/contact" className={linkClass}>
      our support team
    </Link>
  );

const B = ({ children }) => <strong className="font-semibold text-ink">{children}</strong>;

const ShippingPolicy = () => {
  const brand = BUSINESS_INFO.businessName;
  const address = getFullAddress();

  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  const schedule = [
    BUSINESS_INFO.businessDays,
    [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const sections = [
    {
      id: "area",
      title: "Shipping area",
      body: (
        <>
          <p>
            We currently ship to deliverable addresses within the contiguous 48
            United States.
          </p>
          <p>
            We do not currently ship internationally or to Alaska, Hawaii, U.S.
            territories, APO/FPO/DPO addresses, or P.O. boxes.
          </p>
        </>
      ),
    },
    {
      id: "cost",
      title: "Shipping cost",
      body: (
        <>
          <p>
            {brand} provides <B>free standard shipping</B> on eligible orders
            within our published U.S. shipping area.
          </p>
          <p>
            Customers will not be charged a standard shipping fee unless a
            different charge is clearly disclosed before completing the order.
          </p>
        </>
      ),
    },
    {
      id: "processing",
      title: "Order processing",
      body: (
        <>
          <p>
            Orders are normally processed within <B>1–2 business days</B> after
            payment authorization and order acceptance.
          </p>
          <p>
            Business days are Monday through Friday and exclude federal
            holidays. Orders submitted during weekends or holidays begin
            processing on the following business day.
          </p>
          <p>
            An order confirmation does not mean the order has shipped.
            Customers will receive a separate shipping confirmation when
            tracking becomes available.
          </p>
        </>
      ),
    },
    {
      id: "delivery",
      title: "Estimated delivery",
      body: (
        <>
          <p>
            After processing, standard delivery normally takes{" "}
            <B>3–7 business days</B>.
          </p>
          <p>
            The estimated total period from order acceptance to delivery is
            generally <B>4–9 business days</B>.
          </p>
          <p>
            Delivery estimates are not guarantees. Severe weather, carrier
            disruptions, incorrect addresses, holidays, emergencies, or other
            circumstances outside our control may cause delays.
          </p>
          <p>
            If we cannot ship within the promised period, we will notify the
            customer and provide available options, including cancellation and
            refund when required.
          </p>
        </>
      ),
    },
    {
      id: "method",
      title: "Shipping method",
      body: (
        <>
          <p>
            Orders are shipped using standard ground or parcel delivery through
            a recognized third-party carrier. The carrier used may depend on
            the destination, package size, and operational availability.
          </p>
          <p>
            Available tracking information will be included in the shipping
            confirmation.
          </p>
        </>
      ),
    },
    {
      id: "accuracy",
      title: "Address accuracy",
      body: (
        <>
          <p>
            Customers are responsible for providing a complete and accurate
            delivery address.
          </p>
          <p>
            Contact <SupportLink /> immediately if an address needs to be
            corrected. We cannot guarantee changes after an order enters
            fulfillment or has shipped.
          </p>
          <p>
            {brand} is not responsible for delays or failed delivery caused by
            incorrect or incomplete information supplied by the customer.
          </p>
        </>
      ),
    },
    {
      id: "tracking",
      title: "Tracking",
      body: (
        <>
          <p>
            Tracking information may take up to 48 hours to update after a
            label is created.
          </p>
          <p>
            A carrier’s “delivered” scan does not always mean the package was
            handed directly to the recipient. Customers should check the
            delivery area, household members, property staff, and carrier
            notices before reporting a missing delivery.
          </p>
          <p>
            You can also use your {brand} order number on our{" "}
            <Link to="/track-order" className={linkClass}>
              Order Tracking page
            </Link>
            .
          </p>
        </>
      ),
    },
    {
      id: "lost",
      title: "Lost packages",
      body: (
        <>
          <p>
            If tracking does not update for an unusual period or a package
            appears lost, contact{" "}
            {BUSINESS_INFO.email ? (
              <>
                us at <SupportLink />
              </>
            ) : (
              <SupportLink />
            )}{" "}
            with the order number.
          </p>
          <p>
            We will review the shipment with the carrier and provide an
            appropriate resolution based on the investigation and applicable
            law.
          </p>
        </>
      ),
    },
    {
      id: "damaged",
      title: "Damaged packages",
      body: (
        <>
          <p>
            If a package arrives visibly damaged, photograph the package and
            product and contact us within <B>48 hours of delivery</B>.
          </p>
          <p>
            Please retain the item, packaging, labels, and shipping materials
            until we complete our review.
          </p>
        </>
      ),
    },
    {
      id: "undeliverable",
      title: "Refused or undeliverable packages",
      body: (
        <>
          <p>
            A shipment returned because of refusal, an incorrect address,
            repeated failed delivery, or failure to collect the package may be
            treated as a return.
          </p>
          <p>
            Any additional reshipping charge will be disclosed and approved
            before reshipment. If a refund is requested, unavoidable carrier
            charges incurred because of an incorrect address or refused
            delivery may be deducted where legally permitted.
          </p>
        </>
      ),
    },
    {
      id: "split",
      title: "Split shipments",
      body: (
        <p>
          If an order contains multiple products, products may arrive in
          separate packages. Additional standard shipping will not be charged
          unless disclosed before purchase.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      body: (
        <div className="grid justify-items-start gap-2.5 border border-line bg-chalk p-5">
          <strong className="font-serif text-2xl font-normal text-ink">{brand}</strong>
          {address && <address className="not-italic">{address}</address>}
          {BUSINESS_INFO.email && (
            <p>
              Email:{" "}
              <a href={`mailto:${BUSINESS_INFO.email}`} className={linkClass}>
                {BUSINESS_INFO.email}
              </a>
            </p>
          )}
          {BUSINESS_INFO.phoneDisplay && phoneHref && (
            <p>
              Phone:{" "}
              <a href={`tel:${phoneHref}`} className={linkClass}>
                {BUSINESS_INFO.phoneDisplay}
              </a>
            </p>
          )}
          {schedule && <p>Support Hours: {schedule}</p>}
          <Link
            to="/contact"
            className="group mt-1 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-wine"
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
    ["Shipping area", "Contiguous 48 U.S. states"],
    ["Order processing", "1–2 business days"],
    ["Shipping cost", "Free standard shipping"],
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
        <div className="relative mx-auto max-w-[1450px] px-4 pb-14 pt-10 sm:px-8 sm:pb-20 sm:pt-14 lg:px-[clamp(40px,4vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/20 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="text-[#d9a9ae]">
              {brand} / {POLICY_TITLE}
            </span>
            <Link
              to="/track-order"
              className="group inline-flex min-h-10 items-center gap-2 text-paper/70 transition-colors hover:text-paper"
            >
              Track your order
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Shipping information
              </p>
              <h1 className="mt-4 font-serif text-[clamp(52px,8vw,118px)] leading-[0.92] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">
                  On its way,
                </span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[8%]">
                  with care.
                </em>
              </h1>
            </div>

            <div className="animate-rise [animation-delay:360ms]">
              <p className="text-sm leading-relaxed text-paper/75">
                This Shipping Policy applies to physical products purchased
                from {brand} through{" "}
                {BUSINESS_INFO.website ? (
                  <a
                    href={BUSINESS_INFO.website}
                    className="break-all font-semibold text-paper underline decoration-[#d9a9ae]/60 underline-offset-4"
                  >
                    {BUSINESS_INFO.website}
                  </a>
                ) : (
                  "our website"
                )}
                .
              </p>
              <p className="mt-5 inline-flex items-center gap-3 border border-paper/25 px-3 py-2 text-[11px]">
                <span className="uppercase tracking-[0.16em] text-paper/60">Last updated</span>
                <time dateTime={UPDATED_ISO} className="font-semibold">
                  {BUSINESS_INFO.policyLastUpdated}
                </time>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Key facts — hang tags ============ */}
      <section
        aria-label="Shipping overview"
        className="mx-auto -mt-8 max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
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
                <p className="relative mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                  {label}
                </p>
                <p className="relative mt-2 font-serif text-[26px] leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Estimated total time from order acceptance to delivery is generally{" "}
          <B>4–9 business days</B>. Delivery estimates are not guaranteed.
        </p>
      </section>

      {/* ============ Journey ============ */}
      <section
        aria-labelledby="journey-title"
        className="mx-auto mt-14 max-w-[1450px] px-4 sm:mt-20 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="journey-title" className="font-serif text-[clamp(32px,3.6vw,52px)] leading-none">
            From checkout <em className="text-wine">to your door.</em>
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Order journey</p>
        </div>

        <ol className="relative mt-8 grid gap-6 md:grid-cols-4 md:gap-4">
          <span aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" />
          {JOURNEY.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.title}
                style={{ animationDelay: `${index * 140}ms` }}
                className="group relative grid animate-rise grid-cols-[48px_minmax(0,1fr)] gap-4 md:block"
              >
                <span className="relative z-10 grid size-12 place-items-center rounded-full border border-wine bg-chalk text-wine transition-all duration-500 transform-3d group-hover:rotate-y-180 group-hover:bg-wine group-hover:text-paper">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <div className="md:mt-4">
                  <span className="text-[10px] font-bold text-wine">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-1 font-serif text-xl">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        {/* table of contents */}
        <nav aria-label="Policy sections" className="lg:sticky lg:top-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">The delivery details</p>
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

        {/* sections */}
        <article ref={articleRef} aria-label={POLICY_TITLE} className="min-w-0 border-t border-ink">
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
              Already submitted an order?
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              Follow <em>its journey.</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">
              Check the latest available status using your order number.
            </p>
          </div>

          <Link
            to="/track-order"
            className="group inline-flex min-h-14 w-full shrink-0 items-center justify-between gap-6 bg-paper px-6 py-4 text-sm font-semibold text-ink transition-colors hover:bg-chalk sm:w-auto"
          >
            Track order
            <ArrowRight size={18} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ShippingPolicy;