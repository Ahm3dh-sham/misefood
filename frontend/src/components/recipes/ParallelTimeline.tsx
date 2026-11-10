"use client";

import React from "react";
import { Eye, Flame, Hourglass, Play, Scissors, Utensils } from "lucide-react";
import type { ParallelTimelineNode, TimelineTrack } from "@/types/recipe";

interface ParallelTimelineProps {
  steps: ParallelTimelineNode[];
  onStartStepTimer: (
    label: string,
    durationSeconds: number,
    stepNumber: number
  ) => void;
}

const TRACK_STYLES: Record<
  TimelineTrack,
  { label: string; color: string; bar: string }
> = {
  prep: {
    label: "Mise en Place / Prep",
    color: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    bar: "bg-sky-400",
  },
  active_cook: {
    label: "Active Heat",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    bar: "bg-amber-400",
  },
  passive_wait: {
    label: "Passive Simmer / Roast",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    bar: "bg-purple-400",
  },
  plating: {
    label: "Plating & Finish",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    bar: "bg-emerald-400",
  },
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

export function ParallelTimeline({
  steps,
  onStartStepTimer,
}: ParallelTimelineProps) {
  const totalSpanSeconds = Math.max(
    600,
    ...steps.map((s) => s.start_offset_seconds + s.duration_seconds)
  );

  return (
    <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-semibold text-white">
            LangGraph Parallel Cooking Timeline (DAG)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Overlaps passive simmers/roasts with active prep &amp; searing so
            every component finishes hot at the same moment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {(Object.keys(TRACK_STYLES) as TimelineTrack[]).map((t) => (
            <span
              key={t}
              className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${TRACK_STYLES[t].color}`}
            >
              <TrackIcon track={t} />
              {TRACK_STYLES[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Gantt concurrency chart */}
      <div className="p-3.5 rounded-xl bg-obsidian border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pb-1">
          <span>T+0:00 (Start)</span>
          <span>
            T+{Math.round(totalSpanSeconds / 120)}:00 (Midpoint)
          </span>
          <span>
            T+{Math.round(totalSpanSeconds / 60)}:00 (Service)
          </span>
        </div>
        {steps.map((step) => {
          const leftPct = Math.min(
            88,
            Math.round((step.start_offset_seconds / totalSpanSeconds) * 100)
          );
          const widthPct = Math.max(
            10,
            Math.min(
              100 - leftPct,
              Math.round((step.duration_seconds / totalSpanSeconds) * 100)
            )
          );
          const style = TRACK_STYLES[step.track] ?? TRACK_STYLES.active_cook;
          return (
            <div key={step.step_number} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium truncate">
                  #{step.step_number} {step.title}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {Math.round(step.duration_seconds / 60)}m
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${style.bar} opacity-85`}
                  style={{
                    marginLeft: `${leftPct}%`,
                    width: `${widthPct}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Cards */}
      <div className="space-y-3">
        {steps.map((step) => {
          const style = TRACK_STYLES[step.track] ?? TRACK_STYLES.active_cook;
          return (
            <div
              key={step.step_number}
              className="p-4 rounded-xl bg-obsidian/70 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-white/10 text-white font-mono text-xs font-bold flex items-center justify-center">
                    {step.step_number}
                  </span>
                  <h4 className="font-semibold text-sm text-white">
                    {step.title}
                  </h4>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.color}`}
                  >
                    <TrackIcon track={step.track} />
                    {style.label}
                  </span>
                </div>

                {step.duration_seconds > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      onStartStepTimer(
                        step.timer_label ?? `Step ${step.step_number}`,
                        step.duration_seconds,
                        step.step_number
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-medium flex items-center gap-1.5 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>
                      Start {Math.round(step.duration_seconds / 60)}m Timer
                    </span>
                  </button>
                )}
              </div>

              <p className="text-sm text-zinc-200 mt-2.5 leading-relaxed">
                {step.instruction}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                {step.sensory_cue && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 shrink-0" />
                    <span>Sensory Cue: {step.sensory_cue}</span>
                  </span>
                )}
                {step.equipment.map((eq) => (
                  <span
                    key={eq}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300"
                  >
                    Tool: {eq}
                  </span>
                ))}
                {step.depends_on_steps.length > 0 && (
                  <span className="text-zinc-500 font-mono text-[11px]">
                    After step #{step.depends_on_steps.join(", #")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
