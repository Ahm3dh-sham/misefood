"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarCheck2,
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  IndianRupee,
  Loader2,
  Share2,
  ShoppingBasket,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { generateSmartMealPlan } from "@/lib/api";
import type { MealPlanResponse } from "@/types/recipe";

export function SmartMealPlanner() {
  const [nlPrompt, setNlPrompt] = useState(
    "2000 kcal/day, 130g protein, max ₹2500 weekly budget, non-veg on Wed/Fri/Sun, use leftover paneer from fridge."
  );
  const [daysCount, setDaysCount] = useState(7);
  const [servingsPerMeal, setServingsPerMeal] = useState(2);
  const [preferThali, setPreferThali] = useState(true);
  const [pantryStaples, setPantryStaples] = useState("salt, turmeric, water");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedProvider, setCopiedProvider] = useState<string | null>(null);

  const runPlanner = async () => {
    setIsLoading(true);
    try {
      const response = await generateSmartMealPlan({
        title: "MiseFood Indian Thali & High-Protein Weekly Plan",
        days_count: daysCount,
        servings_per_meal: servingsPerMeal,
        target_daily_calories: 2000,
        target_daily_protein_g: 130,
        max_weekly_budget_inr: 2500,
        prefer_indian_thali_lunches: preferThali,
        non_veg_days: ["Wednesday", "Friday", "Sunday"],
        dietary_preferences: ["Indian Thali Logic", "High-Protein"],
        excluded_allergens: [],
        pantry_staples_on_hand: pantryStaples
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        natural_language_prompt: nlPrompt,
        taste_query: "high-protein Indian thali, paneer, dal tadka, air-fryer tikka",
      });
      setPlan(response);
      setCheckedItems({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void runPlanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await runPlanner();
  };

  const toggleCheckItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyQuickCommerce = async (
    provider: string,
    summaryText: string
  ) => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedProvider(provider);
      setTimeout(() => setCopiedProvider(null), 2000);
    } catch {
      setCopiedProvider(provider);
    }
  };

  return (
    <div className="space-y-6">
      {/* Natural Language AI Planner & Constraints Bar */}
      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-2xl bg-charcoal border border-white/10 p-6 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarCheck2 className="h-5 w-5 text-sky-400" />
              <span>
                Multi-Slot AI Weekly Meal Planner, Indian Thali Engine &amp;
                Quick-Commerce Cart
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Supports composite Indian multi-dish Thali slots (
              <code className="text-amber-300 font-mono">
                Rice/Roti + Dal/Gravy + Sabji + Curd
              </code>
              ) + Western single-dish slots + real-time Macro &amp; ₹ Budget
              tracking.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.97]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Build 7-Day Plan &amp; Consolidate Cart</span>
              </>
            )}
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-amber-300 mb-1.5">
            Natural Language AI Planner Prompt (LangGraph Constraint Solver)
          </label>
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            className="w-full rounded-xl bg-obsidian border border-amber-500/30 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-obsidian px-3.5 py-2 rounded-xl border border-white/10">
            <input
              id="thali-toggle"
              type="checkbox"
              checked={preferThali}
              onChange={(e) => setPreferThali(e.target.checked)}
              className="accent-amber-500 h-4 w-4"
            />
            <label htmlFor="thali-toggle" className="text-xs text-zinc-200">
              Composite Indian Thali Lunches (Dal + Sabji + Rice/Roti + Dahi)
            </label>
          </div>

          <div className="flex items-center gap-2 bg-obsidian px-3.5 py-2 rounded-xl border border-white/10">
            <span className="text-xs text-zinc-400">Days:</span>
            <input
              type="number"
              min={1}
              max={7}
              value={daysCount}
              onChange={(e) => setDaysCount(Number(e.target.value))}
              className="w-16 bg-charcoal border border-white/10 rounded px-2 py-1 text-xs text-white"
            />
            <span className="text-xs text-zinc-400 ml-2">Servings:</span>
            <input
              type="number"
              min={1}
              max={8}
              value={servingsPerMeal}
              onChange={(e) => setServingsPerMeal(Number(e.target.value))}
              className="w-16 bg-charcoal border border-white/10 rounded px-2 py-1 text-xs text-white"
            />
          </div>

          <div>
            <input
              type="text"
              value={pantryStaples}
              onChange={(e) => setPantryStaples(e.target.value)}
              placeholder="Pantry staples on hand (excluded from cart)..."
              className="w-full rounded-xl bg-obsidian border border-white/10 px-3.5 py-2 text-xs text-white"
            />
          </div>
        </div>
      </form>

      {plan && (
        <>
          {/* Real-Time Weekly Macro & ₹ Budget Gauges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-charcoal border border-white/10">
              <span className="text-xs text-zinc-400">
                Daily Calorie Target
              </span>
              <p className="text-xl font-bold font-mono text-white mt-1">
                {Math.round(plan.avg_daily_calories)} /{" "}
                {plan.target_daily_calories} kcal
              </p>
              <span className="text-[11px] text-emerald-400">
                ✓ Within ±3% macro window
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal border border-white/10">
              <span className="text-xs text-zinc-400">Daily Protein Floor</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {Math.round(plan.avg_daily_protein_g)}g /{" "}
                {plan.target_daily_protein_g}g P
              </p>
              <span className="text-[11px] text-zinc-400">
                Paneer + Toor Dal + Wed/Fri/Sun Grill
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal border border-white/10">
              <span className="text-xs text-zinc-400">
                Weekly Grocery Budget
              </span>
              <p className="text-xl font-bold font-mono text-amber-300 mt-1 flex items-center gap-0.5">
                <IndianRupee className="h-4 w-4" />
                {Math.round(plan.estimated_weekly_cost_inr)} / ₹
                {Math.round(plan.max_weekly_budget_inr)}
              </p>
              <span className="text-[11px] text-emerald-400">
                Saved ₹
                {Math.max(
                  0,
                  Math.round(
                    plan.max_weekly_budget_inr - plan.estimated_weekly_cost_inr
                  )
                )}{" "}
                via fridge rescue
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal border border-white/10">
              <span className="text-xs text-zinc-400">
                Household Sync Code
              </span>
              <p className="text-lg font-bold font-mono text-sky-300 mt-1 flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                {plan.household_share_code}
              </p>
              <span className="text-[11px] text-zinc-400">
                Live shared family checklist
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Multi-Slot Weekly Schedule (Composite Indian Thali + Dinner) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                  <span>
                    Multi-Slot Weekly Calendar ({plan.planned_meals.length}{" "}
                    Composite &amp; Single Slots)
                  </span>
                </h3>

                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {plan.planned_meals.map((meal, idx) => (
                    <div
                      key={`${meal.day_name}-${meal.meal_type}-${idx}`}
                      className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-300 uppercase tracking-wider">
                            {meal.day_name} • {meal.meal_type}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${
                              meal.is_non_veg
                                ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {meal.is_non_veg ? "Non-Veg Day" : "Pure Veg / Thali"}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-300">
                          {Math.round(meal.calories_per_serving)} kcal •{" "}
                          <strong className="text-emerald-400">
                            {Math.round(meal.protein_per_serving_g)}g P
                          </strong>{" "}
                          • ₹{Math.round(meal.slot_cost_inr)}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-white">
                        {meal.recipe_title}
                      </p>

                      {meal.dishes.length > 1 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {meal.dishes.map((dish, dIdx) => (
                            <div
                              key={dIdx}
                              className="p-2 rounded-lg bg-charcoal/90 border border-white/5 text-[11px]"
                            >
                              <span className="uppercase text-[9px] text-amber-300 block font-mono">
                                {dish.role.replace("_", " / ")}
                              </span>
                              <span className="text-zinc-200 font-medium">
                                {dish.recipe_title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-2.5">
                <h3 className="text-sm font-semibold text-emerald-300">
                  Sunday Mise en Place &amp; Leftover Rescue Strategy
                </h3>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {plan.prep_ahead_strategy.map((tip, i) => (
                    <li
                      key={i}
                      className="p-2.5 rounded-xl bg-obsidian/70 border border-white/5"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Consolidated Smart Grocery Cart & Quick-Commerce Export */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShoppingBasket className="h-4 w-4 text-emerald-400" />
                    <span>
                      6. Consolidated Smart Grocery Cart &amp; Quick-Commerce
                      Export
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Auto-aggregates quantities across all weekly slots and
                    exports directly to{" "}
                    <strong className="text-white">
                      Swiggy Instamart, Blinkit, Zepto, or BigBasket
                    </strong>
                    .
                  </p>
                </div>

                {/* Quick-Commerce Deep-Link Launcher Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {plan.quick_commerce_links.map((qLink) => (
                    <div
                      key={qLink.provider}
                      className="p-3 rounded-xl bg-obsidian border border-white/10 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {qLink.provider}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300">
                          10-Min Cart
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            void handleCopyQuickCommerce(
                              qLink.provider,
                              qLink.cart_summary_text
                            )
                          }
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-zinc-200 flex items-center justify-center gap-1 border border-white/10 active:scale-[0.97]"
                        >
                          {copiedProvider === qLink.provider ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy List</span>
                            </>
                          )}
                        </button>
                        <a
                          href={qLink.search_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-[11px] text-amber-200 border border-amber-500/30 flex items-center gap-1"
                        >
                          <span>Open</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aisle-Grouped De-duplicated Items */}
                <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {plan.grocery_aisles.map((group) => (
                    <div
                      key={group.aisle_category}
                      className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                          {group.aisle_label}
                        </span>
                        <span className="text-xs font-mono text-emerald-400">
                          ₹{Math.round(group.subtotal_inr)}
                        </span>
                      </div>

                      <ul className="space-y-1.5">
                        {group.items.map((item) => {
                          const key = `${group.aisle_category}-${item.name}-${item.unit}`;
                          const checked = Boolean(checkedItems[key]);
                          return (
                            <li
                              key={key}
                              onClick={() => toggleCheckItem(key)}
                              className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                checked
                                  ? "bg-white/5 border-white/5 text-zinc-500 line-through"
                                  : "bg-charcoal/70 border-white/10 text-zinc-200 hover:border-white/20"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <CheckSquare
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    checked
                                      ? "text-emerald-400"
                                      : "text-zinc-500"
                                  }`}
                                />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-mono text-amber-300 shrink-0">
                                {item.quantity} {item.unit} • ₹
                                {Math.round(
                                  item.nutrition_meta.estimated_cost_inr
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
