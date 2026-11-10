"use client";

import React from "react";
import {
  CheckCircle2,
  Flame,
  GitMerge,
  Mic,
  Scale,
  ShoppingCart,
  Sparkles,
  Wand2,
} from "lucide-react";

/**
 * Showcase 1 Visual (00:01 - Vertus AI equivalent):
 * Dark volcanic slate environment with an angled laptop screen displaying
 * a crimson/saffron neural surface and live Katori + Gemini OCR extraction.
 */
export function ImporterMacbookShowcase({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div
      onClick={onLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLaunch();
      }}
      className="cursor-pointer group relative w-full min-h-[360px] sm:min-h-[430px] bg-gradient-to-br from-[#232528] via-[#16171A] to-[#0D0E10] p-6 sm:p-10 flex items-center justify-center overflow-hidden"
    >
      {/* Subtle architectural stone texture glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

      {/* Angled Laptop Hardware Frame */}
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0A0B0D] border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.75)] p-2.5 sm:p-3.5 transition-transform duration-500 ease-emil-out group-hover:-translate-y-1.5">
        {/* Top camera notch */}
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-zinc-800" />

        {/* Screen Content: Crimson / Saffron Topographic Shader + Recipe Studio UI */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-[#3A0CA3] via-[#7209B7] to-[#F72585] p-5 sm:p-7 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,160,122,0.38),transparent_60%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          <div className="relative z-10 space-y-5">
            {/* Top Mini Nav */}
            <div className="flex items-center justify-between text-[11px] text-white/80 border-b border-white/15 pb-3">
              <span className="font-semibold tracking-tight text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-300" />
                MISEFOOD STUDIO
              </span>
              <div className="flex items-center gap-3 text-[10px] text-white/70">
                <span>URL / Reel</span>
                <span>Vision OCR</span>
                <span>150ml Katori</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-zinc-950 font-medium">
                  Live Parser
                </span>
              </div>
            </div>

            {/* Centerpiece Display */}
            <div className="py-3 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-rose-100 border border-white/20">
                Link, Video &amp; Cookbook Photo Import
              </span>
              <h4 className="text-xl sm:text-2xl font-medium tracking-tight leading-snug text-white max-w-md">
                Turn Any Saved Link or Recipe Card into Exact Katori &amp; Gram
                Measurements.
              </h4>
            </div>

            {/* Bottom Live Normalized Chips */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="rounded-lg bg-black/55 backdrop-blur-md border border-white/15 p-2.5">
                <p className="text-[10px] text-rose-200/80 font-mono">
                  MALAI PANEER
                </p>
                <p className="text-xs font-semibold text-white mt-0.5">
                  1.67 Katori (250g)
                </p>
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  45g Protein • ₹115
                </p>
              </div>
              <div className="rounded-lg bg-black/55 backdrop-blur-md border border-white/15 p-2.5">
                <p className="text-[10px] text-rose-200/80 font-mono">
                  1-CLICK REMIX
                </p>
                <p className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Wand2 className="h-3 w-3 text-amber-300" />
                  Jain / High-P
                </p>
                <p className="text-[10px] text-zinc-300 mt-0.5">
                  Auto-swaps aromatics
                </p>
              </div>
              <div className="rounded-lg bg-black/55 backdrop-blur-md border border-white/15 p-2.5">
                <p className="text-[10px] text-rose-200/80 font-mono">
                  AIR-FRYER MODE
                </p>
                <p className="text-xs font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-rose-300" />
                  200°C • 9 mins
                </p>
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  -65% Oil Reduction
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Base Lip */}
        <div className="mt-2.5 mx-auto h-1.5 w-24 rounded-full bg-zinc-700/70" />
      </div>
    </div>
  );
}

/**
 * Showcase 2 Visual (00:03 - TitanX equivalent):
 * Thick dark tablet bezel displaying dual high-contrast comparison cards
 * with neon magenta/rose progress bars ("Active Prep Overlap" vs "Sequential Cooking").
 */
