from fastapi import APIRouter
from app.agents.kinetic_timeline_graph import run_kinetic_timeline_pipeline
from app.schemas.recipe import (
    MultiRecipeTimelineMergeRequest,
    MultiRecipeTimelineResponse,
)

router = APIRouter(prefix="/timelines", tags=["timelines"])


@router.post("/merge", response_model=MultiRecipeTimelineResponse)
async def merge_multi_recipe_timeline(
    payload: MultiRecipeTimelineMergeRequest,
) -> MultiRecipeTimelineResponse:
    return await run_kinetic_timeline_pipeline(payload)
