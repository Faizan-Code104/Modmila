import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CreditCard,
  LifeBuoy,
  Package,
  Plus,
  RotateCcw,
  Search,
  Truck,
  X,
} from "lucide-react";
import { BUSINESS_INFO, getFullAddress } from "../storeInfo";

const brandName = BUSINESS_INFO.businessName;
const fullAddress = getFullAddress();

const supportHours = [BUSINESS_INFO.supportHours, BUSINESS_INFO.timeZone]
  .filter(Boolean)
  .join(" ");

const supportSchedule = [BUSINESS_INFO.businessDays, supportHours]
  .filter(Boolean)
  .join(", ");

const phoneHref =
  BUSINESS_INFO.phoneHref ||
  BUSINESS_INFO.phoneDisplay?.replace(/[^\d+]/g, "");

const contactInstruction = BUSINESS_INFO.email
  ? `Contact us at ${BUSINESS_INFO.email}`
  : "Contact our customer support team";

const supportDetails = [
  BUSINESS_INFO.email && `Email: ${BUSINESS_INFO.email}.`,
  BUSINESS_INFO.phoneDisplay && `Phone: ${BUSINESS_INFO.phoneDisplay}.`,
  supportSchedule && `Hours: ${supportSchedule}.`,
]
  .filter(Boolean)
  .join(" ");

const FAQS = [
  {
    category: "Business",
    question: `What is ${brandName}?`,
    answer: `${brandName} is our online store for modern bedroom and bedding textiles.`,
  },
  {
    category: "Product Information",
    question: "What products do you sell?",
    answer:
      "We sell duvet cover sets, quilts, coverlets, sheet sets, pillow shams, bed skirts, and related bedding textiles.",
  },
  {
    category: "Orders & Payment",
    question: "Are prices in U.S. dollars?",
    answer:
      "Yes. All prices are displayed and charged in United States dollars unless clearly stated otherwise.",
  },
  {
    category: "Orders & Payment",
    question: "Do you accept online payments?",
    answer: `${brandName} accepts online electronic payments only through methods displayed at checkout. Payment processing is currently being set up and will become available after an authorized payment provider is activated.`,
  },
  {
    category: "Orders & Payment",
    question: "Do you offer Cash on Delivery?",
    answer: `No. ${brandName} does not accept Cash on Delivery.`,
  },
  {
    category: "Orders & Payment",
    question: "Do you offer recurring subscriptions?",
    answer:
      "No. Product orders are one-time purchases and are not automatically recurring.",
  },
  {
    category: "Orders & Payment",
    question: "What will appear on my card statement?",
    answer: `After online payments are activated, the exact processor-approved billing descriptor will be displayed at checkout or in the order confirmation. It will identify the transaction as associated with ${brandName}.`,
  },
  {
    category: "Shipping",
    question: "How much does shipping cost?",
    answer:
      "We provide free standard shipping on eligible orders within our published U.S. shipping area.",
  },
  {
    category: "Shipping",
    question: "Where do you ship?",
    answer:
      "We currently ship within the contiguous 48 United States. We do not currently ship internationally or to Alaska, Hawaii, U.S. territories, APO/FPO/DPO addresses, or P.O. boxes.",
  },
  {
    category: "Shipping",
    question: "How long does processing take?",
    answer:
      "Orders are normally processed within 1–2 business days after payment authorization and order acceptance.",
  },
  {
    category: "Shipping",
    question: "How long does delivery take?",
    answer:
      "Standard delivery normally takes 3–7 business days after processing. The estimated total period is generally 4–9 business days.",
  },
  {
    category: "Shipping",
    question: "How can I track my order?",
    answer:
      "When tracking becomes available, it will be sent to the email address used for the order. Carrier tracking may take up to 48 hours to update after label creation.",
  },
  {
    category: "Shipping",
    question: "Can I change my shipping address?",
    answer: `${contactInstruction} immediately. Address changes are available only before shipment and cannot be guaranteed after fulfillment begins.`,
  },
  {
    category: "Orders & Payment",
    question: "Can I cancel my order?",
    answer:
      "A cancellation may be requested before the order ships. Once an order has shipped, the Return and Refund Policy applies.",
  },
  {
    category: "Returns & Refunds",
    question: "What is your return period?",
    answer:
      "Eligible products may be returned within 30 days of confirmed delivery.",
  },
  {
    category: "Returns & Refunds",
    question: "What condition must a returned item be in?",
    answer:
      "It must be unused, unworn, unwashed, unaltered, and in original condition with tags, accessories, and packaging.",
  },
  {
    category: "Returns & Refunds",
    question: "Do you charge a restocking fee?",
    answer: "No. We do not charge a restocking fee for an eligible return.",
  },
  {
    category: "Returns & Refunds",
    question: "Who pays for return shipping?",
    answer: `For a change-of-mind return, the customer pays return shipping. For a verified damaged, defective, or incorrect product, ${brandName} covers reasonable return-shipping costs.`,
  },
  {
    category: "Returns & Refunds",
    question: "What if my order arrives damaged or incorrect?",
    answer: `${contactInstruction} within 48 hours of delivery. Include the order number and clear photographs of the item, packaging, and shipping label.`,
  },
  {
    category: "Returns & Refunds",
    question: "Do you offer exchanges?",
    answer:
      "No. We provide refunds for eligible returns. A customer may place a separate order for another product.",
  },
  {
    category: "Returns & Refunds",
    question: "How long does a refund take?",
    answer:
      "An approved refund is issued to the original payment method within 5–7 business days after inspection. The bank or card issuer may take additional time to post it.",
  },
  {
    category: "Returns & Refunds",
    question: "Where should I send an authorized return?",
    answer: fullAddress
      ? `After receiving return authorization, send the product according to our instructions to: ${brandName}, ${fullAddress}. Do not mail an unauthorized return.`
      : "After receiving return authorization, send the product to the return address provided in our instructions. Do not mail an unauthorized return.",
  },
  {
    category: "Business",
    question: "Where is your inventory stored?",
    answer: `${brandName} fulfills customer orders from inventory held for sale by the business. Our published address is a business mailing and authorized return address and is not presented as a walk-in retail store.`,
  },
  {
    category: "Business",
    question: "Can I shop at your business address?",
    answer: `No walk-in retail shopping or customer pickup is offered unless ${brandName} confirms an appointment or pickup option in writing.`,
  },
  {
    category: "Support",
    question: "How can I contact customer support?",
    answer: `${supportDetails || "You can contact our team through the Contact page."} We generally respond within one business day.`,
  },
];

