from uuid import UUID
from fastapi import APIRouter, HTTPException

from app.schemas.meal_plan import (
    BarcodeLookupRequest,
    MarkCookedResponse,
    PantryItemCreateRequest,
    PantryItemSchema,
    PantryRescueMatch,
)
from app.services.seed_store import catalog_store

router = APIRouter(prefix="/pantry", tags=["pantry"])


@router.get("", response_model=list[PantryItemSchema])
async def list_pantry_inventory() -> list[PantryItemSchema]:
    return catalog_store.list_pantry_items()


@router.post("", response_model=PantryItemSchema, status_code=201)
async def add_pantry_item(payload: PantryItemCreateRequest) -> PantryItemSchema:
    return catalog_store.add_pantry_item(payload)


@router.post("/barcode-lookup", response_model=PantryItemSchema, status_code=201)
async def scan_barcode_into_pantry(
    payload: BarcodeLookupRequest,
) -> PantryItemSchema:
    return catalog_store.lookup_barcode(payload.barcode_ean)


@router.post("/mark-cooked/{recipe_id}", response_model=MarkCookedResponse)
async def mark_recipe_cooked_deplete_stock(
    recipe_id: UUID,
) -> MarkCookedResponse:
    res = catalog_store.mark_recipe_cooked(recipe_id)
    if res is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return res


@router.post("/rescue", response_model=list[PantryRescueMatch])
async def cook_with_what_i_have_rescue() -> list[PantryRescueMatch]:
    return catalog_store.rescue_recipes_with_pantry()
