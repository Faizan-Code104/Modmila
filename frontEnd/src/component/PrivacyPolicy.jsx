import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const POLICY_TITLE = "Privacy Policy";
const UPDATED_ISO = "2026-10-08";

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

const BusinessDetails = () => {
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

  return (
    <div className="grid justify-items-start gap-1.5 border border-line bg-chalk p-5">
      <strong className="font-serif text-2xl font-normal text-ink">
        {BUSINESS_INFO.businessName}
      </strong>

      {address && <address className="not-italic">{address}</address>}

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

      {schedule && <p>Customer Support Hours: {schedule}</p>}

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

const PrivacyContact = ({ request = false }) =>
  BUSINESS_INFO.email ? (
    <a
      href={`mailto:${BUSINESS_INFO.email}${request ? "?subject=Privacy%20Request" : ""}`}
      className={linkClass}
    >
      {BUSINESS_INFO.email}
    </a>
  ) : (
    <Link to="/contact" className={linkClass}>
      our customer support team
    </Link>
  );

const Bullets = ({ items }) => (
  <ul className="space-y-1.5 pl-5 text-sm marker:text-wine [list-style:disc]">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

const PrivacyPolicy = () => {
  const brand = BUSINESS_INFO.businessName;

  const sections = [
    {
      id: "business",
      title: "Business Information",
      body: [`Business information for ${brand}:`],
      contact: true,
    },
    {
      id: "collection",
      title: "Information We Collect",
      body: [
        "Depending on how you interact with our website, we may collect:",
      ],
      bullets: [
        "Name, billing address, shipping address, email address, and telephone number.",
        "Account login information, if you create an account.",
        "Products purchased, order value, transaction status, returns, refunds, and customer-service history.",
        "Information you provide through email, telephone, contact forms, reviews, or return requests.",
        "Internet Protocol address, device type, browser type, operating system, referring pages, pages viewed, and approximate location.",
        "Cookie, session, shopping-cart, and local-storage information.",
        "Fraud-prevention and transaction-verification information.",
      ],
    },
    {
      id: "payments",
      title: "Payment Information",
      body: [
        `${brand} is currently completing its online payment setup and does not accept Cash on Delivery.`,
        `When online payment processing is activated, payments will be handled by an authorized third-party payment processor. ${brand} will not intentionally store complete payment-card numbers or card security codes on its own systems.`,
        "Payment processors may collect and process payment information under their own privacy and security policies.",
      ],
    },
    {
      id: "usage",
      title: "How We Use Information",
      body: ["We may use personal information to:"],
      bullets: [
        "Operate and maintain our website.",
        "Create and manage customer accounts.",
        "Process, confirm, fulfill, and track orders.",
        "Communicate order, shipping, delivery, return, and refund information.",
        "Provide customer service.",
        "Verify transactions and prevent fraud or unauthorized activity.",
        "Improve our products, website, and customer experience.",
        "Maintain business, accounting, tax, and compliance records.",
        "Send marketing communications when the customer has chosen to receive them.",
        "Comply with legal obligations and enforce our policies.",
      ],
      after: [
        "We will not use personal information for materially different purposes without providing appropriate notice or obtaining consent when required.",
      ],
    },
    {
      id: "disclosure",
      title: "How We Disclose Information",
      body: [
        "We may disclose personal information to service providers that assist us with:",
      ],
      bullets: [
        "Website hosting and technical infrastructure.",
        "Order and inventory management.",
        "Payment processing.",
        "Shipping, tracking, and delivery.",
        "Email and customer communications.",
        "Website security and fraud prevention.",
        "Analytics and website performance.",
        "Accounting, legal, tax, and regulatory compliance.",
      ],
      after: [
        "These providers may access information only as reasonably necessary to perform services for us and are expected to protect it appropriately.",
        "We may also disclose information:",
      ],
      afterBullets: [
        "When required by law, subpoena, court order, or lawful government request.",
        "To investigate suspected fraud, security incidents, or violations of our policies.",
        `To protect the rights, safety, and property of ${brand}, our customers, or others.`,
        "In connection with a merger, financing, acquisition, reorganization, or sale of business assets.",
      ],
    },
    {
      id: "sharing",
      title: "Sale and Sharing of Personal Information",
      body: [
        "We do not sell personal information for money.",
        <>
          Certain analytics or advertising technologies, if enabled, may
          be treated as “sharing” or targeted advertising under some
          state privacy laws. Where legally required, eligible consumers
          may request to opt out by contacting <PrivacyContact />.
        </>,
      ],
    },
    {
      id: "cookies",
      title: "Cookies and Local Storage",
      body: [
        "Our website may use cookies, browser storage, session technologies, and similar tools to:",
      ],
      bullets: [
        "Keep the website operational.",
        "Maintain shopping-cart contents.",
        "Remember customer preferences.",
        "Support account login and security.",
        "Understand website traffic and performance.",
        "Detect fraud or suspicious activity.",
      ],
      after: [
        <>
          Additional information is available in our{" "}
          <Link to="/cookie-policy" className={linkClass}>
            Cookie Policy
          </Link>.
        </>,
      ],
    },
    {
      id: "marketing",
      title: "Marketing Communications",
      body: [
        <>
          Customers may unsubscribe from promotional emails by using
          the unsubscribe link included in the message or by contacting{" "}
          <PrivacyContact />.
        </>,
        "Transactional communications concerning an order, delivery, return, security issue, or account are not promotional and may still be sent when necessary.",
        "We do not send promotional text messages without the recipient’s appropriate consent. Consent to marketing is not a condition of purchase.",
      ],
    },
    {
      id: "retention",
      title: "Data Retention",
      body: [
        "We retain personal information only for as long as reasonably necessary to:",
      ],
      bullets: [
        "Fulfill orders and provide customer support.",
        "Process returns and refunds.",
        "Maintain accounting, tax, and business records.",
        "Prevent fraud and resolve disputes.",
        "Comply with legal and regulatory obligations.",
      ],
      after: [
        "Retention periods may differ according to the type of information and the reason it was collected.",
      ],
    },
    {
      id: "security",
      title: "Data Security",
      body: [
        "We use reasonable administrative, organizational, and technical safeguards designed to protect personal information. However, no website, transmission, or storage system can be guaranteed to be completely secure.",
        "Customers are responsible for maintaining the confidentiality of their account credentials and should contact us immediately if they suspect unauthorized account access.",
        "Please do not send complete payment-card details through email, telephone messages, or our contact form.",
      ],
    },
    {
      id: "rights",
      title: "Your Privacy Choices and Rights",
      body: [
        "Depending on your state of residence and applicable law, you may have the right to:",
      ],
      bullets: [
        "Request access to personal information we maintain about you.",
        "Request correction of inaccurate information.",
        "Request deletion of eligible personal information.",
        "Request a portable copy of eligible information.",
        "Opt out of certain targeted advertising, sales, or sharing.",
        "Withdraw consent where processing is based on consent.",
        "Appeal our response to an eligible privacy request.",
        "Not receive unlawful discriminatory treatment for exercising privacy rights.",
      ],
      after: [
        <>
          To submit a request,{" "}
          {BUSINESS_INFO.email ? "email " : "contact "}
          <PrivacyContact request /> with the subject “Privacy Request.”
        </>,
        "We may need to verify your identity before completing a request. An authorized agent may submit a request when permitted by law and after providing appropriate authorization.",
      ],
    },
    {
      id: "children",
      title: "Children’s Privacy",
      body: [
        "Our website and products are intended for adults. We do not knowingly collect personal information directly from children under 13. If you believe a child has provided personal information, contact us so we can review and delete it when required.",
        "Individuals under 18 should use the website only with the involvement and permission of a parent or legal guardian.",
      ],
    },
    {
      id: "third-parties",
      title: "Third-Party Websites",
      body: [
        "Our website may contain links to third-party websites or services. We are not responsible for the privacy, security, content, or practices of third parties. Customers should review the applicable third party’s policies before providing information.",
      ],
    },
    {
      id: "operations",
      title: "United States Operations",
      body: [
        `${brand} operates in the United States. Information may be processed and stored in the United States, where privacy laws may differ from those in other jurisdictions.`,
      ],
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      body: [
        "We may update this Privacy Policy to reflect operational, legal, or technical changes. The revised version will be posted on this page with an updated “Last Updated” date.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      body: ["Questions or privacy requests may be directed to:"],
      contact: true,
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
            <Link
              to="/contact"
              className="group inline-flex min-h-10 items-center gap-2 text-paper/70 transition-colors hover:text-paper"
            >
              Privacy questions
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Your information
              </p>
              <h1 className="mt-4 font-serif text-[clamp(52px,8vw,118px)] leading-[0.92] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">
                  Privacy,
                </span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[8%]">
                  with care.
                </em>
              </h1>

              <p className="mt-7 max-w-2xl animate-rise text-sm leading-relaxed text-paper/75 [animation-delay:360ms] [overflow-wrap:anywhere]">
                {brand} (“{brand},” “we,” “us,” or “our”) respects your
                privacy. This Privacy Policy explains how we collect, use,
                disclose, retain, and protect personal information when you
                visit{" "}
                {BUSINESS_INFO.website ? (
                  <a
                    href={BUSINESS_INFO.website}
                    className="font-semibold text-paper underline decoration-[#d9a9ae]/60 underline-offset-4"
                  >
                    {BUSINESS_INFO.website}
                  </a>
                ) : (
                  "our website"
                )}
                , create an account, communicate with us, or purchase our
                products.
              </p>

              <p className="mt-5 inline-flex animate-rise items-center gap-3 border border-paper/25 px-3 py-2 text-[11px] [animation-delay:420ms]">
                <span className="uppercase tracking-[0.16em] text-paper/60">Last updated</span>
                <time dateTime={UPDATED_ISO} className="font-semibold">
                  {BUSINESS_INFO.policyLastUpdated}
                </time>
              </p>
            </div>

            {/* 3D privacy seal */}
            <div aria-hidden="true" className="relative mx-auto grid size-56 place-items-center perspective-distant sm:size-64">
              <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite] fill-[#d9a9ae]">
                <defs>
                  <path id="privacy-seal-circle" d="M50 50m-41 0a41 41 0 1 1 82 0a41 41 0 1 1-82 0" />
                </defs>
                <text className="text-[7.2px] font-semibold uppercase tracking-[0.32em]">
                  <textPath href="#privacy-seal-circle">
                    Your information ✳ Handled with care ✳ {brand} ✳
                  </textPath>
                </text>
              </svg>
              <div className="animate-float-3d transform-3d">
                <span className="grid size-28 animate-spin-y place-items-center rounded-full bg-wine shadow-[0_30px_50px_-20px_rgba(0,0,0,0.7)] sm:size-32">
                  <ShieldCheck size={44} strokeWidth={1.3} className="text-paper" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <aside className="lg:sticky lg:top-28">
          <nav aria-label="Privacy policy sections">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
              In this policy · {sections.length} sections
            </p>
            <ol className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:max-h-[calc(100dvh-280px)] lg:overflow-y-auto lg:border-l lg:border-line lg:px-0">
              {sections.map((section, index) => {
                const active = activeId === section.id;

                return (
                  <li key={section.id} className="shrink-0">
                    <a
                      href={`#policy-${section.id}`}
                      className={`relative flex min-h-10 items-center gap-3 whitespace-nowrap rounded-full border px-4 text-xs transition-all duration-300 lg:min-h-9 lg:rounded-none lg:border-0 lg:py-1.5 lg:pl-5 lg:pr-2 lg:whitespace-normal ${
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

          <div className="mt-6 hidden bg-wine p-5 text-paper lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
              Privacy requests
            </p>
            <h2 className="mt-2 font-serif text-3xl">Let’s talk.</h2>
            <p className="mt-2 text-xs leading-relaxed text-paper/80">
              If you have a question about this Privacy Policy or want to make
              a privacy-related request, you can contact {brand} using the
              details in this policy.
            </p>
            <Link
              to="/contact"
              className="group mt-4 flex min-h-11 items-center justify-between gap-3 border-b border-paper/60 text-xs font-bold"
            >
              Contact us
              <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </aside>

        <article ref={articleRef} aria-label="Privacy policy" className="min-w-0 border-t border-ink">
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

                {section.body?.map((paragraph, paragraphIndex) => (
                  <p key={`body-${paragraphIndex}`}>{paragraph}</p>
                ))}

                {section.bullets && <Bullets items={section.bullets} />}

                {section.after?.map((paragraph, paragraphIndex) => (
                  <p key={`after-${paragraphIndex}`}>{paragraph}</p>
                ))}

                {section.afterBullets && <Bullets items={section.afterBullets} />}

                {section.contact && <BusinessDetails />}
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
              Here to help
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              Questions about <em>your information?</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">
              Contact us if you have a privacy-related question or request.
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

export default PrivacyPolicy;