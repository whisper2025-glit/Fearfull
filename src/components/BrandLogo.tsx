import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

// Vector logo reconstructed from the supplied PNG (blue drawing only)
// Stroke-only glyphs with a cyan→blue gradient, transparent background
export default function BrandLogo({ size = 36, className }: BrandLogoProps) {
  const stroke = "url(#brand-stroke)";
  const strokeWidth = Math.max(2, Math.round(size / 12));

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn(className)}
      aria-label="Brand logo"
    >
      <defs>
        <linearGradient id="brand-stroke" x1="12" y1="84" x2="84" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>

      {/* Outer chat circle with tail (single continuous stroke) */}
      <path
        d="M48 12c19.33 0 35 14.62 35 32.66 0 18.05-15.67 32.67-35 32.67-3.18 0-6.28-.34-9.22-1-3.77 3.82-8.37 6.99-13.42 9 3.47-4.72 5.61-9.17 6.87-13.03C21.9 67.53 13 56.34 13 44.66 13 26.62 28.67 12 48 12Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Hair curve dividing the face (top-right sweep) */}
      <path
        d="M60.5 20.5c-8.5 3.2-14.7 10.7-16.2 19.7"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Eyes (closed) */}
      <path d="M36 48c2.8-3.2 7.2-3.2 10 0" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M57 48c2.8-3.2 7.2-3.2 10 0" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Smile */}
      <path d="M38 60c4.8 5.6 15.2 5.6 20 0" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />

      {/* Three chat dots */}
      <circle cx="63" cy="27" r={strokeWidth / 2 + 2} fill={"#2dd4bf"} />
      <circle cx="71" cy="27" r={strokeWidth / 2 + 2} fill={"#44c7f5"} />
      <circle cx="79" cy="27" r={strokeWidth / 2 + 2} fill={"#60a5fa"} />
    </svg>
  );
}
