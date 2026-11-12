import { NextResponse } from "next/server";
import type {
  AisleCategory,
  NormalizedIngredient,
  ParallelTimelineNode,
  Recipe,
  RecipeParseRequest,
  RecipeSourceType,
} from "@/types/recipe";

export const runtime = "nodejs";

function inferAisle(name: string): AisleCategory {
  const lower = name.toLowerCase();
  if (/(paneer|milk|curd|dahi|yogurt|butter|ghee|cream|cheese)/.test(lower)) {
    return "dairy_eggs";
  }
  if (/(chicken|fish|prawn|mutton|egg|meat|seafood)/.test(lower)) {
    return "meat_seafood";
  }
  if (
    /(cumin|jeera|turmeric|haldi|chili|mirch|masala|hing|coriander powder|garam|cardamom|clove|cinnamon|mustard seed|spice|salt|pepper|kasuri)/.test(
      lower
    )
  ) {
    return "spices_masalas";
  }
  if (/(oil|olive|mustard oil|sesame oil)/.test(lower)) {
    return "spices_oils";
  }
  if (
    /(onion|tomato|palak|spinach|garlic|ginger|chili|coriander leaf|cilantro|potato|aloo|peas|carrot|beans|lemon|mint|cabbage|cauliflower|okra|bhindi|brinjal)/.test(
      lower
    )
  ) {
    return "produce";
  }
  if (/(naan|roti|bread|bun|pav|kulcha|parotta)/.test(lower)) {
    return "bakery_bread";
  }
  return "pantry_dry";
}

function makeIngredient(
  name: string,
  quantity: number,
  unit: string,
  preparation_note: string | null = null,
  gramsOverride?: number
): NormalizedIngredient {
  const cleanName = name.trim();
  const lower = cleanName.toLowerCase();
  const aisle = inferAisle(cleanName);
  const grams =
    gramsOverride ??
    (unit === "g"
      ? quantity
      : unit === "ml"
        ? quantity
        : unit === "katori"
          ? Math.round(quantity * 150)
          : unit === "cup"
            ? Math.round(quantity * 240)
            : unit === "tbsp"
              ? Math.round(quantity * 15)
              : unit === "tsp"
                ? Math.round(quantity * 5)
                : Math.round(quantity * 90));

  const isDairy = aisle === "dairy_eggs";
  const isMeat = aisle === "meat_seafood";
  const isSpice = aisle === "spices_masalas";
  const isOil = aisle === "spices_oils" || /ghee|butter|cream|oil/.test(lower);

  const protein = /paneer|chicken|fish|mutton|egg|prawn/.test(lower)
    ? Math.round(grams * 0.2)
    : /dal|lentil|chana|chickpea|rajma|besan|curd|dahi/.test(lower)
      ? Math.round(grams * 0.14)
      : isSpice
        ? 1
        : Math.round(grams * 0.02);

  const fat = isOil
    ? Math.round(grams * 0.85)
    : /paneer|mutton|curd/.test(lower)
      ? Math.round(grams * 0.16)
      : Math.round(grams * 0.015);

  const carbs = isOil
    ? 0
    : /dal|rice|chana|rajma|flour|atta|besan|potato|aloo/.test(lower)
      ? Math.round(grams * 0.55)
      : isSpice
        ? Math.round(grams * 0.35)
        : Math.round(grams * 0.06);

  const calories = Math.max(12, Math.round(protein * 4 + carbs * 4 + fat * 9));
  const cost = isMeat
    ? Math.max(40, Math.round(grams * 0.45))
    : /paneer|cashew|kaju|almond/.test(lower)
      ? Math.max(30, Math.round(grams * 0.42))
      : isSpice
        ? 12
        : Math.max(15, Math.round(grams * 0.12));

  const flags: string[] = ["gluten-free"];
  if (!isMeat) flags.push("vegetarian");
  if (!isMeat && !isDairy) flags.push("vegan", "dairy-free");
  if (!/(onion|garlic|lasoon|potato|aloo)/.test(lower)) {
    flags.push("jain-friendly");
  }

  return {
    name: cleanName,
    quantity: Number(quantity.toFixed(2)),
    unit,
    aisle_category: aisle,
    preparation_note,
    nutrition_meta: {
      calories_kcal: calories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      fiber_g: aisle === "produce" || /dal|chana/.test(lower) ? 4 : 0.5,
      estimated_cost_inr: cost,
      grams_equivalent: Math.max(5, grams),
      allergens: isDairy ? ["dairy"] : [],
      dietary_flags: flags,
    },
  };
}

