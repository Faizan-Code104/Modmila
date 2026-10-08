import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Cookie, Mail, Phone } from "lucide-react";
import { BUSINESS_INFO } from "../storeInfo";

const POLICY_TITLE = "Cookie Policy";
const UPDATED_ISO = "2026-10-08";

const linkClass =
  "font-semibold text-ink underline decoration-wine/40 underline-offset-4 transition-colors hover:text-wine";

/* 3D stack of technology layers — spreads on hover */
const LAYERS = [
  { label: "Advertising", tone: "bg-sand text-ink" },
  { label: "Analytics", tone: "bg-linen text-ink" },
  { label: "Preferences", tone: "bg-[#e6c4c7] text-ink" },
  { label: "Essential", tone: "bg-wine text-paper" },
];

const LayerStack = () => {
  const [open, setOpen] = useState(false);

  return (
    <div
      aria-hidden="true"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative mx-auto h-[300px] w-full max-w-[360px] animate-fade-in perspective-[1400px] [animation-delay:300ms] sm:h-[340px]"
    >
      <div className="relative size-full transform-3d [transform:rotateX(56deg)_rotateZ(-36deg)]">
        {LAYERS.map((layer, index) => (
          <div
            key={layer.label}
            style={{
              transform: `translateZ(${index * (open ? 58 : 26)}px)`,
              transitionDelay: `${index * 60}ms`,
            }}
            className="absolute inset-[16%] transition-transform duration-700 ease-soft"
          >
            <div
              style={{ animationDelay: `${300 + index * 140}ms` }}
              className={`relative flex size-full animate-rise items-end justify-between p-4 shadow-[0_30px_40px_-20px_rgba(0,0,0,0.6)] ${layer.tone}`}
            >
              <span className="pointer-events-none absolute inset-2 border border-dashed border-current opacity-30" />
              <span className="relative text-[11px] font-bold uppercase tracking-[0.2em]">
                {layer.label}
              </span>
              {index === LAYERS.length - 1 && <Cookie size={26} strokeWidth={1.3} className="relative" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CookiePolicy = () => {
  const addressLines = [
    BUSINESS_INFO.addressLine1,
    BUSINESS_INFO.addressLine2,
    BUSINESS_INFO.country,
  ].filter(Boolean);

  const phoneHref =
    BUSINESS_INFO.phoneHref ||
    BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

  const sections = [
    {
      id: "about",
      label: "About these technologies",
      title: "What are cookies and similar technologies?",
      body: (
        <>
          <p>
            Cookies are small files stored through a browser. Local storage and
            session storage allow a website to remember information on a
            device.
          </p>
          <p>
            These technologies may help operate website features, maintain a
            shopping cart, remember preferences, support account access, and
            understand website performance.
          </p>
        </>
      ),
    },
    {
      id: "essential",
      label: "Essential technologies",
      title: "Essential technologies",
      body: (
        <>
          <p>These support necessary functions such as:</p>
          <ul className="grid gap-x-6 gap-y-1.5 pl-5 text-sm marker:text-wine [list-style:disc] sm:grid-cols-2">
            <li>Website navigation.</li>
            <li>Shopping-cart operation.</li>
            <li>Account login.</li>
            <li>Security.</li>
            <li>Fraud prevention.</li>
            <li>Remembering privacy choices.</li>
          </ul>
          <div className="border-l-2 border-wine bg-wine-soft px-5 py-4">
            <p>
              Disabling essential technologies may prevent parts of the website
              from working correctly.
            </p>
          </div>
        </>
      ),
    },
    {
      id: "preferences",
      label: "Preference technologies",
      title: "Preference technologies",
      body: (
        <p>
          These remember selections such as account settings, display
          preferences, or shopping-cart contents.
        </p>
      ),
    },
    {
      id: "analytics",
      label: "Analytics technologies",
      title: "Analytics technologies",
      body: (
        <p>
          If enabled, analytics technologies help us understand how visitors
          use the website, identify technical errors, and improve performance.
        </p>
      ),
    },
    {
      id: "advertising",
      label: "Advertising technologies",
      title: "Advertising technologies",
      body: (
        <p>
          If advertising tools are enabled, they may help measure advertising
          performance or provide relevant advertising. Where required by law,
          these technologies will be subject to consent or opt-out rights.
        </p>
      ),
    },
    {
      id: "payment",
      label: "Payment information",
      title: "Payment information",
      body: (
        <>
          <p>
            Cookies and local storage used by {BUSINESS_INFO.businessName} are
            not intended to store complete payment-card numbers or card
            security codes.
          </p>
          <p>
            When payments are activated, payment providers may use their own
            necessary security and fraud-prevention technologies.
          </p>
        </>
      ),
    },
    {
      id: "managing",
      label: "Managing cookies",
      title: "Managing cookies",
      body: (
        <>
          <p>
            Customers may block, delete, or restrict cookies through browser
            settings. Doing so may affect shopping-cart, account, and website
            functionality.
          </p>
          <p>
            Where a cookie-preference tool is available, customers may use it
            to manage non-essential technologies.
          </p>
          <p>
            We will recognize legally required browser-based opt-out signals
            where applicable and technically supported.
          </p>
        </>
      ),
    },
    {
      id: "changes",
      label: "Policy changes",
      title: "Changes",
      body: (
        <p>
          We may update this Cookie Policy when our technology, providers, or
          legal obligations change. Updates will be posted with a revised date.
        </p>
      ),
    },
    {
      id: "contact",
      label: "Contact",
      title: "Contact",
      body: (
        <div className="grid gap-5 border border-line bg-chalk p-5 sm:grid-cols-2">
          <address className="text-sm not-italic">
            <strong className="mb-1 block font-serif text-2xl font-normal text-ink">
              {BUSINESS_INFO.businessName}
            </strong>
            {addressLines.map((line, index) => (
              <React.Fragment key={`${index}-${line}`}>
                {index > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </address>

          <div className="grid content-start gap-2">
            {BUSINESS_INFO.email && (
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="inline-flex min-h-11 items-start gap-3 text-sm text-ink transition-colors hover:text-wine"
              >
                <Mail size={17} strokeWidth={1.4} className="mt-1 shrink-0 text-wine" />
                <span className="min-w-0 break-all">
                  <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Email</small>
                  <span className="font-semibold">{BUSINESS_INFO.email}</span>
                </span>
              </a>
            )}

            {BUSINESS_INFO.phoneDisplay && phoneHref && (
              <a
                href={`tel:${phoneHref}`}
                className="inline-flex min-h-11 items-start gap-3 text-sm text-ink transition-colors hover:text-wine"
              >
                <Phone size={17} strokeWidth={1.4} className="mt-1 shrink-0 text-wine" />
                <span>
                  <small className="block text-[10px] uppercase tracking-[0.16em] text-muted">Phone</small>
                  <span className="font-semibold">{BUSINESS_INFO.phoneDisplay}</span>
                </span>
              </a>
            )}
          </div>
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
              {BUSINESS_INFO.businessName} / Website information
            </span>
            <span className="text-paper/70">
              Last updated:{" "}
              <time dateTime={UPDATED_ISO} className="text-paper">
                {BUSINESS_INFO.policyLastUpdated}
              </time>
            </span>
          </div>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <p className="animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-paper/60">
                Cookies & similar technologies
              </p>
              <h1 className="mt-4 font-serif text-[clamp(56px,8.4vw,124px)] leading-[0.9] tracking-[-0.04em] perspective-distant">
                <span className="block animate-fold-in [animation-delay:100ms]">Cookie</span>
                <em className="block animate-fold-in text-[#d9a9ae] [animation-delay:240ms] sm:ml-[10%]">
                  Policy.
                </em>
              </h1>
              <p className="mt-5 animate-rise text-sm text-paper/60 [animation-delay:300ms]">
                Cookies, local storage, and similar website technologies.
              </p>
              <p className="mt-5 max-w-2xl animate-rise font-serif text-[clamp(20px,2vw,26px)] leading-snug text-paper/90 [animation-delay:380ms] [overflow-wrap:anywhere]">
                This Cookie Policy explains how {BUSINESS_INFO.businessName}{" "}
                uses cookies, local storage, session technologies, and similar
                tools
                {BUSINESS_INFO.website ? (
                  <>
                    {" "}on{" "}
                    <a
                      href={BUSINESS_INFO.website}
                      className="underline decoration-[#d9a9ae]/60 underline-offset-4"
                    >
                      {BUSINESS_INFO.website}
                    </a>
                  </>
                ) : (
                  " on our website"
                )}
                .
              </p>
            </div>

            <div>
              <LayerStack />
              <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-paper/50">
                Hover the layers
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Document ============ */}
      <div className="mx-auto mt-14 grid max-w-[1450px] items-start gap-8 px-4 sm:mt-20 sm:px-8 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-14 lg:px-[clamp(40px,4vw,64px)]">
        <aside className="lg:sticky lg:top-28">
          <nav aria-label="Cookie policy sections">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">Inside this policy</p>
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

          <div className="mt-6 hidden bg-wine p-5 text-paper lg:block">
            <Mail size={20} strokeWidth={1.3} className="text-[#e6c4c7]" />
            <h2 className="mt-3 font-serif text-3xl">A privacy question?</h2>
            <p className="mt-2 text-xs leading-relaxed text-paper/80">
              Contact us if you have questions about cookies or website privacy.
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

        <article ref={articleRef} aria-label="Cookie policy" className="min-w-0 border-t border-ink">
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
              {BUSINESS_INFO.businessName} / {POLICY_TITLE}
            </span>
            <a href="#policy-top" className="group inline-flex min-h-11 items-center gap-2 font-semibold text-ink hover:text-wine">
              Back to top
              <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-1" />
            </a>
          </footer>
        </article>
      </div>

      {/* ============ Help (mobile + desktop) ============ */}
      <section
        aria-labelledby="policy-help-title"
        className="mx-auto mt-14 max-w-[1450px] px-4 sm:px-8 lg:px-[clamp(40px,4vw,64px)]"
      >
        <div className="flex flex-col items-start justify-between gap-6 bg-wine p-6 text-paper sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
              Cookies & website privacy
            </p>
            <h2 id="policy-help-title" className="mt-2 font-serif text-[clamp(32px,3.6vw,50px)] leading-tight">
              A privacy <em>question?</em>
            </h2>
            <p className="mt-2 text-sm text-paper/80">
              Contact us if you have questions about cookies or website privacy.
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

export default CookiePolicy;