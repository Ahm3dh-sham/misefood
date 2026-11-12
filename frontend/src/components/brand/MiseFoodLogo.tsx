"use client";

import React from "react";

export type LogoVariant =
  | "steam-negative" // Concept 1 (Selected Default): Steam Toque & Harvest Bowl on Pure White
  | "crown-katori" // Concept 2: Katori Crown & Fresh Sabji
  | "monoline-crest" // Concept 3: Continuous Monoline Harvest Crest
  | "m-monogram" // Concept 4: 'M' Monogram Bowl & Toque
  | "seal-emblem" // Concept 5: Fluted Terracotta Katori & Toque
  | "horizon-duet"; // Concept 6: Minimalist Toque & Veggie Horizon

interface MiseFoodLogoProps {
  variant?: LogoVariant;
  size?: number;
  showWordmark?: boolean;
  useRasterArtwork?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Potly Official Brand Identity — Concept 1: Steam Toque & Harvest Bowl
 * - Pure White Canvas: #FFFFFF
 * - Warm Espresso Ceramic Bowl: #1E1612
 * - Roasted Terracotta (Left/Top Toque & Tomato Wedge): #C44D28
 * - Saffron Amber Gold (Right Toque, Steam & Carrot Slice): #DF9B35
 * - Warm Herb Sage (Coriander Sprig): #6A7B41
 */
export function MiseFoodLogo({
  variant = "steam-negative",
  size = 40,
  showWordmark = true,
  useRasterArtwork = false,
  theme = "light",
  className = "",
}: MiseFoodLogoProps) {
  const textColor = theme === "light" ? "text-[#1E1612]" : "text-white";

  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      {useRasterArtwork ? (
        <span
          className="inline-flex items-center justify-center rounded-xl bg-white border border-[#E6DDD0] overflow-hidden shrink-0 shadow-xs"
          style={{ width: size, height: size }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-steam-toque.jpg"
            alt="Potly Steam Toque & Harvest Bowl Logo"
            className="w-full h-full object-contain scale-125"
          />
        </span>
      ) : (
        <MiseFoodGlyph variant={variant} size={size} />
      )}
      {showWordmark && (
        <span
          className={`font-switzer font-semibold tracking-[-0.04em] leading-none flex items-baseline gap-1 ${textColor}`}
          style={{ fontSize: Math.round(size * 0.56) }}
        >
          <span>potly</span>
          <span
            className="inline-block rounded-full bg-[#C44D28]"
            style={{
              width: Math.max(5, Math.round(size * 0.14)),
              height: Math.max(5, Math.round(size * 0.14)),
            }}
          />
        </span>
      )}
    </span>
  );
}

export function MiseFoodGlyph({
  variant = "steam-negative",
  size = 40,
}: {
  variant?: LogoVariant;
  size?: number;
}) {
  switch (variant) {
    case "steam-negative":
    default:
      // Concept 1 (Official Brand Mark): Steam Toque & Harvest Bowl on Pure White (#FFFFFF)
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Potly Steam Toque and Harvest Bowl Logo"
        >
          {/* Pure White Squircle Background */}
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="16"
            fill="#FFFFFF"
            stroke="#EAE2D7"
            strokeWidth="1.25"
          />

          {/* --- TOP: STEAM TOQUE (CHEF CAP) & RISING AROMA RIBBONS --- */}
          {/* Left & Top Toque Crown Arc in Roasted Terracotta (#C44D28) */}
          <path
            d="M23.5 26.8V22.8C19.2 22.6 16.2 19.6 16.2 15.6C16.2 11.5 19.5 8.4 23.6 8.4C25.1 8.4 26.4 8.9 27.5 9.7C28.8 6.8 31.6 5.2 35 5.6C38.6 6 41.2 8.7 41.4 12.2"
            stroke="#C44D28"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Toque Lobe flowing down into Outer Steam Ribbon in Saffron Gold (#DF9B35) */}
          <path
            d="M42.2 9.4C46.2 9.4 49.2 12.4 49.2 16.2C49.2 19.9 46.4 22.7 42.5 22.9V27.2C42.5 29.5 40.8 30.6 38 31.3C33.8 32.3 30.8 34.2 31.4 38.2"
            stroke="#DF9B35"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center-Left Terracotta S-Curve Steam Plume rising into the Toque */}
          <path
            d="M25.5 34.5C23.5 30.2 26.2 27.6 30.5 25.4C34.8 23.2 36.2 20.4 33.4 16.8C31.2 14 31.8 11.4 33.8 9.8"
            stroke="#C44D28"
            strokeWidth="2.7"
            strokeLinecap="round"
          />

          {/* Center Saffron S-Curve Steam Plume */}
          <path
            d="M28.6 37.6C26.5 33.2 29.2 30.2 33.8 28C37.6 26.2 39.2 23.2 37.5 19.5"
            stroke="#DF9B35"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* --- MIDDLE: FRESH HARVEST VEGETABLES ALONG THE BOWL RIM --- */}
          {/* 1. Left: Heirloom Terracotta Tomato Wedge with Seed Pockets */}
          <path
            d="M18.2 41.2C16.8 37.2 18.2 32.8 21.5 30.2L29.2 39.2L28.5 41.2H18.2Z"
            fill="#C44D28"
          />
          <path
            d="M20.2 39.8C19.3 37.2 20.1 34.2 22.2 32.4"
            stroke="#F7D6C4"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="22.5" cy="36.2" r="0.85" fill="#FBE5B5" />
          <circle cx="24.4" cy="38.2" r="0.85" fill="#FBE5B5" />

          {/* 2. Center: Saffron-Gold Concentric Carrot / Turmeric Slice */}
          <path
            d="M29.2 41.2C29.2 37.8 31.9 35.2 35.2 35.2C38.5 35.2 41.2 37.8 41.2 41.2H29.2Z"
            fill="#DF9B35"
          />
          <path
            d="M31.8 41.2C31.8 39.3 33.3 37.8 35.2 37.8C37.1 37.8 38.6 39.3 38.6 41.2"
            fill="#F3C167"
          />

          {/* 3. Right: Warm Sage Green Coriander / Parsley Sprig */}
          <path
            d="M41.5 41.2L45.2 35.8"
            stroke="#6A7B41"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Left Leaf */}
          <path
            d="M42.8 38.8C39.8 38.2 38.8 35.5 40.8 33.6C42.8 33.5 44 35.8 42.8 38.8Z"
            fill="#6A7B41"
          />
          {/* Top Center Leaf */}
          <path
            d="M44.5 36.5C43.5 33.2 45.5 30.5 48.2 31.2C49.5 33.5 47.8 36.2 44.5 36.5Z"
            fill="#6A7B41"
          />
          {/* Right Leaf */}
          <path
            d="M44.2 39.5C46.5 37.5 49.8 37.8 50.2 40.2C48.8 41.6 46 41.4 44.2 39.5Z"
            fill="#6A7B41"
          />