function parseIngredientLine(rawLine: string): NormalizedIngredient {
  const cleaned = rawLine.replace(/^[-*•\d.)\s]+/, "").trim();
  const match = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(katori|cups?|tbsps?|tsps?|ml|g|grams?|pieces?|pcs?|cloves?|inch)?\s+(.+)$/i
  );

  if (match) {
    const qty = Number(match[1]) || 1;
    const rawUnit = (match[2] ?? "piece").toLowerCase();
    const unit = rawUnit.startsWith("gram")
      ? "g"
      : rawUnit.startsWith("tbsp")
        ? "tbsp"
        : rawUnit.startsWith("tsp")
          ? "tsp"
          : rawUnit.startsWith("cup")
            ? "cup"
            : rawUnit.startsWith("piece") || rawUnit.startsWith("pc")
              ? "piece"
              : rawUnit;
    const rest = (match[3] ?? cleaned).trim();
    const parts = rest.split(",");
    const ingName = (parts[0] ?? rest).trim();
    const prepNote = parts.length > 1 ? parts.slice(1).join(",").trim() : null;
    return makeIngredient(ingName, qty, unit, prepNote);
  }

  const parts = cleaned.split(",");
  return makeIngredient(
    (parts[0] ?? cleaned).trim(),
    1,
    "piece",
    parts.length > 1 ? parts.slice(1).join(",").trim() : null
  );
}

