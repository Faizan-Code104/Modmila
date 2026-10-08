import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  Layers3,
  RotateCw,
  Ruler,
  Sparkles,
} from "lucide-react";

import storeInfo, { CATEGORIES } from "../storeInfo";

const principles = [
  {
    number: "01",
    title: "Everyday comfort",
    image: CATEGORIES[2]?.image,
    description:
      "We look for bedding that feels good night after night, made for real routines rather than a single occasion.",
  },
  {
    number: "02",
    title: "Easy layering",
    image: CATEGORIES[1]?.image,
    description:
      "Sheets, duvet covers, quilts and finishing pieces are chosen to work together, so building a bed feels simple.",
  },
  {
    number: "03",
    title: "Calm styling",
    image: CATEGORIES[0]?.image,
    description:
      "Quiet colors and considered textures help a bedroom feel settled, modern and easy to come home to.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Fabric & feel",
    description:
      "We look for textiles with a pleasant hand-feel and finishes suited to everyday use and regular washing.",
    Icon: Sparkles,
  },
  {
    number: "02",
    title: "Fit & finish",
    description:
      "Sizing, closures, tailored edges and practical details are considered as part of the selection.",
    Icon: Ruler,
  },
  {
    number: "03",
    title: "Layering versatility",
    description:
      "We favor designs that layer easily with other pieces and move naturally across seasons and bedroom styles.",
    Icon: Layers3,
  },
  {
    number: "04",
    title: "Clear information",
    description:
      "Each product page is intended to present the available product details so shoppers can review before ordering.",
    Icon: CheckCircle2,
  },
];

