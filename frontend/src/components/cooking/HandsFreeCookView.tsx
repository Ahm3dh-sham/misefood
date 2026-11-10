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
  Sparkles,
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
import type { ActiveCookingTimer, Recipe } from "@/types/recipe";

interface HandsFreeCookViewProps {
  recipe: Recipe;
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
  timers,
  onStartTimer,
  onToggleTimer,
  onDismissTimer,
  onPauseAllTimers,
}: HandsFreeCookViewProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [manualQuery, setManualQuery] = useState("");
  const [wakeLockActive, setWakeLockActive] = useState(true);

  const totalSteps = recipe.timeline_steps.length;
  const currentStep =
    recipe.timeline_steps[stepIdx] ?? recipe.timeline_steps[0];

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

  // Emil Kowalski rule: Keyboard navigation (ArrowLeft / ArrowRight) executes with zero animation latency
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
    currentStepIndex: stepIdx,
    timers,
    onNextStep: handleNextStep,
    onPrevStep: handlePrevStep,
    onStartTimer,
    onPauseTimers: onPauseAllTimers,
  });

  if (!currentStep) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main High-Contrast Step Stage */}
      <div className="lg:col-span-8 space-y-5">
        <div className="rounded-3xl bg-charcoal border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Hands-Free Voice Sous Chef Mode
                </span>
                {wakeLockActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sun className="h-3 w-3" />
                    Screen Wake-Lock Active
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Step {currentStep.step_number} of {totalSteps}:{" "}
                {currentStep.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-transform duration-150 ease-emil-out active:scale-[0.97] ${
                  isListening
                    ? "bg-emerald-500 text-obsidian shadow-lg shadow-emerald-500/25"
                    : "bg-white/10 text-white hover:bg-white/15 border border-white/15"
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span>Listening (Web Speech)...</span>
                  </>
                ) : (
                  <>
                    <MicOff className="h-4 w-4 text-zinc-400" />
                    <span>Enable Voice Mic</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={readCurrentStepAloud}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs sm:text-sm font-medium flex items-center gap-1.5 active:scale-[0.97]"
              >
                <Volume2 className="h-4 w-4" />
                <span>Read Aloud</span>
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
                  idx === stepIdx
                    ? "bg-amber-400"
                    : idx < stepIdx
                      ? "bg-emerald-500/60"
                      : "bg-white/10"
                }`}
                aria-label={`Jump to step ${s.step_number}`}
              />
            ))}
          </div>

          {/* High-Contrast Instruction Display */}
          <div className="p-6 rounded-2xl bg-obsidian border border-white/10 space-y-4">
            <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
              {currentStep.instruction}
            </p>

            {currentStep.sensory_cue && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-200">
                <strong className="font-semibold">Chef Sensory Cue:</strong>{" "}
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
                  className="px-4 py-2 rounded-xl bg-amber-500 text-obsidian font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-[0.97]"
                >
                  <Timer className="h-4 w-4" />
                  <span>
                    Start Step Timer (
                    {Math.round(currentStep.duration_seconds / 60)}m)
                  </span>
                </button>
              )}

              {currentStep.equipment.map((eq) => (
                <span
                  key={eq}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300"
                >
                  Equipment: {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={stepIdx === 0}
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 text-sm text-white flex items-center gap-2 border border-white/10 active:scale-[0.97]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Step (←)</span>
            </button>

            <span className="text-xs font-mono text-zinc-400">
              Track: {currentStep.track.replace("_", " ").toUpperCase()}
            </span>

            <button
              type="button"
              disabled={stepIdx >= totalSteps - 1}
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-obsidian font-semibold text-sm flex items-center gap-2 active:scale-[0.97]"
            >
              <span>Next Step (→)</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Voice Sous Chef Live Console & Quick Voice Command Simulator */}
        <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">
                AI Voice Command Loop (Web Speech API + FastAPI Responder)
              </h3>
            </div>
            {isSpeaking && (
              <span className="text-xs text-emerald-400 font-mono animate-pulse">
                Speaking via SpeechSynthesis...
              </span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-obsidian border border-white/10 space-y-1.5">
            {lastTranscript && (
              <p className="text-xs text-zinc-400">
                Heard:{" "}
                <span className="text-amber-300 font-mono">
                  &ldquo;{lastTranscript}&rdquo;
                </span>
              </p>
            )}
            <p className="text-sm text-emerald-200 font-medium">
              {assistantMessage}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400">Voice Triggers:</span>
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
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 active:scale-[0.97]"
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
              placeholder="Say or type a command (e.g., 'What can I substitute for heavy cream?')..."
              className="flex-1 rounded-xl bg-obsidian border border-white/10 px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-obsidian font-semibold text-xs flex items-center gap-1.5 active:scale-[0.97]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Multi-Track Concurrent Floating Timers */}
      <div className="lg:col-span-4 space-y-5">
        <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-400" />
              <span>Concurrent Floating Timers ({timers.length})</span>
            </h3>
            {timers.length > 0 && (
              <button
                type="button"
                onClick={onPauseAllTimers}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Pause All
              </button>
            )}
          </div>

          {timers.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center border border-dashed border-white/10 rounded-xl">
              No active timers running. Click &ldquo;Start Step Timer&rdquo; or
              trigger &ldquo;Set a timer for 8 minutes&rdquo;.
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
                    className="p-3.5 rounded-xl bg-obsidian border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-white">
                        {t.label}
                      </span>
                      <span className="font-mono text-base font-bold text-amber-300">
                        {formatSeconds(t.remainingSeconds)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all duration-300 linear"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleTimer(t.id)}
                        className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-xs text-zinc-300 flex items-center gap-1"
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
                        className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-xs text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Dismiss
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Normalized Ingredients Quick Reference */}
        <div className="rounded-2xl bg-charcoal border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white">
            Normalized Mise en Place Reference
          </h3>
          <ul className="space-y-2 text-xs">
            {recipe.ingredients.map((ing, i) => (
              <li
                key={i}
                className="p-2.5 rounded-xl bg-obsidian/70 border border-white/5 flex items-center justify-between gap-2"
              >
                <div>
                  <span className="font-medium text-white">{ing.name}</span>
                  {ing.preparation_note && (
                    <span className="block text-[11px] text-zinc-400">
                      {ing.preparation_note}
                    </span>
                  )}
                </div>
                <span className="font-mono text-amber-300 shrink-0">
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
