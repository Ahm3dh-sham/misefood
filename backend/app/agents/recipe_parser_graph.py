from typing import Any, TypedDict
from langgraph.graph import END, START, StateGraph

from app.schemas.ingredient import NormalizedIngredient, UnitSystem
from app.schemas.recipe import (
    ParallelTimelineNode,
    RecipeCreate,
    RecipeParseRequest,
    RecipeResponse,
    RecipeSourceType,
)
from app.services.gemini_service import gemini_service
from app.services.seed_store import catalog_store
from app.services.unit_converter import convert_ingredient_unit_system


class RecipeParserState(TypedDict, total=False):
    raw_text: str
    source_url: str | None
    image_base64: str | None
    image_mime_type: str
    dietary_adaptation: str | None
    target_unit_system: UnitSystem
    source_type: RecipeSourceType
    extracted_text: str
    parsed_payload: dict[str, Any]
    normalized_ingredients: list[NormalizedIngredient]
    timeline_steps: list[ParallelTimelineNode]
    final_recipe: RecipeResponse


def extract_multi_modal_source_node(state: RecipeParserState) -> RecipeParserState:
    """Step 1: Extract recipe from URL/YouTube Shorts/Instagram Reel, Vision OCR image, or raw text."""
    raw = (state.get("raw_text") or "").strip()
    source_url = (state.get("source_url") or "").strip() or None
    img_b64 = state.get("image_base64")
    mime = state.get("image_mime_type") or "image/jpeg"

    source_type = gemini_service.detect_source_type(
        source_url=source_url, has_image=bool(img_b64)
    )

    parts: list[str] = []
    if source_url:
        parts.append(gemini_service.extract_recipe_from_url_or_social(source_url))
    if img_b64:
        parts.append(gemini_service.extract_text_from_image(img_b64, mime))
    if raw:
        parts.append(raw)

    extracted = "\n\n".join(parts).strip()
    return {
        "source_type": source_type,
        "extracted_text": extracted,
    }


def normalize_ingredients_node(state: RecipeParserState) -> RecipeParserState:
    """Step 2: Parse unstructured text, apply optional dietary remix, and convert to target UnitSystem."""
    extracted = state.get("extracted_text", "")
    adaptation = state.get("dietary_adaptation")
    source_type = state.get("source_type", RecipeSourceType.MANUAL)
    source_url = state.get("source_url")
    target_sys = state.get("target_unit_system", UnitSystem.INDIAN)

    parsed = gemini_service.parse_and_normalize_recipe(
        extracted,
        dietary_adaptation=adaptation,
        source_type=source_type,
        source_url=source_url,
    )

    validated_ingredients = [
        convert_ingredient_unit_system(
            NormalizedIngredient.model_validate(item),
            target_system=target_sys,
            scale_factor=1.0,
        )
        for item in parsed.get("ingredients", [])
    ]
    return {
        "parsed_payload": parsed,
        "normalized_ingredients": validated_ingredients,
    }


def compile_parallel_timeline_node(state: RecipeParserState) -> RecipeParserState:
    """Step 3: Build and verify the parallel cooking timeline DAG (prep, active_cook, passive_wait, plating)."""
    parsed = state.get("parsed_payload", {})
    raw_steps = parsed.get("timeline_steps", [])
    validated_steps = [
        ParallelTimelineNode.model_validate(step) for step in raw_steps
    ]
    return {"timeline_steps": validated_steps}


def persist_and_embed_node(state: RecipeParserState) -> RecipeParserState:
    """Step 4: Compute 768-dim vector embedding and register recipe in the catalog."""
    parsed = state.get("parsed_payload", {})
    ingredients = state.get("normalized_ingredients", [])
    timeline_steps = state.get("timeline_steps", [])
    source_type = state.get("source_type", RecipeSourceType.MANUAL)

    total_cost = round(
        sum(i.nutrition_meta.estimated_cost_inr for i in ingredients), 1
    )

    create_payload = RecipeCreate(
        title=parsed.get("title", "AI Parsed Recipe"),
        description=parsed.get(
            "description",
            "Compiled by MiseFood Universal Importer with normalized ingredients.",
        ),
        cuisine=parsed.get("cuisine", "Indian Modern"),
        difficulty=parsed.get("difficulty", "Intermediate"),
        source_type=source_type,
        source_url=state.get("source_url"),
        prep_time_minutes=int(parsed.get("prep_time_minutes", 15)),
        cook_time_minutes=int(parsed.get("cook_time_minutes", 20)),
        servings=int(parsed.get("servings", 3)),
        estimated_total_cost_inr=total_cost,
        hero_image_url=None,
        ingredients=ingredients,
        timeline_steps=timeline_steps,
        tags=list(parsed.get("tags", ["universal-import", "langgraph"])),
        remix_note=parsed.get("remix_note"),
    )
    saved = catalog_store.create_recipe(
        create_payload, author_name="Universal Importer (LangGraph)"
    )
    return {"final_recipe": saved}


def build_recipe_parser_graph():
    workflow = StateGraph(RecipeParserState)
    workflow.add_node("extract_multi_modal_source", extract_multi_modal_source_node)
    workflow.add_node("normalize_ingredients", normalize_ingredients_node)
    workflow.add_node("compile_parallel_timeline", compile_parallel_timeline_node)
    workflow.add_node("persist_and_embed", persist_and_embed_node)

    workflow.add_edge(START, "extract_multi_modal_source")
    workflow.add_edge("extract_multi_modal_source", "normalize_ingredients")
    workflow.add_edge("normalize_ingredients", "compile_parallel_timeline")
    workflow.add_edge("compile_parallel_timeline", "persist_and_embed")
    workflow.add_edge("persist_and_embed", END)

    return workflow.compile()


recipe_parser_graph = build_recipe_parser_graph()


async def run_recipe_parser_pipeline(
    request: RecipeParseRequest,
) -> RecipeResponse:
    result = await recipe_parser_graph.ainvoke(
        {
            "raw_text": request.raw_text,
            "source_url": request.source_url,
            "image_base64": request.image_base64,
            "image_mime_type": request.image_mime_type,
            "dietary_adaptation": request.dietary_adaptation,
            "target_unit_system": request.target_unit_system,
        }
    )
    return result["final_recipe"]
