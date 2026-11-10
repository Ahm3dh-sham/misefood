"use client";

import React, { useState } from "react";
import {
  FileText,
  Globe,
  ImageUp,
  Loader2,
  Sparkles,
  Video,
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
      setErrorMsg("Photo uploaded. Ready to extract recipe details.");
    } finally {
      setOcrProgress(null);
    }
  };

  const handleImportRecipe = async () => {
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const created = await parseRecipeWithAI({
        raw_text: importMode === "ocr" ? rawText : "",
        source_url: importMode === "url" ? sourceUrl : null,
        // Bug fix: never send stale photo payload when importing from URL
        image_base64: importMode === "ocr" ? imageBase64 : null,
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
          : "Could not import recipe right now. Please try again."
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-[28px] bg-white border border-zinc-200 shadow-2xl overflow-hidden text-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-200/80 flex items-center justify-between">
          <div>
            <h2 className="font-switzer text-lg font-medium text-zinc-950">
              Import Recipe
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Save from any website, YouTube video, Instagram Reel, or cookbook
              photo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full bg-[#F2F3F5]">
            <button
              type="button"
              onClick={() => setImportMode("url")}
              className={`py-2 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                importMode === "url"
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Link / Video</span>
            </button>
            <button
              type="button"
              onClick={() => setImportMode("ocr")}
              className={`py-2 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                importMode === "ocr"
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:text-zinc-950"
              }`}
            >
              <ImageUp className="h-3.5 w-3.5" />
              <span>Photo / Text</span>
            </button>
          </div>

          {importMode === "url" ? (
            <div className="space-y-3">
              <label className="block text-xs font-medium text-zinc-700">
                Recipe URL
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl bg-[#F6F6F4] border border-zinc-200 px-3.5 py-2.5">
                <Globe className="h-4 w-4 text-zinc-400 shrink-0" />
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/... or any recipe blog"
                  className="w-full bg-transparent text-xs text-zinc-950 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-400">Try an example:</span>
                {[
                  {
                    label: "Lasooni Palak Paneer",
                    url: "https://www.instagram.com/reel/lasooni-palak-paneer",
                  },
                  {
                    label: "Air-Fryer Chicken Tikka",
                    url: "https://www.youtube.com/shorts/air-fryer-tandoori-tikka",
                  },
                  {
                    label: "15-Min Tadka Dal Khichdi",
                    url: "https://misefood.app/blog/moong-dal-khichdi",
                  },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setSourceUrl(preset.url)}
                    className="px-2.5 py-1 rounded-full bg-[#F6F6F4] hover:bg-zinc-200/70 border border-zinc-200 text-[11px] text-zinc-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="flex flex-col items-center justify-center p-5 rounded-2xl border border-dashed border-zinc-300 bg-[#F6F6F4] hover:border-zinc-500 cursor-pointer transition-colors">
                <ImageUp className="h-5 w-5 text-[#C85A32] mb-1.5" />
                <span className="text-xs font-medium text-zinc-900">
                  Upload a cookbook page or handwritten recipe photo
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5">
                  PNG, JPG, WEBP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handleImageUpload(e)}
                  className="hidden"
                />
              </label>

              {ocrProgress !== null && (
                <div className="p-3 rounded-xl bg-[#FDF6EF] border border-[#EED9C4] flex items-center justify-between text-xs text-[#9A4220]">
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reading recipe photo...
                  </span>
                  <span className="font-mono">{ocrProgress}%</span>
                </div>
              )}

              {ocrConfidence !== null && (
                <div className="text-xs text-emerald-700 font-medium">
                  ✓ Photo text extracted ({ocrConfidence}% clarity)
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5 mb-1.5">
                  <FileText className="h-3.5 w-3.5 text-zinc-400" />
                  Recipe Text
                </label>
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full rounded-2xl bg-[#F6F6F4] border border-zinc-200 p-3.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          )}

          {/* Dietary Adaptation Selection */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-2">
              Dietary preference (optional)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
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
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    dietaryAdaptation === pill
                      ? "bg-zinc-950 border-zinc-950 text-white font-medium"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
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
              placeholder="Or add a custom note (e.g., less oil, swap paneer for tofu)..."
              className="w-full rounded-2xl bg-[#F6F6F4] border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-zinc-200/80 bg-[#F6F6F4] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isParsing}
            onClick={() => void handleImportRecipe()}
            className="px-5 py-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs flex items-center gap-2 disabled:opacity-50 active:scale-[0.97]"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Save Recipe</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
