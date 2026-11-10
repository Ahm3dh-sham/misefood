from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "MiseFood Backend: AI Sous Chef, Social Recipe Hub & Smart Meal Planner "
        "powered by LangGraph, Google Gemini (gemini-3.8-flash & gemini-embedding-2), and pgvector."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_fast_model": settings.GEMINI_FAST_MODEL,
        "gemini_embedding_model": settings.GEMINI_EMBEDDING_MODEL,
    }