          {/* --- BOTTOM: WARM ESPRESSO CERAMIC BOWL WITH HIGHLIGHT & FOOT --- */}
          <path
            d="M15.2 42H48.8C48.2 50.2 42.4 55.6 38.8 56.6V58C38.8 58.8 38.1 59.4 37.2 59.4H26.8C25.9 59.4 25.2 58.8 25.2 58V56.6C21.6 55.6 15.8 50.2 15.2 42Z"
            fill="#1E1612"
          />
          {/* Left Ceramic Rim Crescent Highlight */}
          <path
            d="M18.6 44.4H20.8C21.5 49.2 24.2 53.2 27.6 55.2C23.2 53.6 19.5 49.6 18.6 44.4Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "crown-katori":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill="#FFFFFF"
            stroke="#E6DDD0"
            strokeWidth="1.5"
          />
          <path
            d="M20.5 27.5V24.5C17 24 14.5 21.2 14.5 17.7C14.5 14 17.5 11 21.3 11C22.4 11 23.5 11.3 24.4 11.8C25.8 9.1 28.6 7.4 32 7.4C35.4 7.4 38.2 9.1 39.6 11.8C40.5 11.3 41.6 11 42.7 11C46.5 11 49.5 14 49.5 17.7C49.5 21.2 47 24 43.5 24.5V27.5H20.5Z"
            fill="#E09F3E"
            stroke="#1E1916"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 37.5C14.5 32.5 18 29 23 30.5C24.5 33.5 22 37.5 15.5 37.5Z"
            fill="#5C7A47"
          />
          <path
            d="M23.5 37.5C23.5 31.8 27.3 28.5 32 28.5C36.7 28.5 40.5 31.8 40.5 37.5H23.5Z"
            fill="#C85A32"
          />
          <path
            d="M38.5 37.5C39 32.5 43.5 29.5 48 31.5C49 34.5 46.5 37.5 38.5 37.5Z"
            fill="#E09F3E"
          />
          <path
            d="M12.5 37.5H51.5C50.6 48.2 42.5 55 32 55C21.5 55 13.4 48.2 12.5 37.5Z"
            fill="#1E1916"
          />
        </svg>
      );

    case "monoline-crest":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill="#FFFFFF"
            stroke="#E6DDD0"
            strokeWidth="1.5"
          />
          <path
            d="M18 36.5C19.5 32 23.5 31 26.5 34M27 35.5C29 30 35 30 37 35.5M37.5 34.5C40.5 31 44.5 32 46 36.5"
            stroke="#5C7A47"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M13.5 37H50.5C49.5 47 41.8 53.5 32 53.5C22.2 53.5 14.5 47 13.5 37ZM20.5 27.5H43.5V23.8C46.8 23.1 49.2 20.3 49.2 16.9C49.2 13.1 46.1 10 42.3 10C41 10 39.8 10.4 38.8 11C37.4 8.3 34.9 6.6 32 6.6C29.1 6.6 26.6 8.3 25.2 11C24.2 10.4 23 10 21.7 10C17.9 10 14.8 13.1 14.8 16.9C14.8 20.3 17.2 23.1 20.5 23.8V27.5Z"
            stroke="#C85A32"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "m-monogram":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill="#FFFFFF"
            stroke="#E6DDD0"
            strokeWidth="1.5"
          />
          <path
            d="M18 28V19C18 13.8 22.2 10 27 11L32 17L37 11C41.8 10 46 13.8 46 19V28H18Z"
            fill="#E09F3E"
          />
          <circle cx="22" cy="34.5" r="4.5" fill="#5C7A47" />
          <circle cx="32" cy="33.5" r="5.5" fill="#C85A32" />
          <circle cx="42" cy="34.5" r="4.5" fill="#5C7A47" />
          <path
            d="M12.5 36.5H51.5C50.5 47 42.4 54 32 54C21.6 54 13.5 47 12.5 36.5Z"
            fill="#1E1916"
          />
        </svg>
      );

    case "seal-emblem":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill="#FFFFFF"
            stroke="#E6DDD0"
            strokeWidth="1.5"
          />
          <path
            d="M21 27.5V24C17.5 23.5 15 20.6 15 17C15 13.1 18.1 10 22 10C23.2 10 24.3 10.3 25.2 10.9C26.7 8.2 29.2 6.5 32 6.5C34.8 6.5 37.3 8.2 38.8 10.9C39.7 10.3 40.8 10 42 10C45.9 10 49 13.1 49 17C49 20.6 46.5 23.5 43 24V27.5H21Z"
            fill="#1E1916"
          />
          <circle cx="28" cy="34" r="4" fill="#C85A32" />
          <circle cx="37" cy="34" r="4" fill="#E09F3E" />
          <path
            d="M13 36.5H51C50.2 46.8 42.2 54 32 54C21.8 54 13.8 46.8 13 36.5Z"
            fill="#C85A32"
          />
        </svg>
      );

    case "horizon-duet":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1.5"
            y="1.5"
            width="61"
            height="61"
            rx="17"
            fill="#FFFFFF"
            stroke="#E6DDD0"
            strokeWidth="1.5"
          />
          <circle cx="32" cy="17.5" r="8.5" fill="#E09F3E" />
          <circle cx="22.5" cy="33.5" r="4.2" fill="#5C7A47" />
          <circle cx="32" cy="33" r="4.8" fill="#C85A32" />
          <circle cx="41.5" cy="33.5" r="4.2" fill="#5C7A47" />
          <path
            d="M14 36.5H50C49 46.2 41.8 53 32 53C22.2 53 15 46.2 14 36.5Z"
            fill="#1E1916"
          />
        </svg>
      );
  }
}
