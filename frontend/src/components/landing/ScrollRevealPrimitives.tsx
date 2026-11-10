"use client";

import React, { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const EMIL_EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

interface ScrollHeadlineRevealProps {
  lines: string[];
  className?: string;
  as?: "h1" | "h2" | "h3";
}

/**
 * Eloqwnt-style line-by-line clip-mask + Y-translate headline reveal on scroll.
 * Respects prefers-reduced-motion automatically.
 */
export function ScrollHeadlineReveal({
  lines,
  className = "",
  as: Tag = "h2",
}: ScrollHeadlineRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className={className}>
      <Tag className="font-normal tracking-[-0.032em] leading-[1.1] text-zinc-950">
        {lines.map((line, index) => (
          <span
            key={index}
            className="block overflow-hidden pb-[0.08em] -mb-[0.08em]"
          >
            <motion.span
              className="block will-change-transform"
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: "92%", clipPath: "inset(0 0 100% 0)" }
              }
              animate={
                isInView
                  ? { opacity: 1, y: "0%", clipPath: "inset(0 0 0% 0)" }
                  : reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: "92%", clipPath: "inset(0 0 100% 0)" }
              }
              transition={{
                duration: reduceMotion ? 0.2 : 0.72,
                delay: reduceMotion ? 0 : index * 0.09,
                ease: EMIL_EASE_OUT,
              }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}

interface ParallaxShowcaseFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth scroll-linked parallax and entrance lift for the alternating Selected Work cards.
 */
export function ParallaxShowcaseFrame({
  children,
  className = "",
}: ParallaxShowcaseFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef, {
    once: true,
    margin: "-10% 0px -10% 0px",
  });
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const innerY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ["0%", "0%"] : ["4%", "-4%"]
  );
  const innerScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [1, 1, 1] : [0.96, 1.0, 0.98]
  );

  return (
    <motion.div
      ref={containerRef}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.97 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 32, scale: 0.97 }
      }
      transition={{ duration: 0.7, ease: EMIL_EASE_OUT }}
      className={`relative overflow-hidden rounded-[28px] ${className}`}
    >
      <motion.div
        style={{ y: innerY, scale: innerScale }}
        className="w-full h-full will-change-transform"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface ScrollServiceRowProps {
  number: string;
  title: string;
  subtitle: string;
  badge: string;
  index: number;
  onSelect: () => void;
}

/**
 * Reproduces the 00:06 -> 00:07 Eloqwnt numbered service rows ("01" to "08")
 * that progressively illuminate from ghost gray (#D4D4D8) to crisp black (#09090B)
 * as the user scrolls down, with animated divider lines and sliding arrows.
 */
export function ScrollServiceRow({
  number,
  title,
  subtitle,
  badge,
  index,
  onSelect,
}: ScrollServiceRowProps) {
  const rowRef = useRef<HTMLButtonElement | null>(null);
  const isInView = useInView(rowRef, {
    once: true,
    margin: "-6% 0px -14% 0px",
  });
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      ref={rowRef}
      type="button"
      onClick={onSelect}
      initial={reduceMotion ? { opacity: 0.25 } : { opacity: 0.2, y: 14 }}
      animate={
        isInView
          ? { opacity: 1, y: 0 }
          : reduceMotion
          ? { opacity: 0.25 }
          : { opacity: 0.2, y: 14 }
      }
      transition={{
        duration: 0.55,
        delay: reduceMotion ? 0 : index * 0.055,
        ease: EMIL_EASE_OUT,
      }}
      className="group relative w-full text-left py-6 sm:py-7 flex items-center justify-between gap-4 transition-colors duration-200 focus:outline-none active:scale-[0.995]"
    >
      {/* Left number ("01", "02"...) */}
      <span
        className={`font-mono text-xs sm:text-sm w-12 sm:w-24 shrink-0 transition-colors duration-500 ${
          isInView ? "text-zinc-500 group-hover:text-zinc-950" : "text-zinc-300"
        }`}
      >
        {number}
      </span>

      {/* Center-left service title */}
      <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-6 pr-4">
        <span
          className={`text-xl sm:text-2xl lg:text-[28px] font-normal tracking-[-0.025em] transition-colors duration-500 ${
            isInView
              ? "text-zinc-950 group-hover:translate-x-1.5"
              : "text-zinc-300"
          } transition-transform ease-emil-out`}
        >
          {title}
        </span>
        <span
          className={`text-xs sm:text-sm transition-colors duration-500 ${
            isInView
              ? "text-zinc-500 group-hover:text-zinc-800"
              : "text-zinc-300"
          }`}
        >
          {subtitle}
        </span>
      </div>

      {/* Right module pill + arrow */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`hidden md:inline-block text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all duration-500 ${
            isInView
              ? "border-zinc-200 bg-zinc-100 text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950"
              : "border-zinc-100 bg-zinc-50 text-zinc-300"
          }`}
        >
          {badge}
        </span>
        <span
          className={`text-xl sm:text-2xl transition-all duration-300 ease-emil-out ${
            isInView
              ? "text-zinc-900 opacity-90 group-hover:translate-x-1.5"
              : "text-zinc-300 opacity-40"
          }`}
        >
          →
        </span>
      </div>

      {/* Animated bottom border line that draws across on scroll reveal */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: 0.15, opacity: 0.25 }}
        animate={
          isInView
            ? { scaleX: 1, opacity: 1 }
            : { scaleX: 0.15, opacity: 0.25 }
        }
        transition={{
          duration: 0.7,
          delay: reduceMotion ? 0 : index * 0.055,
          ease: EMIL_EASE_OUT,
        }}
        className="absolute bottom-0 left-0 right-0 h-px bg-zinc-200 group-hover:bg-zinc-900 origin-left transition-colors duration-200"
      />
    </motion.button>
  );
}
