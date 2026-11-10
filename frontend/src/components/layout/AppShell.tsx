"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarRange,
  ChefHat,
  Command,
  Flame,
  GitMerge,
  Mic,
  PackageCheck,
  Scale,
  ScanText,
  Search,
  Sparkles,
  Timer,
} from "lucide-react";
import type { ActiveCookingTimer, Recipe, UnitSystem } from "@/types/recipe";

export type ActiveTab =
  | "hub"
  | "kinetic-prep"
  | "planner"
  | "pantry"
  | "sous-chef"
  | "social";

interface AppShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  unitSystem: UnitSystem;
  onChangeUnitSystem: (sys: UnitSystem) => void;
  onOpenOcrModal: () => void;
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  activeTimers: ActiveCookingTimer[];
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  onSelectTab,
  unitSystem,
  onChangeUnitSystem,
  onOpenOcrModal,
  recipes,
  onSelectRecipe,
  activeTimers,
  children,
}: AppShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");

  // Emil Kowalski rule: Never animate keyboard-initiated command palette toggles (instant response)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      r.cuisine.toLowerCase().includes(cmdQuery.toLowerCase()) ||
      r.ingredients.some((i) =>
        i.name.toLowerCase().includes(cmdQuery.toLowerCase())
      )
  );

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "hub",
      label: "1. Recipe Studio & Remix",
      icon: <Flame className="h-4 w-4 text-amber-400" />,
    },
    {
      id: "planner",
      label: "2. Thali Planner & Cart",
      icon: <CalendarRange className="h-4 w-4 text-sky-400" />,
    },
    {
      id: "kinetic-prep",
      label: "3. Smart Meal Prep DAG",
      icon: <GitMerge className="h-4 w-4 text-purple-400" />,
    },
    {
      id: "sous-chef",
      label: "4. Voice Sous Chef",
      icon: <Mic className="h-4 w-4 text-emerald-400" />,
    },
    {
      id: "pantry",
      label: "5. Pantry & Barcode Rescue",
      icon: <PackageCheck className="h-4 w-4 text-rose-400" />,
    },
    {
      id: "social",
      label: "7. Cookbooks & Communities",
      icon: <BookOpen className="h-4 w-4 text-cyan-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-obsidian text-parchment flex flex-col selection:bg-saffron/30 selection:text-amber-200">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-obsidian/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ChefHat className="h-5 w-5 text-obsidian stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-lg text-white">
                    MiseFood
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Mise + Samsung Food • Indian &amp; Global
                  </span>
                </div>
                <p className="text-xs text-zinc-400 hidden sm:block">
                  Universal Importer • Thali Macro Planner • Kinetic Parallel
                  Prep • Voice Sous Chef • Quick-Commerce Cart
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Global Measurement System Toggle (Indian Katori / Metric / US Imperial) */}
              <div className="flex items-center gap-1 bg-charcoal p-1 rounded-xl border border-white/10 text-xs">
                <Scale className="h-3.5 w-3.5 text-amber-400 ml-1.5 mr-0.5" />
                {(
                  [
                    { id: "indian", label: "Indian (Katori)" },
                    { id: "metric", label: "Metric (g/ml)" },
                    { id: "imperial", label: "US (oz/cup)" },
                  ] as const
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onChangeUnitSystem(u.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors active:scale-[0.97] ${
                      unitSystem === u.id
                        ? "bg-amber-500 text-obsidian font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-charcoal border border-white/10 text-xs text-zinc-400 hover:text-zinc-200 active:scale-[0.97]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300 flex items-center gap-0.5">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </button>

              <button
                type="button"
                onClick={onOpenOcrModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/15 hover:brightness-105 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
              >
                <ScanText className="h-4 w-4 stroke-[2.2]" />
                <span>Import URL / YT / Reel / OCR</span>
              </button>
            </div>
          </div>

          {/* Bento Module Navigation Strip */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 shrink-0 transition-colors duration-150 active:scale-[0.97] ${
                  activeTab === item.id
                    ? "bg-white/12 text-white border border-white/20 shadow-sm"
                    : "bg-charcoal/70 text-zinc-400 hover:text-zinc-200 border border-white/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.id === "sous-chef" && activeTimers.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Timer className="h-2.5 w-2.5" />
                    {activeTimers.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Instant Command Palette (Zero animation on keyboard trigger per Emil's rule) */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-charcoal border border-white/15 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search className="h-4 w-4 text-amber-400" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Jump to recipe, normalized ingredient, or module..."
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setCmdOpen(false)}
                className="text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-400 hover:text-white"
              >
                ESC
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto divide-y divide-white/5">
              <div className="pb-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                  Quick Actions
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    onOpenOcrModal();
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    Import Recipe from URL / YouTube / Instagram Reel / OCR
                  </span>
                  <span className="text-xs text-zinc-500">Universal Importer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCmdOpen(false);
                    onSelectTab("kinetic-prep");
                  }}
                  className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <GitMerge className="h-4 w-4 text-purple-400" />
                    Open Kinetic Loop Multi-Recipe Parallel Timeline
                  </span>
                  <span className="text-xs text-zinc-500">2-4 Dishes</span>
                </button>
              </div>
              <div className="pt-2">
                <p className="px-3 py-1 text-[11px] uppercase tracking-wider text-zinc-500 font-medium">
                  Recipes ({filteredRecipes.length})
                </p>
                {filteredRecipes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      onSelectRecipe(r);
                      setCmdOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg text-left text-sm text-zinc-200 hover:bg-white/5 flex items-center justify-between"
                  >
                    <span className="truncate pr-3">{r.title}</span>
                    <span className="text-xs text-zinc-400 shrink-0">
                      ₹{r.estimated_total_cost_inr} • {r.cuisine}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
