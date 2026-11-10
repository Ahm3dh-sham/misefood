from datetime import date, datetime
from enum import StrEnum
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.ingredient import AisleCategory, NormalizedIngredient


class MealSlotType(StrEnum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    EVENING_TIFFIN = "evening_tiffin"
    DINNER = "dinner"


class DishRole(StrEnum):
    MAIN = "main"
    DAL_GRAVY = "dal_gravy"
    SABJI = "sabji"
    RICE_ROTI = "rice_roti"
    CURD_ACCOMPANIMENT = "curd_accompaniment"


class CompositeDishItem(BaseModel):
    """Represents a dish inside a single-dish or Indian multi-dish Thali slot."""

    model_config = ConfigDict(extra="forbid")

    recipe_id: UUID | None = None
    recipe_title: str
    role: DishRole = Field(default=DishRole.MAIN)
    servings: int = Field(ge=1, default=2)
    calories_kcal: float = Field(ge=0.0, default=280.0)
    protein_g: float = Field(ge=0.0, default=14.0)
    carbs_g: float = Field(ge=0.0, default=32.0)
    fat_g: float = Field(ge=0.0, default=9.0)
    fiber_g: float = Field(ge=0.0, default=4.5)
    estimated_cost_inr: float = Field(ge=0.0, default=65.0)


class PlannedMealItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    day_name: str = Field(..., description="e.g., Monday, Tuesday")
    meal_type: MealSlotType
    slot_structure: str = Field(
        default="indian_thali_combo",
        description="single_dish | indian_thali_combo",
    )
    recipe_id: UUID
    recipe_title: str
    dishes: list[CompositeDishItem] = Field(default_factory=list)
    servings: int = Field(ge=1, default=2)
    prep_time_minutes: int = Field(ge=0, default=15)
    cook_time_minutes: int = Field(ge=0, default=25)
    calories_per_serving: float = Field(ge=0.0, default=550.0)
    protein_per_serving_g: float = Field(ge=0.0, default=34.0)
    carbs_per_serving_g: float = Field(ge=0.0, default=58.0)
    fat_per_serving_g: float = Field(ge=0.0, default=18.0)
    fiber_per_serving_g: float = Field(ge=0.0, default=8.0)
    slot_cost_inr: float = Field(ge=0.0, default=140.0)
    is_non_veg: bool = Field(default=False)


class QuickCommerceLink(BaseModel):
    model_config = ConfigDict(extra="forbid")

    provider: str = Field(
        ..., description="Swiggy Instamart | Blinkit | Zepto | BigBasket"
    )
    search_url: str
    deep_link_uri: str
    cart_summary_text: str


class GroceryAisleGroup(BaseModel):
    model_config = ConfigDict(extra="forbid")

    aisle_category: AisleCategory
    aisle_label: str
    subtotal_inr: float = Field(ge=0.0, default=0.0)
    items: list[NormalizedIngredient]


class MealPlanGenerateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(default="Smart Indian & Global Macro Plan")
    days_count: int = Field(ge=1, le=7, default=7)
    servings_per_meal: int = Field(ge=1, le=12, default=2)
    target_daily_calories: int = Field(ge=1000, le=5000, default=2000)
    target_daily_protein_g: int = Field(ge=30, le=350, default=130)
    max_weekly_budget_inr: float = Field(ge=500.0, le=25000.0, default=2500.0)
    prefer_indian_thali_lunches: bool = Field(default=True)
    non_veg_days: list[str] = Field(
        default_factory=lambda: ["Wednesday", "Friday", "Sunday"]
    )
    dietary_preferences: list[str] = Field(default_factory=list)
    excluded_allergens: list[str] = Field(default_factory=list)
    pantry_staples_on_hand: list[str] = Field(default_factory=list)
    natural_language_prompt: str = Field(
        default="2000 kcal/day, 130g protein, max ₹2500 weekly budget, non-veg on Wed/Fri/Sun, use leftover paneer from fridge.",
        description="Natural language constraints parsed by LangGraph planner",
    )
    taste_query: str = Field(
        default="high-protein Indian thali & vibrant weeknight meals",
        description="Flavor profile matched against pgvector recipes",
    )


class MealPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    week_start_date: date
    target_daily_calories: int
    target_daily_protein_g: int = 130
    max_weekly_budget_inr: float = 2500.0
    estimated_weekly_cost_inr: float = 1980.0
    avg_daily_calories: float = 1985.0
    avg_daily_protein_g: float = 132.0
    dietary_focus: list[str]
    planned_meals: list[PlannedMealItem]
    grocery_aisles: list[GroceryAisleGroup]
    quick_commerce_links: list[QuickCommerceLink] = Field(default_factory=list)
    household_share_code: str = "MISE-HOME-742"
    prep_ahead_strategy: list[str] = Field(default_factory=list)
    created_at: datetime


class StorageLocation(StrEnum):
    FRIDGE = "fridge"
    FREEZER = "freezer"
    DRY_PANTRY = "dry_pantry"
    SPICE_BOX = "spice_box"


class PantryItemSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    name: str
    quantity: float = Field(ge=0.0)
    unit: str
    storage_location: StorageLocation = Field(default=StorageLocation.FRIDGE)
    aisle_category: AisleCategory
    barcode_ean: str | None = None
    expiry_date: date | None = None
    days_until_expiry: int | None = None
    status: str = Field(default="fresh", description="fresh | expiring_soon | low_stock")
    nutrition_meta: dict[str, object] = Field(default_factory=dict)


class PantryItemCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0.0)
    unit: str = Field(default="g")
    storage_location: StorageLocation = Field(default=StorageLocation.FRIDGE)
    aisle_category: AisleCategory = Field(default=AisleCategory.PRODUCE)
    barcode_ean: str | None = None
    days_until_expiry: int = Field(default=5, ge=0, le=365)


class BarcodeLookupRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    barcode_ean: str = Field(..., min_length=4, max_length=32)


class PantryRescueMatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipe_id: UUID
    recipe_title: str
    cuisine: str
    match_percentage: float
    matched_pantry_items: list[str]
    missing_ingredients: list[NormalizedIngredient]
    rescues_expiring_items: list[str]


class MarkCookedResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    recipe_id: UUID
    recipe_title: str
    depleted_items: list[str]
    updated_pantry: list[PantryItemSchema]


class CommunitySchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    name: str
    slug: str
    description: str
    banner_tag: str
    members_count: int
    featured_tags: list[str]


class CookbookSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    title: str
    description: str
    owner_name: str
    is_collaborative: bool
    recipe_ids: list[UUID]
    members_names: list[str]
