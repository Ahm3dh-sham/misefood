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
    label: "Prep",
    color: "bg-zinc-100 text-zinc-700 border-zinc-200",
    bar: "bg-zinc-700",
  },
  active_cook: {
    label: "Active Heat",
    color: "bg-[#FDF6EF] text-[#C85A32] border-[#EED9C4]",
    bar: "bg-[#C85A32]",
  },
  passive_wait: {
    label: "Simmer / Rest",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    bar: "bg-[#E09F3E]",
  },
  plating: {
    label: "Finish & Serve",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    bar: "bg-emerald-600",
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
    <div className="rounded-[24px] bg-[#F6F6F4] border border-zinc-200/80 p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-4">
        <div>
          <h3 className="font-switzer text-lg font-medium text-zinc-950">
            Cooking Steps &amp; Schedule
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Prep and active cooking steps overlapped so everything finishes hot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {(Object.keys(TRACK_STYLES) as TimelineTrack[]).map((t) => (
            <span
              key={t}
              className={`px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${TRACK_STYLES[t].color}`}
            >
              <TrackIcon track={t} />
              {TRACK_STYLES[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* Visual Schedule Bar */}
      <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pb-1">
          <span>0 min</span>
          <span>{Math.round(totalSpanSeconds / 120)} min</span>
          <span>{Math.round(totalSpanSeconds / 60)} min</span>
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
                <span className="text-zinc-800 font-medium truncate">
                  {step.step_number}. {step.title}
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {Math.max(1, Math.round(step.duration_seconds / 60))}m
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden relative">
                <div
                  className={`h-full rounded-full ${style.bar}`}
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
              className="p-4 rounded-2xl bg-white border border-zinc-200/80 hover:border-zinc-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-full bg-zinc-950 text-white font-mono text-xs font-semibold flex items-center justify-center">
                    {step.step_number}
                  </span>
                  <h4 className="font-switzer font-medium text-sm text-zinc-950">
                    {step.title}
                  </h4>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${style.color}`}
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
                    className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition-transform duration-150 ease-emil-out active:scale-[0.97]"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>
                      {Math.max(1, Math.round(step.duration_seconds / 60))}m
                      Timer
                    </span>
                  </button>
                )}
              </div>

              <p className="text-sm text-zinc-700 mt-2.5 leading-relaxed">
                {step.instruction}
              </p>

              {(step.sensory_cue || step.equipment.length > 0) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  {step.sensory_cue && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FDF6EF] border border-[#EED9C4] text-[#9A4220] flex items-center gap-1.5">
                      <Eye className="h-3 w-3 shrink-0" />
                      <span>{step.sensory_cue}</span>
                    </span>
                  )}
                  {step.equipment.map((eq) => (
                    <span
                      key={eq}
                      className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
