"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { querySousChefVoice } from "@/lib/api";
import {
  createSpeechRecognition,
  speakAloud,
  stopSpeaking,
  type SpeechRecognitionInstance,
} from "@/lib/speech";
import type { ActiveCookingTimer, Recipe } from "@/types/recipe";

interface UseVoiceSousChefOptions {
  recipe: Recipe;
  currentStepIndex: number;
  timers: ActiveCookingTimer[];
  onNextStep: () => void;
  onPrevStep: () => void;
  onStartTimer: (label: string, seconds: number, stepNumber: number | null) => void;
  onPauseTimers: () => void;
}

export function useVoiceSousChef({
  recipe,
  currentStepIndex,
  timers,
  onNextStep,
  onPrevStep,
  onStartTimer,
  onPauseTimers,
}: UseVoiceSousChefOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [assistantMessage, setAssistantMessage] = useState<string>(
    'Say "Next step", "Start timer", or ask "How much miso do I need?"'
  );
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentStep =
    recipe.timeline_steps[currentStepIndex] ?? recipe.timeline_steps[0];

  const handleVoiceCommand = useCallback(
    async (transcript: string) => {
      const cleaned = transcript.trim();
      if (!cleaned || !currentStep) return;

      setLastTranscript(cleaned);
      try {
        const res = await querySousChefVoice({
          recipe_title: recipe.title,
          current_step_number: currentStep.step_number,
          current_instruction: currentStep.instruction,
          ingredients: recipe.ingredients,
          user_transcript: cleaned,
          active_timers: timers.map(
            (t) => `${t.label}: ${t.remainingSeconds}s remaining`
          ),
        });

        setAssistantMessage(res.spoken_reply);
        if (res.action_command === "NEXT_STEP") {
          onNextStep();
        } else if (res.action_command === "PREV_STEP") {
          onPrevStep();
        } else if (
          res.action_command === "START_TIMER" &&
          res.timer_seconds
        ) {
          onStartTimer(
            res.timer_label ?? `Step ${currentStep.step_number} Timer`,
            res.timer_seconds,
            currentStep.step_number
          );
        } else if (res.action_command === "PAUSE_TIMERS") {
          onPauseTimers();
        }

        setIsSpeaking(true);
        speakAloud(res.spoken_reply, () => setIsSpeaking(false));
      } catch {
        const lower = cleaned.toLowerCase();
        if (lower.includes("next")) {
          onNextStep();
          const msg = "Advancing to the next step.";
          setAssistantMessage(msg);
          speakAloud(msg);
        } else if (lower.includes("back") || lower.includes("previous")) {
          onPrevStep();
          const msg = "Returning to the previous step.";
          setAssistantMessage(msg);
          speakAloud(msg);
        } else if (lower.includes("timer")) {
          onStartTimer(
            currentStep.timer_label ?? `Step ${currentStep.step_number}`,
            currentStep.duration_seconds,
            currentStep.step_number
          );
          const msg = `Started timer for ${Math.round(currentStep.duration_seconds / 60)} minutes.`;
          setAssistantMessage(msg);
          speakAloud(msg);
        } else {
          setAssistantMessage(currentStep.instruction);
          speakAloud(currentStep.instruction);
        }
      }
    },
    [
      currentStep,
      onNextStep,
      onPauseTimers,
      onPrevStep,
      onStartTimer,
      recipe.ingredients,
      recipe.title,
      timers,
    ]
  );

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const instance = createSpeechRecognition();
    if (!instance) {
      setAssistantMessage(
        "Web Speech Recognition is not supported in this browser; use the quick voice command simulator below."
      );
      return;
    }

    instance.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      if (latest && latest.isFinal && latest[0]?.transcript) {
        void handleVoiceCommand(latest[0].transcript);
      }
    };
    instance.onerror = () => {
      setIsListening(false);
    };
    instance.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = instance;
    instance.start();
    setIsListening(true);
  }, [handleVoiceCommand, isListening]);

  const readCurrentStepAloud = useCallback(() => {
    if (!currentStep) return;
    setIsSpeaking(true);
    const text = `Step ${currentStep.step_number}, ${currentStep.title}. ${currentStep.instruction}`;
    setAssistantMessage(text);
    speakAloud(text, () => setIsSpeaking(false));
  }, [currentStep]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    lastTranscript,
    assistantMessage,
    toggleListening,
    readCurrentStepAloud,
    simulateVoiceCommand: handleVoiceCommand,
  };
}
