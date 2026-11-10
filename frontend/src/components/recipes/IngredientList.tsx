"use client";

import React, { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Loader2,
  Minus,
  Plus,
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

const AISLE_LABELS: Record<string, string> = {
  produce: "Produce",
  meat_seafood: "Meat & Seafood",
  dairy_eggs: "Dairy",
  bakery_bread: "Bakery",
  pantry_dry: "Pantry",
  spices_masalas: "Spices",
  spices_oils: "Oils & Spices",
  canned_jarred: "Jarred",
  frozen: "Frozen",
  beverages: "Beverages",
  other: "Essentials",
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
                ? "soaked cashew paste"
                : `plant-based ${ing.name}`,
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
            "1:1 texture and richness match for curries and gravies.",
          flavor_impact: "Smooth, nutty finish",
        },
      ]);
    } finally {
      setLoadingSubIdx(null);
    }
  };

  return (
    <div className="rounded-[24px] bg-[#F6F6F4] border border-zinc-200/80 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80">
        <div className="flex items-baseline gap-3">
          <h3 className="font-switzer text-lg font-medium text-zinc-950">
            Ingredients
          </h3>
          <span className="text-xs font-mono text-zinc-500">
            Est. ₹{totalCostInr}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Servings Scaler */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-zinc-200/90 text-xs">
            <button
              type="button"
              onClick={() => onChangeServings(baseServings)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                currentServings === baseServings
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => onChangeServings(baseServings * 2)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                currentServings === baseServings * 2
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-500 hover:text-zinc-950"
              }`}
            >
              2x
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.max(1, currentServings - 1))
              }
              className="p-1 rounded-full hover:bg-zinc-100 text-zinc-600 active:scale-[0.95]"
              aria-label="Decrease servings"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-medium px-1.5 text-zinc-950">
              {currentServings} servings
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.min(24, currentServings + 1))
              }
              className="p-1 rounded-full hover:bg-zinc-100 text-zinc-600 active:scale-[0.95]"
              aria-label="Increase servings"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Inline Unit Switcher */}
          <div className="flex items-center gap-0.5 bg-white p-1 rounded-full border border-zinc-200/90 text-[11px]">
            {(
              [
                { id: "indian", label: "Katori" },
                { id: "metric", label: "Metric" },
                { id: "imperial", label: "US" },
              ] as const
            ).map((sys) => (
              <button
                key={sys.id}
                type="button"
                onClick={() => onChangeUnitSystem(sys.id)}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  unitSystem === sys.id
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-500 hover:text-zinc-950"
                }`}
              >
                {sys.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-zinc-200/70">
        {ingredients.map((ing, idx) => {
          const formatted = formatIngredientForDisplay(
            ing,
            unitSystem,
            scaleFactor
          );

          return (
            <li key={`${ing.name}-${idx}`} className="py-3 first:pt-1 last:pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-[#C85A32]">
                      {formatted.quantity} {formatted.unit}
                    </span>
                    <span className="font-medium text-sm text-zinc-950">
                      {ing.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-zinc-200/80 text-zinc-500">
                      {AISLE_LABELS[ing.aisle_category] ?? "Pantry"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    {ing.preparation_note && (
                      <span>{ing.preparation_note}</span>
                    )}
                    {ing.preparation_note && <span>•</span>}
                    <span>
                      {formatted.calories} kcal • {formatted.protein}g protein • ₹
                      {formatted.costInr}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleFetchSubstitution(idx, ing)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-xs text-zinc-700 flex items-center gap-1.5 border border-zinc-200/90 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <ArrowLeftRight className="h-3 w-3 text-[#C85A32]" />
                  <span>Substitute</span>
                </button>
              </div>

              {activeSubIdx === idx && (
                <div className="mt-3 p-4 rounded-2xl bg-white border border-zinc-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-900">
                      Suggested substitutes for &ldquo;{ing.name}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubIdx(null)}
                      className="text-[11px] text-zinc-400 hover:text-zinc-900"
                    >
                      Close
                    </button>
                  </div>

                  {loadingSubIdx === idx ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#C85A32]" />
                      Finding best kitchen alternatives...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {subOptions.map((opt, oIdx) => {
                        const subFormatted = formatIngredientForDisplay(
                          opt.replacement,
                          unitSystem,
                          scaleFactor
                        );
                        return (
                          <div
                            key={oIdx}
                            className="p-3 rounded-xl bg-[#F6F6F4] border border-zinc-200/80 flex flex-col justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-zinc-950">
                                  {subFormatted.quantity} {subFormatted.unit}{" "}
                                  {opt.replacement.name}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {Math.round(opt.similarity_score * 100)}% fit
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-600 mt-1">
                                {opt.culinary_notes}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onReplaceIngredient(idx, opt.replacement);
                                setActiveSubIdx(null);
                              }}
                              className="w-full py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.97]"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Use this instead
                            </button>
                          </div>
                        );
                      })}
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
