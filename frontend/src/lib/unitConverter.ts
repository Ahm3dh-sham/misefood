import type { NormalizedIngredient, UnitSystem } from "@/types/recipe";

const TO_GRAMS_OR_ML: Record<string, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  katori: 150,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  pinch: 0.5,
  oz: 28.35,
  lb: 453.59,
  fl_oz: 29.57,
};

export interface FormattedIngredientDisplay {
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  costInr: number;
}

/**
 * Instant client-side unit & serving converter between:
 * - Indian Kitchen Metrics (katori, tbsp, tsp, pinch, piece)
 * - Metric (g, ml, piece)
 * - US Imperial (oz, cup, tbsp, tsp, piece)
 */
export function formatIngredientForDisplay(
  ing: NormalizedIngredient,
  unitSystem: UnitSystem,
  scaleFactor: number
): FormattedIngredientDisplay {
  const scaledQty = ing.quantity * scaleFactor;
  const calories = Math.round(ing.nutrition_meta.calories_kcal * scaleFactor);
  const protein = Number((ing.nutrition_meta.protein_g * scaleFactor).toFixed(1));
  const carbs = Number((ing.nutrition_meta.carbs_g * scaleFactor).toFixed(1));
  const fat = Number((ing.nutrition_meta.fat_g * scaleFactor).toFixed(1));
  const costInr = Math.round(
    (ing.nutrition_meta.estimated_cost_inr ?? 25) * scaleFactor
  );
  const rawUnit = ing.unit.toLowerCase();

  if (["piece", "clove", "sprig", "leaf"].includes(rawUnit)) {
    return {
      quantity: Number(Math.max(0.25, scaledQty).toFixed(2)),
      unit: rawUnit,
      calories,
      protein,
      carbs,
      fat,
      costInr,
    };
  }

  const baseGrams = scaledQty * (TO_GRAMS_OR_ML[rawUnit] ?? 1);

  if (unitSystem === "indian") {
    if (baseGrams >= 75) {
      return {
        quantity: Number((baseGrams / 150).toFixed(2)),
        unit: "katori",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    if (baseGrams >= 12) {
      return {
        quantity: Number((baseGrams / 15).toFixed(1)),
        unit: "tbsp",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    if (baseGrams >= 2) {
      return {
        quantity: Number((baseGrams / 5).toFixed(1)),
        unit: "tsp",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    return {
      quantity: Math.max(1, Math.round(baseGrams / 0.5)),
      unit: "pinch",
      calories,
      protein,
      carbs,
      fat,
      costInr,
    };
  }

  if (unitSystem === "imperial") {
    if (baseGrams >= 200 && ["ml", "l", "cup", "katori"].includes(rawUnit)) {
      return {
        quantity: Number((baseGrams / 240).toFixed(2)),
        unit: "cup",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    if (baseGrams >= 28) {
      return {
        quantity: Number((baseGrams / 28.35).toFixed(1)),
        unit: "oz",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    if (baseGrams >= 12) {
      return {
        quantity: Number((baseGrams / 15).toFixed(1)),
        unit: "tbsp",
        calories,
        protein,
        carbs,
        fat,
        costInr,
      };
    }
    return {
      quantity: Number(Math.max(0.25, baseGrams / 5).toFixed(1)),
      unit: "tsp",
      calories,
      protein,
      carbs,
      fat,
      costInr,
    };
  }

  // Metric
  const isLiquid =
    rawUnit === "ml" ||
    rawUnit === "l" ||
    /milk|water|oil|cream|curd|dahi|mirin|stock|broth/.test(
      ing.name.toLowerCase()
    );
  return {
    quantity: Math.max(1, Math.round(baseGrams)),
    unit: isLiquid ? "ml" : "g",
    calories,
    protein,
    carbs,
    fat,
    costInr,
  };
}
