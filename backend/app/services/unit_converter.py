from app.schemas.ingredient import NormalizedIngredient, NutritionMeta, UnitSystem

# Base conversion to grams / ml equivalent
TO_GRAMS_OR_ML: dict[str, float] = {
    "g": 1.0,
    "kg": 1000.0,
    "ml": 1.0,
    "l": 1000.0,
    "katori": 150.0,
    "cup": 240.0,
    "tbsp": 15.0,
    "tsp": 5.0,
    "pinch": 0.5,
    "oz": 28.35,
    "lb": 453.59,
    "fl_oz": 29.57,
}


def convert_ingredient_unit_system(
    ingredient: NormalizedIngredient,
    target_system: UnitSystem,
    scale_factor: float = 1.0,
) -> NormalizedIngredient:
    """Converts a NormalizedIngredient to Metric, US Imperial, or Indian Kitchen Metrics
    (katori, tbsp, tsp, pinch, piece) and scales its quantity & nutrition_meta.
    """
    scaled_qty = ingredient.quantity * scale_factor
    unit = ingredient.unit.lower()
    meta = ingredient.nutrition_meta

    scaled_meta = NutritionMeta(
        calories_kcal=round(meta.calories_kcal * scale_factor, 1),
        protein_g=round(meta.protein_g * scale_factor, 1),
        carbs_g=round(meta.carbs_g * scale_factor, 1),
        fat_g=round(meta.fat_g * scale_factor, 1),
        fiber_g=round(meta.fiber_g * scale_factor, 1),
        estimated_cost_inr=round(meta.estimated_cost_inr * scale_factor, 1),
        grams_equivalent=round(meta.grams_equivalent * scale_factor, 1),
        allergens=list(meta.allergens),
        dietary_flags=list(meta.dietary_flags),
    )

    # Countable units stay as piece/clove across all systems
    if unit in ("piece", "clove", "sprig", "leaf"):
        return NormalizedIngredient(
            name=ingredient.name,
            quantity=round(max(0.25, scaled_qty), 2),
            unit=unit,
            aisle_category=ingredient.aisle_category,
            preparation_note=ingredient.preparation_note,
            nutrition_meta=scaled_meta,
        )

    base_grams = scaled_qty * TO_GRAMS_OR_ML.get(unit, 1.0)

    if target_system == UnitSystem.INDIAN:
        if base_grams >= 75.0:
            new_qty = round(base_grams / 150.0, 2)
            new_unit = "katori"
        elif base_grams >= 12.0:
            new_qty = round(base_grams / 15.0, 2)
            new_unit = "tbsp"
        elif base_grams >= 2.0:
            new_qty = round(base_grams / 5.0, 2)
            new_unit = "tsp"
        else:
            new_qty = round(max(1.0, base_grams / 0.5), 1)
            new_unit = "pinch"
    elif target_system == UnitSystem.IMPERIAL:
        if base_grams >= 200.0 and unit in ("ml", "l", "cup", "katori"):
            new_qty = round(base_grams / 240.0, 2)
            new_unit = "cup"
        elif base_grams >= 28.0:
            new_qty = round(base_grams / 28.35, 2)
            new_unit = "oz"
        elif base_grams >= 12.0:
            new_qty = round(base_grams / 15.0, 2)
            new_unit = "tbsp"
        else:
            new_qty = round(max(0.25, base_grams / 5.0), 2)
            new_unit = "tsp"
    else:
        # Metric
        is_liquid = any(
            w in ingredient.name
            for w in ("milk", "water", "oil", "stock", "broth", "cream", "mirin", "curd", "dahi")
        ) or unit in ("ml", "l")
        new_qty = round(max(1.0, base_grams), 1)
        new_unit = "ml" if is_liquid else "g"

    return NormalizedIngredient(
        name=ingredient.name,
        quantity=max(0.1, new_qty),
        unit=new_unit,
        aisle_category=ingredient.aisle_category,
        preparation_note=ingredient.preparation_note,
        nutrition_meta=scaled_meta,
    )