const TOPICS = [
  { name: "Business", subtitle: "About the business", Icon: Building2 },
  { name: "Product Information", subtitle: "Our bedding collection", Icon: Package },
  {
    name: "Orders & Payment",
    subtitle: "Purchases, payments, and cancellations",
    Icon: CreditCard,
  },
  { name: "Shipping", subtitle: "Delivery and tracking", Icon: Truck },
  {
    name: "Returns & Refunds",
    subtitle: "Returns, conditions, and refunds",
    Icon: RotateCcw,
  },
  { name: "Support", subtitle: "Get in touch", Icon: LifeBuoy },
];

const pad = (number) => String(number).padStart(2, "0");

const FAQs = () => {
  const [activeTopic, setActiveTopic] = useState("Orders & Payment");
  const [query, setQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState(null);

  const searchText = query.trim().toLowerCase();

  const visibleFaqs = useMemo(
    () =>
      FAQS.filter((faq) =>
        searchText
          ? `${faq.question} ${faq.answer} ${faq.category}`
              .toLowerCase()
              .includes(searchText)
          : faq.category === activeTopic,
      ),
    [activeTopic, searchText],
  );

  const topicCounts = useMemo(() => {
    const counts = {};
    FAQS.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, []);

  const selectTopic = (name) => {
    setActiveTopic(name);
    setQuery("");
    setOpenQuestion(null);
  };

  const toggleQuestion = (question) =>
    setOpenQuestion((current) => (current === question ? null : question));

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      {/* ============ Hero with search ============ */}
      <section className="relative overflow-hidden px-4 pb-14 pt-12 text-center sm:px-8 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-12 size-[560px] -translate-x-1/2 animate-[spin_60s_linear_infinite] rounded-full border border-dashed border-line sm:size-[760px]"
        />

        <div className="relative mx-auto max-w-[920px]">
          <div className="flex animate-rise items-center justify-between gap-4 border-b border-line pb-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="text-wine">{brandName} / Customer care</span>
            <Link
              to="/contact"
              className="group inline-flex min-h-11 items-center gap-2 text-muted transition-colors hover:text-wine"
            >
              Speak to our team
              <ArrowUpRight
                size={14}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <p className="mt-10 animate-rise text-[10px] font-bold uppercase tracking-[0.22em] text-muted [animation-delay:100ms]">
            Frequently asked questions
          </p>
          <h1 className="mt-4 font-serif text-[clamp(54px,8vw,116px)] leading-[0.92] tracking-[-0.04em] perspective-distant">
            <span className="block animate-fold-in [animation-delay:150ms]">
              A little
            </span>
            <em className="block animate-fold-in text-wine [animation-delay:300ms]">
              guidance.
            </em>
          </h1>
          <p className="mx-auto mt-6 max-w-md animate-rise text-[15px] text-muted [animation-delay:420ms]">
            Choose a topic, or search every answer at once.
          </p>

          {/* Floating search */}
          <div className="mx-auto mt-9 max-w-[640px] animate-flip-up perspective-distant [animation-delay:500ms]">
            <label htmlFor="faq-search-input" className="sr-only">
              Search every topic
            </label>
            <div className="flex items-center gap-3 border border-ink bg-paper px-5 shadow-[0_24px_50px_-30px_rgba(36,34,35,0.6)] transition-[border-color,box-shadow] duration-300 focus-within:border-wine focus-within:shadow-[0_24px_50px_-25px_rgba(125,48,58,0.55)]">
              <Search size={19} aria-hidden="true" className="shrink-0 text-wine" />
              <input
                id="faq-search-input"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpenQuestion(null);
                }}
                placeholder="Shipping, returns, payments…"
                className="min-h-[60px] w-full min-w-0 bg-transparent text-left text-base outline-none placeholder:text-sm placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid size-10 shrink-0 place-items-center transition-transform duration-300 hover:rotate-90 hover:text-wine"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ Topic tiles (3D) ============ */}
      <section aria-label="FAQ topics" className="px-4 sm:px-8 lg:px-[clamp(40px,5vw,82px)]">
        <nav className="mx-auto grid max-w-[1450px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOPICS.map(({ name, subtitle, Icon }, index) => {
            const selected = !searchText && activeTopic === name;

            return (
              <div
                key={name}
                style={{ animationDelay: `${600 + index * 80}ms` }}
                className="animate-fold-in perspective-[900px]"
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-controls="faq-answers"
                  onClick={() => selectTopic(name)}
                  className={`group relative flex h-full min-h-[150px] w-full flex-col justify-between p-4 text-left transition-all duration-500 ease-soft sm:min-h-[170px] sm:p-5 ${
                    selected
                      ? "-translate-y-2 bg-wine text-paper shadow-[0_30px_40px_-25px_rgba(125,48,58,0.8)] [transform:rotateX(8deg)]"
                      : "bg-paper hover:-translate-y-1 hover:shadow-[0_24px_36px_-28px_rgba(36,34,35,0.6)] hover:[transform:rotateX(6deg)]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-2 border border-dashed ${
                      selected ? "border-paper/30" : "border-line"
                    }`}
                  />
                  <span className="relative flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold ${selected ? "text-[#e6c4c7]" : "text-wine"}`}
                    >
                      {pad(index + 1)}
                    </span>
                    <Icon
                      size={19}
                      strokeWidth={1.4}
                      aria-hidden="true"
                      className={`transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:rotate-6 ${
                        selected ? "text-[#e6c4c7]" : "text-wine"
                      }`}
                    />
                  </span>
                  <span className="relative">
                    <strong className="block font-serif text-xl font-normal leading-tight sm:text-[22px]">
                      {name}
                    </strong>
                    <small
                      className={`mt-1 block text-[11px] leading-snug ${
                        selected ? "text-paper/75" : "text-muted"
                      }`}
                    >
                      {subtitle} · {pad(topicCounts[name] || 0)}
                    </small>
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
      </section>

      {/* ============ Answers (accordion) ============ */}
      <section
        id="faq-answers"
        aria-labelledby="faq-reader-title"
        className="px-4 py-14 sm:px-8 sm:py-20 lg:px-[clamp(40px,5vw,82px)] lg:py-24"
      >
        <div className="mx-auto grid max-w-[1450px] gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine">
              {searchText ? "Across all topics" : "The details"}
            </p>
            <h2
              key={searchText ? "search" : activeTopic}
              id="faq-reader-title"
              className="mt-3 animate-flip-up font-serif text-[clamp(40px,4.6vw,68px)] leading-[1]"
            >
              {searchText ? "Search results" : activeTopic}
            </h2>
            <span
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="mt-4 inline-flex items-center gap-2 border border-line bg-paper px-3 py-1.5 text-[11px] font-semibold"
            >
              <span className="size-1.5 rounded-full bg-wine" aria-hidden="true" />
              {visibleFaqs.length} {visibleFaqs.length === 1 ? "answer" : "answers"}
            </span>
          </div>

          <div key={searchText ? "search" : activeTopic} className="border-t border-ink">
            {visibleFaqs.length ? (
              visibleFaqs.map((faq, index) => {
                const open = openQuestion === faq.question;
                const panelId = `faq-panel-${index}`;
                const buttonId = `faq-button-${index}`;

                return (
                  <article
                    key={faq.question}
                    style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
                    className="animate-rise border-b border-line"
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => toggleQuestion(faq.question)}
                        className="group grid min-h-[76px] w-full grid-cols-[34px_minmax(0,1fr)_40px] items-center gap-3 py-4 text-left sm:grid-cols-[44px_minmax(0,1fr)_44px]"
                      >
                        <span className="text-[11px] font-bold text-wine">
                          {pad(index + 1)}
                        </span>
                        <span className="min-w-0">
                          {searchText && (
                            <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                              {faq.category}
                            </span>
                          )}
                          <span
                            className={`block font-serif text-xl leading-snug transition-colors sm:text-2xl ${
                              open ? "text-wine" : "group-hover:text-wine"
                            }`}
                          >
                            {faq.question}
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`grid size-9 place-items-center justify-self-end rounded-full border transition-all duration-500 sm:size-10 ${
                            open
                              ? "rotate-45 border-wine bg-wine text-paper"
                              : "border-line group-hover:border-wine group-hover:text-wine"
                          }`}
                        >
                          <Plus size={16} />
                        </span>
                      </button>
                    </h3>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`grid transition-[grid-template-rows] duration-500 ease-soft ${
                        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p
                          className={`origin-top pb-6 pl-[46px] pr-2 text-[15px] leading-[1.85] text-muted transition-[opacity,transform] duration-500 sm:pl-14 sm:pr-14 ${
                            open
                              ? "opacity-100 [transform:perspective(800px)_rotateX(0deg)]"
                              : "opacity-0 [transform:perspective(800px)_rotateX(-35deg)]"
                          }`}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="border-b border-line py-14 text-center">
                <h3 className="font-serif text-3xl">No matching answers.</h3>
                <p className="mt-3 text-sm text-muted">
                  Try another word or choose a topic.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="group mt-6 inline-flex min-h-11 items-center gap-3 border-b border-wine text-sm font-bold text-wine"
                >
                  Return to {activeTopic}
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ Still need a hand ============ */}
      <section className="bg-ink px-4 py-14 text-paper sm:px-8 sm:py-20 lg:px-[clamp(40px,5vw,82px)]">
        <div className="mx-auto grid max-w-[1450px] items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9a9ae]">
              Still need a hand? · A conversation can help
            </p>
            <h2 className="mt-4 font-serif text-[clamp(40px,5vw,76px)] leading-[1]">
              Let&apos;s talk it <em className="text-[#d9a9ae]">through.</em>
            </h2>

            <div className="mt-7 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              {BUSINESS_INFO.email && (
                <a
                  href={`mailto:${BUSINESS_INFO.email}`}
                  className="break-all border-b border-paper/30 pb-1 transition-colors hover:border-[#d9a9ae] hover:text-[#d9a9ae]"
                >
                  {BUSINESS_INFO.email}
                </a>
              )}

              {BUSINESS_INFO.phoneDisplay && phoneHref && (
                <a
                  href={`tel:${phoneHref}`}
                  className="border-b border-paper/30 pb-1 transition-colors hover:border-[#d9a9ae] hover:text-[#d9a9ae]"
                >
                  {BUSINESS_INFO.phoneDisplay}
                </a>
              )}

              {supportSchedule && (
                <p className="text-paper/65">
                  {BUSINESS_INFO.businessDays}
                  {BUSINESS_INFO.businessDays && supportHours && " · "}
                  {supportHours}
                </p>
              )}
            </div>
          </div>

          <Link
            to="/contact"
            className="group relative inline-flex min-h-14 items-center justify-between gap-10 overflow-hidden bg-wine px-6 py-4 text-sm font-semibold transition-colors duration-300 hover:bg-wine-dark"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
            />
            <span className="relative">Contact support</span>
            <ArrowRight
              size={18}
              className="relative transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default FAQs;