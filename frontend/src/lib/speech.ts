/**
 * Web Speech API (SpeechRecognition & SpeechSynthesis) + Screen Wake Lock controller
 * for MiseFood Hands-Free Sous Chef Mode.
 */

export interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

export interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function createSpeechRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const instance = new Ctor();
  instance.continuous = true;
  instance.interimResults = false;
  instance.lang = "en-IN";
  return instance;
}

export function speakAloud(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 1.0;
  if (onEnd) {
    utterance.onend = () => onEnd();
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

export async function requestScreenWakeLock(): Promise<WakeLockSentinelLike | null> {
  if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
    return null;
  }
  try {
    const nav = navigator as unknown as {
      wakeLock: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
    };
    return await nav.wakeLock.request("screen");
  } catch {
    return null;
  }
}
