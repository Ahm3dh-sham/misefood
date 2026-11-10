import type {
  Community,
  Cookbook,
  IngredientSubstitutionResponse,
  MadeItReview,
  MarkCookedResponse,
  MealPlanGenerateRequest,
  MealPlanResponse,
  MultiRecipeTimelineResponse,
  NormalizedIngredient,
  PantryItem,
  PantryRescueMatch,
  Recipe,
  RecipeParseRequest,
  RemixMode,
  SousChefVoiceQueryRequest,
  SousChefVoiceQueryResponse,
  StorageLocation,
  AisleCategory,
} from "@/types/recipe";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const FALLBACK_RECIPES: Recipe[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    title: "Smoky Dhaba Paneer Tikka Masala with Garlic Naan",
    slug: "smoky-dhaba-paneer-tikka-masala",
    description:
      "Char-grilled malai paneer cubes marinated in Kashmiri mirch and hung curd, simmered in a velvety onion-tomato-cashew makhani gravy.",
    cuisine: "North Indian Punjabi",
    difficulty: "Intermediate",
    source_type: "instagram_reel",
    source_url: "https://www.instagram.com/reel/misefood-paneer-tikka",
    prep_time_minutes: 15,
    cook_time_minutes: 20,
    servings: 3,
    estimated_total_cost_inr: 265,
    hero_image_url: null,
    likes_count: 642,
    forks_count: 94,
    author_name: "Chef Ranveer Kapoor",
    parent_recipe_id: null,
    remix_mode: null,
    remix_note: null,
    similarity_score: 0.98,
    created_at: "2026-11-10T12:00:00Z",
    tags: [
      "high-protein",
      "vegetarian",
      "indian-classic",
      "paneer",
      "north-indian",
    ],
    reviews: [
      {
        id: "rev-1",
        recipe_id: "11111111-1111-4111-8111-111111111101",
        author_name: "Priya Nair",
        rating: 5,
        review_note:
          "Used the 1-click Jain Remix for my in-laws and nobody could believe there was no onion or garlic!",
        photo_caption: "Charred tawa paneer in clay handi",
        tweak_note: "Swapped heavy cream for soaked kaju paste",
        created_at: "2026-11-10T12:00:00Z",
      },
    ],
    ingredients: [
      {
        name: "malai paneer (fresh cottage cheese)",
        quantity: 300,
        unit: "g",
        aisle_category: "dairy_eggs",
        preparation_note: "cut into 1.5-inch tikka cubes, soaked in warm water",
        nutrition_meta: {
          calories_kcal: 795,
          protein_g: 54,
          carbs_g: 9.6,
          fat_g: 60,
          fiber_g: 0,
          estimated_cost_inr: 135,
          grams_equivalent: 300,
          allergens: ["dairy"],
          dietary_flags: ["vegetarian", "gluten-free", "high-protein"],
        },
      },
      {
        name: "strained hung curd (chakka dahi)",
        quantity: 1,
        unit: "katori",
        aisle_category: "dairy_eggs",
        preparation_note: "whisked smooth with roasted besan",
        nutrition_meta: {
          calories_kcal: 145,
          protein_g: 14.5,
          carbs_g: 6.5,
          fat_g: 6,
          fiber_g: 0,
          estimated_cost_inr: 35,
          grams_equivalent: 150,
          allergens: ["dairy"],
          dietary_flags: ["vegetarian", "gluten-free", "high-protein"],
        },
      },
      {
        name: "red onion",
        quantity: 2,
        unit: "piece",
        aisle_category: "produce",
        preparation_note: "finely chopped for bhuna masala",
        nutrition_meta: {
          calories_kcal: 88,
          protein_g: 2.4,
          carbs_g: 20,
          fat_g: 0.2,
          fiber_g: 3.6,
          estimated_cost_inr: 18,
          grams_equivalent: 220,
          allergens: [],
          dietary_flags: ["vegan", "dairy-free", "gluten-free"],
        },
      },
      {
        name: "roma tomato",
        quantity: 3,
        unit: "piece",
        aisle_category: "produce",
        preparation_note: "blended into smooth puree",
        nutrition_meta: {
          calories_kcal: 66,
          protein_g: 3,
          carbs_g: 14.4,
          fat_g: 0.6,
          fiber_g: 4.2,
          estimated_cost_inr: 22,
          grams_equivalent: 300,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
      {
        name: "cumin seeds (jeera)",
        quantity: 1.5,
        unit: "tsp",
        aisle_category: "spices_masalas",
        preparation_note: "whole for hot ghee tadka",
        nutrition_meta: {
          calories_kcal: 22,
          protein_g: 1.1,
          carbs_g: 2.6,
          fat_g: 1.3,
          fiber_g: 0.6,
          estimated_cost_inr: 8,
          grams_equivalent: 7.5,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
      {
        name: "kashmiri lal mirch & garam masala",
        quantity: 2,
        unit: "tbsp",
        aisle_category: "spices_masalas",
        preparation_note: "bloomed in warm oil for deep ruby color",
        nutrition_meta: {
          calories_kcal: 48,
          protein_g: 1.8,
          carbs_g: 8.5,
          fat_g: 1.9,
          fiber_g: 3.8,
          estimated_cost_inr: 17,
          grams_equivalent: 20,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
      {
        name: "heavy cream (fresh malai)",
        quantity: 3,
        unit: "tbsp",
        aisle_category: "dairy_eggs",
        preparation_note: "chilled for finishing swirl",
        nutrition_meta: {
          calories_kcal: 150,
          protein_g: 1.2,
          carbs_g: 1.5,
          fat_g: 16,
          fiber_g: 0,
          estimated_cost_inr: 30,
          grams_equivalent: 45,
          allergens: ["dairy"],
          dietary_flags: ["vegetarian", "gluten-free", "jain-friendly"],
        },
      },
    ],
    timeline_steps: [
      {
        step_number: 1,
        title: "Whisk Tikka Marinade & Cube Paneer",
        instruction:
          "Whisk hung curd, 1 tbsp Kashmiri lal mirch, and salt; coat the paneer cubes gently and chop the red onions + puree the tomatoes.",
        track: "prep",
        duration_seconds: 300,
        start_offset_seconds: 0,
        depends_on_steps: [],
        equipment: ["Mixing Bowl", "Chef's Knife", "Blender"],
        ingredient_names: [
          "malai paneer (fresh cottage cheese)",
          "strained hung curd (chakka dahi)",
        ],
        timer_label: "Prep & Coat (5m)",
        sensory_cue:
          "Ruby-red yogurt marinade clings thickly to every paneer cube",
      },
      {
        step_number: 2,
        title: "Rest Paneer in Spiced Hung Curd Marinade",
        instruction:
          "Let the coated paneer cubes marinate for 12 minutes so the spices penetrate while you build the gravy on the main burner.",
        track: "passive_wait",
        duration_seconds: 720,
        start_offset_seconds: 300,
        depends_on_steps: [1],
        equipment: ["Covered Bowl"],
        ingredient_names: ["malai paneer (fresh cottage cheese)"],
        timer_label: "Marinate Paneer (12m)",
        sensory_cue: "Aromatic smoky-tangy fragrance",
      },
      {
        step_number: 3,
        title: "Crackle Jeera & Bhuno Onion-Tomato Masala",
        instruction:
          "While paneer marinates, crackle cumin seeds in hot ghee, caramelize chopped onions for 5 minutes, then simmer tomato puree for 5 minutes until oil separates.",
        track: "active_cook",
        duration_seconds: 600,
        start_offset_seconds: 300,
        depends_on_steps: [1],
        equipment: ["Heavy Brass/Steel Kadhai"],
        ingredient_names: ["cumin seeds (jeera)", "red onion", "roma tomato"],
        timer_label: "Bhuno Masala (10m)",
        sensory_cue:
          "Glossy crimson droplets rising around the edges of the kadhai",
      },
      {
        step_number: 4,
        title: "High-Heat Char Paneer Tikka on Cast-Iron Tawa",
        instruction:
          "Sear marinated paneer cubes on a smoking-hot cast-iron tawa for 4 minutes, turning once until edges develop charred dhaba blisters.",
        track: "active_cook",
        duration_seconds: 240,
        start_offset_seconds: 900,
        depends_on_steps: [2],
        equipment: ["Cast-Iron Tawa"],
        ingredient_names: ["malai paneer (fresh cottage cheese)"],
        timer_label: "Char Tikka (4m)",
        sensory_cue:
          "Audible sizzle and smoky blistered corners on the paneer",
      },
      {
        step_number: 5,
        title: "Fold Charred Paneer & Swirl Fresh Cream",
        instruction:
          "Fold the blistered paneer tikka into the simmering makhani gravy, swirl in 3 tbsp fresh cream and crushed kasuri methi, and serve hot.",
        track: "plating",
        duration_seconds: 120,
        start_offset_seconds: 1140,
        depends_on_steps: [3, 4],
        equipment: ["Serving Handi"],
        ingredient_names: [
          "malai paneer (fresh cottage cheese)",
          "heavy cream (fresh malai)",
        ],
        timer_label: null,
        sensory_cue: "Velvety saffron-red gravy ribbons with cream swirl",
      },
    ],
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    title: "High-Protein Lasooni Palak Toor Dal Tadka & Jeera Rice Thali",
    slug: "lasooni-palak-toor-dal-tadka-thali",
    description:
      "Unpolished toor and moong dal pressure-cooked with iron-rich spinach, crowned with a double burnt-garlic & Kashmiri chili ghee tadka alongside fluffy jeera basmati rice.",
    cuisine: "Indian Home Thali",
    difficulty: "Easy",
    source_type: "youtube_shorts",
    source_url: "https://www.youtube.com/shorts/misefood-dal-palak",
    prep_time_minutes: 10,
    cook_time_minutes: 18,
    servings: 3,
    estimated_total_cost_inr: 165,
    hero_image_url: null,
    likes_count: 518,
    forks_count: 72,
    author_name: "Chef Meera Joshi",
    parent_recipe_id: null,
    remix_mode: null,
    remix_note: null,
    similarity_score: 0.94,
    created_at: "2026-11-10T12:00:00Z",
    tags: [
      "thali",
      "high-protein",
      "vegetarian",
      "dal-tadka",
      "budget-friendly",
    ],
    reviews: [],
    ingredients: [
      {
        name: "unpolished toor & yellow moong dal",
        quantity: 1.5,
        unit: "katori",
        aisle_category: "pantry_dry",
        preparation_note: "washed 3 times and soaked 15 mins",
        nutrition_meta: {
          calories_kcal: 740,
          protein_g: 49.5,
          carbs_g: 128,
          fat_g: 3.5,
          fiber_g: 24,
          estimated_cost_inr: 48,
          grams_equivalent: 225,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
      {
        name: "fresh palak (spinach)",
        quantity: 250,
        unit: "g",
        aisle_category: "produce",
        preparation_note: "washed and finely shredded",
        nutrition_meta: {
          calories_kcal: 58,
          protein_g: 7.2,
          carbs_g: 9,
          fat_g: 1,
          fiber_g: 5.5,
          estimated_cost_inr: 30,
          grams_equivalent: 250,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
      {
        name: "aged basmati rice",
        quantity: 1.5,
        unit: "katori",
        aisle_category: "pantry_dry",
        preparation_note: "rinsed until clear for fluffy jeera rice",
        nutrition_meta: {
          calories_kcal: 765,
          protein_g: 15.8,
          carbs_g: 168,
          fat_g: 1.5,
          fiber_g: 3,
          estimated_cost_inr: 42,
          grams_equivalent: 225,
          allergens: [],
          dietary_flags: [
            "vegan",
            "dairy-free",
            "gluten-free",
            "jain-friendly",
          ],
        },
      },
    ],
    timeline_steps: [
      {
        step_number: 1,
        title: "Wash Dal, Rinse Basmati & Shred Palak",
        instruction:
          "Wash the toor-moong dal blend and aged basmati rice in separate bowls; finely shred the fresh palak leaves.",
        track: "prep",
        duration_seconds: 240,
        start_offset_seconds: 0,
        depends_on_steps: [],
        equipment: ["Strainer", "Chef's Knife"],
        ingredient_names: [
          "unpolished toor & yellow moong dal",
          "fresh palak (spinach)",
        ],
        timer_label: "Prep Dal & Greens (4m)",
        sensory_cue: "Rinse water runs crystal clear",
      },
      {
        step_number: 2,
        title: "Pressure Cook Toor-Moong Dal (3 Whistles)",
        instruction:
          "Pressure cook the soaked dal with turmeric, salt, and 3.5 katori water for 11 minutes (3 whistles) until creamy.",
        track: "passive_wait",
        duration_seconds: 660,
        start_offset_seconds: 240,
        depends_on_steps: [1],
        equipment: ["3-Litre Pressure Cooker"],
        ingredient_names: ["unpolished toor & yellow moong dal"],
        timer_label: "Pressure Cook Dal (11m)",
        sensory_cue: "Three steady whistles and fragrant turmeric steam",
      },
      {
        step_number: 3,
        title: "Fold Shredded Palak & Sizzle Double Ghee Tadka",
        instruction:
          "Whisk shredded palak into the hot pressure-cooked dal for 3 minutes until emerald, then pour sizzling cow ghee, jeera, and hing tadka on top.",
        track: "active_cook",
        duration_seconds: 240,
        start_offset_seconds: 900,
        depends_on_steps: [2],
        equipment: ["Tadka Pan", "Wire Whisk"],
        ingredient_names: ["fresh palak (spinach)"],
        timer_label: "Tadka Finish (4m)",
        sensory_cue: "Loud crackle as hot ghee hits the emerald dal surface",
      },
    ],
  },
];

export async function fetchRecipes(query?: string): Promise<Recipe[]> {
  try {
    const url = query
      ? `${API_BASE}/recipes?q=${encodeURIComponent(query)}`
      : `${API_BASE}/recipes`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Recipe[];
  } catch {
    return FALLBACK_RECIPES;
  }
}

export async function parseRecipeWithAI(
  payload: RecipeParseRequest
): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to parse recipe (${res.status})`);
  }
  return (await res.json()) as Recipe;
}

export async function remixRecipeWithAI(
  recipeId: string,
  remixMode: RemixMode,
  customInstruction?: string,
  targetServings?: number
): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${recipeId}/remix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      remix_mode: remixMode,
      custom_instruction: customInstruction ?? null,
      target_servings: targetServings ?? null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to remix recipe (${res.status})`);
  }
  return (await res.json()) as Recipe;
}

export async function forkRecipeOnServer(
  parentRecipe: Recipe,
  remixNote: string,
  scaledIngredients: NormalizedIngredient[],
  servings: number
): Promise<Recipe> {
  const payload = {
    title: `${parentRecipe.title} (Remix)`,
    description: parentRecipe.description,
    cuisine: parentRecipe.cuisine,
    difficulty: parentRecipe.difficulty,
    source_type: "ai_remix",
    source_url: parentRecipe.source_url,
    prep_time_minutes: parentRecipe.prep_time_minutes,
    cook_time_minutes: parentRecipe.cook_time_minutes,
    servings,
    estimated_total_cost_inr: parentRecipe.estimated_total_cost_inr,
    hero_image_url: parentRecipe.hero_image_url,
    ingredients: scaledIngredients,
    timeline_steps: parentRecipe.timeline_steps,
    tags: [...parentRecipe.tags, "remixed"],
    parent_recipe_id: parentRecipe.id,
    remix_note: remixNote,
  };
  const res = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to fork recipe (${res.status})`);
  }
  return (await res.json()) as Recipe;
}

export async function requestIngredientSubstitution(
  ingredient: NormalizedIngredient,
  recipeTitle: string,
  dietaryReason?: string
): Promise<IngredientSubstitutionResponse> {
  const res = await fetch(`${API_BASE}/recipes/substitute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredient,
      recipe_title: recipeTitle,
      dietary_reason: dietaryReason ?? null,
    }),
  });
  if (!res.ok) {
    throw new Error(`Substitution request failed (${res.status})`);
  }
  return (await res.json()) as IngredientSubstitutionResponse;
}

export async function mergeMultiRecipeTimeline(
  recipeIds: string[],
  availableBurners = 3
): Promise<MultiRecipeTimelineResponse> {
  const res = await fetch(`${API_BASE}/timelines/merge`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipe_ids: recipeIds,
      available_burners: availableBurners,
    }),
  });
  if (!res.ok) {
    throw new Error(`Timeline merge failed (${res.status})`);
  }
  return (await res.json()) as MultiRecipeTimelineResponse;
}

