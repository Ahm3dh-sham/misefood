"use client";

import React from "react";

export type LogoVariant =
  | "crown-katori" // 1. The Toque-Dome Katori (Chef cap forms the steaming dome lid of a brass/terracotta bowl)
  | "steam-negative" // 2. Negative-Space Steam Toque (Rising aroma lines from a crescent bowl sculpt a chef cap)
  | "monoline-crest" // 3. Michelin Monoline Ribbon (Single continuous gold-copper line tracing bowl + toque)
  | "m-monogram" // 4. Geometric 'M' Bowl & Toque (Letter M base = deep bowl, top puffs = chef toque)
  | "seal-emblem" // 5. Warm Terracotta Squircle App Icon (Embossed parchment toque + fluted bowl)
  | "horizon-duet"; // 6. Horizon Duet (Minimalist floating chef toque reflected as a katori bowl below a saffron horizon)

interface MiseFoodLogoProps {
  variant?: LogoVariant;
  size?: number;
  showWordmark?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Warm & Elegant Palette:
 * - Warm Espresso Ink: #1E1916
 * - Roasted Terracotta: #C85A32
 * - Saffron Amber Gold: #E09F3E
 * - Creamy Alabaster: #FAF5EE
 * - Brushed Copper: #A84422
 */
export function MiseFoodLogo({
  variant = "crown-katori",
  size = 36,
  showWordmark = true,
  theme = "light",
  className = "",
}: MiseFoodLogoProps) {
  const textColor = theme === "light" ? "text-[#1E1916]" : "text-[#FAF5EE]";

  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <MiseFoodGlyph variant={variant} size={size} />
      {showWordmark && (
        <span
          className={`font-switzer font-semibold tracking-[-0.04em] leading-none flex items-baseline gap-1 ${textColor}`}
          style={{ fontSize: Math.round(size * 0.58) }}
        >
          <span>misefood</span>
          <span
            className="inline-block rounded-full bg-[#C85A32]"
            style={{
              width: Math.max(5, Math.round(size * 0.15)),
              height: Math.max(5, Math.round(size * 0.15)),
            }}
          />
        </span>
      )}
    </span>
  );
}

