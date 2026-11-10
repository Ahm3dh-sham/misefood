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
      className={`group cursor-pointer rounded-[22px] p-4 border transition-all duration-200 ease-emil-out active:scale-[0.99] ${
        isSelected
          ? "bg-white border-zinc-900 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
          : "bg-[#F6F6F4] border-zinc-200/80 hover:bg-white hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
          {recipe.cuisine}
        </span>
        <span className="text-[11px] font-mono text-zinc-500">
          ₹{Math.round(recipe.estimated_total_cost_inr)}
        </span>
      </div>

      <h3 className="font-switzer font-medium text-base text-zinc-950 group-hover:text-[#C85A32] transition-colors line-clamp-2">
        {recipe.title}
      </h3>
      <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
        {recipe.description}
      </p>

      {recipe.remix_note && (
        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-[#FDF6EF] border border-[#EED9C4] text-[11px] text-[#9A4220] flex items-center gap-1.5">
          <GitFork className="h-3 w-3 shrink-0" />
          <span className="truncate">{recipe.remix_note}</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-zinc-200/70 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            {recipe.prep_time_minutes + recipe.cook_time_minutes}m
          </span>
          <span>{totalCalories} kcal</span>
          <span className="text-zinc-900 font-medium">{totalProtein}g protein</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-zinc-400">
            <Heart className="h-3 w-3" />
            {recipe.likes_count}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-400">
          {recipe.ingredients.length} ingredients • {recipe.servings} servings
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartCooking(recipe);
          }}
          className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-transform duration-150 ease-emil-out active:scale-[0.96]"
        >
          <Utensils className="h-3 w-3" />
          Cook
        </button>
      </div>
    </div>
  );
}
