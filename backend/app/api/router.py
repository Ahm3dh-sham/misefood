from fastapi import APIRouter
from app.api.endpoints import (
    meal_plans,
    pantry,
    recipes,
    social,
    sous_chef,
    timelines,
)

api_router = APIRouter()
api_router.include_router(recipes.router)
api_router.include_router(sous_chef.router)
api_router.include_router(meal_plans.router)
api_router.include_router(timelines.router)
api_router.include_router(pantry.router)
api_router.include_router(social.router)
