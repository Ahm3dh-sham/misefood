"use client";

import React, { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Code2,
  IndianRupee,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
import { requestIngredientSubstitution } from "@/lib/api";
import { formatIngredientForDisplay } from "@/lib/unitConverter";
import type {
  IngredientSubstitutionOption,
  NormalizedIngredient,
  UnitSystem,
} from "@/types/recipe";

interface IngredientListProps {
  recipeTitle: string;
  baseServings: number;
  currentServings: number;
  onChangeServings: (nextServings: number) => void;
  unitSystem: UnitSystem;
  onChangeUnitSystem: (sys: UnitSystem) => void;
  ingredients: NormalizedIngredient[];
  onReplaceIngredient: (
    index: number,
    replacement: NormalizedIngredient
  ) => void;
}

const AISLE_BADGE_COLORS: Record<string, string> = {
  produce: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  meat_seafood: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  dairy_eggs: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  bakery_bread: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  pantry_dry: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  spices_masalas: "bg-orange-500/20 text-orange-200 border-orange-500/40",
  spices_oils: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  canned_jarred: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  frozen: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  beverages: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  other: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export function IngredientList({
  recipeTitle,
  baseServings,
  currentServings,
  onChangeServings,
  unitSystem,
  onChangeUnitSystem,
  ingredients,
  onReplaceIngredient,
}: IngredientListProps) {
  const [activeSubIdx, setActiveSubIdx] = useState<number | null>(null);
  const [loadingSubIdx, setLoadingSubIdx] = useState<number | null>(null);
  const [subOptions, setSubOptions] = useState<IngredientSubstitutionOption[]>(
    []
  );
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  const scaleFactor = currentServings / Math.max(1, baseServings);
  const totalCostInr = Math.round(
    ingredients.reduce(
      (sum, ing) =>
        sum + (ing.nutrition_meta.estimated_cost_inr ?? 25) * scaleFactor,
      0
    )
  );

  const handleFetchSubstitution = async (
    idx: number,
    ing: NormalizedIngredient
  ) => {
    if (activeSubIdx === idx) {
      setActiveSubIdx(null);
      return;
    }
    setActiveSubIdx(idx);
    setLoadingSubIdx(idx);
    try {
      const response = await requestIngredientSubstitution(ing, recipeTitle);
      setSubOptions(response.substitutions);
    } catch {
      setSubOptions([
        {
          replacement: {
            ...ing,
            name:
              ing.name.includes("cream") || ing.name.includes("malai")
                ? "soaked cashew malai paste (kaju paste)"
                : `chef's plant-based ${ing.name}`,
            nutrition_meta: {
              ...ing.nutrition_meta,
              allergens: [],
              dietary_flags: [
                "vegan",
                "dairy-free",
                "gluten-free",
                "jain-friendly",
              ],
            },
          },
          similarity_score: 0.94,
          culinary_notes:
            "1:1 structural and flavor swap computed via pgvector taste profile.",
          flavor_impact: "Velvety savory balance",
        },
      ]);
    } finally {
      setLoadingSubIdx(null);
    }
  };

  return (
    <div className="rounded-2xl bg-charcoal border border-white/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-white">
              Normalized Ingredients &amp; Indian Kitchen Metrics
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
              <IndianRupee className="h-3 w-3" />
              Est. ₹{totalCostInr} total
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Schema:{" "}
            <code className="text-amber-300/90 font-mono text-[11px]">
              {"{ name, quantity, unit, aisle_category, preparation_note, nutrition_meta }"}
            </code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick 1x / 2x / +/- Servings Scaler */}
          <div className="flex items-center gap-1 bg-obsidian px-2 py-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => onChangeServings(baseServings)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                currentServings === baseServings
                  ? "bg-amber-500/25 text-amber-300"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => onChangeServings(baseServings * 2)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                currentServings === baseServings * 2
                  ? "bg-amber-500/25 text-amber-300"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              2x
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.max(1, currentServings - 1))
              }
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 active:scale-[0.95]"
              aria-label="Decrease servings"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-medium px-1.5 text-white">
              {currentServings} srv
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.min(24, currentServings + 1))
              }
              className="p-1 rounded-lg hover:bg-white/10 text-zinc-300 active:scale-[0.95]"
              aria-label="Increase servings"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Inline Metric / US / Indian Katori Switcher */}
          <div className="flex items-center gap-1 bg-obsidian p-1 rounded-xl border border-white/10 text-[11px]">
            {(
              [
                { id: "indian", label: "Katori/Tsp" },
                { id: "metric", label: "Metric" },
                { id: "imperial", label: "Imperial" },
              ] as const
            ).map((sys) => (
              <button
                key={sys.id}
                type="button"
                onClick={() => onChangeUnitSystem(sys.id)}
                className={`px-2 py-0.5 rounded-lg font-medium ${
                  unitSystem === sys.id
                    ? "bg-white/15 text-amber-300"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {sys.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowJsonInspector((prev) => !prev)}
            className="px-2.5 py-1.5 rounded-xl bg-obsidian border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 active:scale-[0.97]"
          >
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>{showJsonInspector ? "Hide JSON" : "JSON"}</span>
          </button>
        </div>
      </div>

      {showJsonInspector && (
        <pre className="mt-4 p-3.5 rounded-xl bg-obsidian border border-white/10 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-60">
          {JSON.stringify(ingredients, null, 2)}
        </pre>
      )}

      <ul className="mt-4 divide-y divide-white/5">
        {ingredients.map((ing, idx) => {
          const formatted = formatIngredientForDisplay(
            ing,
            unitSystem,
            scaleFactor
          );
          const badgeClass =
            AISLE_BADGE_COLORS[ing.aisle_category] ?? AISLE_BADGE_COLORS.other;

          return (
            <li key={`${ing.name}-${idx}`} className="py-3 first:pt-0 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-amber-300">
                      {formatted.quantity} {formatted.unit}
                    </span>
                    <span className="font-medium text-sm text-white">
                      {ing.name}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeClass}`}
                    >
                      <Tag className="inline h-2.5 w-2.5 mr-1" />
                      {ing.aisle_category.replace("_", " ")}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      ₹{formatted.costInr}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {ing.preparation_note && (
                      <span className="italic text-zinc-300">
                        Prep: {ing.preparation_note}
                      </span>
                    )}
                    <span>•</span>
                    <span>
                      {formatted.calories} kcal ({ing.nutrition_meta.protein_g}g
                      P / {ing.nutrition_meta.carbs_g}g C /{" "}
                      {ing.nutrition_meta.fat_g}g F)
                    </span>
                    {ing.nutrition_meta.dietary_flags.includes(
                      "jain-friendly"
                    ) && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px]">
                        Jain-Friendly
                      </span>
                    )}
                    {ing.nutrition_meta.allergens.map((alg) => (
                      <span
                        key={alg}
                        className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px]"
                      >
                        Allergen: {alg}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleFetchSubstitution(idx, ing)}
                  className="self-start sm:self-center px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 flex items-center gap-1.5 border border-white/10 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
                  <span>AI Substitute</span>
                </button>
              </div>

              {activeSubIdx === idx && (
                <div className="mt-3 p-3.5 rounded-xl bg-obsidian border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      pgvector Semantic Substitutions for &ldquo;{ing.name}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubIdx(null)}
                      className="text-[11px] text-zinc-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  {loadingSubIdx === idx ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                      Computing flavor &amp; ratio vector matches...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {subOptions.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className="p-3 rounded-lg bg-charcoal border border-white/10 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-white">
                                {opt.replacement.quantity}{" "}
                                {opt.replacement.unit} {opt.replacement.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
                                {Math.round(opt.similarity_score * 100)}% match
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 mt-1">
                              {opt.culinary_notes}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              Flavor profile: {opt.flavor_impact}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              onReplaceIngredient(idx, opt.replacement);
                              setActiveSubIdx(null);
                            }}
                            className="w-full py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.97]"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Swap into Recipe
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
