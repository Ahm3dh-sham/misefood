export type UnitSystem = "metric" | "imperial" | "indian";

export type AisleCategory =
  | "produce"
  | "meat_seafood"
  | "dairy_eggs"
  | "bakery_bread"
  | "pantry_dry"
  | "spices_masalas"
  | "spices_oils"
  | "canned_jarred"
  | "frozen"
  | "beverages"
  | "other";

export interface NutritionMeta {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  estimated_cost_inr: number;
  grams_equivalent: number;
  allergens: string[];
  dietary_flags: string[];
}

/**
 * Canonical MiseFood Ingredient Object:
 * { name, quantity, unit, aisle_category, preparation_note, nutrition_meta }
 */
export interface NormalizedIngredient {
  name: string;
  quantity: number;
  unit: string;
  aisle_category: AisleCategory;
  preparation_note: string | null;
  nutrition_meta: NutritionMeta;
}

export type TimelineTrack =
  | "prep"
  | "active_cook"
  | "passive_wait"
  | "plating";

export type RemixMode =
  | "high_protein"
  | "vegan"
  | "jain_no_onion_garlic"
  | "air_fryer"
  | "low_calorie";

export type RecipeSourceType =
  | "manual"
  | "website_url"
  | "youtube_shorts"
  | "instagram_reel"
  | "ocr_image"
  | "ai_remix";

export interface ParallelTimelineNode {
  step_number: number;
  title: string;
  instruction: string;
  track: TimelineTrack;
  duration_seconds: number;
  start_offset_seconds: number;
  depends_on_steps: number[];
  equipment: string[];
  ingredient_names: string[];
  timer_label: string | null;
  sensory_cue: string | null;
}

export interface MultiRecipeTimelineNode {
  global_step_number: number;
  recipe_id: string;
  recipe_title: string;
  recipe_color_hex: string;
  title: string;
  instruction: string;
  track: TimelineTrack;
  duration_seconds: number;
  start_offset_seconds: number;
  overlap_reason: string | null;
  equipment: string[];
  timer_label: string | null;
  sensory_cue: string | null;
}

export interface MultiRecipeTimelineResponse {
  id: string;
  title: string;
  recipe_ids: string[];
  recipe_titles: string[];
  sequential_duration_seconds: number;
  total_duration_seconds: number;
  time_saved_seconds: number;
  interleaved_steps: MultiRecipeTimelineNode[];
  created_at: string;
}

export interface MadeItReview {
  id: string;
  recipe_id: string;
  author_name: string;
  rating: number;
  review_note: string;
  photo_caption: string | null;
  tweak_note: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  cuisine: string;
  difficulty: string;
  source_type: RecipeSourceType;
  source_url: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  estimated_total_cost_inr: number;
  hero_image_url: string | null;
  ingredients: NormalizedIngredient[];
  timeline_steps: ParallelTimelineNode[];
  tags: string[];
  likes_count: number;
  forks_count: number;
  author_name: string;
  parent_recipe_id: string | null;
  remix_mode: string | null;
  remix_note: string | null;
  similarity_score: number | null;
  reviews: MadeItReview[];
  created_at: string;
}

export interface RecipeParseRequest {
  raw_text: string;
  source_url?: string | null;
  image_base64?: string | null;
  image_mime_type?: string;
  dietary_adaptation?: string | null;
  target_unit_system?: UnitSystem;
}

export interface IngredientSubstitutionOption {
  replacement: NormalizedIngredient;
  similarity_score: number;
  culinary_notes: string;
  flavor_impact: string;
}

export interface IngredientSubstitutionResponse {
  original_name: string;
  substitutions: IngredientSubstitutionOption[];
}

export interface SousChefVoiceQueryRequest {
  recipe_title: string;
  current_step_number: number;
  current_instruction: string;
  ingredients: NormalizedIngredient[];
  user_transcript: string;
  active_timers: string[];
}

export interface SousChefVoiceQueryResponse {
  spoken_reply: string;
  action_command:
    | "NEXT_STEP"
    | "PREV_STEP"
    | "REPEAT_STEP"
    | "START_TIMER"
    | "PAUSE_TIMERS"
    | "NONE"
    | null;
  timer_seconds: number | null;
  timer_label: string | null;
}

export type MealSlotType =
  | "breakfast"
  | "lunch"
  | "evening_tiffin"
  | "dinner";

export type DishRole =
  | "main"
  | "dal_gravy"
  | "sabji"
  | "rice_roti"
  | "curd_accompaniment";

export interface CompositeDishItem {
  recipe_id: string | null;
  recipe_title: string;
  role: DishRole;
  servings: number;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  estimated_cost_inr: number;
}

export interface PlannedMealItem {
  day_name: string;
  meal_type: MealSlotType;
  slot_structure: string;
  recipe_id: string;
  recipe_title: string;
  dishes: CompositeDishItem[];
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  calories_per_serving: number;
  protein_per_serving_g: number;
  carbs_per_serving_g: number;
  fat_per_serving_g: number;
  fiber_per_serving_g: number;
  slot_cost_inr: number;
  is_non_veg: boolean;
}

export interface QuickCommerceLink {
  provider: string;
  search_url: string;
  deep_link_uri: string;
  cart_summary_text: string;
}

export interface GroceryAisleGroup {
  aisle_category: AisleCategory;
  aisle_label: string;
  subtotal_inr: number;
  items: NormalizedIngredient[];
}

export interface MealPlanGenerateRequest {
  title: string;
  days_count: number;
  servings_per_meal: number;
  target_daily_calories: number;
  target_daily_protein_g: number;
  max_weekly_budget_inr: number;
  prefer_indian_thali_lunches: boolean;
  non_veg_days: string[];
  dietary_preferences: string[];
  excluded_allergens: string[];
  pantry_staples_on_hand: string[];
  natural_language_prompt: string;
  taste_query: string;
}

export interface MealPlanResponse {
  id: string;
  title: str;
  week_start_date: string;
  target_daily_calories: number;
  target_daily_protein_g: number;
  max_weekly_budget_inr: number;
  estimated_weekly_cost_inr: number;
  avg_daily_calories: number;
  avg_daily_protein_g: number;
  dietary_focus: string[];
  planned_meals: PlannedMealItem[];
  grocery_aisles: GroceryAisleGroup[];
  quick_commerce_links: QuickCommerceLink[];
  household_share_code: string;
  prep_ahead_strategy: string[];
  created_at: string;
}

type str = string;

export type StorageLocation =
  | "fridge"
  | "freezer"
  | "dry_pantry"
  | "spice_box";

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  storage_location: StorageLocation;
  aisle_category: AisleCategory;
  barcode_ean: string | null;
  expiry_date: string | null;
  days_until_expiry: number | null;
  status: "fresh" | "expiring_soon" | "low_stock";
  nutrition_meta: Record<string, number | string>;
}

export interface PantryRescueMatch {
  recipe_id: string;
  recipe_title: string;
  cuisine: string;
  match_percentage: number;
  matched_pantry_items: string[];
  missing_ingredients: NormalizedIngredient[];
  rescues_expiring_items: string[];
}

export interface MarkCookedResponse {
  recipe_id: string;
  recipe_title: string;
  depleted_items: string[];
  updated_pantry: PantryItem[];
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_tag: string;
  members_count: number;
  featured_tags: string[];
}

export interface Cookbook {
  id: string;
  title: string;
  description: string;
  owner_name: string;
  is_collaborative: boolean;
  recipe_ids: string[];
  members_names: string[];
}

export interface ActiveCookingTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  stepNumber: number | null;
}
