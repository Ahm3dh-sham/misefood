"use client";

import React from "react";

export type LogoVariant =
  | "crown-katori" // 1. Toque Crown + Harvest Vegetables in Terracotta Katori (White BG)
  | "steam-negative" // 2. Steam Toque rising from Vegetable Bowl (White BG)
  | "monoline-crest" // 3. Michelin Monoline Toque + Veggie Bowl (White BG)
  | "m-monogram" // 4. 'M' Monogram Toque + Vegetable Bowl (White BG)
  | "seal-emblem" // 5. Fluted Brass Katori + Vegetables + Toque Dome (White BG)
  | "horizon-duet"; // 6. Minimalist Toque + Veggie Horizon Bowl (White BG)

interface MiseFoodLogoProps {
  variant?: LogoVariant;
  size?: number;
  showWordmark?: boolean;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Pure White (#FFFFFF) background with Warm & Elegant Palette + Fresh Vegetables in the Bowl:
 * - Pure White Canvas: #FFFFFF
 * - Warm Espresso Ink: #1E1916
 * - Roasted Terracotta (Tomato / Clay): #C85A32
 * - Saffron Amber Gold (Carrot / Bell Pepper / Turmeric): #E09F3E
 * - Warm Herb Sage (Coriander / Basil Leaf): #5C7A47
 */
export function MiseFoodLogo({
  variant = "crown-katori",
  size = 38,
  showWordmark = true,
  theme = "light",
  className = "",
}: MiseFoodLogoProps) {
  const textColor = theme === "light" ? "text-[#1E1916]" : "text-white";

  return (
    <span
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      <MiseFoodGlyph variant={variant} size={size} />
      {showWordmark && (
        <span
          className={`font-switzer font-semibold tracking-[-0.04em] leading-none flex items-baseline gap-1 ${textColor}`}
          style={{ fontSize: Math.round(size * 0.56) }}
        >
          <span>misefood</span>
          <span
            className="inline-block rounded-full bg-[#C85A32]"
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
  variant = "crown-katori",
  size = 38,
}: {
  variant?: LogoVariant;
  size?: number;
}) {
  switch (variant) {
    case "crown-katori":
      // 1. White Badge: 3-Lobed Chef Cap crowning a Bowl brimming with Tomato, Saffron Carrot & Herb Leaves
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="MiseFood Bowl with Vegetables and Chef Cap Logo"
        >
          {/* Crisp Pure White Squircle Background */}
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

          {/* Top Component: Warm Saffron & Espresso 3-Lobed Chef Cap (Toque Blanche) */}
          <path
            d="M20.5 27.5V24.5C17 24 14.5 21.2 14.5 17.7C14.5 14 17.5 11 21.3 11C22.4 11 23.5 11.3 24.4 11.8C25.8 9.1 28.6 7.4 32 7.4C35.4 7.4 38.2 9.1 39.6 11.8C40.5 11.3 41.6 11 42.7 11C46.5 11 49.5 14 49.5 17.7C49.5 21.2 47 24 43.5 24.5V27.5H20.5Z"
            fill="#E09F3E"
            stroke="#1E1916"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Toque Pleats & Band */}
          <path
            d="M27.5 16.5V25M32 14.5V25M36.5 16.5V25"
            stroke="#1E1916"
            strokeWidth="1.7"
            strokeLinecap="round"
          />

          {/* Middle Layer: Fresh Vegetables nestled inside the Bowl Rim */}
          {/* Left: Warm Herb Leaf Sprig (Coriander / Basil) */}
          <path
            d="M15.5 37.5C14.5 32.5 18 29 23 30.5C24.5 33.5 22 37.5 15.5 37.5Z"
            fill="#5C7A47"
            stroke="#1E1916"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Center: Roasted Heirloom Tomato Half with seed details */}
          <path
            d="M23.5 37.5C23.5 31.8 27.3 28.5 32 28.5C36.7 28.5 40.5 31.8 40.5 37.5H23.5Z"
            fill="#C85A32"
            stroke="#1E1916"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M29.5 33.5L30.8 35M34.5 33.5L33.2 35"
            stroke="#FAF5EE"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Right: Saffron Carrot / Bell Pepper Slice & Right Herb Leaf */}
          <path
            d="M38.5 37.5C39 32.5 43.5 29.5 48 31.5C49 34.5 46.5 37.5 38.5 37.5Z"
            fill="#E09F3E"
            stroke="#1E1916"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M44.5 36.5C46.5 32 50 31.5 51 35.5"
            stroke="#5C7A47"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Bottom Component: Deep Espresso & Terracotta Culinary Bowl (Katori) */}
          <path
            d="M12.5 37.5H51.5C50.6 48.2 42.5 55 32 55C21.5 55 13.4 48.2 12.5 37.5Z"
            fill="#1E1916"
          />
          {/* Warm Terracotta Gloss Curve & Foot on the Bowl */}
          <path
            d="M18.5 42.5C21.8 47.2 26.5 49.8 32 49.8C37.5 49.8 42.2 47.2 45.5 42.5"
            stroke="#C85A32"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M25 57H39"
            stroke="#E09F3E"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "steam-negative":
      // 2. White Badge: Negative-Space Steam Toque rising from a Vegetable-Filled Bowl
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
          {/* Chef Cap Outline sculpted by rising steam */}
          <path
            d="M21.5 28V24C17.8 23.5 15.2 20.6 15.2 17C15.2 13.2 18.4 10.2 22.3 10.2C23.5 10.2 24.6 10.5 25.6 11.1C27 8.5 29.5 7 32.2 7C35.2 7 37.8 8.8 39.1 11.4C40 10.7 41.2 10.2 42.5 10.2C46.2 10.2 49.2 13.2 49.2 16.9C49.2 20.6 46.5 23.6 42.8 24.1V28"
            stroke="#C85A32"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.5 25.5C27.5 22.5 29.2 21.5 29.2 18.5M33 25.5C33 22 34.8 21 34.8 17.5M38.5 25.5C38.5 22.5 40.2 21.5 40.2 18.5"
            stroke="#E09F3E"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Vegetables in the Bowl */}
          <circle cx="24" cy="35" r="5" fill="#5C7A47" />
          <circle cx="32" cy="34" r="6" fill="#C85A32" />
          <circle cx="40" cy="35" r="5" fill="#E09F3E" />
          {/* Bowl */}
          <path
            d="M12.5 37H51.5C50.6 47.8 42.5 54.5 32 54.5C21.5 54.5 13.4 47.8 12.5 37Z"
            fill="#1E1916"
          />
          <path
            d="M20 43C23.5 46.2 27.6 47.8 32 47.8C36.4 47.8 40.5 46.2 44 43"
            stroke="#E09F3E"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case "monoline-crest":
      // 3. White Badge: Michelin Continuous Monoline Toque + Harvest Vegetables
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
          {/* Vegetables peeking from bowl */}
          <path
            d="M17 37C17 32.5 21 30 25 32.5C27 29 31.5 28.5 34.5 31.5C38 29 43 30.5 45.5 34.5L47 37H17Z"
            fill="#E09F3E"
            fillOpacity="0.28"
          />
          <path
            d="M18 36.5C19.5 32 23.5 31 26.5 34M27 35.5C29 30 35 30 37 35.5M37.5 34.5C40.5 31 44.5 32 46 36.5"
            stroke="#5C7A47"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Continuous Espresso & Terracotta Monoline Toque + Bowl */}
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
      // 4. White Badge: Geometric 'M' Toque + Vegetable Bowl
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
          {/* Top Chef Toque forming M Crown */}
          <path
            d="M18 28V19C18 13.8 22.2 10 27 11L32 17L37 11C41.8 10 46 13.8 46 19V28H18Z"
            fill="#E09F3E"
          />
          {/* Vegetables along the rim */}
          <circle cx="22" cy="34.5" r="4.5" fill="#5C7A47" />
          <circle cx="32" cy="33.5" r="5.5" fill="#C85A32" />
          <circle cx="42" cy="34.5" r="4.5" fill="#5C7A47" />
          {/* Deep Bowl */}
          <path
            d="M12.5 36.5H51.5C50.5 47 42.4 54 32 54C21.6 54 13.5 47 12.5 36.5Z"
            fill="#1E1916"
          />
          <path
            d="M23 36.5L32 45.5L41 36.5"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "seal-emblem":
      // 5. White Badge: Fluted Terracotta Katori + Harvest Vegetables + Chef Toque
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
          {/* Toque */}
          <path
            d="M21 27.5V24C17.5 23.5 15 20.6 15 17C15 13.1 18.1 10 22 10C23.2 10 24.3 10.3 25.2 10.9C26.7 8.2 29.2 6.5 32 6.5C34.8 6.5 37.3 8.2 38.8 10.9C39.7 10.3 40.8 10 42 10C45.9 10 49 13.1 49 17C49 20.6 46.5 23.5 43 24V27.5H21Z"
            fill="#1E1916"
          />
          {/* Vegetables */}
          <path
            d="M16 36C16.5 31.5 20.5 29.5 24.5 31.5C26.5 28.5 31 28 34 30.5C37.5 28 42.5 29.5 45.5 33.5L47.5 36H16Z"
            fill="#5C7A47"
          />
          <circle cx="28" cy="34" r="4" fill="#C85A32" />
          <circle cx="37" cy="34" r="4" fill="#E09F3E" />
          {/* Fluted Terracotta Katori Bowl */}
          <path
            d="M13 36.5H51C50.2 46.8 42.2 54 32 54C21.8 54 13.8 46.8 13 36.5Z"
            fill="#C85A32"
          />
          <path
            d="M25 36.5C25 44 28 50 32 53.5M39 36.5C39 44 36 50 32 53.5"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeOpacity="0.65"
          />
        </svg>
      );

    case "horizon-duet":
    default:
      // 6. White Badge: Minimalist Toque + Veggie Horizon Bowl
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
          <circle cx="23" cy="19.5" r="6" fill="#E09F3E" />
          <circle cx="41" cy="19.5" r="6" fill="#E09F3E" />
          {/* Vegetable Trio Row */}
          <circle cx="22.5" cy="33.5" r="4.2" fill="#5C7A47" />
          <circle cx="32" cy="33" r="4.8" fill="#C85A32" />
          <circle cx="41.5" cy="33.5" r="4.2" fill="#5C7A47" />
          {/* Espresso Bowl */}
          <path
            d="M14 36.5H50C49 46.2 41.8 53 32 53C22.2 53 15 46.2 14 36.5Z"
            fill="#1E1916"
          />
        </svg>
      );
  }
}