const ribbon = ["Everyday comfort", "Easy layering", "Calm styling", "Clear information"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* true once the element has scrolled into view */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

/* 3D flip card — hover on desktop, tap on touch screens */
const FlipCard = ({ item, index, visible }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      style={{ transitionDelay: `${index * 140}ms` }}
      className={`perspective-[1400px] transition-[opacity,transform] duration-1000 ease-soft ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-12 opacity-0"
      }`}
    >
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`${item.title}. ${item.description}`}
        onClick={() => setFlipped((value) => !value)}
        className={`group relative block aspect-[4/5] w-full text-left transition-transform duration-[900ms] ease-soft transform-3d [@media(hover:hover)]:hover:rotate-y-180 ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <span className="absolute inset-0 overflow-hidden bg-linen backface-hidden">
          <img
            src={item.image}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <span className="absolute left-4 top-4 bg-chalk px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:left-5 sm:top-5">
            Principle {item.number}
          </span>
          <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-paper sm:inset-x-5 sm:bottom-5">
            <span className="font-serif text-[30px] leading-none sm:text-[34px]">
              {item.title}
            </span>
            <RotateCw size={18} aria-hidden="true" className="shrink-0 opacity-80" />
          </span>
        </span>

        {/* Back */}
        <span className="absolute inset-0 flex rotate-y-180 flex-col justify-between bg-wine p-6 text-paper backface-hidden sm:p-7">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-2.5 border border-dashed border-paper/30"
          />
          <span className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
            {item.number} / {storeInfo.businessName}
          </span>
          <span className="relative">
            <span className="block font-serif text-[32px] leading-tight">
              {item.title}
            </span>
            <span className="mt-4 block text-sm leading-7 text-paper/85">
              {item.description}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
};

const About = () => {
  const heroImageRef = useRef(null);
  const [cardsRef, cardsVisible] = useInView(0.15);
  const [quoteRef, quoteVisible] = useInView(0.3);
  const [stepsRef, stepsVisible] = useInView(0.2);
  const [ctaRef, ctaVisible] = useInView(0.2);

  const handleHeroMove = (event) => {
    const element = heroImageRef.current;
    if (
      !element ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      prefersReducedMotion()
    ) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.transform = `perspective(1400px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg)`;
  };

  const resetHero = () => {
    if (heroImageRef.current) heroImageRef.current.style.transform = "";
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-chalk text-ink">
      {/* ============ 01 / HERO — split like the home room edit ============ */}
      <section className="relative grid lg:min-h-[calc(100dvh-120px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative z-10 flex flex-col justify-center px-5 pb-12 pt-11 sm:px-8 lg:py-20 lg:pl-[clamp(40px,6vw,82px)] lg:pr-10">
          <p className="flex animate-rise items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]">
            <span className="h-px w-7 bg-wine" aria-hidden="true" />
            01 / Our story
          </p>

          <h1 className="mt-8 font-serif text-[clamp(52px,7vw,100px)] leading-[0.95] tracking-[-0.04em] perspective-distant lg:mt-12">
            <span className="block animate-fold-in [animation-delay:100ms]">
              Made for the room
            </span>
            <em className="block animate-fold-in text-wine [animation-delay:260ms]">
              you call yours.
            </em>
          </h1>

          <p className="mt-7 max-w-[400px] animate-rise text-[15px] leading-relaxed text-muted [animation-delay:420ms]">
            {storeInfo.businessName} is focused on modern bedding textiles —
            duvet cover sets, quilts, coverlets, sheet sets, pillow shams and
            bed skirts — selected for everyday comfort, easy layering and a
            calm, modern look.
          </p>

          <div className="mt-9 flex animate-rise flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:560ms]">
            <Link
              to="/shop"
              className="group inline-flex min-h-12 items-center gap-6 bg-ink px-6 py-3.5 text-[13px] font-bold text-paper transition-colors duration-300 hover:bg-wine"
            >
              Meet the collection
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="#principles"
              className="inline-flex min-h-11 items-center border-b border-wine text-[13px] font-bold text-wine"
            >
              What we believe
            </a>
          </div>
        </div>

        {/* Image stage */}
        <div
          className="relative min-h-[360px] animate-scale-in sm:min-h-[480px] lg:min-h-0 lg:py-7 lg:pr-[27px]"
          onMouseMove={handleHeroMove}
          onMouseLeave={resetHero}
        >
          <div
            ref={heroImageRef}
            className="absolute inset-0 overflow-hidden transition-transform duration-500 ease-out will-change-transform lg:inset-y-7 lg:left-0 lg:right-[27px]"
          >
            <img
              src="/about.png"
              alt={`${storeInfo.businessName} bedding layered with an oxblood throw`}
              fetchPriority="high"
              className="absolute inset-0 size-full animate-slow-zoom object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-paper sm:inset-x-6 sm:bottom-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                Story 01
              </span>
              <span className="text-xs font-semibold">
                Designed to come home to.
              </span>
            </div>

            <span className="absolute right-4 top-4 bg-chalk px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:right-7 sm:top-7">
              MM / About
            </span>
          </div>

          {/* Floating 3D sewn-mark badge */}
          <div className="pointer-events-none absolute -bottom-8 left-5 z-20 perspective-distant sm:left-8 lg:-left-14 lg:bottom-20">
            <div className="animate-float-3d transform-3d">
              <div className="grid size-28 place-items-center rounded-full bg-wine text-paper shadow-[0_30px_50px_-20px_rgba(36,34,35,0.7)] sm:size-36">
                <svg
                  viewBox="0 0 70 70"
                  aria-hidden="true"
                  className="size-14 fill-none stroke-paper [stroke-linecap:round] [stroke-linejoin:round] sm:size-[72px]"
                >
                  <path
                    pathLength="1"
                    d="M7 52V17c0-3 4-5 7-2l20 19 21-19c3-3 7-1 7 2v35"
                    className="animate-stitch [animation-duration:3s] [stroke-dasharray:1] [stroke-width:2.6]"
                  />
                  <path
                    d="M7 52c7-12 15-12 27 1C46 40 55 40 62 52"
                    className="stroke-[#e6c4c7] [stroke-dasharray:3_3.5] [stroke-width:2]"
                  />
                  <path d="M14 58h42" className="[stroke-width:2]" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1.5 hidden origin-bottom-left -rotate-90 text-[10px] uppercase tracking-[0.2em] text-muted lg:block"
        >
          {storeInfo.businessName} / A note on resting well
        </span>
      </section>

      {/* ============ RIBBON ============ */}
      <div className="mt-14 overflow-hidden bg-wine py-4 text-paper sm:mt-16 lg:mt-0">
        <div className="flex w-max animate-marquee items-center [animation-duration:32s]">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1 ? "true" : undefined}
              className="flex shrink-0 items-center"
            >
              {ribbon.map((word) => (
                <span
                  key={word}
                  className="flex items-center gap-8 px-8 font-serif text-2xl italic sm:text-3xl"
                >
                  {word}
                  <span aria-hidden="true" className="not-italic text-[#e6c4c7]">
                    ✳
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ 02 / PRINCIPLES — 3D flip cards ============ */}
      <section
        id="principles"
        className="px-4 py-16 sm:px-8 sm:py-24 lg:px-[clamp(40px,5vw,82px)] lg:py-28"
      >
        <div className="mx-auto max-w-[1450px]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
                02 / What we believe
              </p>
              <h2 className="mt-4 font-serif text-[clamp(42px,5.6vw,84px)] leading-[0.98] tracking-[-0.03em]">
                Three quiet
                <br />
                <em>principles.</em>
              </h2>
            </div>
            <p className="max-w-[300px] text-sm leading-relaxed text-muted">
              A few simple ideas guide the way we look at bedding. Hover or tap
              a card to turn it over.
            </p>
          </div>

          <div
            ref={cardsRef}
            className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {principles.map((item, index) => (
              <div
                key={item.number}
                className={`${index === 1 ? "lg:mt-14" : ""} ${
                  index === 2 ? "sm:col-span-2 sm:mx-auto sm:w-1/2 lg:col-span-1 lg:mx-0 lg:w-auto" : ""
                }`}
              >
                <FlipCard item={item} index={index} visible={cardsVisible} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 03 / STATEMENT ============ */}
      <section
        ref={quoteRef}
        className="relative overflow-hidden bg-ink px-5 py-20 text-center text-paper sm:px-8 sm:py-28 lg:py-36"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-sand/15 sm:size-[700px]"
        />
        <div className="relative mx-auto max-w-[1000px] perspective-distant">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.22em] text-[#d9a9ae] transition-opacity duration-700 ${
              quoteVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            03 / The thought behind the collection
          </p>
          <blockquote
            className={`mt-7 origin-top font-serif text-[clamp(38px,5.4vw,80px)] leading-[1.02] transition-[opacity,transform] duration-[1200ms] ease-soft ${
              quoteVisible
                ? "opacity-100 [transform:rotateX(0deg)]"
                : "opacity-0 [transform:rotateX(-60deg)]"
            }`}
          >
            A bed should feel calm before it feels{" "}
            <em className="text-[#d9a9ae]">complicated.</em>
          </blockquote>
          <p
            className={`mx-auto mt-8 max-w-xl text-sm leading-7 text-paper/75 transition-opacity delay-500 duration-1000 sm:text-base ${
              quoteVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            Our approach centers on pieces that layer naturally — a foundation
            of sheets, a top layer that sets the mood, and finishing details
            that bring the room together.
          </p>
        </div>
      </section>

      {/* ============ 04 / HOW WE CHOOSE — drawn timeline ============ */}
      <section className="bg-paper px-4 py-16 sm:px-8 sm:py-24 lg:px-[clamp(40px,5vw,82px)] lg:py-28">
        <div className="mx-auto max-w-[1450px]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wine sm:text-[11px]">
                04 / How we choose
              </p>
              <h2 className="mt-4 font-serif text-[clamp(42px,5.6vw,84px)] leading-[0.98] tracking-[-0.03em]">
                The selection
                <br />
                <em>notes.</em>
              </h2>
            </div>
            <p className="max-w-[420px] text-sm leading-7 text-muted lg:justify-self-end">
              Our selection process is built around practical considerations
              and straightforward product information.
            </p>
          </div>

          <ol ref={stepsRef} className="relative mt-12 grid gap-10 sm:mt-16 lg:grid-cols-4 lg:gap-8">
            {/* line that draws itself (vertical on mobile, horizontal on desktop) */}
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-[19px] top-0 w-px origin-top bg-wine transition-transform duration-[1600ms] ease-soft lg:bottom-auto lg:left-0 lg:right-0 lg:top-[19px] lg:h-px lg:w-auto lg:origin-left ${
                stepsVisible ? "scale-100" : "scale-y-0 lg:scale-x-0 lg:scale-y-100"
              }`}
            />

            {processSteps.map(({ number, title, description, Icon }, index) => (
              <li
                key={number}
                style={{ transitionDelay: `${300 + index * 220}ms` }}
                className={`group relative pl-16 transition-[opacity,transform] duration-700 ease-soft lg:pl-0 lg:pt-16 ${
                  stepsVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
              >
                <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full border border-wine bg-paper text-wine transition-all duration-500 transform-3d group-hover:rotate-y-180 group-hover:bg-wine group-hover:text-paper">
                  <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="text-xs font-bold text-wine">{number}</span>
                <h3 className="mt-2 font-serif text-[28px] leading-tight lg:text-[30px]">
                  {title}
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-muted">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ 05 / INVITATION — full-bleed room ============ */}
      <section ref={ctaRef} className="relative min-h-[520px] overflow-hidden sm:min-h-[600px]">
        <img
          src="/hero-banner.png"
          alt=""
          loading="lazy"
          className={`absolute inset-0 size-full object-cover transition-transform duration-[2000ms] ease-soft ${
            ctaVisible ? "scale-100" : "scale-110"
          }`}
        />
        <span className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/10" />

        <div className="relative mx-auto flex min-h-[520px] max-w-[1450px] flex-col justify-end px-5 py-14 text-paper sm:min-h-[600px] sm:px-8 sm:py-20 lg:px-[clamp(40px,5vw,82px)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e6c4c7]">
            05 / Your next layer
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-[clamp(40px,5.4vw,80px)] leading-[1] tracking-[-0.03em]">
            Find a layer for
            <br />
            <em>the room ahead.</em>
          </h2>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {CATEGORIES.map((category, index) => (
              <Link
                key={category.slug}
                to={`/shop?category=${category.slug}`}
                style={{ transitionDelay: `${index * 90}ms` }}
                className={`border border-paper/50 bg-ink/20 px-4 py-2.5 text-xs font-semibold backdrop-blur-sm transition-all duration-500 hover:border-paper hover:bg-paper hover:text-ink ${
                  ctaVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <Link
            to="/shop"
            className="group relative mt-8 inline-flex min-h-14 w-full items-center justify-between gap-8 overflow-hidden bg-wine px-6 py-4 text-sm font-semibold transition-colors duration-300 hover:bg-wine-dark sm:w-fit"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-paper/15 transition-transform duration-700 group-hover:translate-x-[420%]"
            />
            <span className="relative">Explore the collection</span>
            <ArrowUpRight
              size={20}
              aria-hidden="true"
              className="relative transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;