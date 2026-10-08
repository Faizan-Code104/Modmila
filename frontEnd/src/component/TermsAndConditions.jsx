import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Mail, Phone, Clock } from "lucide-react";

import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const brand = BUSINESS_INFO.businessName;
const updatedDate = BUSINESS_INFO.policyLastUpdated || "October 8, 2026";
const UPDATED_ISO = "2026-10-08";

const BusinessDetails = ({ showHours = false }) => {
  const address = getFullAddress();

  const supportSchedule = [
    BUSINESS_INFO.businessDays,
    BUSINESS_INFO.supportHours,
    BUSINESS_INFO.timeZone,
  ]
    .filter(Boolean)
    .join(", ");

  const phone = BUSINESS_INFO.phoneDisplay || BUSINESS_INFO.phoneHref;
  const phoneHref = BUSINESS_INFO.phoneHref
    ? `tel:${BUSINESS_INFO.phoneHref.replace(/^tel:/i, "")}`
    : "";

  return (
    <address className="grid gap-5 border border-line bg-chalk p-5 not-italic sm:grid-cols-2">
      <div className="text-sm">
        <strong className="mb-1 block font-serif text-2xl font-normal text-ink">
          {brand}
        </strong>
        {address && <span className="block">{address}</span>}
      </div>

      <div className="grid content-start gap-2 text-sm">
        {BUSINESS_INFO.email && (
          <span className="flex items-start gap-3">
            <Mail size={17} strokeWidth={1.4} className="mt-1 shrink-0 text-wine" aria-hidden="true" />
            <span className="min-w-0 break-all">
              <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Email:</small>
              <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>
            </span>
          </span>
        )}

        {phone && (
          <span className="flex items-start gap-3">
            <Phone size={17} strokeWidth={1.4} className="mt-1 shrink-0 text-wine" aria-hidden="true" />
            <span>
              <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Phone:</small>
              {phoneHref ? <a href={phoneHref}>{phone}</a> : phone}
            </span>
          </span>
        )}

        {showHours && supportSchedule && (
          <span className="flex items-start gap-3">
            <Clock size={17} strokeWidth={1.4} className="mt-1 shrink-0 text-wine" aria-hidden="true" />
            <span>
              <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Support Hours:</small>
              {supportSchedule}
            </span>
          </span>
        )}
      </div>
    </address>
  );
};

