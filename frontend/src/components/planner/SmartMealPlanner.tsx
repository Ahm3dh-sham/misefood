"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  CheckSquare,
  Copy,
  ExternalLink,
  Loader2,
  Share2,
  Sparkles,
} from "lucide-react";
import { generateSmartMealPlan } from "@/lib/api";
import type { MealPlanResponse } from "@/types/recipe";

interface SmartMealPlannerProps {
  initialPrompt?: string;
}

export function SmartMealPlanner({ initialPrompt }: SmartMealPlannerProps) {
  const [nlPrompt, setNlPrompt] = useState(
    initialPrompt ||
      "2000 kcal/day, 130g protein, max ₹2500 weekly budget, non-veg on Wed/Fri/Sun, use leftover paneer from fridge."
  );
  const [daysCount, setDaysCount] = useState(7);
  const [servingsPerMeal, setServingsPerMeal] = useState(2);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(130);
  const [maxBudgetInr, setMaxBudgetInr] = useState(2500);
  const [preferThali, setPreferThali] = useState(true);
  const [pantryStaples, setPantryStaples] = useState("salt, turmeric, water");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlanResponse | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedProvider, setCopiedProvider] = useState<string | null>(null);

  // Sync external prompt if user submitted the concierge form
  useEffect(() => {
    if (initialPrompt && initialPrompt !== nlPrompt) {
      setNlPrompt(initialPrompt);
      void runPlannerWithPrompt(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  const runPlannerWithPrompt = async (promptToUse: string) => {
    setIsLoading(true);
    try {
      // Parse dynamic numbers from prompt if present, else use form inputs
      const kcalMatch = promptToUse.match(/(\d{3,4})\s*kcal/i);
      const protMatch = promptToUse.match(/(\d{2,3})\s*g\s*protein/i);
      const budgetMatch =
        promptToUse.match(/₹\s*(\d{3,5})/i) ??
        promptToUse.match(/(\d{3,5})\s*(?:inr|rs|budget)/i);

      const resolvedKcal = kcalMatch ? Number(kcalMatch[1]) : targetCalories;
      const resolvedProt = protMatch ? Number(protMatch[1]) : targetProtein;
      const resolvedBudget = budgetMatch
        ? Number(budgetMatch[1])
        : maxBudgetInr;

      setTargetCalories(resolvedKcal);
      setTargetProtein(resolvedProt);
      setMaxBudgetInr(resolvedBudget);

      const response = await generateSmartMealPlan({
        title: "Weekly Meal Plan",
        days_count: daysCount,
        servings_per_meal: servingsPerMeal,
        target_daily_calories: resolvedKcal,
        target_daily_protein_g: resolvedProt,
        max_weekly_budget_inr: resolvedBudget,
        prefer_indian_thali_lunches: preferThali,
        non_veg_days: ["Wednesday", "Friday", "Sunday"],
        dietary_preferences: preferThali
          ? ["Indian Thali", "High-Protein"]
          : ["High-Protein"],
        excluded_allergens: [],
        pantry_staples_on_hand: pantryStaples
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        natural_language_prompt: promptToUse,
        taste_query: promptToUse,
      });
      setPlan(response);
      setCheckedItems({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void runPlannerWithPrompt(nlPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await runPlannerWithPrompt(nlPrompt);
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
      {/* Meal Plan Preferences Bar */}
      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-switzer text-xl sm:text-2xl font-medium text-zinc-950">
              Weekly Meal Plan &amp; Grocery List
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Describe your calorie, protein, and weekly budget goals to build a
              balanced schedule and consolidated shopping list.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Planning...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Update Plan</span>
              </>
            )}
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-600 mb-1.5">
            Your weekly goals &amp; preferences
          </label>
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g., 2000 kcal/day, 130g protein, max ₹2500 budget, use leftover paneer..."
            className="w-full rounded-2xl bg-[#F6F6F4] border border-zinc-200 px-4 py-3 text-xs sm:text-sm text-zinc-950 focus:outline-none focus:border-zinc-400"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2.5 bg-[#F6F6F4] px-4 py-2.5 rounded-2xl border border-zinc-200/80">
            <input
              id="thali-toggle"
              type="checkbox"
              checked={preferThali}
              onChange={(e) => setPreferThali(e.target.checked)}
              className="accent-zinc-950 h-4 w-4"
            />
            <label htmlFor="thali-toggle" className="text-xs text-zinc-700">
              Multi-dish Indian Thali lunches (Dal + Sabji + Rice + Curd)
            </label>
          </div>

          <div className="flex items-center gap-3 bg-[#F6F6F4] px-4 py-2.5 rounded-2xl border border-zinc-200/80">
            <label className="text-xs text-zinc-500 flex items-center gap-1.5">
              <span>Days</span>
              <input
                type="number"
                min={1}
                max={7}
                value={daysCount}
                onChange={(e) => setDaysCount(Number(e.target.value))}
                className="w-12 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-950"
              />
            </label>
            <label className="text-xs text-zinc-500 flex items-center gap-1.5">
              <span>Servings</span>
              <input
                type="number"
                min={1}
                max={8}
                value={servingsPerMeal}
                onChange={(e) => setServingsPerMeal(Number(e.target.value))}
                className="w-12 bg-white border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-950"
              />
            </label>
          </div>

          <div>
            <input
              type="text"
              value={pantryStaples}
              onChange={(e) => setPantryStaples(e.target.value)}
              placeholder="Staples already at home (e.g. salt, turmeric)..."
              className="w-full h-full rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 px-4 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none"
            />
          </div>
        </div>
      </form>

      {plan && (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-[24px] bg-white border border-zinc-200/80">
              <span className="text-xs text-zinc-500">Daily Calories</span>
              <p className="font-switzer text-2xl font-medium text-zinc-950 mt-1">
                {Math.round(plan.avg_daily_calories)}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  / {plan.target_daily_calories} kcal
                </span>
              </p>
            </div>

            <div className="p-5 rounded-[24px] bg-white border border-zinc-200/80">
              <span className="text-xs text-zinc-500">Daily Protein</span>
              <p className="font-switzer text-2xl font-medium text-zinc-950 mt-1">
                {Math.round(plan.avg_daily_protein_g)}g{" "}
                <span className="text-sm font-normal text-zinc-400">
                  / {plan.target_daily_protein_g}g
                </span>
              </p>
            </div>

            <div className="p-5 rounded-[24px] bg-white border border-zinc-200/80">
              <span className="text-xs text-zinc-500">Weekly Est. Cost</span>
              <p className="font-switzer text-2xl font-medium text-[#C85A32] mt-1">
                ₹{Math.round(plan.estimated_weekly_cost_inr)}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  / ₹{Math.round(plan.max_weekly_budget_inr)}
                </span>
              </p>
            </div>

            <div className="p-5 rounded-[24px] bg-white border border-zinc-200/80">
              <span className="text-xs text-zinc-500">Household Share Code</span>
              <p className="font-mono text-lg font-semibold text-zinc-950 mt-1.5 flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-zinc-400" />
                {plan.household_share_code}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Weekly Meal Schedule */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
                <h3 className="font-switzer text-lg font-medium text-zinc-950">
                  7-Day Schedule
                </h3>

                <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                  {plan.planned_meals.map((meal, idx) => (
                    <div
                      key={`${meal.day_name}-${meal.meal_type}-${idx}`}
                      className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 uppercase tracking-wider">
                            {meal.day_name} • {meal.meal_type}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600">
                            {meal.is_non_veg ? "Non-Veg" : "Vegetarian"}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-500">
                          {Math.round(meal.calories_per_serving)} kcal •{" "}
                          <strong className="text-zinc-900">
                            {Math.round(meal.protein_per_serving_g)}g protein
                          </strong>{" "}
                          • ₹{Math.round(meal.slot_cost_inr)}
                        </span>
                      </div>

                      <p className="font-switzer text-sm font-medium text-zinc-950">
                        {meal.recipe_title}
                      </p>

                      {meal.dishes.length > 1 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {meal.dishes.map((dish, dIdx) => (
                            <div
                              key={dIdx}
                              className="p-2.5 rounded-xl bg-white border border-zinc-200/70 text-[11px]"
                            >
                              <span className="uppercase text-[9px] text-[#C85A32] block font-mono">
                                {dish.role.replace("_", " / ")}
                              </span>
                              <span className="text-zinc-800 font-medium">
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

              <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-3">
                <h3 className="font-switzer text-base font-medium text-zinc-950">
                  Prep-Ahead Notes
                </h3>
                <ul className="space-y-2 text-xs text-zinc-600">
                  {plan.prep_ahead_strategy.map((tip, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl bg-[#F6F6F4] border border-zinc-200/70 leading-relaxed"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Consolidated Grocery List */}
            <div className="lg:col-span-6 space-y-5">
              <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
                <div>
                  <h3 className="font-switzer text-lg font-medium text-zinc-950">
                    Shopping List
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Combined across all meals for the week and grouped by aisle.
                  </p>
                </div>

                {/* Quick-Commerce Export Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {plan.quick_commerce_links.map((qLink) => (
                    <div
                      key={qLink.provider}
                      className="p-3.5 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-950">
                          {qLink.provider}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-500">
                          10m Delivery
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
                          className="flex-1 py-1.5 px-2.5 rounded-full bg-white hover:bg-zinc-100 text-[11px] text-zinc-800 flex items-center justify-center gap-1 border border-zinc-200 active:scale-[0.97]"
                        >
                          {copiedProvider === qLink.provider ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <a
                          href={qLink.search_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-[11px] text-white flex items-center gap-1"
                        >
                          <span>Order</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aisle-Grouped Items */}
                <div className="grid grid-cols-1 gap-3 max-h-[460px] overflow-y-auto pr-1">
                  {plan.grocery_aisles.map((group) => (
                    <div
                      key={group.aisle_category}
                      className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-700">
                          {group.aisle_label}
                        </span>
                        <span className="text-xs font-mono text-zinc-500">
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
                              className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                                checked
                                  ? "bg-zinc-100 border-zinc-200/60 text-zinc-400 line-through"
                                  : "bg-white border-zinc-200/80 text-zinc-900 hover:border-zinc-300"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <CheckSquare
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    checked
                                      ? "text-emerald-600"
                                      : "text-zinc-300"
                                  }`}
                                />
                                <span>{item.name}</span>
                              </span>
                              <span className="font-mono text-zinc-600 shrink-0">
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
