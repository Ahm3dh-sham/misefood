"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Sun,
  Timer,
  Trash2,
  Volume2,
} from "lucide-react";
import { useVoiceSousChef } from "@/hooks/useVoiceSousChef";
import {
  requestScreenWakeLock,
  type WakeLockSentinelLike,
} from "@/lib/speech";
import { formatIngredientForDisplay } from "@/lib/unitConverter";
import type { ActiveCookingTimer, Recipe, UnitSystem } from "@/types/recipe";

interface HandsFreeCookViewProps {
  recipe: Recipe;
  currentServings?: number;
  unitSystem?: UnitSystem;
  timers: ActiveCookingTimer[];
  onStartTimer: (
    label: string,
    durationSeconds: number,
    stepNumber: number | null
  ) => void;
  onToggleTimer: (id: string) => void;
  onDismissTimer: (id: string) => void;
  onPauseAllTimers: () => void;
}

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function HandsFreeCookView({
  recipe,
  currentServings,
  unitSystem = "indian",
  timers,
  onStartTimer,
  onToggleTimer,
  onDismissTimer,
  onPauseAllTimers,
}: HandsFreeCookViewProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [manualQuery, setManualQuery] = useState("");
  const [wakeLockActive, setWakeLockActive] = useState(true);

  // Bug Fix #1: Reset stepIdx to 0 whenever the active recipe changes
  useEffect(() => {
    setStepIdx(0);
  }, [recipe.id]);

  const totalSteps = recipe.timeline_steps.length;
  const safeStepIdx = Math.min(stepIdx, Math.max(0, totalSteps - 1));
  const currentStep =
    recipe.timeline_steps[safeStepIdx] ?? recipe.timeline_steps[0];

  const scaleFactor =
    (currentServings ?? recipe.servings) / Math.max(1, recipe.servings);

  const handleNextStep = useCallback(() => {
    setStepIdx((prev) => Math.min(totalSteps - 1, prev + 1));
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setStepIdx((prev) => Math.max(0, prev - 1));
  }, []);

  // Acquire Screen Wake Lock while in Hands-Free Cooking Mode
  useEffect(() => {
    let sentinel: WakeLockSentinelLike | null = null;
    void (async () => {
      sentinel = await requestScreenWakeLock();
      setWakeLockActive(true);
    })();
    return () => {
      void sentinel?.release();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        handleNextStep();
      } else if (e.key === "ArrowLeft") {
        handlePrevStep();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleNextStep, handlePrevStep]);

  const {
    isListening,
    isSpeaking,
    lastTranscript,
    assistantMessage,
    toggleListening,
    readCurrentStepAloud,
    simulateVoiceCommand,
  } = useVoiceSousChef({
    recipe,
    currentStepIndex: safeStepIdx,
    timers,
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onStartTimer,
    onPauseTimers: onPauseAllTimers,
  });

  if (!currentStep) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Step Stage */}
      <div className="lg:col-span-8 space-y-5">
        <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#C85A32]">
                  {recipe.title}
                </span>
                {wakeLockActive && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    Screen stays awake
                  </span>
                )}
              </div>
              <h2 className="font-switzer text-2xl sm:text-3xl font-medium text-zinc-950 mt-1">
                Step {currentStep.step_number} of {totalSteps}:{" "}
                {currentStep.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97] ${
                  isListening
                    ? "bg-[#C85A32] text-white shadow-sm"
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span>Listening...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span>Voice Control</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={readCurrentStepAloud}
                className="px-4 py-2.5 rounded-full bg-[#F6F6F4] hover:bg-zinc-200/70 text-zinc-900 border border-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-1.5 active:scale-[0.97]"
              >
                <Volume2 className="h-4 w-4" />
                <span>Read Step</span>
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="grid grid-flow-col auto-cols-fr gap-2">
            {recipe.timeline_steps.map((s, idx) => (
              <button
                key={s.step_number}
                type="button"
                onClick={() => setStepIdx(idx)}
                className={`h-2 rounded-full transition-colors ${
                  idx === safeStepIdx
                    ? "bg-[#C85A32]"
                    : idx < safeStepIdx
                      ? "bg-zinc-900"
                      : "bg-zinc-200"
                }`}
                aria-label={`Jump to step ${s.step_number}`}
              />
            ))}
          </div>

          {/* Large Instruction Display */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-4">
            <p className="font-switzer text-xl sm:text-2xl text-zinc-950 font-normal leading-relaxed">
              {currentStep.instruction}
            </p>

            {currentStep.sensory_cue && (
              <div className="p-3.5 rounded-xl bg-[#FDF6EF] border border-[#EED9C4] text-sm text-[#9A4220]">
                <strong className="font-medium">What to look for:</strong>{" "}
                {currentStep.sensory_cue}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {currentStep.duration_seconds > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onStartTimer(
                      currentStep.timer_label ??
                        `Step ${currentStep.step_number}`,
                      currentStep.duration_seconds,
                      currentStep.step_number
                    )
                  }
                  className="px-4 py-2 rounded-full bg-zinc-950 text-white font-medium text-xs sm:text-sm flex items-center gap-2 active:scale-[0.97]"
                >
                  <Timer className="h-4 w-4" />
                  <span>
                    Start{" "}
                    {Math.max(1, Math.round(currentStep.duration_seconds / 60))}
                    m Timer
                  </span>
                </button>
              )}

              {currentStep.equipment.map((eq) => (
                <span
                  key={eq}
                  className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs text-zinc-600"
                >
                  {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={safeStepIdx === 0}
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-full bg-[#F6F6F4] hover:bg-zinc-200/70 disabled:opacity-40 text-xs sm:text-sm font-medium text-zinc-900 flex items-center gap-2 border border-zinc-200 active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-zinc-400">
              Use ← / → arrow keys or voice
            </span>

            <button
              type="button"
              disabled={safeStepIdx >= totalSteps - 1}
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 disabled:opacity-40 text-white font-medium text-xs sm:text-sm flex items-center gap-2 active:scale-[0.97]"
            >
              <span>Next Step</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Ask Sous Chef Bar */}
        <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-switzer text-base font-medium text-zinc-950">
              Ask Sous Chef
            </h3>
            {isSpeaking && (
              <span className="text-xs text-[#C85A32] font-medium animate-pulse">
                Speaking...
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-1.5">
            {lastTranscript && (
              <p className="text-xs text-zinc-500">
                You asked:{" "}
                <span className="text-zinc-900 font-medium">
                  &ldquo;{lastTranscript}&rdquo;
                </span>
              </p>
            )}
            <p className="text-sm text-zinc-900 font-medium">
              {assistantMessage}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              "Next step",
              "Repeat",
              "How much cumin?",
              "Set a timer for 8 minutes",
              "What can I substitute for heavy cream?",
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => void simulateVoiceCommand(cmd)}
                className="px-3 py-1 rounded-full bg-[#F6F6F4] hover:bg-zinc-200/70 border border-zinc-200 text-xs text-zinc-700 active:scale-[0.97]"
              >
                &ldquo;{cmd}&rdquo;
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualQuery.trim()) return;
              void simulateVoiceCommand(manualQuery);
              setManualQuery("");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Ask a question about this step or ingredient..."
              className="flex-1 rounded-full bg-[#F6F6F4] border border-zinc-200 px-4 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-zinc-950 text-white font-medium text-xs flex items-center gap-1.5 active:scale-[0.97]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Active Timers & Scaled Ingredients */}
      <div className="lg:col-span-4 space-y-5">
        <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-switzer text-base font-medium text-zinc-950 flex items-center gap-2">
              <Timer className="h-4 w-4 text-[#C85A32]" />
              <span>Active Timers ({timers.length})</span>
            </h3>
            {timers.length > 0 && (
              <button
                type="button"
                onClick={onPauseAllTimers}
                className="text-xs text-zinc-500 hover:text-zinc-950"
              >
                Pause All
              </button>
            )}
          </div>

          {timers.length === 0 ? (
            <p className="text-xs text-zinc-400 py-6 text-center border border-dashed border-zinc-200 rounded-2xl">
              No timers running yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {timers.map((t) => {
                const pct = Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round((t.remainingSeconds / t.totalSeconds) * 100)
                  )
                );
                return (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-[#F6F6F4] border border-zinc-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-900">
                        {t.label}
                      </span>
                      <span className="font-mono text-base font-bold text-[#C85A32]">
                        {formatSeconds(t.remainingSeconds)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full bg-[#C85A32] transition-all duration-300 linear"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleTimer(t.id)}
                        className="px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-xs text-zinc-700 flex items-center gap-1"
                      >
                        {t.isRunning ? (
                          <>
                            <Pause className="h-3 w-3" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" /> Resume
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDismissTimer(t.id)}
                        className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bug Fix #2: Ingredients Reference uses scaled quantities & selected unitSystem */}
        <div className="rounded-[28px] bg-white border border-zinc-200/80 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-switzer text-base font-medium text-zinc-950">
              Ingredients ({currentServings ?? recipe.servings} servings)
            </h3>
            <span className="text-[11px] font-mono uppercase text-zinc-400">
              {unitSystem}
            </span>
          </div>
          <ul className="space-y-2 text-xs">
            {recipe.ingredients.map((ing, i) => {
              const formatted = formatIngredientForDisplay(
                ing,
                unitSystem,
                scaleFactor
              );
              return (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-[#F6F6F4] border border-zinc-200/70 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-medium text-zinc-900">{ing.name}</span>
                    {ing.preparation_note && (
                      <span className="block text-[11px] text-zinc-500">
                        {ing.preparation_note}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-[#C85A32] shrink-0">
                    {formatted.quantity} {formatted.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
