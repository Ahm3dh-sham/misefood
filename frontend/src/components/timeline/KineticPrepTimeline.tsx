"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Flame,
  Hourglass,
  Loader2,
  Play,
  Scissors,
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
  prep: "Prep",
  active_cook: "Active Stove",
  passive_wait: "Simmer / Rest",
  plating: "Ready to Serve",
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

  // Bug Fix: Automatically recompute merged timeline whenever selected recipes or burner count changes
  useEffect(() => {
    if (selectedIds.length < 2) return;
    let cancelled = false;
    setIsMerging(true);
    void (async () => {
      try {
        const res = await mergeMultiRecipeTimeline(selectedIds, burners);
        if (!cancelled) {
          setMerged(res);
        }
      } catch {
        // ignore abort/offline errors
      } finally {
        if (!cancelled) {
          setIsMerging(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedIds, burners]);

  const totalSpan = merged ? Math.max(600, merged.total_duration_seconds) : 1200;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-switzer text-xl sm:text-2xl font-medium text-zinc-950">
              Cook Multiple Dishes Together
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Select 2 to 4 dishes. We overlap chopping and stove steps during
              simmering windows so everything finishes hot at once.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-600 flex items-center gap-2">
              <span>Stove setup:</span>
              <select
                value={burners}
                onChange={(e) => setBurners(Number(e.target.value))}
                className="bg-[#F6F6F4] border border-zinc-200 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-900 focus:outline-none"
              >
                <option value={2}>2 Burners</option>
                <option value={3}>3 Burners + Air-Fryer</option>
                <option value={4}>4 Burners + Oven</option>
              </select>
            </label>
            {isMerging && (
              <Loader2 className="h-4 w-4 animate-spin text-[#C85A32]" />
            )}
          </div>
        </div>

        {/* Multi-Recipe Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recipes.map((r) => {
            const active = selectedIds.includes(r.id);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRecipeSelection(r.id)}
                className={`p-4 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                  active
                    ? "bg-[#FDF6EF] border-[#C85A32] shadow-sm"
                    : "bg-[#F6F6F4] border-zinc-200/80 opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200/70">
                    {r.cuisine}
                  </span>
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      active
                        ? "bg-[#C85A32] text-white"
                        : "bg-white border border-zinc-300 text-transparent"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                </div>
                <p className="font-switzer text-sm font-medium text-zinc-950 line-clamp-2">
                  {r.title}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {r.timeline_steps.length} steps •{" "}
                  {r.prep_time_minutes + r.cook_time_minutes}m solo
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {merged && (
        <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 space-y-6">
          {/* Time Saved Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80">
            <div>
              <span className="text-xs text-zinc-500">Cooking one by one</span>
              <p className="font-switzer text-2xl font-medium text-zinc-500 mt-0.5">
                {Math.round(merged.sequential_duration_seconds / 60)} mins
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">
                Cooking together (parallel)
              </span>
              <p className="font-switzer text-2xl font-medium text-zinc-950 mt-0.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" />
                {Math.round(merged.total_duration_seconds / 60)} mins
              </p>
            </div>
            <div>
              <span className="text-xs text-zinc-500">Time saved</span>
              <p className="font-switzer text-2xl font-medium text-[#C85A32] mt-0.5 flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                {Math.round(merged.time_saved_seconds / 60)} mins faster (
                {Math.round(
                  (merged.time_saved_seconds /
                    Math.max(1, merged.sequential_duration_seconds)) *
                    100
                )}
                %)
              </p>
            </div>
          </div>

          {/* Visual Multi-Recipe Schedule Bars */}
          <div className="p-5 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-1">
              <span>0 min (Start Prep)</span>
              <span>{Math.round(totalSpan / 120)} min</span>
              <span>{Math.round(totalSpan / 60)} min (Serve Hot)</span>
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
                    <span className="text-zinc-800 font-medium truncate flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: node.recipe_color_hex }}
                      />
                      {node.global_step_number}. {node.title}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {TRACK_LABELS[node.track]} •{" "}
                      {Math.max(1, Math.round(node.duration_seconds / 60))}m
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white overflow-hidden border border-zinc-200/60">
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
                className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 flex flex-col gap-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-white font-mono text-xs font-semibold"
                      style={{ backgroundColor: step.recipe_color_hex }}
                    >
                      Step {step.global_step_number}
                    </span>
                    <span className="font-switzer font-medium text-sm text-zinc-950">
                      {step.title}
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-600 flex items-center gap-1">
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
                    className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 active:scale-[0.97]"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>
                      {Math.max(1, Math.round(step.duration_seconds / 60))}m
                      Timer
                    </span>
                  </button>
                </div>

                <p className="text-sm text-zinc-700 leading-relaxed">
                  {step.instruction}
                </p>

                {step.overlap_reason && (
                  <p className="text-xs text-[#9A4220] font-medium">
                    Tip: {step.overlap_reason}
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
