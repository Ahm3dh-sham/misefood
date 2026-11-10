from fastapi import APIRouter
from app.schemas.meal_plan import CommunitySchema, CookbookSchema
from app.services.seed_store import catalog_store

router = APIRouter(prefix="/social", tags=["social"])


@router.get("/communities", response_model=list[CommunitySchema])
async def list_communities() -> list[CommunitySchema]:
    return catalog_store.list_communities()


@router.get("/cookbooks", response_model=list[CookbookSchema])
async def list_cookbooks() -> list[CookbookSchema]:
    return catalog_store.list_cookbooks()