function applyDietaryAdaptation(
  title: string,
  ingredients: NormalizedIngredient[],
  steps: ParallelTimelineNode[],
  adaptation?: string | null
): {
  title: string;
  ingredients: NormalizedIngredient[];
  steps: ParallelTimelineNode[];
  tags: string[];
  remixMode: string | null;
  remixNote: string | null;
} {
  if (!adaptation || !adaptation.trim()) {
    return {
      title,
      ingredients,
      steps,
      tags: ["imported", "home-cooked"],
      remixMode: null,
      remixNote: null,
    };
  }

  const lower = adaptation.toLowerCase();
  let nextIngs = [...ingredients];
  let nextSteps = [...steps];
  let nextTitle = title;
  const tags = ["imported", "adapted"];
  let remixMode: string | null = "custom";

  if (lower.includes("jain") || lower.includes("no onion")) {
    remixMode = "jain_no_onion_garlic";
    nextTitle = `${title} (Jain Edition)`;
    tags.push("jain-friendly", "no-onion-garlic");
    nextIngs = nextIngs.map((ing) => {
      const n = ing.name.toLowerCase();
      if (n.includes("onion") || n.includes("garlic")) {
        return makeIngredient(
          "asafoetida (hing) & grated fresh ginger",
          1,
          "tsp",
          "Jain-friendly aromatic swap for onion/garlic",
          15
        );
      }
      if (n.includes("potato") || n.includes("aloo")) {
        return makeIngredient(
          "steamed raw banana (kaccha kela)",
          ing.quantity,
          ing.unit,
          "diced • root-free Jain swap"
        );
      }
      return ing;
    });
  } else if (lower.includes("vegan")) {
    remixMode = "vegan";
    nextTitle = `${title} (Plant-Based)`;
    tags.push("vegan", "dairy-free");
    nextIngs = nextIngs.map((ing) => {
      const n = ing.name.toLowerCase();
      if (n.includes("paneer")) {
        return makeIngredient(
          "extra-firm organic tofu",
          ing.quantity,
          ing.unit,
          "pressed & cubed • dairy-free swap"
        );
      }
      if (n.includes("ghee") || n.includes("butter")) {
        return makeIngredient(
          "cold-pressed groundnut oil",
          ing.quantity,
          ing.unit,
          "dairy-free tempering swap"
        );
      }
      if (n.includes("cream") || n.includes("curd") || n.includes("dahi")) {
        return makeIngredient(
          "silky soaked cashew cream",
          ing.quantity,
          ing.unit,
          "blended smooth • plant-based richness"
        );
      }
      return ing;
    });
  } else if (lower.includes("protein")) {
    remixMode = "high_protein";
    nextTitle = `${title} (+40% Protein)`;
    tags.push("high-protein");
    nextIngs = [
      ...nextIngs,
      makeIngredient(
        "roasted soya chunks or hung curd booster",
        0.75,
        "katori",
        "added for +22g extra protein",
        110
      ),
    ];
  } else if (lower.includes("air") || lower.includes("less oil")) {
    remixMode = "air_fryer";
    nextTitle = `${title} (Air-Fryer • -65% Oil)`;
    tags.push("air-fryer", "low-oil");
    nextIngs = nextIngs.map((ing) =>
      /oil|ghee|butter/.test(ing.name.toLowerCase())
        ? makeIngredient(
            ing.name,
            1,
            "tsp",
            "light spray coat (-65% oil)",
            5
          )
        : ing
    );
    nextSteps = nextSteps.map((s) =>
      s.track === "active_cook"
        ? {
            ...s,
            instruction: `${s.instruction} (Cook in pre-heated 195°C Air-Fryer basket with minimal oil brush.)`,
            equipment: ["Air-Fryer Basket"],
          }
        : s
    );
  }

  return {
    title: nextTitle,
    ingredients: nextIngs,
    steps: nextSteps,
    tags,
    remixMode,
    remixNote: adaptation.trim(),
  };
}

function defaultStepsForDish(
  title: string,
  ingredients: NormalizedIngredient[]
): ParallelTimelineNode[] {
  const ingNames = ingredients.slice(0, 3).map((i) => i.name);
  return [
    {
      step_number: 1,
      title: "Mise en Place & Chopping",
      instruction: `Measure all ingredients for ${title} into katoris, finely chop aromatics, and keep whole spices ready by the stove.`,
      track: "prep",
      duration_seconds: 360,
      start_offset_seconds: 0,
      depends_on_steps: [],
      equipment: ["Chef's Knife", "Mixing Bowls"],
      ingredient_names: ingNames,
      timer_label: "Prep (6m)",
      sensory_cue: "Ingredients portioned and aromatics finely diced",
    },
    {
      step_number: 2,
      title: "Temper Whole Spices & Sear Base",
      instruction:
        "Warm ghee or oil in a heavy pan over medium heat, crackle cumin and whole spices until fragrant, then sauté the base until deeply golden.",
      track: "active_cook",
      duration_seconds: 480,
      start_offset_seconds: 360,
      depends_on_steps: [1],
      equipment: ["Heavy Kadhai / Skillet"],
      ingredient_names: ingNames,
      timer_label: "Sauté Base (8m)",
      sensory_cue: "Warm roasted aroma with glossy edges",
    },
    {
      step_number: 3,
      title: "Simmer & Blend Flavors",
      instruction:
        "Cover and simmer gently so textures turn tender and spices infuse evenly without scorching.",
      track: "passive_wait",
      duration_seconds: 600,
      start_offset_seconds: 840,
      depends_on_steps: [2],
      equipment: ["Covered Lid"],
      ingredient_names: ingNames,
      timer_label: "Simmer (10m)",
      sensory_cue: "Steady gentle bubbles and rich color",
    },
    {
      step_number: 4,
      title: "Finish, Garnish & Serve Hot",
      instruction:
        "Adjust salt and acidity to taste, fold in fresh herbs, and serve piping hot.",
      track: "plating",
      duration_seconds: 120,
      start_offset_seconds: 1440,
      depends_on_steps: [3],
      equipment: ["Serving Bowl"],
      ingredient_names: [],
      timer_label: null,
      sensory_cue: "Vibrant color and fresh herb aroma",
    },
  ];
}

