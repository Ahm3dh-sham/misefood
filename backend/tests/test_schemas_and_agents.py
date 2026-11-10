import asyncio
from uuid import UUID
import pytest
from pydantic import ValidationError

from app.agents.kinetic_timeline_graph import run_kinetic_timeline_pipeline
from app.agents.meal_planner_graph import run_meal_planner_pipeline
from app.agents.recipe_parser_graph import run_recipe_parser_pipeline
from app.schemas.ingredient import (
    AisleCategory,
    NormalizedIngredient,
    NutritionMeta,
    UnitSystem,
)
from app.schemas.meal_plan import MealPlanGenerateRequest
from app.schemas.recipe import (
    MultiRecipeTimelineMergeRequest,
    RecipeParseRequest,
    RecipeRemixRequest,
    RemixMode,
)
from app.services.gemini_service import gemini_service
from app.services.grocery_aggregator import aggregate_grocery_list
from app.services.seed_store import catalog_store
from app.services.unit_converter import convert_ingredient_unit_system


def test_normalized_ingredient_strict_contract_and_indian_metrics() -> None:
    ing = NormalizedIngredient(
        name="  Malai Paneer ",
        quantity=300,
        unit="grams",
        aisle_category=AisleCategory.DAIRY_EGGS,
        preparation_note="cubed",
        nutrition_meta=NutritionMeta(
            calories_kcal=795.0,
            protein_g=54.0,
            carbs_g=9.6,
            fat_g=60.0,
            fiber_g=0.0,
            estimated_cost_inr=135.0,
            grams_equivalent=300.0,
            allergens=["dairy"],
            dietary_flags=["vegetarian", "gluten-free"],
        ),
    )
    dumped = ing.model_dump()
    assert set(dumped.keys()) == {
        "name",
        "quantity",
        "unit",
        "aisle_category",
        "preparation_note",
        "nutrition_meta",
    }
    assert ing.name == "malai paneer"
    assert ing.unit == "g"

    # Convert 300g to Indian kitchen metric -> 2.0 katori
    indian_conv = convert_ingredient_unit_system(ing, UnitSystem.INDIAN, 1.0)
    assert indian_conv.unit == "katori"
    assert indian_conv.quantity == 2.0

    # Extra unknown fields must be rejected by Pydantic v2 extra="forbid"
    with pytest.raises(ValidationError):
        NormalizedIngredient.model_validate(
            {
                **dumped,
                "unexpected_field": "rejected",
            }
        )


def test_grocery_aggregator_merges_onions_and_groups_by_aisle() -> None:
    items = [
        NormalizedIngredient(
            name="red onion",
            quantity=2.0,
            unit="piece",
            aisle_category=AisleCategory.PRODUCE,
            preparation_note="chopped (Tuesday)",
            nutrition_meta=NutritionMeta(calories_kcal=88.0, estimated_cost_inr=18.0),
        ),
        NormalizedIngredient(
            name="red onion",
            quantity=1.5,
            unit="piece",
            aisle_category=AisleCategory.PRODUCE,
            preparation_note="sliced (Friday)",
            nutrition_meta=NutritionMeta(calories_kcal=66.0, estimated_cost_inr=13.5),
        ),
        NormalizedIngredient(
            name="kosher salt",
            quantity=1,
            unit="tbsp",
            aisle_category=AisleCategory.SPICES_MASALAS,
            preparation_note=None,
            nutrition_meta=NutritionMeta(calories_kcal=0.0, estimated_cost_inr=2.0),
        ),
    ]
    groups = aggregate_grocery_list(items, pantry_staples_on_hand=["salt"])
    assert len(groups) == 1
    assert groups[0].aisle_category == AisleCategory.PRODUCE
    assert groups[0].items[0].quantity == 3.5
    assert groups[0].subtotal_inr == 31.5


def test_universal_importer_and_ai_remix_modes() -> None:
    # Import from Instagram Reel URL
    parsed = asyncio.run(
        run_recipe_parser_pipeline(
            RecipeParseRequest(
                source_url="https://www.instagram.com/reel/lasooni-palak-paneer",
                target_unit_system=UnitSystem.INDIAN,
            )
        )
    )
    assert len(parsed.ingredients) >= 3
    assert parsed.source_type.value == "instagram_reel"

    # 1-Click Jain Remix (No Onion-Garlic)
    jain_remix = catalog_store.remix_recipe(
        parsed.id,
        RecipeRemixRequest(remix_mode=RemixMode.JAIN_NO_ONION_GARLIC),
    )
    assert jain_remix is not None
    assert all(
        "onion" not in ing.name and "garlic" not in ing.name
        for ing in jain_remix.ingredients
    )
    assert any("hing" in ing.name for ing in jain_remix.ingredients)


def test_kinetic_loop_multi_recipe_parallel_timeline() -> None:
    merged = asyncio.run(
        run_kinetic_timeline_pipeline(
            MultiRecipeTimelineMergeRequest(
                recipe_ids=[
                    UUID("11111111-1111-4111-8111-111111111101"),
                    UUID("11111111-1111-4111-8111-111111111102"),
                    UUID("11111111-1111-4111-8111-111111111104"),
                ],
                available_burners=3,
            )
        )
    )
    assert len(merged.recipe_ids) == 3
    assert merged.time_saved_seconds > 0
    assert len(merged.interleaved_steps) >= 8