export function MiseFoodGlyph({
  variant = "crown-katori",
  size = 36,
}: {
  variant?: LogoVariant;
  size?: number;
}) {
  switch (variant) {
    case "crown-katori":
      // 1. The Toque-Dome Katori: Puffy 3-lobed Chef Cap crowning a warm Terracotta & Saffron Katori Bowl
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MiseFood Bowl and Chef Cap Logo"
        >
          <defs>
            <linearGradient id="warmBg1" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#261F1B" />
              <stop offset="100%" stopColor="#161210" />
            </linearGradient>
            <linearGradient id="saffronGrad" x1="16" y1="12" x2="48" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F3C677" />
              <stop offset="100%" stopColor="#DF9236" />
            </linearGradient>
            <linearGradient id="terracottaBowl" x1="14" y1="36" x2="50" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#DF6D43" />
              <stop offset="100%" stopColor="#B8431E" />
            </linearGradient>
          </defs>
          {/* Squircle Medallion Base */}
          <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#warmBg1)" />
          <rect
            x="2.75"
            y="2.75"
            width="58.5"
            height="58.5"
            rx="17.25"
            stroke="#E09F3E"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />

          {/* Top Component: 3-Lobed Chef Cap (Toque Blanche) */}
          <path
            d="M21 31V27.5C17.2 27.1 14.5 24.1 14.5 20.4C14.5 16.5 17.7 13.4 21.6 13.4C22.7 13.4 23.8 13.7 24.7 14.2C26.2 11.4 28.9 9.5 32 9.5C35.1 9.5 37.8 11.4 39.3 14.2C40.2 13.7 41.3 13.4 42.4 13.4C46.3 13.4 49.5 16.5 49.5 20.4C49.5 24.1 46.8 27.1 43 27.5V31H21Z"
            fill="url(#saffronGrad)"
          />
          {/* Subtle vertical toque pleats */}
          <path
            d="M28 19V28.5M32 17V28.5M36 19V28.5"
            stroke="#1E1916"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.55"
          />

          {/* Golden Horizon Rim separating Toque & Bowl */}
          <rect x="13" y="33.5" width="38" height="2.6" rx="1.3" fill="#FAF3E8" />

          {/* Bottom Component: Deep Indian Katori / Culinary Bowl */}
          <path
            d="M15 38.5H49C49 46.8 41.8 53 32 53C22.2 53 15 46.8 15 38.5Z"
            fill="url(#terracottaBowl)"
          />
          {/* Bowl Foot Ring */}
          <path
            d="M25 54.8H39"
            stroke="#E09F3E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "steam-negative":
      // 2. Negative-Space Steam Toque: Crescent terracotta bowl with saffron steam forming a chef cap
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="60" height="60" rx="18" fill="#F7F1E5" stroke="#E4D7C5" strokeWidth="1.5" />
          {/* Chef Cap Outline sculpted by rising steam */}
          <path
            d="M22 33V28C18.2 27.5 15.5 24.4 15.5 20.6C15.5 16.6 18.8 13.5 22.8 13.5C24 13.5 25.1 13.8 26.1 14.4C27.5 11.7 30.1 10 32.8 10C35.8 10 38.5 11.9 39.8 14.6C40.7 13.9 41.9 13.5 43.2 13.5C47 13.5 50 16.6 50 20.4C50 24.2 47.2 27.4 43.5 27.9V33"
            stroke="#C85A32"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Three S-curve steam plumes inside the toque */}
          <path
            d="M27 29C27 25.5 29 24.5 29 21M33 29C33 25 35 24 35 20M39 29C39 25.5 41 24.5 41 21"
            stroke="#E09F3E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Deep Espresso Crescent Bowl */}
          <path
            d="M13 36.5H51C50.2 46.2 42.3 53 32 53C21.7 53 13.8 46.2 13 36.5Z"
            fill="#1E1916"
          />
          <path
            d="M20 42C23.5 45.2 27.6 46.8 32 46.8C36.4 46.8 40.5 45.2 44 42"
            stroke="#E09F3E"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "monoline-crest":
      // 3. Michelin Continuous Monoline Ribbon (Single unbroken gold/copper line)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="60" height="60" rx="18" fill="#1A1512" />
          <path
            d="M14 36H50C49 46 41.5 52.5 32 52.5C22.5 52.5 15 46 14 36ZM20 32H44V27.5C47.2 26.8 49.5 24 49.5 20.5C49.5 16.6 46.4 13.5 42.5 13.5C41.2 13.5 40 13.9 39 14.5C37.6 11.8 35 10 32 10C29 10 26.4 11.8 25 14.5C24 13.9 22.8 13.5 21.5 13.5C17.6 13.5 14.5 16.6 14.5 20.5C14.5 24 16.8 26.8 20 27.5V32Z"
            stroke="#E5A94C"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Subtle AI 4-point culinary star inside bowl */}
          <path
            d="M32 40L33.4 43.1L36.5 44.5L33.4 45.9L32 49L30.6 45.9L27.5 44.5L30.6 43.1L32 40Z"
            fill="#D46A3E"
          />
        </svg>
      );

    case "m-monogram":
      // 4. Geometric 'M' Bowl & Toque Monogram
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="60" height="60" rx="18" fill="#F6EFE4" stroke="#E2D5C1" strokeWidth="1.5" />
          {/* Top M-Peaks forming Chef Cap */}
          <path
            d="M17 32V21C17 15.5 21.5 11.5 26.5 12.5L32 19L37.5 12.5C42.5 11.5 47 15.5 47 21V32H17Z"
            fill="#D9822B"
          />
          {/* Bottom Bowl cradle forming M base */}
          <path
            d="M13 35.5H51C50 45.8 42.2 52.5 32 52.5C21.8 52.5 14 45.8 13 35.5Z"
            fill="#211C19"
          />
          <path
            d="M23 35.5L32 44.5L41 35.5"
            stroke="#F6EFE4"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "seal-emblem":
      // 5. Roasted Terracotta App Icon Seal with Cream Embossed Glyph
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sealGrad" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#D16038" />
              <stop offset="100%" stopColor="#8E3317" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#sealGrad)" />
          {/* Cream Toque */}
          <path
            d="M21 30.5V27C17.5 26.5 15 23.6 15 20C15 16.1 18.1 13 22 13C23.2 13 24.3 13.3 25.2 13.9C26.7 11.2 29.2 9.5 32 9.5C34.8 9.5 37.3 11.2 38.8 13.9C39.7 13.3 40.8 13 42 13C45.9 13 49 16.1 49 20C49 23.6 46.5 26.5 43 27V30.5H21Z"
            fill="#FAF5EE"
          />
          {/* Cream Fluted Bowl */}
          <path
            d="M14 35.5H50C49.2 45.2 41.8 52 32 52C22.2 52 14.8 45.2 14 35.5Z"
            fill="#FAF5EE"
          />
          <path
            d="M24 54.5H40"
            stroke="#F3C677"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "horizon-duet":
    default:
      // 6. Minimalist Horizon Symmetry (Toque above, Katori below)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="2" y="2" width="60" height="60" rx="18" fill="#231D1A" />
          <circle cx="32" cy="21" r="9" fill="#E09F3E" />
          <circle cx="23" cy="23" r="6.5" fill="#E09F3E" />
          <circle cx="41" cy="23" r="6.5" fill="#E09F3E" />
          <rect x="12" y="32" width="40" height="2.5" rx="1.25" fill="#FAF5EE" />
          <path
            d="M16 37.5H48C47 46 40.5 51.5 32 51.5C23.5 51.5 17 46 16 37.5Z"
            fill="#C85A32"
          />
        </svg>
      );
  }
}
