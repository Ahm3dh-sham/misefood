"use client";

import React, { useState } from "react";
import {
  FileText,
  Globe,
  ImageUp,
  Loader2,
  Sparkles,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { parseRecipeWithAI } from "@/lib/api";
import { fileToBase64, runTesseractOcr } from "@/lib/ocr";
import type { Recipe, UnitSystem } from "@/types/recipe";

interface OcrImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  unitSystem: UnitSystem;
  onRecipeParsed: (recipe: Recipe) => void;
}

const SAMPLE_UNSTRUCTURED_RECIPE = `Amritsari Chole & Bhature Bowl
Servings: 3
Ingredients:
- 250 g kabuli chana (chickpeas), soaked overnight
- 2 piece red onion, finely grated
- 3 piece roma tomato, pureed
- 1.5 tsp cumin seeds (jeera), whole
- 2 tbsp chana masala spice blend, freshly roasted
- 2 tbsp cultured A2 cow ghee, for tempering

Instructions:
1. Grate the red onions, puree the tomatoes, and drain the soaked kabuli chana.
2. Pressure cook soaked chickpeas with a tea bag and bay leaf for 16 minutes until melt-in-mouth.
3. Bhuno grated onion and ginger-garlic in hot ghee for 7 minutes until golden brown.
4. Add tomato puree and roasted chana masala; simmer for 8 minutes and pour sizzling ghee tadka on top.`;

export function OcrImporterModal({
  isOpen,
  onClose,
  unitSystem,
  onRecipeParsed,
}: OcrImporterModalProps) {
  const [importMode, setImportMode] = useState<"url" | "ocr">("url");
  const [sourceUrl, setSourceUrl] = useState(
    "https://www.instagram.com/reel/lasooni-palak-paneer-dhaba"
  );
  const [rawText, setRawText] = useState(SAMPLE_UNSTRUCTURED_RECIPE);
  const [dietaryAdaptation, setDietaryAdaptation] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setOcrProgress(5);
    setImageMimeType(file.type || "image/jpeg");

    try {
      const b64 = await fileToBase64(file);
      setImageBase64(b64);
      const res = await runTesseractOcr(file, (pct) => setOcrProgress(pct));
      if (res.transcript) {
        setRawText(res.transcript);
      }
      setOcrConfidence(res.confidence);
    } catch {
      setErrorMsg(
        "Client Tesseract OCR fallback triggered; Gemini 3.8 Vision will extract directly on the server."
      );
    } finally {
      setOcrProgress(null);
    }
  };

  const handleCompileWithLangGraph = async () => {
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const created = await parseRecipeWithAI({
        raw_text: importMode === "ocr" ? rawText : "",
        source_url: importMode === "url" ? sourceUrl : null,
        image_base64: imageBase64,
        image_mime_type: imageMimeType,
        dietary_adaptation: dietaryAdaptation.trim() || null,
        target_unit_system: unitSystem,
      });
      onRecipeParsed(created);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Unable to reach backend; ensure FastAPI server is running on port 8000."
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-charcoal border border-white/15 shadow-2xl overflow-hidden transition-transform duration-200 ease-emil-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Universal Multi-Modal Recipe Importer (Mise + Samsung Food)
              </h2>
              <p className="text-xs text-zinc-400">
                Website URL • YouTube Shorts • Instagram Reel • Handwritten/Book
                OCR • 1-Click Dietary Remix
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-obsidian border border-white/10">
            <button
              type="button"
              onClick={() => setImportMode("url")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${
                importMode === "url"
                  ? "bg-amber-500 text-obsidian"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>URL / YouTube / Instagram Reel</span>
            </button>
            <button
              type="button"
              onClick={() => setImportMode("ocr")}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 ${
                importMode === "ocr"
                  ? "bg-amber-500 text-obsidian"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <ImageUp className="h-4 w-4" />
              <span>Photo &amp; Handwritten OCR / Text</span>
            </button>
          </div>

          {importMode === "url" ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-zinc-300">
                Paste Website Blog, YouTube Video/Shorts, or Instagram Reel URL
                (Strips ads &amp; fluff)
              </label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-400 shrink-0" />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/... or https://youtube.com/shorts/..."
                  className="w-full rounded-xl bg-obsidian border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-zinc-500">Presets:</span>
                {[
                  {
                    label: "IG Reel: Lasooni Palak Paneer",
                    url: "https://www.instagram.com/reel/lasooni-palak-paneer",
                  },
                  {
                    label: "YT Shorts: Air-Fryer Chicken Tikka",
                    url: "https://www.youtube.com/shorts/air-fryer-tandoori-tikka",
                  },
                  {
                    label: "Blog URL: 15-Min Tadka Dal Khichdi",
                    url: "https://misefood.app/blog/moong-dal-khichdi",
                  },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setSourceUrl(preset.url)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-amber-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-white/20 bg-obsidian/60 hover:border-amber-400/50 cursor-pointer transition-colors">
                <ImageUp className="h-6 w-6 text-amber-400 mb-1.5" />
                <span className="text-xs font-medium text-white">
                  Upload cookbook photo or handwritten family card (Tesseract.js
                  + Gemini Vision)
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5">
                  PNG, JPG, WEBP supported
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleImageUpload(e)}
                  className="hidden"
                />
              </label>

              {ocrProgress !== null && (
                <div className="p-3 rounded-xl bg-obsidian border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running client-side Tesseract.js OCR...
                  </span>
                  <span className="font-mono">{ocrProgress}%</span>
                </div>
              )}

              {ocrConfidence !== null && (
                <div className="text-xs text-emerald-400 font-mono">
                  ✓ Tesseract.js OCR complete ({ocrConfidence}% confidence)
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1">
                  <FileText className="h-3.5 w-3.5 text-amber-400" />
                  Raw Recipe Transcript or Paste
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-xl bg-obsidian border border-white/10 p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          )}

          {/* 1-Click AI Recipe Remix Selection during Import */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Optional AI Recipe Remix During Import
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                "Make it High-Protein",
                "Jain-Friendly / No Onion-Garlic",
                "Veganize",
                "Air-Fryer Version",
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() =>
                    setDietaryAdaptation((prev) => (prev === pill ? "" : pill))
                  }
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    dietaryAdaptation === pill
                      ? "bg-amber-500/25 border-amber-500 text-amber-200 font-semibold"
                      : "bg-obsidian border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={dietaryAdaptation}
              onChange={(e) => setDietaryAdaptation(e.target.value)}
              placeholder="Or type custom adaptation (e.g., 'low-oil, swap paneer for tofu')..."
              className="w-full rounded-xl bg-obsidian border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-obsidian/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Target System:{" "}
            <strong className="text-amber-300 uppercase">{unitSystem}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isParsing}
              onClick={() => void handleCompileWithLangGraph()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-obsidian font-semibold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-[0.97]"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Extracting &amp; Normalizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Import &amp; Build Parallel Timeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