def test_multi_slot_nl_meal_planner_and_quick_commerce() -> None:
    plan = asyncio.run(
        run_meal_planner_pipeline(
            MealPlanGenerateRequest(
                title="Indian & Global High-Protein Week",
                days_count=7,
                servings_per_meal=2,
                natural_language_prompt=(
                    "2000 kcal/day, 130g protein, max ₹2500 weekly budget, "
                    "non-veg on Wed/Fri/Sun, use leftover paneer from fridge."
                ),
            )
        )
    )
    assert plan.target_daily_calories == 2000
    assert plan.target_daily_protein_g == 130
    assert plan.estimated_weekly_cost_inr <= 2500.0
    assert len(plan.planned_meals) == 14  # 7 composite Thali lunches + 7 dinners
    providers = {link.provider for link in plan.quick_commerce_links}
    assert providers == {"Swiggy Instamart", "Blinkit", "Zepto", "BigBasket"}


def test_pantry_barcode_rescue_and_voice_sous_chef() -> None:
    scanned = catalog_store.lookup_barcode("8901262010016")
    assert "paneer" in scanned.name

    rescue_list = catalog_store.rescue_recipes_with_pantry()
    assert len(rescue_list) >= 3
    assert rescue_list[0].match_percentage > 0

    # Voice command triggers
    recipe = catalog_store.get_recipe(
        UUID("11111111-1111-4111-8111-111111111101")
    )
    assert recipe is not None
    timer_reply = gemini_service.answer_sous_chef_query(
        recipe_title=recipe.title,
        current_step_number=1,
        current_instruction=recipe.timeline_steps[0].instruction,
        ingredients=recipe.ingredients,
        user_transcript="Set a timer for 8 minutes",
        active_timers=[],
    )
    assert timer_reply["action_command"] == "START_TIMER"
    assert timer_reply["timer_seconds"] == 480

    sub_reply = gemini_service.answer_sous_chef_query(
        recipe_title=recipe.title,
        current_step_number=1,
        current_instruction=recipe.timeline_steps[0].instruction,
        ingredients=recipe.ingredients,
        user_transcript="What can I substitute for heavy cream?",
        active_timers=[],
    )
    assert "cashew" in sub_reply["spoken_reply"].lower()


def test_full_end_to_end_fastapi_flow() -> None:
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Health check
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    # 2. Import recipe from YouTube Shorts link
    imported = client.post(
        "/api/v1/recipes/parse",
        json={
            "raw_text": "",
            "source_url": "https://www.youtube.com/shorts/air-fryer-tandoori-tikka",
            "target_unit_system": "indian",
        },
    )
    assert imported.status_code == 201
    imported_data = imported.json()
    recipe_id = imported_data["id"]
    assert imported_data["source_type"] == "youtube_shorts"

    # 3. 1-Click AI Remix
    remixed = client.post(
        f"/api/v1/recipes/{recipe_id}/remix",
        json={"remix_mode": "high_protein"},
    )
    assert remixed.status_code == 201
    assert "High-Protein" in remixed.json()["title"]

    # 4. Generate 7-Day Multi-Slot Meal Plan + Consolidated Quick-Commerce Cart
    plan_res = client.post(
        "/api/v1/meal-plans/generate",
        json={
            "title": "E2E Verification Plan",
            "days_count": 7,
            "servings_per_meal": 2,
            "target_daily_calories": 2000,
            "target_daily_protein_g": 130,
            "max_weekly_budget_inr": 2500.0,
            "prefer_indian_thali_lunches": True,
            "natural_language_prompt": "2000 kcal/day, 130g protein, max ₹2500 weekly budget, non-veg on Wed/Fri/Sun, use leftover paneer from fridge.",
        },
    )
    assert plan_res.status_code == 200
    plan_json = plan_res.json()
    assert len(plan_json["planned_meals"]) == 14
    assert len(plan_json["quick_commerce_links"]) == 4

    # 5. Merge 3 recipes into Kinetic Loop Parallel Timeline
    merge_res = client.post(
        "/api/v1/timelines/merge",
        json={
            "recipe_ids": [
                "11111111-1111-4111-8111-111111111101",
                "11111111-1111-4111-8111-111111111102",
                recipe_id,
            ],
            "available_burners": 3,
        },
    )
    assert merge_res.status_code == 200
    assert merge_res.json()["time_saved_seconds"] > 0

    # 6. Pantry Rescue & Mark Cooked Depletion
    rescue_res = client.post("/api/v1/pantry/rescue")
    assert rescue_res.status_code == 200
    cooked_res = client.post(
        "/api/v1/pantry/mark-cooked/11111111-1111-4111-8111-111111111101"
    )
    assert cooked_res.status_code == 200
    assert len(cooked_res.json()["depleted_items"]) >= 1

