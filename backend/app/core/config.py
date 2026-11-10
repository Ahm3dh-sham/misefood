from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "MiseFood API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = (
        "postgresql+asyncpg://misefood:misefood_password@localhost:5432/misefood_db"
    )

    GEMINI_API_KEY: str = ""
    GEMINI_FAST_MODEL: str = "gemini-3.8-flash"
    GEMINI_PRO_MODEL: str = "gemini-3.1-pro-preview"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-2"
    GEMINI_EMBEDDING_DIM: int = 768

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
