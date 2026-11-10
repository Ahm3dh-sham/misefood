from fastapi import APIRouter
from app.schemas.recipe import (
    SousChefVoiceQueryRequest,
    SousChefVoiceQueryResponse,
)
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/sous-chef", tags=["sous-chef"])


@router.post("/voice-query", response_model=SousChefVoiceQueryResponse)
async def handle_voice_query(
    payload: SousChefVoiceQueryRequest,
) -> SousChefVoiceQueryResponse:
    result = gemini_service.answer_sous_chef_query(
        recipe_title=payload.recipe_title,
        current_step_number=payload.current_step_number,
        current_instruction=payload.current_instruction,
        ingredients=payload.ingredients,
        user_transcript=payload.user_transcript,
        active_timers=payload.active_timers,
    )
    return SousChefVoiceQueryResponse.model_validate(result)