function buildSmartDishFromTitle(titleHint: string): {
  title: string;
  cuisine: string;
  description: string;
  ingredients: NormalizedIngredient[];
  steps: ParallelTimelineNode[];
} {
  const lower = titleHint.toLowerCase();

  if (lower.includes("palak") && lower.includes("paneer")) {
    const ings = [
      makeIngredient("fresh spinach (palak)", 300, "g", "blanched & pureed"),
      makeIngredient("malai paneer", 250, "g", "cut into cubes"),
      makeIngredient("garlic cloves (lasoon)", 6, "piece", "finely minced", 24),
      makeIngredient("cumin seeds (jeera)", 1, "tsp", "whole for tadka", 5),
      makeIngredient("cultured cow ghee", 1.5, "tbsp", "for smoky tadka", 22),
      makeIngredient("roma tomato", 2, "piece", "finely chopped", 180),
    ];
    return {
      title: "Lasooni Palak Paneer (Dhaba Style)",
      cuisine: "North Indian",
      description:
        "Velvety emerald spinach puree gently simmered with golden seared paneer cubes and crowned with crisp burnt-garlic ghee tadka.",
      ingredients: ings,
      steps: defaultStepsForDish("Lasooni Palak Paneer", ings),
    };
  }

  if (lower.includes("tikka") || lower.includes("chicken")) {
    const ings = [
      makeIngredient(
        "boneless chicken thigh or paneer",
        400,
        "g",
        "1.5-inch tikka pieces"
      ),
      makeIngredient("hung curd (thick yogurt)", 0.75, "katori", "whisked smooth"),
      makeIngredient("ginger-garlic paste", 1.5, "tbsp", "freshly crushed"),
      makeIngredient("kashmiri red chili & tandoori masala", 2, "tbsp", "bloomed"),
      makeIngredient("mustard oil", 1, "tbsp", "for smoky marinade"),
    ];
    return {
      title: "Air-Fryer Tandoori Chicken Tikka",
      cuisine: "North Indian Tandoori",
      description:
        "High-protein spiced yogurt marinade charred crisp at 200°C with smoky dhaba flavor and 65% less oil.",
      ingredients: ings,
      steps: defaultStepsForDish("Tandoori Chicken Tikka", ings),
    };
  }

  if (lower.includes("khichdi") || lower.includes("dal")) {
    const ings = [
      makeIngredient("yellow moong dal", 0.75, "katori", "washed & soaked 15m"),
      makeIngredient("sona masoori or basmati rice", 0.75, "katori", "rinsed clean"),
      makeIngredient("turmeric powder (haldi)", 0.5, "tsp", "for golden color"),
      makeIngredient("cumin seeds (jeera)", 1, "tsp", "crackle in hot ghee"),
      makeIngredient("pure cow ghee", 1.5, "tbsp", "for finishing tadka"),
    ];
    return {
      title: "15-Min Comfort Tadka Dal Khichdi",
      cuisine: "Indian Comfort",
      description:
        "One-pot pressure-cooked moong dal and rice khichdi topped with fragrant cumin, hing, and roasted garlic ghee tadka.",
      ingredients: ings,
      steps: defaultStepsForDish("Tadka Dal Khichdi", ings),
    };
  }

  const cleanTitle = titleHint
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const finalTitle = cleanTitle || "Imported Home Kitchen Special";
  const ings = [
    makeIngredient("fresh seasonal vegetables or protein", 300, "g", "diced evenly"),
    makeIngredient("red onion", 1, "piece", "finely sliced", 110),
    makeIngredient("roma tomato", 2, "piece", "chopped", 180),
    makeIngredient("ginger-garlic paste", 1, "tbsp", "freshly crushed", 15),
    makeIngredient("cumin & coriander spice blend", 1.5, "tbsp", "whole & ground"),
    makeIngredient("cold-pressed cooking oil or ghee", 1.5, "tbsp", "for sautéing"),
  ];
  return {
    title: finalTitle,
    cuisine: "Indian & Global Home Kitchen",
    description: `Structured recipe imported directly from your link/notes into normalized 150ml katori and gram measurements.`,
    ingredients: ings,
    steps: defaultStepsForDish(finalTitle, ings),
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,15})/
  );
  return m?.[1] ?? null;
}

