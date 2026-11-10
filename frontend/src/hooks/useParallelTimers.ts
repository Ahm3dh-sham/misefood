"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActiveCookingTimer } from "@/types/recipe";

function playCompletionChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // Ignore if browser blocks audio context
  }
}

export function useParallelTimers() {
  const [timers, setTimers] = useState<ActiveCookingTimer[]>([]);

  const startTimer = useCallback(
    (label: string, durationSeconds: number, stepNumber: number | null = null) => {
      if (durationSeconds <= 0) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setTimers((prev) => [
        ...prev,
        {
          id,
          label,
          totalSeconds: durationSeconds,
          remainingSeconds: durationSeconds,
          isRunning: true,
          stepNumber,
        },
      ]);
    },
    []
  );

  const toggleTimer = useCallback((id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  }, []);

  const dismissTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pauseAllTimers = useCallback(() => {
    setTimers((prev) => prev.map((t) => ({ ...t, isRunning: false })));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimers((prev) => {
        const hasRunning = prev.some((t) => t.isRunning && t.remainingSeconds > 0);
        if (!hasRunning) return prev;
        return prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const nextRemaining = t.remainingSeconds - 1;
          if (nextRemaining === 0) {
            playCompletionChime();
          }
          return {
            ...t,
            remainingSeconds: nextRemaining,
            isRunning: nextRemaining > 0,
          };
        });
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return {
    timers,
    startTimer,
    toggleTimer,
    dismissTimer,
    pauseAllTimers,
  };
}
