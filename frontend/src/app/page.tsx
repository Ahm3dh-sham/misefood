"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  GitFork,
  Loader2,
  Mic,
  Search,
  Sparkles,
  Users,
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
  const [plannerPrompt, setPlannerPrompt] = useState<string | undefined>(
    undefined
  );

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
      const recalculatedCost = nextIngs.reduce(
        (sum, ing) => sum + (ing.nutrition_meta?.estimated_cost_inr ?? 25),
        0
      );
      const updated: Recipe = {
        ...prev,
        ingredients: nextIngs,
        estimated_total_cost_inr: Math.round(recalculatedCost),
      };
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
        `Scaled to ${currentServings} servings (${unitSystem})`;
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
        title: `${selectedRecipe.title} (My Version)`,
        servings: currentServings,
        parent_recipe_id: selectedRecipe.id,
        remix_note:
          remixNote.trim() ||
          `Scaled to ${currentServings} servings (${unitSystem})`,
        forks_count: (selectedRecipe.forks_count ?? 0) + 1,
        likes_count: (selectedRecipe.likes_count ?? 0) + 1,
      };
      setRecipes((prev) => [localFork, ...prev]);
      setSelectedRecipe(localFork);
      setRemixNote("");
    } finally {
      setIsForking(false);
    }
  };

  const scaleFactor =
    selectedRecipe.servings > 0
      ? currentServings / selectedRecipe.servings
      : 1;
  const scaledTotalCost = Math.round(
    selectedRecipe.estimated_total_cost_inr * scaleFactor
  );

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
      onStartQuickTimer={(label, seconds, stepNum) => {
        startTimer(label, seconds, stepNum);
      }}
      onApplyConciergePrompt={(promptText) => {
        setPlannerPrompt(promptText);
        setActiveTab("planner");
      }}
    >
      {activeTab === "hub" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recipe Library & Search */}
          <div className="lg:col-span-4 space-y-4">
            <form
              onSubmit={(e) => void handleSemanticSearch(e)}
              className="flex items-center gap-2"
            >
              <label htmlFor="recipe-search" className="sr-only">
                Search dishes, ingredients, or mood
              </label>
              <div className="relative flex-1">
                <Search className="h-4 w-4 text-[#4d4c4c] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="recipe-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes, ingredients, or mood..."
                  className="w-full rounded-full bg-[#e9eade] border border-[#d3d4c8] pl-10 pr-4 py-2.5 text-xs text-[#000000] placeholder:text-[#4d4c4c] focus:outline-none focus:border-[#3f6212]"
                />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    void reloadRecipes("");
                  }}
                  className="btn-press px-3 py-2 rounded-full bg-[#e9eade] border border-[#d3d4c8] text-[#333333] text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="space-y-2.5">
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

          {/* Right Column: Recipe Detail, 1-Click Adaptations, Ingredients & Timeline */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-[8px] bg-[#e9eade] border border-[#d3d4c8] p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#333333]">
                    <span className="font-semibold text-[#fcfcfd] bg-[#3f6212] px-2.5 py-0.5 rounded-full">
                      {selectedRecipe.cuisine}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#333333] tabular-nums">
                      <Clock className="h-3 w-3 text-[#3f6212]" />
                      {selectedRecipe.prep_time_minutes +
                        selectedRecipe.cook_time_minutes}{" "}
                      min
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#333333] tabular-nums">
                      <Users className="h-3 w-3 text-[#3f6212]" />
                      {currentServings} servings
                    </span>
                    <span className="font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] text-[#3f6212] tabular-nums">
                      ₹{scaledTotalCost}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#000000]">
                    {selectedRecipe.title}
                  </h2>

                  <p className="text-sm text-[#333333] leading-relaxed">
                    {selectedRecipe.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("sous-chef")}
                  className="btn-press px-5 py-3 rounded-full bg-[#3f6212] hover:bg-[#33500e] text-[#fcfcfd] font-medium text-xs sm:text-sm flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  <span>Cook Hands-Free</span>
                </button>
              </div>

              {/* 1-Click Dietary & Cooking Style Adaptations */}
              <div className="pt-4 border-t border-[#d3d4c8] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#333333] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#3f6212]" />
                    Adapt recipe in one click
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      {
                        mode: "high_protein",
                        label: "High-Protein (+40%)",
                      },
                      {
                        mode: "jain_no_onion_garlic",
                        label: "Jain (No Onion-Garlic)",
                      },
                      {
                        mode: "vegan",
                        label: "Plant-Based / Vegan",
                      },
                      {
                        mode: "air_fryer",
                        label: "Air-Fryer (-65% Oil)",
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      disabled={activeRemixLoading !== null}
                      onClick={() => void handleOneClickAiRemix(item.mode)}
                      className="btn-press px-3.5 py-1.5 rounded-full bg-[#f1f3e6] hover:bg-[#3f6212] hover:text-[#fcfcfd] border border-[#d3d4c8] text-xs font-medium text-[#000000] flex items-center gap-1.5"
                    >
                      {activeRemixLoading === item.mode && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      )}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Personal Version */}
              <div className="pt-3 border-t border-[#d3d4c8] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label htmlFor="remix-note-input" className="sr-only">
                  Personal recipe note
                </label>
                <input
                  id="remix-note-input"
                  type="text"
                  value={remixNote}
                  onChange={(e) => setRemixNote(e.target.value)}
                  placeholder="Add a personal note (e.g., extra ginger, less chili)..."
                  className="flex-1 rounded-full bg-[#f1f3e6] border border-[#d3d4c8] px-4 py-2 text-xs text-[#000000] placeholder:text-[#4d4c4c] focus:outline-none focus:border-[#3f6212]"
                />
                <button
                  type="button"
                  disabled={isForking}
                  onClick={() => void handleForkRemix()}
                  className="btn-press px-4 py-2 rounded-full bg-[#f1f3e6] hover:border-[#3f6212] text-[#000000] border border-[#d3d4c8] text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <GitFork className="h-3.5 w-3.5 text-[#3f6212]" />
                  <span>{isForking ? "Saving..." : "Save My Version"}</span>
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

      {activeTab === "planner" && (
        <SmartMealPlanner initialPrompt={plannerPrompt} />
      )}

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
          currentServings={currentServings}
          unitSystem={unitSystem}
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