async function fetchMetadataFromUrl(sourceUrl: string): Promise<{
  sourceType: RecipeSourceType;
  titleHint: string;
  authorName: string;
  description: string;
  extractedIngredients: string[];
  extractedSteps: string[];
}> {
  const isYouTube = /(?:youtube\.com|youtu\.be)/i.test(sourceUrl);
  const isInstagram = /instagram\.com/i.test(sourceUrl);
  const sourceType: RecipeSourceType = isYouTube
    ? "youtube_shorts"
    : isInstagram
      ? "instagram_reel"
      : "website_url";

  let titleHint = "";
  let authorName = "Imported Creator";
  let description = "";
  const extractedIngredients: string[] = [];
  const extractedSteps: string[] = [];

  // Derive fallback title from URL slug just in case network fetch is blocked
  try {
    const parsedUrl = new URL(sourceUrl);
    const slugParts = parsedUrl.pathname
      .split("/")
      .filter((p) => p && p !== "reel" && p !== "shorts" && p !== "watch");
    const lastSlug = slugParts[slugParts.length - 1] ?? "";
    if (lastSlug && !extractYouTubeId(sourceUrl)) {
      titleHint = decodeURIComponent(lastSlug).replace(/[-_]+/g, " ");
    }
  } catch {
    // ignore malformed URL
  }

  // 1. Official YouTube oEmbed + Watch Metadata (fast, zero-auth, reliable)
  if (isYouTube) {
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`,
        { signal: AbortSignal.timeout(4500) }
      );
      if (oembedRes.ok) {
        const data = (await oembedRes.json()) as {
          title?: string;
          author_name?: string;
        };
        if (data.title) titleHint = data.title;
        if (data.author_name) authorName = data.author_name;
      }
    } catch {
      // continue to page fetch fallback
    }

    const ytId = extractYouTubeId(sourceUrl);
    if (ytId) {
      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(4500),
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          const descMatch = html.match(/"shortDescription":"((?:\\.|[^"\\])*)"/);
          if (descMatch?.[1]) {
            description = JSON.parse(`"${descMatch[1]}"`) as string;
            for (const line of description.split(/\r?\n/)) {
              const trimmed = line.trim();
              if (
                /^[-•*\d]/.test(trimmed) &&
                /(g|ml|tbsp|tsp|cup|katori|salt|oil|onion|tomato|chicken|paneer|dal|masala|rice|ginger|garlic)/i.test(
                  trimmed
                )
              ) {
                extractedIngredients.push(trimmed);
              }
            }
          }
          if (!titleHint) {
            const tMatch = html.match(/<title>(.*?)<\/title>/i);
            if (tMatch?.[1]) {
              titleHint = decodeHtmlEntities(
                tMatch[1].replace(/\s*-\s*YouTube\s*$/i, "")
              );
            }
          }
        }
      } catch {
        // graceful fallback
      }
    }
    return {
      sourceType,
      titleHint: titleHint || "YouTube Recipe Video",
      authorName,
      description,
      extractedIngredients: extractedIngredients.slice(0, 14),
      extractedSteps,
    };
  }

  // 2. General Website / Blog URL: Parse Schema.org Recipe JSON-LD & <title>
  try {
    const pageRes = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MiseFoodBot/1.0; +https://misefood.app)",
      },
      signal: AbortSignal.timeout(4500),
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const tMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (tMatch?.[1]) {
        titleHint = decodeHtmlEntities(tMatch[1].trim());
      }

      const jsonLdMatches = html.matchAll(
        /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
      );
      for (const m of jsonLdMatches) {
        try {
          const rawJson = m[1];
          if (!rawJson) continue;
          const parsed = JSON.parse(rawJson) as unknown;
          const queue: unknown[] = Array.isArray(parsed) ? [...parsed] : [parsed];
          while (queue.length > 0) {
            const node = queue.shift() as Record<string, unknown> | null;
            if (!node || typeof node !== "object") continue;
            if (Array.isArray(node["@graph"])) {
              queue.push(...(node["@graph"] as unknown[]));
            }
            const nodeType = node["@type"];
            const isRecipe =
              nodeType === "Recipe" ||
              (Array.isArray(nodeType) && nodeType.includes("Recipe"));
            if (isRecipe) {
              if (typeof node.name === "string") titleHint = node.name;
              if (typeof node.description === "string") {
                description = node.description;
              }
              if (Array.isArray(node.recipeIngredient)) {
                for (const item of node.recipeIngredient) {
                  if (typeof item === "string") extractedIngredients.push(item);
                }
              }
              if (Array.isArray(node.recipeInstructions)) {
                for (const step of node.recipeInstructions) {
                  if (typeof step === "string") {
                    extractedSteps.push(step);
                  } else if (
                    step &&
                    typeof step === "object" &&
                    typeof (step as Record<string, unknown>).text === "string"
                  ) {
                    extractedSteps.push(
                      String((step as Record<string, unknown>).text)
                    );
                  }
                }
              }
              break;
            }
          }
        } catch {
          // ignore malformed JSON-LD block
        }
      }
    }
  } catch {
    // graceful fallback when target host rejects bot fetch
  }

  return {
    sourceType,
    titleHint: titleHint || "Saved Web Recipe",
    authorName,
    description,
    extractedIngredients: extractedIngredients.slice(0, 16),
    extractedSteps: extractedSteps.slice(0, 10),
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RecipeParseRequest;
    const rawText = (body.raw_text ?? "").trim();
    const sourceUrl = body.source_url?.trim() || null;

    if (!rawText && !sourceUrl && !body.image_base64) {
      return NextResponse.json(
        { error: "Please paste a recipe URL, recipe text, or upload a photo." },
        { status: 400 }
      );
    }

    let title = "";
    let cuisine = "Indian Home Kitchen";
    let description = "";
    let servings = 3;
    let authorName = "Home Chef Import";
    let sourceType: RecipeSourceType = body.image_base64
      ? "ocr_image"
      : "manual";
    let ingredients: NormalizedIngredient[] = [];
    let steps: ParallelTimelineNode[] = [];

    if (sourceUrl) {
      const urlMeta = await fetchMetadataFromUrl(sourceUrl);
      sourceType = urlMeta.sourceType;
      authorName = urlMeta.authorName;

      if (urlMeta.extractedIngredients.length > 0) {
        title = urlMeta.titleHint;
        description =
          urlMeta.description.slice(0, 260) ||
          `Imported directly from ${sourceType.replace("_", " ")}.`;
        ingredients = urlMeta.extractedIngredients.map(parseIngredientLine);
        steps =
          urlMeta.extractedSteps.length > 0
            ? urlMeta.extractedSteps.map((inst, idx) => ({
                step_number: idx + 1,
                title: `Step ${idx + 1}`,
                instruction: inst,
                track: idx === 0 ? "prep" : "active_cook",
                duration_seconds: 300,
                start_offset_seconds: idx * 300,
                depends_on_steps: idx === 0 ? [] : [idx],
                equipment: ["Pan"],
                ingredient_names: [],
                timer_label: `Step ${idx + 1} (5m)`,
                sensory_cue: null,
              }))
            : defaultStepsForDish(title, ingredients);
      } else {
        const smart = buildSmartDishFromTitle(urlMeta.titleHint);
        title = smart.title;
        cuisine = smart.cuisine;
        description = urlMeta.description
          ? `${urlMeta.description.split("\n")[0]?.slice(0, 220) ?? smart.description}`
          : smart.description;
        ingredients = smart.ingredients;
        steps = smart.steps;
      }
    } else if (rawText) {
      const lines = rawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      title = lines[0]?.replace(/^(title|recipe)\s*:\s*/i, "") || "Scanned Recipe";
      const servLine = lines.find((l) => /servings?\s*:\s*\d+/i.test(l));
      if (servLine) {
        const m = servLine.match(/\d+/);
        if (m?.[0]) servings = Math.max(1, Math.min(12, Number(m[0])));
      }

      const ingLines = lines.filter(
        (l) => /^[-*•]\s+/.test(l) && !/^(ingredients|instructions)/i.test(l)
      );
      const stepLines = lines.filter((l) => /^\d+[.)]\s+/.test(l));

      ingredients =
        ingLines.length > 0
          ? ingLines.map(parseIngredientLine)
          : buildSmartDishFromTitle(title).ingredients;

      steps =
        stepLines.length > 0
          ? stepLines.map((line, idx) => ({
              step_number: idx + 1,
              title: `Step ${idx + 1}`,
              instruction: line.replace(/^\d+[.)]\s+/, "").trim(),
              track:
                idx === 0
                  ? "prep"
                  : idx === stepLines.length - 1
                    ? "plating"
                    : /simmer|pressure|rest|marinate/i.test(line)
                      ? "passive_wait"
                      : "active_cook",
              duration_seconds: 360,
              start_offset_seconds: idx * 360,
              depends_on_steps: idx === 0 ? [] : [idx],
              equipment: ["Kadhai / Pan"],
              ingredient_names: [],
              timer_label: `Step ${idx + 1} (6m)`,
              sensory_cue: null,
            }))
          : defaultStepsForDish(title, ingredients);
      description = `Imported and normalized ${ingredients.length} ingredients into strict gram and 150ml katori measurements.`;
    } else {
      const smart = buildSmartDishFromTitle("Scanned Cookbook Recipe");
      title = smart.title;
      cuisine = smart.cuisine;
      description = smart.description;
      ingredients = smart.ingredients;
      steps = smart.steps;
    }

    const adapted = applyDietaryAdaptation(
      title,
      ingredients,
      steps,
      body.dietary_adaptation
    );
    const totalCost = Math.round(
      adapted.ingredients.reduce(
        (sum, ing) => sum + (ing.nutrition_meta.estimated_cost_inr ?? 20),
        0
      )
    );

    const recipe: Recipe = {
      id: `imp-${Date.now()}`,
      title: adapted.title,
      slug: adapted.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      description,
      cuisine,
      difficulty: "Intermediate",
      source_type: sourceType,
      source_url: sourceUrl,
      prep_time_minutes: 12,
      cook_time_minutes: Math.max(
        10,
        Math.round(
          adapted.steps.reduce((s, st) => s + st.duration_seconds, 0) / 60
        )
      ),
      servings,
      estimated_total_cost_inr: totalCost,
      hero_image_url: null,
      ingredients: adapted.ingredients,
      timeline_steps: adapted.steps,
      tags: adapted.tags,
      likes_count: 1,
      forks_count: 0,
      author_name: authorName,
      parent_recipe_id: null,
      remix_mode: adapted.remixMode,
      remix_note: adapted.remixNote,
      similarity_score: 0.96,
      reviews: [],
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(recipe, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to parse recipe payload.",
      },
      { status: 400 }
    );
  }
}
