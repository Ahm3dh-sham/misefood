"use client";

import React from "react";
import { Clock, GitFork, Heart, Sparkles, Utensils } from "lucide-react";
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
      className={`group cursor-pointer rounded-2xl p-4 border transition-transform duration-200 ease-emil-out active:scale-[0.985] ${
        isSelected
          ? "bg-slateCard border-amber-500/50 shadow-lg shadow-amber-500/10"
          : "bg-charcoal/80 border-white/10 hover:border-white/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-amber-300 border border-white/10">
          {recipe.cuisine}
        </span>
        {recipe.similarity_score !== null && (
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {Math.round(recipe.similarity_score * 100)}% match
          </span>
        )}
      </div>

      <h3 className="font-semibold text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2">
        {recipe.title}
      </h3>
      <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
        {recipe.description}
      </p>

      {recipe.remix_note && (
        <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-1.5">
          <GitFork className="h-3 w-3 shrink-0" />
          <span className="truncate">Forked remix: {recipe.remix_note}</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            {recipe.prep_time_minutes + recipe.cook_time_minutes}m
          </span>
          <span>{totalCalories} kcal</span>
          <span className="text-emerald-400 font-medium">{totalProtein}g P</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1 text-zinc-400">
            <Heart className="h-3.5 w-3.5 text-rose-400/80" />
            {recipe.likes_count}
          </span>
          <span className="flex items-center gap-1 text-zinc-400">
            <GitFork className="h-3.5 w-3.5 text-sky-400/80" />
            {recipe.forks_count}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-500">
          By {recipe.author_name} • {recipe.ingredients.length} normalized items
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartCooking(recipe);
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-transform duration-150 ease-emil-out active:scale-[0.96]"
        >
          <Utensils className="h-3 w-3" />
          Cook Mode
        </button>
      </div>
    </div>
  );
}