export async function querySousChefVoice(
  payload: SousChefVoiceQueryRequest
): Promise<SousChefVoiceQueryResponse> {
  const res = await fetch(`${API_BASE}/sous-chef/voice-query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Sous chef voice query failed (${res.status})`);
  }
  return (await res.json()) as SousChefVoiceQueryResponse;
}

export async function generateSmartMealPlan(
  payload: MealPlanGenerateRequest
): Promise<MealPlanResponse> {
  const res = await fetch(`${API_BASE}/meal-plans/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Meal plan generation failed (${res.status})`);
  }
  return (await res.json()) as MealPlanResponse;
}

export async function fetchPantryItems(): Promise<PantryItem[]> {
  const res = await fetch(`${API_BASE}/pantry`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PantryItem[];
}

export async function addPantryItemApi(payload: {
  name: string;
  quantity: number;
  unit: string;
  storage_location: StorageLocation;
  aisle_category: AisleCategory;
  days_until_expiry: number;
}): Promise<PantryItem> {
  const res = await fetch(`${API_BASE}/pantry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PantryItem;
}

export async function scanBarcodeIntoPantry(
  barcodeEan: string
): Promise<PantryItem> {
  const res = await fetch(`${API_BASE}/pantry/barcode-lookup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode_ean: barcodeEan }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PantryItem;
}

export async function markRecipeCookedApi(
  recipeId: string
): Promise<MarkCookedResponse> {
  const res = await fetch(`${API_BASE}/pantry/mark-cooked/${recipeId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MarkCookedResponse;
}

export async function fetchPantryRescueMatches(): Promise<PantryRescueMatch[]> {
  const res = await fetch(`${API_BASE}/pantry/rescue`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as PantryRescueMatch[];
}

export async function fetchCommunities(): Promise<Community[]> {
  const res = await fetch(`${API_BASE}/social/communities`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Community[];
}

export async function fetchCookbooks(): Promise<Cookbook[]> {
  const res = await fetch(`${API_BASE}/social/cookbooks`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Cookbook[];
}

export async function postMadeItReview(
  recipeId: string,
  payload: {
    author_name: string;
    rating: number;
    review_note: string;
    photo_caption?: string;
    tweak_note?: string;
  }
): Promise<MadeItReview> {
  const res = await fetch(`${API_BASE}/recipes/${recipeId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as MadeItReview;
}
