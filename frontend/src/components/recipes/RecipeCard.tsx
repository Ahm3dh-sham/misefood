"use client";

import React from "react";
import { Clock, GitFork, Heart, Utensils } from "lucide-react";
import type { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
  onStartCooking: (recipe: Recipe) => void;
}

export function RecipeCard({
  recipe,
  isSelected,
  onSelect,
  onStartCooking,
}: RecipeCardProps) {
  const totalCalories = Math.round(
    recipe.ingredients.reduce(
      (acc, ing) => acc + ing.nutrition_meta.calories_kcal,
      0
    ) / Math.max(1, recipe.servings)
  );
  const totalProtein = Math.round(
    recipe.ingredients.reduce(
      (acc, ing) => acc + ing.nutrition_meta.protein_g,
      0
    ) / Math.max(1, recipe.servings)
  );

  return (
    <div
      onClick={() => onSelect(recipe)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(recipe);
        }
      }}
      className={`group cursor-pointer rounded-[8px] p-4 border transition-colors ${
        isSelected
          ? "bg-[#e9eade] border-[#3f6212]"
          : "bg-[#e9eade]/70 border-[#d3d4c8] hover:border-[#3f6212]/70"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#333333]">
          {recipe.cuisine}
        </span>
        <span className="text-[11px] font-mono font-semibold text-[#3f6212] tabular-nums">
          ₹{Math.round(recipe.estimated_total_cost_inr)}
        </span>
      </div>

      <h3 className="font-semibold text-base text-[#000000] group-hover:text-[#3f6212] transition-colors line-clamp-2">
        {recipe.title}
      </h3>
      <p className="text-xs text-[#333333] mt-1 line-clamp-2 leading-relaxed">
        {recipe.description}
      </p>

      {recipe.remix_note && (
        <div className="mt-2.5 px-2.5 py-1 rounded-[6px] bg-[#f1f3e6] border border-[#d3d4c8] text-[11px] text-[#3f6212] font-medium flex items-center gap-1.5">
          <GitFork className="h-3 w-3 shrink-0" />
          <span className="truncate">{recipe.remix_note}</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-[#d3d4c8] flex items-center justify-between text-xs text-[#4d4c4c] tabular-nums">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-[#3f6212]" />
            {recipe.prep_time_minutes + recipe.cook_time_minutes}m
          </span>
          <span>{totalCalories} kcal</span>
          <span className="text-[#000000] font-semibold">
            {totalProtein}g protein
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-[#4d4c4c]">
            <Heart className="h-3 w-3" />
            {recipe.likes_count}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#4d4c4c] tabular-nums">
          {recipe.ingredients.length} ingredients • {recipe.servings} servings
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartCooking(recipe);
          }}
          className="btn-press px-3.5 py-1.5 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] text-xs font-medium flex items-center gap-1.5"
        >
          <Utensils className="h-3 w-3" />
          Cook
        </button>
      </div>
    </div>
  );
}
