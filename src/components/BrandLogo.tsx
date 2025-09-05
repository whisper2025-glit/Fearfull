import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  const strokeWidth = Math.max(1.5, Math.round(size / 16));
  const dotR = Math.max(1, Math.round(size / 24));
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      aria-label="Whisperchat logo"
    >
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="48" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" />
          <stop offset="1" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      {/* Outer circular chat bubble with tail */}
      <path
        d="M24 4c11.046 0 20 8.065 20 18.001C44 31.937 35.046 40 24 40c-1.66 0-3.27-.186-4.8-.54-2.06 2.09-4.62 3.88-7.39 4.96 2.02-2.74 3.28-5.38 3.93-7.52C10.08 34.43 6 28.72 6 22.001 6 12.065 12.954 4 24 4Z"
        stroke="url(#brandGrad)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Face - closed eyes and smile */}
      <path d="M17 23c1.2-1.6 3.8-1.6 5 0" stroke="url(#brandGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M26 23c1.2-1.6 3.8-1.6 5 0" stroke="url(#brandGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M18 28c2.2 2.6 9.8 2.6 12 0" stroke="url(#brandGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />
      {/* Chat dots at top right */}
      <circle cx="30.5" cy="12.5" r={dotR} fill="url(#brandGrad)" />
      <circle cx="35.5" cy="12.5" r={dotR} fill="url(#brandGrad)" />
      <circle cx="40.5" cy="12.5" r={dotR} fill="url(#brandGrad)" />
    </svg>
  );
}

export default BrandLogo;
