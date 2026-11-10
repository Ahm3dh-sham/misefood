from uuid import UUID
from fastapi import APIRouter, HTTPException, Query

from app.agents.recipe_parser_graph import run_recipe_parser_pipeline
from app.schemas.ingredient import UnitSystem
from app.schemas.recipe import (
    IngredientSubstitutionRequest,
    IngredientSubstitutionResponse,
    MadeItReviewCreateRequest,
    MadeItReviewSchema,
    RecipeCreate,
    RecipeParseRequest,
    RecipeRemixRequest,
    RecipeResponse,
)
from app.services.gemini_service import gemini_service
from app.services.seed_store import catalog_store

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeResponse])
async def list_recipes(
    q: str | None = Query(
        default=None,
        description="Optional natural language semantic search query (pgvector / gemini-embedding-2)",
    ),
    unit_system: UnitSystem | None = Query(
        default=None,
        description="Optional unit system conversion: metric | imperial | indian",
    ),
) -> list[RecipeResponse]:
    return catalog_store.list_recipes(search_query=q, unit_system=unit_system)


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: UUID,
    servings: int | None = Query(default=None, ge=1, le=50),
    unit_system: UnitSystem | None = Query(default=None),
) -> RecipeResponse:
    recipe = catalog_store.get_recipe(
        recipe_id, servings=servings, unit_system=unit_system
    )
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("", response_model=RecipeResponse, status_code=201)
async def create_or_fork_recipe(payload: RecipeCreate) -> RecipeResponse:
    return catalog_store.create_recipe(payload)


@router.post("/parse", response_model=RecipeResponse, status_code=201)
async def parse_recipe_with_langgraph(
    payload: RecipeParseRequest,
) -> RecipeResponse:
    if (
        not payload.raw_text.strip()
        and not payload.image_base64
        and not (payload.source_url and payload.source_url.strip())
    ):
        raise HTTPException(
            status_code=400,
            detail="Provide raw_text, source_url (Web/YouTube/Instagram Reel), or image_base64 for OCR parsing.",
        )
    return await run_recipe_parser_pipeline(payload)


@router.post("/{recipe_id}/remix", response_model=RecipeResponse, status_code=201)
async def remix_recipe(
    recipe_id: UUID, payload: RecipeRemixRequest
) -> RecipeResponse:
    remixed = catalog_store.remix_recipe(recipe_id, payload)
    if remixed is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return remixed


@router.post("/substitute", response_model=IngredientSubstitutionResponse)
async def suggest_ingredient_substitutions(
    payload: IngredientSubstitutionRequest,
) -> IngredientSubstitutionResponse:
    options = gemini_service.suggest_substitutions(
        ingredient=payload.ingredient,
        recipe_title=payload.recipe_title,
        dietary_reason=payload.dietary_reason,
    )
    return IngredientSubstitutionResponse(
        original_name=payload.ingredient.name,
        substitutions=options,
    )


@router.post("/{recipe_id}/reviews", response_model=MadeItReviewSchema, status_code=201)
async def add_made_it_review(
    recipe_id: UUID, payload: MadeItReviewCreateRequest
) -> MadeItReviewSchema:
    review = catalog_store.add_review(recipe_id, payload)
    if review is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return review
