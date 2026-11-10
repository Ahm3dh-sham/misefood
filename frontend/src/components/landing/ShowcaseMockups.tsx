"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  ExternalLink,
  Flame,
  GitMerge,
  Scale,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

/**
 * Feature Row 1 Working UI Mockup:
 * Universal Link, Reel & Photo Importer + Katori Scaling + 1-Click Dietary Remix.
 * Built with real working interactive controls on the #f1f3e6 / #e9eade / #3f6212 system.
 */
export function ImporterFeatureMockup({
  onLaunch,
  onOpenImporter,
}: {
  onLaunch: () => void;
  onOpenImporter: () => void;
}) {
  const [unit, setUnit] = useState<"katori" | "metric" | "us">("katori");
  const [dietMode, setDietMode] = useState<
    "original" | "high_protein" | "jain" | "air_fryer"
  >("original");

  const rows = [
    {
      name:
        dietMode === "high_protein"
          ? "Low-Fat Malai Paneer + Soya Granules"
          : "Fresh Malai Paneer (cubed)",
      qty:
        unit === "katori"
          ? dietMode === "high_protein"
            ? "2.2 katori"
            : "1.67 katori"
          : unit === "metric"
            ? dietMode === "high_protein"
              ? "330 g"
              : "250 g"
            : dietMode === "high_protein"
              ? "11.6 oz"
              : "8.8 oz",
      meta:
        dietMode === "high_protein"
          ? "62g Protein • ₹145"
          : "45g Protein • ₹115",
      aisle: "Dairy & Paneer",
    },
    {
      name:
        dietMode === "jain"
          ? "Asafoetida (Hing) & Ginger-Fennel Paste"
          : "Charred Red Onion & Garlic Paste",
      qty:
        unit === "katori"
          ? "0.5 katori"
          : unit === "metric"
            ? "75 g"
            : "0.33 cup",
      meta:
        dietMode === "jain"
          ? "No Onion-Garlic • ₹18"
          : "Aromatic Base • ₹22",
      aisle: dietMode === "jain" ? "Spices & Masalas" : "Produce",
    },
    {
      name:
        dietMode === "air_fryer"
          ? "Cold-Pressed Mustard Oil Spray (-65%)"
          : "Cultured Cow Ghee (for Tadka)",
      qty:
        unit === "katori"
          ? dietMode === "air_fryer"
            ? "1 tsp"
            : "2 tbsp"
          : unit === "metric"
            ? dietMode === "air_fryer"
              ? "5 ml"
              : "30 ml"
            : dietMode === "air_fryer"
              ? "0.17 fl oz"
              : "1 fl oz",
      meta:
        dietMode === "air_fryer"
          ? "45 kcal • 200°C 9m"
          : "240 kcal • Dhungar",
      aisle: "Dairy & Oils",
    },
  ];

  return (
    <div className="rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] p-5 sm:p-6 space-y-5">
      {/* Top Interactive Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d3d4c8]">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#3f6212]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
            Normalized Recipe Schema
          </span>
        </div>

        {/* Working Unit Switcher */}
        <div
          role="group"
          aria-label="Preview unit system"
          className="inline-flex items-center rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-0.5 text-xs"
        >
          {(
            [
              { id: "katori", label: "150ml Katori" },
              { id: "metric", label: "Metric (g)" },
              { id: "us", label: "US Cup" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setUnit(item.id)}
              className={`btn-press px-2.5 py-1 rounded-[6px] font-medium ${
                unit === item.id
                  ? "bg-[#3f6212] text-[#fcfcfd]"
                  : "text-[#333333] hover:text-[#000000]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 1-Click Dietary Adaptation Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[#4d4c4c]">
          <span className="flex items-center gap-1.5 font-medium text-[#333333]">
            <Sparkles className="h-3.5 w-3.5 text-[#3f6212]" />
            Click a dietary mode to preview live ingredient &amp; macro adaptation:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "original", label: "Classic Dhaba" },
              { id: "high_protein", label: "High-Protein (+40%)" },
              { id: "jain", label: "Jain (No Onion-Garlic)" },
              { id: "air_fryer", label: "Air-Fryer (-65% Oil)" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setDietMode(mode.id)}
              className={`btn-press px-3 py-1.5 rounded-full text-xs font-medium border ${
                dietMode === mode.id
                  ? "bg-[#3f6212] text-[#fcfcfd] border-[#3f6212]"
                  : "bg-[#e9eade] text-[#000000] border-[#d3d4c8] hover:border-[#3f6212]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Ingredient Rows */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.name}
            className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] px-3.5 py-2.5 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium text-[#000000]">{row.name}</p>
              <p className="text-xs text-[#4d4c4c]">
                Aisle: {row.aisle} • {row.meta}
              </p>
            </div>
            <span className="px-3 py-1 rounded-[6px] bg-[#f1f3e6] border border-[#d3d4c8] font-mono text-xs font-semibold text-[#000000] tabular-nums shrink-0">
              {row.qty}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#d3d4c8] text-xs">
        <span className="text-[#4d4c4c]">
          Parsed from Instagram Reel + Handwritten Masala Card
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenImporter}
            className="btn-press px-3 py-1.5 rounded-full bg-[#e9eade] border border-[#d3d4c8] text-[#000000] font-medium"
          >
            Import Your Own Link
          </button>
          <button
            type="button"
            onClick={onLaunch}
            className="btn-press px-3.5 py-1.5 rounded-full bg-[#3f6212] text-[#fcfcfd] font-medium"
          >
            Open in Studio →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature Row 2 Working UI Mockup:
 * Multi-Dish Parallel Cooking Timeline (Active Prep vs. Passive Simmer Gantt UI).
 */
export function ParallelTimelineFeatureMockup({
  onLaunch,
  onStartQuickTimer,
}: {
  onLaunch: () => void;
  onStartQuickTimer?: (label: string, seconds: number, stepNum: number) => void;
}) {
  const [mode, setMode] = useState<"parallel" | "sequential">("parallel");
  const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);

  const tracks = [
    {
      dish: "Smoke-Infused Dal Tadka",
      step: "Pressure-cook Toor Dal (3 whistles)",
      kind: "Passive Simmer",
      window: mode === "parallel" ? "00m – 16m" : "00m – 24m",
      leftPct: 0,
      widthPct: mode === "parallel" ? 45 : 35,
      seconds: 720,
      note: "Hands-free pressure cooker window — use this 12m slot to marinate and cube paneer.",
    },
    {
      dish: "Air-Fryer Malai Paneer Tikka",
      step: "Dice paneer & whisk hung-curd marinade",
      kind: "Active Prep (Overlapped)",
      window: mode === "parallel" ? "03m – 14m" : "24m – 48m",
      leftPct: mode === "parallel" ? 10 : 35,
      widthPct: mode === "parallel" ? 34 : 35,
      seconds: 540,
      note: "Scheduled directly inside the Dal pressure-cooking wait window — saves 14 minutes.",
    },
    {
      dish: "Jeera Basmati Rice + Tadka Finish",
      step: "Soak rice, air-fry tikka at 200°C & temper ghee tadka",
      kind: "Synchronized Hot Finish",
      window: mode === "parallel" ? "16m – 42m" : "48m – 68m",
      leftPct: mode === "parallel" ? 42 : 70,
      widthPct: mode === "parallel" ? 58 : 30,
      seconds: 600,
      note: "All 3 dishes complete between minute 40 and 42 so every bowl hits the table piping hot.",
    },
  ];

  const activeTrack = tracks[selectedTrackIdx] ?? tracks[0]!;

  return (
    <div className="rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] p-5 sm:p-6 space-y-5">
      {/* Header & Mode Comparison Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d3d4c8]">
        <div className="flex items-center gap-2">
          <GitMerge className="h-4 w-4 text-[#3f6212]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
            3-Dish Parallel Prep Schedule
          </span>
        </div>

        <div className="inline-flex items-center rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("parallel")}
            className={`btn-press px-2.5 py-1 rounded-[6px] font-medium tabular-nums ${
              mode === "parallel"
                ? "bg-[#3f6212] text-[#fcfcfd]"
                : "text-[#333333] hover:text-[#000000]"
            }`}
          >
            Parallel (42m • All Hot)
          </button>
          <button
            type="button"
            onClick={() => setMode("sequential")}
            className={`btn-press px-2.5 py-1 rounded-[6px] font-medium tabular-nums ${
              mode === "sequential"
                ? "bg-[#3f6212] text-[#fcfcfd]"
                : "text-[#333333] hover:text-[#000000]"
            }`}
          >
            Sequential (68m)
          </button>
        </div>
      </div>

      {/* Time Ruler */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#4d4c4c] px-1 tabular-nums">
        <span>0m</span>
        <span>10m</span>
        <span>20m</span>
        <span>30m</span>
        <span>{mode === "parallel" ? "42m (Hot Finish)" : "68m"}</span>
      </div>

      {/* Interactive Gantt Bars */}
      <div className="space-y-2.5">
        {tracks.map((track, idx) => {
          const isSelected = idx === selectedTrackIdx;
          return (
            <button
              key={track.dish}
              type="button"
              onClick={() => setSelectedTrackIdx(idx)}
              className={`btn-press w-full text-left rounded-[8px] p-3 border transition-colors ${
                isSelected
                  ? "bg-[#e9eade] border-[#3f6212]"
                  : "bg-[#e9eade]/60 border-[#d3d4c8] hover:border-[#3f6212]/60"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#000000]">
                  {track.dish}
                </span>
                <span className="font-mono text-[#333333] tabular-nums">
                  {track.window} • {track.kind}
                </span>
              </div>
              <div className="w-full h-6 rounded-[6px] bg-[#f1f3e6] border border-[#d3d4c8] relative overflow-hidden">
                <div
                  style={{
                    marginLeft: `${track.leftPct}%`,
                    width: `${track.widthPct}%`,
                  }}
                  className={`h-full px-2.5 flex items-center text-[11px] font-medium truncate transition-all duration-200 ${
                    idx === 0
                      ? "bg-[#d3d4c8] text-[#000000]"
                      : "bg-[#3f6212] text-[#fcfcfd]"
                  }`}
                >
                  {track.step}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Track Detail & Live Timer Trigger */}
      <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-3.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#333333] max-w-md">{activeTrack.note}</p>
        <div className="flex items-center gap-2">
          {onStartQuickTimer && (
            <button
              type="button"
              onClick={() =>
                onStartQuickTimer(
                  `${activeTrack.dish}: ${activeTrack.step}`,
                  activeTrack.seconds,
                  selectedTrackIdx + 1
                )
              }
              className="btn-press px-3 py-1.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-xs font-medium text-[#000000] inline-flex items-center gap-1.5"
            >
              <Clock className="h-3.5 w-3.5 text-[#3f6212]" />
              <span>Start {Math.round(activeTrack.seconds / 60)}m Timer</span>
            </button>
          )}
          <button
            type="button"
            onClick={onLaunch}
            className="btn-press px-3.5 py-1.5 rounded-full bg-[#3f6212] text-[#fcfcfd] text-xs font-medium"
          >
            Open Full Scheduler →
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature Row 3 Working UI Mockup:
 * Multi-Slot Indian Thali Planner & 10-Min Quick-Commerce Grocery Cart.
 */
export function ThaliAndCartFeatureMockup({
  onLaunchPlanner,
  onLaunchPantry,
}: {
  onLaunchPlanner: () => void;
  onLaunchPantry: () => void;
}) {
  const [view, setView] = useState<"thali" | "cart">("thali");
  const [checkedItems, setCheckedItems] = useState<string[]>([
    "Cumin Seeds (Jeera) — 2 tbsp (Already in Pantry)",
  ]);

  const toggleItem = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] p-5 sm:p-6 space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d3d4c8]">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[#3f6212]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#000000]">
            Thali Macro Solver &amp; Grocery Cart
          </span>
        </div>

        <div className="inline-flex items-center rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setView("thali")}
            className={`btn-press px-2.5 py-1 rounded-[6px] font-medium ${
              view === "thali"
                ? "bg-[#3f6212] text-[#fcfcfd]"
                : "text-[#333333] hover:text-[#000000]"
            }`}
          >
            4-Slot Thali Plate
          </button>
          <button
            type="button"
            onClick={() => setView("cart")}
            className={`btn-press px-2.5 py-1 rounded-[6px] font-medium ${
              view === "cart"
                ? "bg-[#3f6212] text-[#fcfcfd]"
                : "text-[#333333] hover:text-[#000000]"
            }`}
          >
            10-Min Grocery Cart
          </button>
        </div>
      </div>

      {view === "thali" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                slot: "Slot 1 • Dal / Gravy",
                dish: "Smoke-Infused Yellow Dal Tadka",
                stats: "1.0 katori • 14g Protein • ₹48",
              },
              {
                slot: "Slot 2 • High-Protein Sabji",
                dish: "Air-Fryer Malai Paneer Tikka",
                stats: "1.67 katori • 45g Protein • ₹115",
              },
              {
                slot: "Slot 3 • Grain / Bread",
                dish: "2 Phulka Rotis + Jeera Basmati",
                stats: "1.0 katori • 8g Protein • ₹24",
              },
              {
                slot: "Slot 4 • Probiotic / Raita",
                dish: "Roasted Cumin Boondi Raita",
                stats: "0.75 katori • 7g Protein • ₹22",
              },
            ].map((s) => (
              <div
                key={s.slot}
                className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-3.5 space-y-1"
              >
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#3f6212] font-semibold">
                  {s.slot}
                </span>
                <p className="text-sm font-semibold text-[#000000]">{s.dish}</p>
                <p className="text-xs text-[#4d4c4c] tabular-nums">{s.stats}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 tabular-nums">
              <span className="font-semibold text-[#000000]">
                Plate Total: 74g Protein
              </span>
              <span className="text-[#333333]">780 kcal</span>
              <span className="font-mono font-semibold text-[#3f6212]">
                ₹209 / Thali
              </span>
            </div>
            <button
              type="button"
              onClick={onLaunchPlanner}
              className="btn-press px-3.5 py-1.5 rounded-full bg-[#3f6212] text-[#fcfcfd] font-medium"
            >
              Plan Full 7-Day Week →
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {[
              {
                label: "Fresh Malai Paneer — 500 g (Tue + Fri combined)",
                cost: "₹230",
                query: "fresh malai paneer 500g",
              },
              {
                label: "Unpolished Toor Dal — 500 g",
                cost: "₹95",
                query: "toor dal 500g",
              },
              {
                label: "Cumin Seeds (Jeera) — 2 tbsp (Already in Pantry)",
                cost: "₹0 (Saved)",
                query: "cumin seeds jeera",
              },
            ].map((item) => {
              const checked = checkedItems.includes(item.label);
              return (
                <div
                  key={item.label}
                  className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] px-3.5 py-2.5 flex items-center justify-between gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleItem(item.label)}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <span
                      className={`h-4 w-4 rounded-[4px] border flex items-center justify-center ${
                        checked
                          ? "bg-[#3f6212] border-[#3f6212] text-[#fcfcfd]"
                          : "bg-[#f1f3e6] border-[#4d4c4c]"
                      }`}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-medium ${
                        checked
                          ? "line-through text-[#4d4c4c]"
                          : "text-[#000000]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                  <span className="font-mono text-xs font-semibold text-[#333333] tabular-nums shrink-0">
                    {item.cost}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  name: "Swiggy Instamart",
                  url: "https://www.swiggy.com/instamart/search?custom_back=true&query=malai+paneer",
                },
                {
                  name: "Blinkit",
                  url: "https://blinkit.com/s/?q=malai+paneer",
                },
                {
                  name: "Zepto",
                  url: "https://www.zeptonow.com/search?query=malai+paneer",
                },
                {
                  name: "BigBasket",
                  url: "https://www.bigbasket.com/ps/?q=malai+paneer",
                },
              ].map((store) => (
                <a
                  key={store.name}
                  href={store.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-press px-2.5 py-1.5 rounded-full bg-[#e9eade] border border-[#d3d4c8] hover:border-[#3f6212] text-[#000000] font-medium inline-flex items-center gap-1"
                >
                  <ShoppingCart className="h-3 w-3 text-[#3f6212]" />
                  <span>{store.name}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-[#4d4c4c]" />
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={onLaunchPantry}
              className="btn-press px-3.5 py-1.5 rounded-full bg-[#3f6212] text-[#fcfcfd] font-medium"
            >
              Open Pantry &amp; Cart →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