export function KineticTabletShowcase({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div
      onClick={onLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLaunch();
      }}
      className="cursor-pointer group relative w-full min-h-[360px] sm:min-h-[430px] bg-[#E3E5E8] p-4 sm:p-8 flex items-center justify-center"
    >
      {/* Thick Matte Black Tablet Bezel */}
      <div className="w-full rounded-[26px] bg-[#0B0C0E] p-4 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)] border border-zinc-800 transition-transform duration-500 ease-emil-out group-hover:scale-[1.01]">
        <div className="rounded-2xl bg-[#111317] border border-white/10 p-5 sm:p-6 text-white space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-bold tracking-wider text-white flex items-center gap-1.5">
              <GitMerge className="h-3.5 w-3.5 text-rose-500" />
              COOK TOGETHER
            </span>
            <div className="hidden sm:flex items-center gap-4 text-[10px]">
              <span>Smart Timing</span>
              <span>Active/Passive Overlap</span>
              <span>Multi-Dish Timers</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-semibold">
              Combine 4 Dishes
            </span>
          </div>

          {/* Split Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center pt-1">
            <div className="sm:col-span-5 space-y-3">
              <p className="text-lg sm:text-xl font-normal tracking-tight leading-snug text-zinc-100">
                38% Faster Meal Prep with{" "}
                <span className="font-semibold text-white">
                  SMART STEP OVERLAP
                </span>
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Automatically slots onion/tomato chopping and tadka tempering
                inside pressure-cooker &amp; marination wait windows.
              </p>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-600/90 text-white text-[11px] font-medium">
                Open Combined Timeline →
              </span>
            </div>

            {/* Dual Comparison Cards (Prompts vs Kinetic Overlap) */}
            <div className="sm:col-span-7 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#181A20] border border-white/10 p-3.5 space-y-3">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Sequential Cook</span>
                  <span className="font-mono text-zinc-500">1 Dish / Track</span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-zinc-400">Idle Wait</span>
                    <span className="font-mono text-white font-semibold">
                      42%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-[42%] bg-zinc-500 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5 text-[10px]">
                  <div>
                    <p className="text-zinc-500">Total Time</p>
                    <p className="text-sm font-semibold text-zinc-200 mt-0.5">
                      68m
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Hot Finish</p>
                    <p className="text-sm font-semibold text-zinc-400 mt-0.5">
                      1 of 3
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#1C1520] border border-rose-500/40 p-3.5 space-y-3 shadow-lg shadow-rose-950/30">
                <div className="flex items-center justify-between text-[10px] text-rose-300">
                  <span className="font-semibold">Kinetic DAG</span>
                  <span className="font-mono">Interleaved</span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="text-rose-200">Active Overlap</span>
                    <span className="font-mono text-rose-400 font-semibold">
                      94%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-rose-500 to-amber-400 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-rose-500/20 text-[10px]">
                  <div>
                    <p className="text-rose-200/70">Total Time</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      42m
                    </p>
                  </div>
                  <div>
                    <p className="text-rose-200/70">Hot Finish</p>
                    <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                      All 3 Dishes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Showcase 3 Visual (00:04 - Metapic equivalent):
 * Warm terracotta/coral architectural background with a dark desktop screen
 * and an overlapping coral/pink smartphone mockup in the foreground.
 */
export function ThaliPlannerDualShowcase({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div
      onClick={onLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLaunch();
      }}
      className="cursor-pointer group relative w-full min-h-[360px] sm:min-h-[430px] bg-gradient-to-br from-[#D98A6C] via-[#C86D51] to-[#8C3F2B] p-6 sm:p-10 flex items-center justify-center overflow-hidden"
    >
      {/* Ambient warm sun flare */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-200/25 blur-3xl" />

      {/* Desktop Frame */}
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D0E11] border border-white/15 p-4 sm:p-6 shadow-[0_28px_70px_rgba(0,0,0,0.55)] text-white transition-transform duration-500 ease-emil-out group-hover:-translate-y-1">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/10 pb-3">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-rose-400" />
            misefood planner
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[10px]">
            <span>Composite Thali</span>
            <span>2000 kcal Target</span>
            <span>₹2,500 Budget</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-400/20 text-rose-200 border border-rose-400/30 text-[10px]">
            7-Day Solver
          </span>
        </div>

        <div className="py-6 sm:py-8 text-center space-y-2 max-w-md mx-auto">
          <h4 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Where Macros and Indian Thalis Grow Together
          </h4>
          <p className="text-xs text-zinc-400">
            Rice/Roti + Dal Tadka + Paneer Sabji + Raita balanced to the exact
            rupee &amp; gram.
          </p>
        </div>

        {/* Bottom miniature 4-slot Thali preview */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-left">
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
            <span className="text-[10px] text-amber-300 font-mono">
              MON LUNCH THALI
            </span>
            <p className="text-xs font-medium text-white mt-0.5 truncate">
              Dal + Paneer + Jeera Rice
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              685 kcal • 44g P • ₹175
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
            <span className="text-[10px] text-emerald-300 font-mono">
              WED HIGH-PROTEIN
            </span>
            <p className="text-xs font-medium text-white mt-0.5 truncate">
              Air-Fryer Tikka + Curd
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              620 kcal • 52g P • ₹190
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-2.5">
            <span className="text-[10px] text-sky-300 font-mono">
              WEEKLY BUDGET
            </span>
            <p className="text-xs font-medium text-white mt-0.5">
              ₹1,840 / ₹2,500
            </p>
            <p className="text-[10px] text-emerald-300 mt-0.5">
              Under budget by ₹660
            </p>
          </div>
        </div>

        {/* Overlapping Foreground Coral/Pink Phone Mockup (matching 00:04 center-bottom) */}
        <div className="hidden sm:flex flex-col justify-between w-40 h-44 rounded-t-2xl bg-gradient-to-b from-[#F4A5AE] to-[#E57F8E] text-zinc-950 p-3.5 mx-auto -mb-6 mt-4 shadow-2xl border-2 border-zinc-900 transition-transform duration-500 ease-emil-out group-hover:-translate-y-2">
          <div className="w-8 h-1 rounded-full bg-zinc-900/30 mx-auto" />
          <div className="text-center space-y-1 my-auto">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-900/75">
              DAILY ROLLUP
            </p>
            <p className="text-lg font-bold tracking-tight leading-none">
              134g Protein
            </p>
            <p className="text-[11px] font-medium text-zinc-900/80">
              1,980 kcal • ₹262/day
            </p>
          </div>
          <div className="rounded-lg bg-zinc-950 text-white text-[10px] font-medium py-1.5 text-center">
            Sync Quick Cart
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Showcase 4 Visual (00:05 - AlphaLedger equivalent):
 * Crisp white high-contrast audit dashboard inside a sleek black laptop bezel.
 */
export function PantryCartAuditShowcase({
  onLaunch,
}: {
  onLaunch: () => void;
}) {
  return (
    <div
      onClick={onLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onLaunch();
      }}
      className="cursor-pointer group relative w-full min-h-[360px] sm:min-h-[430px] bg-[#E5E7EB] p-4 sm:p-8 flex items-center justify-center"
    >
      {/* Sleek Black Laptop Bezel with Crisp White Screen */}
      <div className="w-full max-w-xl rounded-[24px] bg-[#0B0C0E] p-3.5 sm:p-5 shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-zinc-800 transition-transform duration-500 ease-emil-out group-hover:-translate-y-1">
        <div className="rounded-xl bg-white text-zinc-950 p-5 sm:p-7 space-y-5">
          {/* Top White Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-xs">
            <span className="font-bold tracking-tight text-zinc-950 flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-zinc-900" />
              Smart Cart
            </span>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-500">
              <span>Fridge Match</span>
              <span>Aisle Grouping</span>
              <span>Barcode Lookup</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-zinc-950 text-white text-[10px] font-medium">
              Shop 4 Apps
            </span>
          </div>

          {/* Center Audit Headline matching "Your Trading Audit" at 00:05 */}
          <div className="text-center space-y-2 py-2">
            <h4 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
              Your Pantry &amp; Cart Audit
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              2 onions (Tue) + 1.5 onions (Fri) automatically merged into 3.5
              onions, subtracted against live fridge stock, and deep-linked to
              10-minute delivery.
            </p>
          </div>

          {/* Quick-Commerce & Pantry Rescue Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[
              {
                name: "Swiggy Instamart",
                meta: "92% Match • ₹410",
                dot: "bg-orange-500",
              },
              {
                name: "Blinkit 10-Min",
                meta: "14 Aisle Items",
                dot: "bg-amber-400",
              },
              {
                name: "Zepto Superfast",
                meta: "Spices & Dairy",
                dot: "bg-purple-600",
              },
              {
                name: "BigBasket Now",
                meta: "Monthly Stock",
                dot: "bg-emerald-600",
              },
            ].map((platform) => (
              <div
                key={platform.name}
                className="rounded-xl bg-[#F6F7F9] border border-zinc-200/80 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${platform.dot}`} />
                  <span className="text-[11px] font-semibold text-zinc-900 truncate">
                    {platform.name}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {platform.meta}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium pt-0.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Deep-link ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
