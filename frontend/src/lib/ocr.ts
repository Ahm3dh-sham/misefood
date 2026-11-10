import { createWorker } from "tesseract.js";

export interface OcrExtractionResult {
  transcript: string;
  confidence: number;
}

/**
 * Extracts raw recipe text from an image File using Tesseract.js on the client
 * and also converts the file to base64 so Gemini Vision on the backend can
 * perform multimodal verification.
 */
export async function runTesseractOcr(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrExtractionResult> {
  const worker = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    return {
      transcript: data.text.trim(),
      confidence: Math.round(data.confidence),
    };
  } finally {
    await worker.terminate();
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIdx = result.indexOf(",");
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}
