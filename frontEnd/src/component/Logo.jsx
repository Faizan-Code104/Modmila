import React from "react";
import { BUSINESS_INFO } from "../storeInfo";

/*
  Sewn "M" mark + lowercase wordmark.
  Props (unchanged): size = "sm" | "md" | "lg" | "xl", showTagline, className
  Extra (optional): tone = "dark" (default, for light backgrounds) | "light" (for dark backgrounds)
*/
const Logo = ({
  size = "md",
  showTagline = false,
  className = "",
  tone = "dark",
}) => {
  const sizes = {
    sm: {
      mark: "size-6 sm:size-7",
      word: "text-[22px] sm:text-2xl",
      tagline: "text-[8px]",
    },
    md: {
      mark: "size-7 sm:size-8",
      word: "text-[26px] sm:text-[30px]",
      tagline: "text-[9px]",
    },
    lg: {
      mark: "size-8 sm:size-10",
      word: "text-[32px] sm:text-[38px]",
      tagline: "text-[10px]",
    },
    xl: {
      mark: "size-10 sm:size-12",
      word: "text-[40px] sm:text-[50px]",
      tagline: "text-[11px] sm:text-xs",
    },
  };

  const currentSize = sizes[size] || sizes.md;
  const brandName = BUSINESS_INFO.businessName;
  const isLight = tone === "light";

  return (
    <div
      className={`group inline-flex min-w-0 max-w-full select-none flex-col items-start font-sans ${className}`}
    >
      <span
        role="img"
        aria-label={brandName}
        className="inline-flex items-center gap-2 perspective-midrange"
      >
        <svg
          viewBox="0 0 70 70"
          aria-hidden="true"
          className={`${currentSize.mark} shrink-0 fill-none stroke-wine transition-transform duration-700 transform-3d [stroke-linecap:round] [stroke-linejoin:round] group-hover:rotate-y-180`}
        >
          <path
            pathLength="1"
            d="M7 52V17c0-3 4-5 7-2l20 19 21-19c3-3 7-1 7 2v35"
            className="animate-stitch [stroke-dasharray:1] [stroke-width:2.6]"
          />
          <path
            d="M7 52c7-12 15-12 27 1C46 40 55 40 62 52"
            className="animate-fade-in [animation-delay:900ms] [stroke-dasharray:3_3.5] [stroke-width:2.2]"
          />
          <path
            d="M14 58h42"
            className={`animate-fade-in [animation-delay:1200ms] [stroke-width:2.2] ${
              isLight ? "stroke-paper" : "stroke-ink"
            }`}
          />
        </svg>

        <span
          aria-hidden="true"
          className={`${currentSize.word} font-semibold lowercase leading-none tracking-[-0.085em] ${
            isLight ? "text-paper" : "text-ink"
          }`}
        >
          {brandName}
        </span>
      </span>

      {showTagline && (
        <span
          className={`${currentSize.tagline} mt-2 max-w-full font-semibold uppercase leading-relaxed tracking-[0.14em] sm:tracking-[0.2em] ${
            isLight ? "text-sand" : "text-wine"
          }`}
        >
          Comfort in composition
        </span>
      )}
    </div>
  );
};

export default Logo;