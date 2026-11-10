from fastapi import APIRouter
from app.agents.meal_planner_graph import run_meal_planner_pipeline
from app.schemas.meal_plan import MealPlanGenerateRequest, MealPlanResponse

router = APIRouter(prefix="/meal-plans", tags=["meal-plans"])


@router.post("/generate", response_model=MealPlanResponse)
async def generate_smart_meal_plan(
    payload: MealPlanGenerateRequest,
) -> MealPlanResponse:
    return await run_meal_planner_pipeline(payload)