const sections = [
  {
    title: "Business Operator",
    content: (
      <>
        <p>The website and {brand} brand are operated by:</p>
        <BusinessDetails />
      </>
    ),
  },
  {
    title: "Eligibility",
    content: (
      <>
        <p>
          You must be at least 18 years old or have the involvement and
          permission of a parent or legal guardian to use this website or
          place an order.
        </p>
        <p>
          You agree to provide accurate, current, and complete information.
        </p>
      </>
    ),
  },
  {
    title: "Products",
    content: (
      <>
        <p>
          {brand} sells duvet cover sets, quilts and coverlets, sheet sets,
          pillow shams, bed skirts, and related bedding textiles.
        </p>
        <p>
          We make reasonable efforts to display product descriptions,
          materials, dimensions, colors, availability, and images
          accurately. Colors and appearance may vary slightly depending on
          lighting, photography, manufacturing variations, and device-screen
          settings.
        </p>
        <p>
          Product images are illustrative of the item offered. Customers
          should review the complete product description before purchasing.
        </p>
      </>
    ),
  },
  {
    title: "Prices and Currency",
    content: (
      <>
        <p>
          All prices are displayed and charged in United States dollars
          unless clearly stated otherwise.
        </p>
        <p>
          Applicable sales tax will be calculated and disclosed during
          checkout where required.
        </p>
        <p>
          We may correct accidental pricing, description, inventory, or
          typographical errors. If an error affects an order, we will
          contact the customer before fulfillment and provide the option to
          accept the correction or receive a cancellation and full refund.
        </p>
      </>
    ),
  },
  {
    title: "Online Orders",
    content: (
      <>
        <p>
          Submitting an order is an offer to purchase. An order is not
          accepted until:
        </p>
        <ul>
          <li>Required payment is successfully authorized.</li>
          <li>We confirm product availability.</li>
          <li>We issue an order confirmation.</li>
        </ul>
        <p>
          We may decline or cancel an order because of inventory errors,
          inaccurate information, suspected fraud, payment failure, delivery
          restrictions, pricing errors, or legal requirements.
        </p>
        <p>
          If we cancel a paid order, the full amount collected for the
          canceled items will be refunded to the original payment method.
        </p>
      </>
    ),
  },
  {
    title: "Payment",
    content: (
      <>
        <p>
          {brand} accepts online electronic payments only through the
          payment methods displayed at checkout. We do not accept Cash on
          Delivery.
        </p>
        <p>
          Online payment processing is currently being set up. Until an
          active payment method is displayed and payment is successfully
          authorized, no completed purchase will be accepted through the
          website.
        </p>
        <p>
          Once activated, payments will be securely processed by an
          authorized third-party payment provider. {brand} does not offer
          subscription billing or automatically recurring product charges.
        </p>
        <p>
          The exact approved billing descriptor will be disclosed at
          checkout or in the order confirmation before live card payments
          are accepted.
        </p>
      </>
    ),
  },
  {
    title: "Fraud Prevention",
    content: (
      <>
        <p>
          We may use reasonable verification and fraud-prevention measures.
          An order may be held, canceled, or declined if:
        </p>
        <ul>
          <li>Billing or shipping information cannot be verified.</li>
          <li>Payment authorization fails.</li>
          <li>The order appears unauthorized or fraudulent.</li>
          <li>
            Additional verification requested from the customer is not
            provided.
          </li>
          <li>
            The transaction violates payment-network or legal requirements.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Shipping",
    content: (
      <>
        <p>Orders are generally processed within 1–2 business days.</p>
        <p>
          After processing, estimated standard delivery is 3–7 business
          days. These periods exclude weekends, federal holidays, severe
          weather, carrier delays, and circumstances outside our reasonable
          control.
        </p>
        <p>
          Free standard shipping is offered on eligible orders delivered
          within our published U.S. shipping area.
        </p>
        <p>
          Complete shipping terms are provided in our{" "}
          <Link to="/shipping-policy">Shipping Policy</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Order Tracking",
    content: (
      <>
        <p>
          When tracking is available, customers will receive tracking
          information through the email address provided with the order.
        </p>
        <p>
          Tracking updates are supplied by the carrier and may take time to
          appear after a shipping label is created.
        </p>
      </>
    ),
  },
  {
    title: "Cancellations and Address Changes",
    content: (
      <>
        <p>
          Customers should contact us immediately to request a cancellation
          or shipping-address change.
        </p>
        <p>
          A cancellation or modification is available only before the order
          has shipped. Once an order has shipped, it is governed by our
          Return and Refund Policy.
        </p>
        <p>
          We cannot guarantee that an address can be changed after an order
          enters fulfillment.
        </p>
      </>
    ),
  },
  {
    title: "Returns and Refunds",
    content: (
      <>
        <p>
          Eligible products may be returned within 30 days of confirmed
          delivery.
        </p>
        <p>
          Returned products must generally be unused, unworn, unaltered, and
          in their original condition with tags and original packaging.
        </p>
        <p>
          We do not offer direct product exchanges. Customers may return an
          eligible item for a refund and place a separate order for another
          product.
        </p>
        <p>
          No restocking fee is charged on an eligible return. Change-of-mind
          return shipping is the customer’s responsibility. {brand} covers
          reasonable return shipping for verified damaged, defective, or
          incorrect items.
        </p>
        <p>
          Complete conditions are provided in our{" "}
          <Link to="/return-policy">Return and Refund Policy</Link>.
        </p>
      </>
    ),
  },
  {
    title: "Customer Accounts",
    content: (
      <>
        <p>
          Customers may be allowed to purchase as a guest or create an
          account. You are responsible for:
        </p>
        <ul>
          <li>Keeping account credentials confidential.</li>
          <li>Providing accurate information.</li>
          <li>Restricting unauthorized access to your device.</li>
          <li>Notifying us promptly of suspected unauthorized activity.</li>
        </ul>
        <p>
          We may suspend or close accounts used for fraud, abuse, unlawful
          conduct, or violations of these Terms.
        </p>
      </>
    ),
  },
  {
    title: "Acceptable Use",
    content: (
      <>
        <p>You may not:</p>
        <ul>
          <li>Use the website for unlawful or fraudulent activity.</li>
          <li>
            Attempt unauthorized access to accounts, systems, or data.
          </li>
          <li>
            Introduce malicious code or interfere with website operation.
          </li>
          <li>
            Scrape or copy website content for unauthorized commercial use.
          </li>
          <li>Misrepresent your identity or payment authority.</li>
          <li>
            Place orders using stolen or unauthorized payment credentials.
          </li>
          <li>Infringe intellectual-property or privacy rights.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Intellectual Property",
    content: (
      <>
        <p>
          The {brand} name, website design, written content, graphics,
          logos, and original website materials are owned by or licensed to{" "}
          {brand} and are protected by applicable intellectual-property laws.
        </p>
        <p>
          No content may be reproduced, distributed, modified, or
          commercially exploited without written permission, except for
          lawful personal use.
        </p>
      </>
    ),
  },
  {
    title: "Third-Party Services",
    content: (
      <>
        <p>
          The website may rely on third-party services for payment
          processing, hosting, communications, shipping, tracking, or other
          functions.
        </p>
        <p>
          We are not responsible for an independent third party’s systems or
          policies, but we remain responsible for our obligations to
          customers under applicable law.
        </p>
      </>
    ),
  },
  {
    title: "Product Use and Care",
    content: (
      <>
        <p>
          Customers must follow product descriptions and care instructions.
          Damage caused by misuse, accidents, unauthorized alterations,
          improper cleaning, ordinary wear, or failure to follow
          instructions is not considered a manufacturing defect.
        </p>
        <p>
          Nothing in these Terms excludes warranties or consumer rights that
          cannot legally be excluded.
        </p>
      </>
    ),
  },
  {
    title: "Website Availability",
    content: (
      <p>
        We may update, suspend, or restrict website functionality for
        maintenance, security, technical, or business reasons. We do not
        guarantee uninterrupted or error-free availability.
      </p>
    ),
  },
  {
    title: "Disclaimer",
    content: (
      <>
        <p>
          To the maximum extent permitted by law, the website and its
          content are provided on an “as available” basis. We do not
          guarantee that every product or website feature will always remain
          available.
        </p>
        <p>
          This disclaimer does not limit any non-waivable legal rights or
          obligations relating to paid products.
        </p>
      </>
    ),
  },
  {
    title: "Limitation of Liability",
    content: (
      <>
        <p>
          To the maximum extent permitted by law, {brand} will not be
          liable for indirect, incidental, special, punitive, or
          consequential damages arising from use of the website.
        </p>
        <p>
          For a claim concerning a purchased product, our aggregate
          liability will not exceed the amount the customer paid for the
          product giving rise to the claim, except where a greater remedy is
          required by law.
        </p>
      </>
    ),
  },
  {
    title: "Indemnification",
    content: (
      <p>
        You agree to be responsible for losses or claims caused by your
        unlawful use of the website, fraudulent activity, infringement of
        another party’s rights, or material violation of these Terms.
      </p>
    ),
  },
  {
    title: "Delays Outside Our Control",
    content: (
      <>
        <p>
          We are not responsible for delays caused by events reasonably
          outside our control, including severe weather, natural disasters,
          carrier interruptions, labor disruptions, government actions,
          emergencies, or failures of third-party infrastructure.
        </p>
        <p>
          If a material shipping delay occurs, we will provide notice and
          available options as required by law.
        </p>
      </>
    ),
  },
  {
    title: "Governing Law and Venue",
    content: (
      <>
        <p>
          These Terms are governed by the laws of the State of Texas,
          without regard to conflict-of-law principles.
        </p>
        <p>
          Subject to any consumer rights that cannot be waived, disputes
          relating to these Terms or the website will be brought in an
          appropriate state or federal court located in Harris County,
          Texas.
        </p>
        <p>
          Before filing a claim, the parties are encouraged to attempt
          resolution by contacting one another in writing.
        </p>
      </>
    ),
  },
  {
    title: "Severability",
    content: (
      <p>
        If any provision is determined to be unlawful or unenforceable,
        the remaining provisions will continue in effect.
      </p>
    ),
  },
  {
    title: "No Waiver",
    content: (
      <p>
        Failure to enforce a provision of these Terms does not waive the
        right to enforce it later.
      </p>
    ),
  },
  {
    title: "Assignment",
    content: (
      <p>
        Customers may not transfer their rights or obligations under these
        Terms without our written consent. {brand} may transfer these Terms
        in connection with a merger, acquisition, financing,
        reorganization, or sale of business assets.
      </p>
    ),
  },
  {
    title: "Entire Agreement",
    content: (
      <p>
        These Terms and the policies linked from the website constitute
        the entire agreement concerning website use and product purchases,
        except for any additional terms expressly accepted during
        checkout.
      </p>
    ),
  },
  {
    title: "Changes to These Terms",
    content: (
      <>
        <p>
          We may update these Terms when our business, website, payment
          arrangements, or legal obligations change. Updated Terms will be
          posted with a revised “Last Updated” date.
        </p>
        <p>
          Changes will not retroactively reduce rights relating to an order
          already accepted unless permitted by law.
        </p>
      </>
    ),
  },
  {
    title: "Contact",
    content: (
      <>
        <BusinessDetails showHours />
        <p>
          <Link to="/contact">Visit our contact page for assistance.</Link>
        </p>
      </>
    ),
  },
];

/* Sections grouped into four chapters (by position in the list above) */
const CHAPTERS = [
  { name: "The basics", from: 0, to: 1 },
  { name: "Ordering & delivery", from: 2, to: 11 },
  { name: "Using the website", from: 12, to: 16 },
  { name: "Legal terms", from: 17, to: sections.length - 1 },
];

const chapterOf = (index) =>
  CHAPTERS.findIndex((chapter) => index >= chapter.from && index <= chapter.to);

/* 3D contract sheet — tilts with the mouse, seal floats above the paper */
const ContractSheet = () => {
  const tiltRef = useRef(null);

  const handleMove = (event) => {
    const element = tiltRef.current;
    if (!element) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.transform = `rotateX(${8 - y * 16}deg) rotateY(${-14 + x * 22}deg)`;
  };

  const handleLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  };

  return (
    <div
      aria-hidden="true"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="mx-auto w-full max-w-[340px] animate-fade-in py-6 perspective-[1300px] [animation-delay:300ms]"
    >
      <div
        ref={tiltRef}
        className="relative aspect-[3/4] transform-3d transition-transform duration-500 ease-soft [transform:rotateX(8deg)_rotateY(-14deg)]"
      >
        {/* back sheets */}
        <div className="absolute inset-0 bg-sand/70 [transform:translateZ(-36px)_rotate(-6deg)]" />
        <div className="absolute inset-0 bg-linen [transform:translateZ(-18px)_rotate(3deg)]" />

        {/* front sheet */}
        <div className="absolute inset-0 flex flex-col bg-paper p-6 text-ink shadow-[0_40px_60px_-30px_rgba(0,0,0,0.7)]">
          <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-wine">{brand}</p>
          <p className="mt-2 font-serif text-3xl leading-none">Terms</p>
          <div className="mt-5 space-y-2.5">
            {[100, 92, 96, 70, 88, 94, 60].map((width, index) => (
              <span
                key={index}
                style={{ width: `${width}%`, animationDelay: `${500 + index * 90}ms` }}
                className="block h-[3px] origin-left animate-stitch bg-line"
              />
            ))}
          </div>
          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="flex-1">
              <svg viewBox="0 0 120 30" className="h-7 w-28 text-ink">
                <path
                  d="M2 22c10-14 16-16 18-8s-4 10 2 4 10-14 14-8-2 12 6 4 12-10 16-4 4 8 12 2 18-8 26-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="block border-t border-ink/40 pt-1 text-[8px] uppercase tracking-[0.2em] text-muted">
                Your agreement
              </span>
            </div>
          </div>
        </div>

        {/* seal floating above the sheet */}
        <div className="absolute bottom-6 right-5 grid size-16 place-items-center rounded-full bg-wine text-paper shadow-[0_20px_30px_-12px_rgba(0,0,0,0.6)] [transform:translateZ(60px)]">
          <span className="absolute inset-1.5 rounded-full border border-dashed border-paper/50" />
          <span className="font-serif text-2xl italic">M</span>
        </div>
      </div>
    </div>
  );
};

const TermsAndConditions = () => {
  const articleRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

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
            setActiveIndex(Number(entry.target.dataset.index) || 0);
          }
        });
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );

    articleRef.current
      ?.querySelectorAll("section[data-index]")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const activeChapter = chapterOf(activeIndex);

  return (
    <main id="terms-top" className="min-w-0 overflow-x-clip bg-chalk pb-16 text-ink sm:pb-24">
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
          className="pointer-events-none absolute -left-40 -bottom-40 size-[560px] animate-[spin_70s_linear_infinite] rounded-full border border-dashed border-sand/15"
        />
        <div className="relative mx-auto max-w-[1450px] px-4 pb-14 pt-8 sm:px-8 sm:pb-20 sm:pt-12 lg:px-[clamp(40px,4vw,64px)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/20 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <Link to="/" className="group inline-flex min-h-11 items-center gap-2 text-paper/80 hover:text-paper">
              <ArrowLeft size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1" />
              Back to home
            </Link>
            <span className="text-[#d9a9ae]">{brand}</span>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Website &amp; purchase terms
              </p>
              <h1 className="mt-4 font-serif text-[clamp(54px,8vw,120px)] leading-[0.9] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">Terms &amp;</span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[8%]">
                  Conditions.
                </em>
              </h1>

              <div className="mt-8 grid max-w-2xl animate-rise gap-5 border-l-2 border-[#d9a9ae] pl-5 [animation-delay:360ms]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
                    Please read before ordering
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-paper/75">
                    These Terms explain the conditions that apply when you use
                    our website or purchase from {brand}.
                  </p>
                </div>

                <dl className="flex flex-wrap gap-x-10 gap-y-3">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-paper/50">Last updated</dt>
                    <dd className="mt-1 font-serif text-xl">
                      <time dateTime={UPDATED_ISO}>{updatedDate}</time>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-paper/50">Document</dt>
                    <dd className="mt-1 font-serif text-xl">{sections.length} sections</dd>
                  </div>
                </dl>
              </div>
            </div>

            <ContractSheet />
          </div>
        </div>
      </header>

      {/* ============ Agreement intro ============ */}
      <div className="mx-auto max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]">
        <div className="relative -mt-8 grid gap-4 border border-line bg-paper p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.5)] sm:-mt-10 sm:grid-cols-[180px_minmax(0,1fr)] sm:p-9">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">Your agreement</span>
          <p className="font-serif text-[clamp(20px,2vw,27px)] leading-snug text-ink [overflow-wrap:anywhere]">
            These Terms and Conditions (“Terms”) govern your access to and use
            of{" "}
            {BUSINESS_INFO.website ? (
              <a
                href={BUSINESS_INFO.website}
                className="underline decoration-wine/40 underline-offset-4 hover:text-wine"
              >
                {BUSINESS_INFO.website}
              </a>
            ) : (
              "our website"
            )}{" "}
            and any purchase from {brand}. By using our website or placing an
            order, you agree to these Terms.
          </p>
        </div>

        {/* chapter strip */}
        <ol className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.name}>
              <a
                href={`#terms-section-${chapter.from + 1}`}
                className={`group flex h-full min-h-20 flex-col justify-between gap-3 p-4 transition-colors duration-300 sm:p-5 ${
                  activeChapter === index ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-linen"
                }`}
              >
                <span className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
                  Part {index + 1}
                  <span>
                    {String(chapter.from + 1).padStart(2, "0")}–{String(chapter.to + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="font-serif text-xl leading-tight sm:text-2xl">{chapter.name}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-12 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-16 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <aside className="lg:sticky lg:top-28">
          {/* mobile: collapsible index */}
          <details className="group border border-line bg-paper lg:hidden">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 text-sm font-semibold [&::-webkit-details-marker]:hidden">
              Browse the document
              <span className="text-xs font-normal text-muted">
                {sections.length} sections
                <span aria-hidden="true" className="ml-2 inline-block transition-transform duration-300 group-open:rotate-45">+</span>
              </span>
            </summary>
            <nav aria-label="Terms and Conditions contents" className="max-h-[55vh] overflow-y-auto border-t border-line px-5 py-3">
              {sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#terms-section-${index + 1}`}
                  className="flex min-h-10 items-center gap-3 text-sm text-muted hover:text-wine"
                >
                  <span className="text-[10px] text-wine">{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </details>

          {/* desktop: grouped index */}
          <nav aria-label="Terms and Conditions contents" className="hidden lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">Browse the document</p>
            <div className="no-scrollbar mt-4 max-h-[calc(100vh-200px)] overflow-y-auto border-l border-line pr-2">
              {CHAPTERS.map((chapter, chapterIndex) => (
                <div key={chapter.name} className="mb-3">
                  <p
                    className={`py-1.5 pl-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      activeChapter === chapterIndex ? "text-ink" : "text-muted/70"
                    }`}
                  >
                    {chapter.name}
                  </p>
                  {sections.slice(chapter.from, chapter.to + 1).map((section, offset) => {
                    const index = chapter.from + offset;
                    const active = activeIndex === index;

                    return (
                      <a
                        key={section.title}
                        href={`#terms-section-${index + 1}`}
                        className={`relative flex items-baseline gap-3 py-1.5 pl-5 text-xs transition-colors duration-300 ${
                          active ? "font-bold text-wine" : "text-muted hover:text-ink"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`absolute -left-px top-0 h-full w-0.5 origin-top bg-wine transition-transform duration-500 ${
                            active ? "scale-y-100" : "scale-y-0"
                          }`}
                        />
                        <span className="text-[10px] opacity-70">{String(index + 1).padStart(2, "0")}</span>
                        {section.title}
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        <article ref={articleRef} aria-label="Terms and Conditions" className="min-w-0 border-t border-ink">
          {sections.map((section, index) => {
            const chapterIndex = chapterOf(index);
            const startsChapter = CHAPTERS[chapterIndex]?.from === index;

            return (
              <React.Fragment key={section.title}>
                {startsChapter && (
                  <div className="flex items-end justify-between gap-4 border-b border-line bg-linen/60 px-4 pb-3 pt-6 sm:px-6">
                    <h2 className="font-serif text-[clamp(28px,3vw,42px)] leading-none">
                      {CHAPTERS[chapterIndex].name}
                    </h2>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
                      Part {chapterIndex + 1}
                    </span>
                  </div>
                )}

                <section
                  id={`terms-section-${index + 1}`}
                  data-index={index}
                  aria-labelledby={`terms-title-${index + 1}`}
                  className="grid scroll-mt-28 gap-3 border-b border-line py-8 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-6 sm:py-10"
                >
                  <span
                    aria-hidden="true"
                    className={`font-serif text-4xl leading-none transition-colors duration-500 ${
                      activeIndex === index ? "text-wine" : "text-line"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 space-y-4 text-[15px] leading-[1.85] text-muted [overflow-wrap:anywhere] [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:decoration-wine/40 [&_a]:underline-offset-4 [&_a:hover]:text-wine [&_li]:pl-1 [&_ul]:grid [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul]:[list-style:disc] [&_li]:marker:text-wine">
                    <h3
                      id={`terms-title-${index + 1}`}
                      className="font-serif text-[clamp(24px,2.4vw,34px)] leading-tight text-ink"
                    >
                      {section.title}
                    </h3>
                    {section.content}
                  </div>
                </section>
              </React.Fragment>
            );
          })}

          <footer className="flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] uppercase tracking-[0.16em] text-muted">
            <span>{brand} / Terms &amp; Conditions</span>
            <a href="#terms-top" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink hover:text-wine">
              Back to top
              <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-1" />
            </a>
          </footer>
        </article>
      </div>

      {/* ============ Help ============ */}
      <section
        aria-labelledby="terms-help-title"
        className="mx-auto mt-14 max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col items-start justify-between gap-6 bg-wine p-6 text-paper sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
              Need assistance?
            </p>
            <h2 id="terms-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              We’re here to <em>help.</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">Contact our team with questions about these Terms.</p>
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
    </main>
  );
};

export default TermsAndConditions;