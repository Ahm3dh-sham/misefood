from collections import defaultdict
from urllib.parse import quote_plus
from app.schemas.ingredient import AisleCategory, NormalizedIngredient, NutritionMeta
from app.schemas.meal_plan import GroceryAisleGroup, QuickCommerceLink


AISLE_LABELS: dict[AisleCategory, str] = {
    AisleCategory.PRODUCE: "Fresh Mandi Produce, Ginger-Garlic & Herbs",
    AisleCategory.DAIRY_EGGS: "Dairy, Fresh Paneer, Dahi & Eggs",
    AisleCategory.SPICES_MASALAS: "Spices, Whole Masalas & Tadka Oils",
    AisleCategory.SPICES_OILS: "Cold-Pressed Oils, Ghee & Condiments",
    AisleCategory.PANTRY_DRY: "Dry Pantry, Basmati Rice, Atta & Dals",
    AisleCategory.MEAT_SEAFOOD: "Butcher & Sustainable Seafood",
    AisleCategory.CANNED_JARRED: "Coconut Milk, Purees, Pastes & Achaar",
    AisleCategory.BAKERY_BREAD: "Artisanal Bakery, Pav & Rotis",
    AisleCategory.FROZEN: "Frozen Green Peas & Specialty",
    AisleCategory.BEVERAGES: "Filter Coffee, Chai & Broths",
    AisleCategory.OTHER: "Kitchen Essentials",
}


def scale_ingredient(
    ingredient: NormalizedIngredient, factor: float
) -> NormalizedIngredient:
    """Scales a NormalizedIngredient quantity and its NutritionMeta proportionally."""
    meta = ingredient.nutrition_meta
    return NormalizedIngredient(
        name=ingredient.name,
        quantity=round(max(0.1, ingredient.quantity * factor), 2),
        unit=ingredient.unit,
        aisle_category=ingredient.aisle_category,
        preparation_note=ingredient.preparation_note,
        nutrition_meta=NutritionMeta(
            calories_kcal=round(meta.calories_kcal * factor, 1),
            protein_g=round(meta.protein_g * factor, 1),
            carbs_g=round(meta.carbs_g * factor, 1),
            fat_g=round(meta.fat_g * factor, 1),
            fiber_g=round(meta.fiber_g * factor, 1),
            estimated_cost_inr=round(meta.estimated_cost_inr * factor, 1),
            grams_equivalent=round(meta.grams_equivalent * factor, 1),
            allergens=list(meta.allergens),
            dietary_flags=list(meta.dietary_flags),
        ),
    )


