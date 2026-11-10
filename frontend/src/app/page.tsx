"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  GitFork,
  Loader2,
  Mic,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { type ActiveTab } from "@/components/layout/AppShell";
import { EloqwntLandingShell } from "@/components/landing/EloqwntLandingShell";
import { HandsFreeCookView } from "@/components/cooking/HandsFreeCookView";
import { PantryRescueView } from "@/components/pantry/PantryRescueView";
import { SmartMealPlanner } from "@/components/planner/SmartMealPlanner";
import { IngredientList } from "@/components/recipes/IngredientList";
import { OcrImporterModal } from "@/components/recipes/OcrImporterModal";
import { ParallelTimeline } from "@/components/recipes/ParallelTimeline";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { SocialCookbooksView } from "@/components/social/SocialCookbooksView";
import { KineticPrepTimeline } from "@/components/timeline/KineticPrepTimeline";
import { useParallelTimers } from "@/hooks/useParallelTimers";
import {
  FALLBACK_RECIPES,
  fetchRecipes,
  forkRecipeOnServer,
  remixRecipeWithAI,
} from "@/lib/api";
import type {
  NormalizedIngredient,
  Recipe,
  RemixMode,
  UnitSystem,
} from "@/types/recipe";

export default function MiseFoodWorkspacePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("hub");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("indian");
  const [recipes, setRecipes] = useState<Recipe[]>(FALLBACK_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(
    FALLBACK_RECIPES[0]!
  );
  const [currentServings, setCurrentServings] = useState<number>(
    FALLBACK_RECIPES[0]?.servings ?? 3
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [remixNote, setRemixNote] = useState("");
  const [isForking, setIsForking] = useState(false);
  const [activeRemixLoading, setActiveRemixLoading] =
    useState<RemixMode | null>(null);

  const {
    timers,
    startTimer,
    toggleTimer,
    dismissTimer,
    pauseAllTimers,
  } = useParallelTimers();

  const reloadRecipes = async (q?: string) => {
    const loaded = await fetchRecipes(q);
    if (loaded.length > 0) {
      setRecipes(loaded);
      setSelectedRecipe((prev) => {
        const match = loaded.find((r) => r.id === prev.id);
        return match ?? loaded[0]!;
      });
    }
  };

  useEffect(() => {
    void reloadRecipes();
  }, []);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await reloadRecipes(searchQuery);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentServings(recipe.servings);
  };

  const handleReplaceIngredient = (
    idx: number,
    replacement: NormalizedIngredient
  ) => {
    setSelectedRecipe((prev) => {
      const nextIngs = [...prev.ingredients];
      nextIngs[idx] = replacement;
      const updated = { ...prev, ingredients: nextIngs };
      setRecipes((list) =>
        list.map((r) => (r.id === updated.id ? updated : r))
      );
      return updated;
    });
  };

  const handleOneClickAiRemix = async (mode: RemixMode) => {
    setActiveRemixLoading(mode);
    try {
      const remixed = await remixRecipeWithAI(
        selectedRecipe.id,
        mode,
        undefined,
        currentServings
      );
      setRecipes((prev) => [remixed, ...prev]);
      setSelectedRecipe(remixed);
      setCurrentServings(remixed.servings);
    } finally {
      setActiveRemixLoading(null);
    }
  };

  const handleForkRemix = async () => {
    setIsForking(true);
    try {
      const note =
        remixNote.trim() ||
        `Scaled to ${currentServings} servings (${unitSystem} metrics)`;
      const forked = await forkRecipeOnServer(
        selectedRecipe,
        note,
        selectedRecipe.ingredients,
        currentServings
      );
      setRecipes((prev) => [forked, ...prev]);
      setSelectedRecipe(forked);
      setRemixNote("");
    } catch {
      const localFork: Recipe = {
        ...selectedRecipe,
        id: `fork-${Date.now()}`,
        title: `${selectedRecipe.title} (Remix)`,
        servings: currentServings,
        parent_recipe_id: selectedRecipe.id,
        remix_note:
          remixNote.trim() ||
          `Scaled to ${currentServings} servings (${unitSystem} metrics)`,
        forks_count: 0,
        likes_count: 1,
      };
      setRecipes((prev) => [localFork, ...prev]);
      setSelectedRecipe(localFork);
      setRemixNote("");
    } finally {
      setIsForking(false);
    }
  };

  return (
    <EloqwntLandingShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      unitSystem={unitSystem}
      onChangeUnitSystem={setUnitSystem}
      onOpenOcrModal={() => setOcrModalOpen(true)}
      recipes={recipes}
      onSelectRecipe={(r) => {
        handleSelectRecipe(r);
        setActiveTab("hub");
      }}
      activeTimers={timers}
    >
      {activeTab === "hub" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Semantic Recipe Search & Social Feed */}
          <div className="lg:col-span-4 space-y-4">
            <form
              onSubmit={(e) => void handleSemanticSearch(e)}
              className="rounded-2xl bg-charcoal border border-white/10 p-3.5 space-y-2.5"
            >
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  pgvector Semantic Recipe Search
                </span>
                <span className="font-mono text-[10px] text-zinc-500">
                  gemini-embedding-2
                </span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., paneer tikka, dal tadka, air-fryer, miso..."
                    className="w-full rounded-xl bg-obsidian border border-white/10 pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-medium active:scale-[0.97]"
                >
                  Match
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={recipe.id === selectedRecipe.id}
                  onSelect={handleSelectRecipe}
                  onStartCooking={(r) => {
                    handleSelectRecipe(r);
                    setActiveTab("sous-chef");
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main Recipe Detail: Header, 1-Click AI Remix Pills, Normalized Ingredients, Parallel Timeline */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl bg-charcoal border border-white/10 p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {selectedRecipe.cuisine}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                      Source: {selectedRecipe.source_type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      ₹{Math.round(selectedRecipe.estimated_total_cost_inr)}
                    </span>
                    {selectedRecipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {selectedRecipe.title}
                  </h1>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedRecipe.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("sous-chef")}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                >
                  <Mic className="h-4 w-4" />
                  <span>Start Hands-Free Cooking</span>
                </button>
              </div>

              {/* 1-Click AI Recipe Remix Bar */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <span className="text-xs font-medium text-amber-300 flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5" />
                  1-Click AI Recipe Remix (LangGraph Dietary &amp; Technique
                  Transformer):
                </span>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        mode: "high_protein",
                        label: "💪 Make it High-Protein (+40% P)",
                      },
                      {
                        mode: "jain_no_onion_garlic",
                        label: "🌿 Jain-Friendly (No Onion-Garlic)",
                      },
                      {
                        mode: "vegan",
                        label: "🌱 Veganize (Tofu & Cashew Malai)",
                      },
                      {
                        mode: "air_fryer",
                        label: "🔥 Air-Fryer Version (-65% Oil)",
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      disabled={activeRemixLoading !== null}
                      onClick={() => void handleOneClickAiRemix(item.mode)}
                      className="px-3 py-1.5 rounded-xl bg-obsidian hover:bg-amber-500/15 border border-white/15 hover:border-amber-500/40 text-xs text-zinc-200 hover:text-amber-200 flex items-center gap-1.5 transition-all active:scale-[0.97]"
                    >
                      {activeRemixLoading === item.mode ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Flame className="h-3.5 w-3.5 text-amber-400" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Fork / Custom Remix Bar */}
              <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="text"
                  value={remixNote}
                  onChange={(e) => setRemixNote(e.target.value)}
                  placeholder="Or save your own custom household fork note..."
                  className="flex-1 rounded-xl bg-obsidian border border-white/10 px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
                <button
                  type="button"
                  disabled={isForking}
                  onClick={() => void handleForkRemix()}
                  className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-medium flex items-center justify-center gap-1.5 active:scale-[0.97]"
                >
                  <GitFork className="h-3.5 w-3.5" />
                  <span>
                    {isForking ? "Forking..." : "Fork & Save Remix"}
                  </span>
                </button>
              </div>
            </div>

            <IngredientList
              recipeTitle={selectedRecipe.title}
              baseServings={selectedRecipe.servings}
              currentServings={currentServings}
              onChangeServings={setCurrentServings}
              unitSystem={unitSystem}
              onChangeUnitSystem={setUnitSystem}
              ingredients={selectedRecipe.ingredients}
              onReplaceIngredient={handleReplaceIngredient}
            />

            <ParallelTimeline
              steps={selectedRecipe.timeline_steps}
              onStartStepTimer={(label, seconds, stepNum) => {
                startTimer(label, seconds, stepNum);
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "kinetic-prep" && (
        <KineticPrepTimeline
          recipes={recipes}
          onStartStepTimer={(label, seconds, stepNum) => {
            startTimer(label, seconds, stepNum);
          }}
        />
      )}

      {activeTab === "planner" && <SmartMealPlanner />}

      {activeTab === "pantry" && (
        <PantryRescueView
          recipes={recipes}
          onSelectRecipeToCook={(recipeId) => {
            const found = recipes.find((r) => r.id === recipeId);
            if (found) {
              handleSelectRecipe(found);
              setActiveTab("sous-chef");
            }
          }}
        />
      )}

      {activeTab === "sous-chef" && (
        <HandsFreeCookView
          recipe={selectedRecipe}
          timers={timers}
          onStartTimer={startTimer}
          onToggleTimer={toggleTimer}
          onDismissTimer={dismissTimer}
          onPauseAllTimers={pauseAllTimers}
        />
      )}

      {activeTab === "social" && (
        <SocialCookbooksView
          recipes={recipes}
          selectedRecipe={selectedRecipe}
          onSelectRecipe={(r) => {
            handleSelectRecipe(r);
            setActiveTab("hub");
          }}
          onReviewAdded={() => {
            void reloadRecipes();
          }}
        />
      )}

      <OcrImporterModal
        isOpen={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        unitSystem={unitSystem}
        onRecipeParsed={(newRecipe) => {
          setRecipes((prev) => [newRecipe, ...prev]);
          setSelectedRecipe(newRecipe);
          setCurrentServings(newRecipe.servings);
          setActiveTab("hub");
        }}
      />
    </EloqwntLandingShell>
  );
}
