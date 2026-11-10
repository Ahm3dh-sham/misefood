from datetime import datetime
from enum import StrEnum
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.ingredient import NormalizedIngredient, UnitSystem


class TimelineTrack(StrEnum):
    PREP = "prep"
    ACTIVE_COOK = "active_cook"
    PASSIVE_WAIT = "passive_wait"
    PLATING = "plating"


class RemixMode(StrEnum):
    HIGH_PROTEIN = "high_protein"
    VEGAN = "vegan"
    JAIN_NO_ONION_GARLIC = "jain_no_onion_garlic"
    AIR_FRYER = "air_fryer"
    LOW_CALORIE = "low_calorie"


class RecipeSourceType(StrEnum):
    MANUAL = "manual"
    WEBSITE_URL = "website_url"
    YOUTUBE_SHORTS = "youtube_shorts"
    INSTAGRAM_REEL = "instagram_reel"
    OCR_IMAGE = "ocr_image"
    AI_REMIX = "ai_remix"


class ParallelTimelineNode(BaseModel):
    """Represents a node in the parallel cooking timeline DAG."""

    model_config = ConfigDict(extra="forbid")

    step_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=140)
    instruction: str = Field(..., min_length=1)
    track: TimelineTrack = Field(default=TimelineTrack.ACTIVE_COOK)
    duration_seconds: int = Field(ge=0, default=180)
    start_offset_seconds: int = Field(ge=0, default=0)
    depends_on_steps: list[int] = Field(default_factory=list)
    equipment: list[str] = Field(default_factory=list)
    ingredient_names: list[str] = Field(default_factory=list)
    timer_label: str | None = Field(default=None)
    sensory_cue: str | None = Field(
        default=None,
        description="Visual/auditory/aroma cue (e.g., 'mustard seeds crackle and curry leaves turn crisp')",
    )


class MultiRecipeTimelineNode(BaseModel):
    """Interleaved step across 2 to 4 recipes in Kinetic Loop's Smart Meal Prep Gantt."""

    model_config = ConfigDict(extra="forbid")

    global_step_number: int = Field(..., ge=1)
    recipe_id: UUID
    recipe_title: str
    recipe_color_hex: str = Field(default="#F59E0B")
    title: str
    instruction: str
    track: TimelineTrack
    duration_seconds: int = Field(ge=0)
    start_offset_seconds: int = Field(ge=0)
    overlap_reason: str | None = Field(
        default=None,
        description="Explains how this active step slots into another dish's passive window",
    )
    equipment: list[str] = Field(default_factory=list)
    timer_label: str | None = None
    sensory_cue: str | None = None


class MultiRecipeTimelineMergeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipe_ids: list[UUID] = Field(..., min_length=2, max_length=4)
    available_burners: int = Field(ge=1, le=6, default=3)


class MultiRecipeTimelineResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    title: str
    recipe_ids: list[UUID]
    recipe_titles: list[str]
    sequential_duration_seconds: int
    total_duration_seconds: int
    time_saved_seconds: int
    interleaved_steps: list[MultiRecipeTimelineNode]
    created_at: datetime


class MadeItReviewSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    recipe_id: UUID
    author_name: str
    rating: int = Field(ge=1, le=5, default=5)
    review_note: str
    photo_caption: str | None = None
    tweak_note: str | None = None
    created_at: datetime


class MadeItReviewCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    author_name: str = Field(default="Aarav Mehta")
    rating: int = Field(ge=1, le=5, default=5)
    review_note: str = Field(..., min_length=3)
    photo_caption: str | None = None
    tweak_note: str | None = None


class RecipeBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=5)
    cuisine: str = Field(..., min_length=2, max_length=80)
    difficulty: str = Field(default="Intermediate")
    source_type: RecipeSourceType = Field(default=RecipeSourceType.MANUAL)
    source_url: str | None = Field(default=None)
    prep_time_minutes: int = Field(ge=0, default=15)
    cook_time_minutes: int = Field(ge=0, default=25)
    servings: int = Field(ge=1, le=50, default=4)
    estimated_total_cost_inr: float = Field(ge=0.0, default=220.0)
    hero_image_url: str | None = Field(default=None)
    ingredients: list[NormalizedIngredient] = Field(..., min_length=1)
    timeline_steps: list[ParallelTimelineNode] = Field(..., min_length=1)
    tags: list[str] = Field(default_factory=list)


class RecipeCreate(RecipeBase):
    parent_recipe_id: UUID | None = None
    remix_mode: str | None = None
    remix_note: str | None = None


class RecipeResponse(RecipeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    likes_count: int = 0
    forks_count: int = 0
    author_name: str = "Chef Ananya Sharma"
    parent_recipe_id: UUID | None = None
    remix_mode: str | None = None
    remix_note: str | None = None
    similarity_score: float | None = None
    reviews: list[MadeItReviewSchema] = Field(default_factory=list)
    created_at: datetime


class RecipeParseRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    raw_text: str = Field(
        default="",
        description="Raw unstructured recipe text or OCR transcript",
    )
    source_url: str | None = Field(
        default=None,
        description="Optional website URL, YouTube video/Shorts, or Instagram Reel link",
    )
    image_base64: str | None = Field(
        default=None,
        description="Optional base64-encoded image for Gemini Vision OCR extraction",
    )
    image_mime_type: str = Field(default="image/jpeg")
    dietary_adaptation: str | None = Field(
        default=None,
        description="Optional adaptation during parse (e.g., 'Jain-friendly / No Onion-Garlic', 'High-Protein')",
    )
    target_unit_system: UnitSystem = Field(default=UnitSystem.INDIAN)


class RecipeRemixRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    remix_mode: RemixMode
    custom_instruction: str | None = None
    target_servings: int | None = Field(default=None, ge=1, le=30)


class IngredientSubstitutionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ingredient: NormalizedIngredient
    recipe_title: str
    dietary_reason: str | None = Field(
        default=None,
        description="e.g., 'vegan', 'jain', 'nut allergy', 'out of stock'",
    )


class IngredientSubstitutionOption(BaseModel):
    model_config = ConfigDict(extra="forbid")

    replacement: NormalizedIngredient
    similarity_score: float = Field(ge=0.0, le=1.0)
    culinary_notes: str
    flavor_impact: str


class IngredientSubstitutionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    original_name: str
    substitutions: list[IngredientSubstitutionOption]


class SousChefVoiceQueryRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipe_title: str
    current_step_number: int = Field(ge=1)
    current_instruction: str
    ingredients: list[NormalizedIngredient]
    user_transcript: str = Field(..., min_length=1)
    active_timers: list[str] = Field(default_factory=list)


class SousChefVoiceQueryResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    spoken_reply: str
    action_command: str | None = Field(
        default=None,
        description="UI command triggered: NEXT_STEP | PREV_STEP | REPEAT_STEP | START_TIMER | PAUSE_TIMERS | NONE",
    )
    timer_seconds: int | None = None
    timer_label: str | None = None
