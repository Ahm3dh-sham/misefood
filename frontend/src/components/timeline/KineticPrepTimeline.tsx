"use client";

import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Clock,
  Flame,
  GitMerge,
  Hourglass,
  Loader2,
  Play,
  Scissors,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import { mergeMultiRecipeTimeline } from "@/lib/api";
import type {
  MultiRecipeTimelineResponse,
  Recipe,
  TimelineTrack,
} from "@/types/recipe";

interface KineticPrepTimelineProps {
  recipes: Recipe[];
  onStartStepTimer: (
    label: string,
    durationSeconds: number,
    stepNumber: number
  ) => void;
}

const TRACK_LABELS: Record<TimelineTrack, string> = {
  prep: "Mise en Place / Prep",
  active_cook: "Active Burner / Bhuno",
  passive_wait: "Passive Pressure / Marinate / Air-Fry",
  plating: "Synchronized Hot Service",
};

function TrackIcon({ track }: { track: TimelineTrack }) {
  switch (track) {
    case "prep":
      return <Scissors className="h-3.5 w-3.5" />;
    case "active_cook":
      return <Flame className="h-3.5 w-3.5" />;
    case "passive_wait":
      return <Hourglass className="h-3.5 w-3.5" />;
    case "plating":
      return <Utensils className="h-3.5 w-3.5" />;
  }
}

export function KineticPrepTimeline({
  recipes,
  onStartStepTimer,
}: KineticPrepTimelineProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    recipes.slice(0, 3).map((r) => r.id)
  );
  const [burners, setBurners] = useState(3);
  const [isMerging, setIsMerging] = useState(false);
  const [merged, setMerged] = useState<MultiRecipeTimelineResponse | null>(
    null
  );

  const toggleRecipeSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.length > 2 ? prev.filter((x) => x !== id) : prev;
      }
      return prev.length < 4 ? [...prev, id] : prev;
    });
  };

  const handleRunMerge = async () => {
    if (selectedIds.length < 2) return;
    setIsMerging(true);
    try {
      const res = await mergeMultiRecipeTimeline(selectedIds, burners);
      setMerged(res);
    } finally {
      setIsMerging(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2 && !merged) {
      void handleRunMerge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSpan = merged ? Math.max(600, merged.total_duration_seconds) : 1200;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-charcoal border border-white/10 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-purple-400" />
              <span>
                Kinetic Loop &ldquo;Smart Meal Prep&rdquo; Multi-Recipe Parallel
                Timeline Engine
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select 2 to 4 recipes to cook together. Our DAG scheduler
              automatically slots active chopping &amp; sautéing inside passive
              pressure-cooking, marinating, and air-frying windows so every dish
              finishes hot together.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-400">
              Burners:{" "}
              <select
                value={burners}
                onChange={(e) => setBurners(Number(e.target.value))}
                className="bg-obsidian border border-white/15 rounded-lg px-2 py-1 text-white ml-1"
              >
                <option value={2}>2 Burners</option>
                <option value={3}>3 Burners + Air-Fryer</option>
                <option value={4}>4 Burners + Oven</option>
              </select>
            </label>

            <button
              type="button"
              disabled={isMerging}
              onClick={() => void handleRunMerge()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-amber-500 text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-[0.97]"
            >
              {isMerging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Interleaving DAG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Re-Compute Interleaved Gantt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Multi-Recipe Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {recipes.map((r) => {
            const active = selectedIds.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRecipeSelection(r.id)}
                className={`p-3.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                  active
                    ? "bg-slateCard border-purple-400/60 shadow-md shadow-purple-500/10"
                    : "bg-obsidian/70 border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-amber-300">
                    {r.cuisine}
                  </span>
                  <CheckSquare
                    className={`h-4 w-4 ${
                      active ? "text-purple-400" : "text-zinc-600"
                    }`}
                  />
                </div>
                <p className="text-xs font-semibold text-white line-clamp-2">
                  {r.title}
                </p>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {r.timeline_steps.length} DAG nodes •{" "}
                  {r.prep_time_minutes + r.cook_time_minutes}m solo
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {merged && (
        <div className="rounded-2xl bg-charcoal border border-white/10 p-6 space-y-6">
          {/* Time Saved Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-obsidian border border-purple-500/30">
            <div>
              <span className="text-xs text-zinc-400">
                Sequential Cooking Time
              </span>
              <p className="text-xl font-bold font-mono text-zinc-300 mt-0.5">
                {Math.round(merged.sequential_duration_seconds / 60)} mins
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-400">
                Kinetic Interleaved Parallel Time
              </span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.round(merged.total_duration_seconds / 60)} mins
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-400">
                Active Kitchen Time Saved
              </span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-0.5 flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                Saved {Math.round(merged.time_saved_seconds / 60)} mins (
                {Math.round(
                  (merged.time_saved_seconds /
                    Math.max(1, merged.sequential_duration_seconds)) *
                    100
                )}
                % faster)
              </p>
            </div>
          </div>

          {/* Visual Multi-Recipe Gantt Bars */}
          <div className="p-4 rounded-xl bg-obsidian border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pb-1">
              <span>T+0:00 (Unified Mise en Place)</span>
              <span>
                T+{Math.round(totalSpan / 120)}:00 (Active/Passive Overlap)
              </span>
              <span>
                T+{Math.round(totalSpan / 60)}:00 (All Dishes Hot)
              </span>
            </div>

            {merged.interleaved_steps.map((node) => {
              const leftPct = Math.min(
                86,
                Math.round((node.start_offset_seconds / totalSpan) * 100)
              );
              const widthPct = Math.max(
                10,
                Math.min(
                  100 - leftPct,
                  Math.round((node.duration_seconds / totalSpan) * 100)
                )
              );
              return (
                <div key={node.global_step_number} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-200 font-medium truncate flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: node.recipe_color_hex }}
                      />
                      #{node.global_step_number} {node.title}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      {TRACK_LABELS[node.track]} •{" "}
                      {Math.round(node.duration_seconds / 60)}m
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        marginLeft: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: node.recipe_color_hex,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interleaved Step Execution Cards */}
          <div className="space-y-3">
            {merged.interleaved_steps.map((step) => (
              <div
                key={step.global_step_number}
                className="p-4 rounded-xl bg-obsidian/80 border border-white/10 flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-obsidian font-mono text-xs font-bold"
                      style={{ backgroundColor: step.recipe_color_hex }}
                    >
                      Step #{step.global_step_number}
                    </span>
                    <span className="font-semibold text-sm text-white">
                      {step.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1">
                      <TrackIcon track={step.track} />
                      {TRACK_LABELS[step.track]}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onStartStepTimer(
                        step.timer_label ?? step.title,
                        step.duration_seconds,
                        step.global_step_number
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 active:scale-[0.97]"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>
                      Timer ({Math.round(step.duration_seconds / 60)}m)
                    </span>
                  </button>
                </div>

                <p className="text-sm text-zinc-200 leading-relaxed">
                  {step.instruction}
                </p>

                {step.overlap_reason && (
                  <p className="text-xs text-purple-300 font-medium">
                    ⚡ Concurrency Optimization: {step.overlap_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