def aggregate_grocery_list(
    ingredients: list[NormalizedIngredient],
    pantry_staples_on_hand: list[str] | None = None,
) -> list[GroceryAisleGroup]:
    """Merges NormalizedIngredients with identical (name, unit) keys (e.g. 2 onions + 1.5 onions = 3.5 onions),
    filters out pantry staples, and groups them into supermarket aisle sections with ₹ subtotals.
    """
    pantry_set = {s.strip().lower() for s in (pantry_staples_on_hand or []) if s.strip()}

    merged: dict[tuple[str, str], NormalizedIngredient] = {}

    for ing in ingredients:
        if any(staple in ing.name for staple in pantry_set):
            continue

        key = (ing.name, ing.unit)
        if key not in merged:
            merged[key] = ing.model_copy(deep=True)
        else:
            existing = merged[key]
            notes = {
                n
                for n in (existing.preparation_note, ing.preparation_note)
                if n
            }
            combined_allergens = sorted(
                set(existing.nutrition_meta.allergens) | set(ing.nutrition_meta.allergens)
            )
            combined_flags = sorted(
                set(existing.nutrition_meta.dietary_flags)
                & set(ing.nutrition_meta.dietary_flags)
            )

            merged[key] = NormalizedIngredient(
                name=existing.name,
                quantity=round(existing.quantity + ing.quantity, 2),
                unit=existing.unit,
                aisle_category=existing.aisle_category,
                preparation_note=" + ".join(sorted(notes)) if notes else None,
                nutrition_meta=NutritionMeta(
                    calories_kcal=round(
                        existing.nutrition_meta.calories_kcal
                        + ing.nutrition_meta.calories_kcal,
                        1,
                    ),
                    protein_g=round(
                        existing.nutrition_meta.protein_g + ing.nutrition_meta.protein_g,
                        1,
                    ),
                    carbs_g=round(
                        existing.nutrition_meta.carbs_g + ing.nutrition_meta.carbs_g,
                        1,
                    ),
                    fat_g=round(
                        existing.nutrition_meta.fat_g + ing.nutrition_meta.fat_g,
                        1,
                    ),
                    fiber_g=round(
                        existing.nutrition_meta.fiber_g + ing.nutrition_meta.fiber_g,
                        1,
                    ),
                    estimated_cost_inr=round(
                        existing.nutrition_meta.estimated_cost_inr
                        + ing.nutrition_meta.estimated_cost_inr,
                        1,
                    ),
                    grams_equivalent=round(
                        existing.nutrition_meta.grams_equivalent
                        + ing.nutrition_meta.grams_equivalent,
                        1,
                    ),
                    allergens=combined_allergens,
                    dietary_flags=combined_flags,
                ),
            )

    by_aisle: dict[AisleCategory, list[NormalizedIngredient]] = defaultdict(list)
    for item in merged.values():
        by_aisle[item.aisle_category].append(item)

    groups: list[GroceryAisleGroup] = []
    for category in AisleCategory:
        if category in by_aisle:
            sorted_items = sorted(by_aisle[category], key=lambda x: x.name)
            subtotal = round(
                sum(i.nutrition_meta.estimated_cost_inr for i in sorted_items), 1
            )
            groups.append(
                GroceryAisleGroup(
                    aisle_category=category,
                    aisle_label=AISLE_LABELS[category],
                    subtotal_inr=subtotal,
                    items=sorted_items,
                )
            )

    return groups


def build_quick_commerce_links(
    aisle_groups: list[GroceryAisleGroup],
) -> list[QuickCommerceLink]:
    """Generates deep-link search & cart export payloads for Swiggy Instamart, Blinkit, Zepto, and BigBasket."""
    all_items = [item for group in aisle_groups for item in group.items]
    top_names = [item.name for item in all_items[:8]]
    search_phrase = ", ".join(top_names) if top_names else "fresh paneer, toor dal, basmati rice"
    encoded_query = quote_plus(top_names[0] if top_names else "paneer")

    formatted_lines = [
        f"• {item.quantity:g} {item.unit} {item.name} (~₹{item.nutrition_meta.estimated_cost_inr:g})"
        for item in all_items
    ]
    cart_summary = "\n".join(formatted_lines)

    return [
        QuickCommerceLink(
            provider="Swiggy Instamart",
            search_url=f"https://www.swiggy.com/instamart/search?custom_back=true&query={encoded_query}",
            deep_link_uri=f"swiggy://instamart/search?query={encoded_query}",
            cart_summary_text=f"Swiggy Instamart Express Cart ({len(all_items)} items: {search_phrase})\n{cart_summary}",
        ),
        QuickCommerceLink(
            provider="Blinkit",
            search_url=f"https://blinkit.com/s/?q={encoded_query}",
            deep_link_uri=f"blinkit://search?q={encoded_query}",
            cart_summary_text=f"Blinkit 10-Min Cart ({len(all_items)} items: {search_phrase})\n{cart_summary}",
        ),
        QuickCommerceLink(
            provider="Zepto",
            search_url=f"https://www.zeptonow.com/search?query={encoded_query}",
            deep_link_uri=f"zepto://search?query={encoded_query}",
            cart_summary_text=f"Zepto Superfast Cart ({len(all_items)} items: {search_phrase})\n{cart_summary}",
        ),
        QuickCommerceLink(
            provider="BigBasket",
            search_url=f"https://www.bigbasket.com/ps/?q={encoded_query}",
            deep_link_uri=f"bigbasket://search?q={encoded_query}",
            cart_summary_text=f"BigBasket Weekly Stock-Up ({len(all_items)} items: {search_phrase})\n{cart_summary}",
        ),
    ]
