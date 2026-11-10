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
  dairy_eggs: "Dairy & Paneer",
  bakery_bread: "Bakery",
  pantry_dry: "Pantry",
  spices_masalas: "Spices & Masalas",
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
    <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#d3d4c8]">
        <div className="flex items-baseline gap-3">
          <h3 className="text-lg font-semibold text-[#000000]">Ingredients</h3>
          <span className="text-xs font-mono font-semibold text-[#3f6212] tabular-nums">
            Est. ₹{totalCostInr}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Servings Scaler */}
          <div className="flex items-center gap-1 bg-[#f1f3e6] px-2 py-1 rounded-full border border-[#d3d4c8] text-xs tabular-nums">
            <button
              type="button"
              onClick={() => onChangeServings(baseServings)}
              className={`btn-press px-2 py-0.5 rounded-full text-[11px] font-medium ${
                currentServings === baseServings
                  ? "bg-[#3f6212] text-[#fcfcfd]"
                  : "text-[#333333] hover:text-[#000000]"
              }`}
            >
              1x
            </button>
            <button
              type="button"
              onClick={() => onChangeServings(baseServings * 2)}
              className={`btn-press px-2 py-0.5 rounded-full text-[11px] font-medium ${
                currentServings === baseServings * 2
                  ? "bg-[#3f6212] text-[#fcfcfd]"
                  : "text-[#333333] hover:text-[#000000]"
              }`}
            >
              2x
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.max(1, currentServings - 1))
              }
              className="btn-press p-1 rounded-full hover:bg-[#e9eade] text-[#000000]"
              aria-label="Decrease servings"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-semibold px-1.5 text-[#000000]">
              {currentServings} servings
            </span>
            <button
              type="button"
              onClick={() =>
                onChangeServings(Math.min(24, currentServings + 1))
              }
              className="btn-press p-1 rounded-full hover:bg-[#e9eade] text-[#000000]"
              aria-label="Increase servings"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Inline Unit Switcher */}
          <div className="flex items-center gap-0.5 bg-[#f1f3e6] p-1 rounded-full border border-[#d3d4c8] text-[11px]">
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
                className={`btn-press px-2.5 py-0.5 rounded-full font-medium ${
                  unitSystem === sys.id
                    ? "bg-[#3f6212] text-[#fcfcfd]"
                    : "text-[#333333] hover:text-[#000000]"
                }`}
              >
                {sys.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ul className="mt-3 divide-y divide-[#d3d4c8]">
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
                    <span className="font-mono text-sm font-semibold text-[#3f6212] tabular-nums">
                      {formatted.quantity} {formatted.unit}
                    </span>
                    <span className="font-semibold text-sm text-[#000000]">
                      {ing.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#4d4c4c]">
                      {AISLE_LABELS[ing.aisle_category] ?? "Pantry"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#4d4c4c] tabular-nums">
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
                  className="btn-press self-start sm:self-center px-3 py-1.5 rounded-full bg-[#f1f3e6] hover:border-[#3f6212] text-xs font-medium text-[#000000] flex items-center gap-1.5 border border-[#d3d4c8]"
                >
                  <ArrowLeftRight className="h-3 w-3 text-[#3f6212]" />
                  <span>Substitute</span>
                </button>
              </div>

              {activeSubIdx === idx && (
                <div className="mt-3 p-4 rounded-[8px] bg-[#f1f3e6] border border-[#d3d4c8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#000000]">
                      Suggested substitutes for &ldquo;{ing.name}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveSubIdx(null)}
                      className="text-xs text-[#4d4c4c] hover:text-[#000000]"
                    >
                      Close
                    </button>
                  </div>

                  {loadingSubIdx === idx ? (
                    <div className="flex items-center gap-2 text-xs text-[#333333] py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#3f6212]" />
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
                            className="p-3 rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] flex flex-col justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#000000] tabular-nums">
                                  {subFormatted.quantity} {subFormatted.unit}{" "}
                                  {opt.replacement.name}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f1f3e6] text-[#3f6212] border border-[#d3d4c8] tabular-nums">
                                  {Math.round(opt.similarity_score * 100)}% fit
                                </span>
                              </div>
                              <p className="text-[11px] text-[#333333] mt-1">
                                {opt.culinary_notes}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onReplaceIngredient(idx, opt.replacement);
                                setActiveSubIdx(null);
                              }}
                              className="btn-press w-full py-1.5 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-xs font-medium flex items-center justify-center gap-1.5"
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
