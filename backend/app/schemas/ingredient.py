from enum import StrEnum
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UnitSystem(StrEnum):
    METRIC = "metric"
    IMPERIAL = "imperial"
    INDIAN = "indian"


class AisleCategory(StrEnum):
    PRODUCE = "produce"
    MEAT_SEAFOOD = "meat_seafood"
    DAIRY_EGGS = "dairy_eggs"
    BAKERY_BREAD = "bakery_bread"
    PANTRY_DRY = "pantry_dry"
    SPICES_MASALAS = "spices_masalas"
    SPICES_OILS = "spices_oils"
    CANNED_JARRED = "canned_jarred"
    FROZEN = "frozen"
    BEVERAGES = "beverages"
    OTHER = "other"


class NutritionMeta(BaseModel):
    """Strict nutritional & INR cost metadata attached to every normalized ingredient."""

    model_config = ConfigDict(extra="forbid")

    calories_kcal: float = Field(ge=0.0, default=0.0)
    protein_g: float = Field(ge=0.0, default=0.0)
    carbs_g: float = Field(ge=0.0, default=0.0)
    fat_g: float = Field(ge=0.0, default=0.0)
    fiber_g: float = Field(ge=0.0, default=0.0)
    estimated_cost_inr: float = Field(ge=0.0, default=25.0)
    grams_equivalent: float = Field(ge=0.0, default=100.0)
    allergens: list[str] = Field(default_factory=list)
    dietary_flags: list[str] = Field(default_factory=list)


class NormalizedIngredient(BaseModel):
    """Canonical MiseFood Ingredient Schema:
    { name, quantity, unit, aisle_category, preparation_note, nutrition_meta }
    """

    model_config = ConfigDict(extra="forbid")

    name: str = Field(
        ...,
        min_length=1,
        max_length=140,
        description="Canonical singular lowercase ingredient name",
    )
    quantity: float = Field(
        ...,
        gt=0.0,
        description="Numeric quantity normalized to a positive decimal",
    )
    unit: str = Field(
        ...,
        min_length=1,
        max_length=32,
        description="Standardized culinary unit (g, ml, katori, cup, tbsp, tsp, pinch, piece, oz)",
    )
    aisle_category: AisleCategory = Field(
        ...,
        description="Supermarket aisle category for smart grocery grouping",
    )
    preparation_note: str | None = Field(
        default=None,
        description="Optional preparation instruction (e.g., 'finely minced', 'tempering/tadka ready')",
    )
    nutrition_meta: NutritionMeta = Field(
        default_factory=NutritionMeta,
        description="Macronutrient, ₹ cost, allergen, and dietary metadata for this ingredient quantity",
    )

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("unit")
    @classmethod
    def normalize_unit(cls, v: str) -> str:
        unit_map = {
            "tablespoon": "tbsp",
            "tablespoons": "tbsp",
            "tbsps": "tbsp",
            "teaspoon": "tsp",
            "teaspoons": "tsp",
            "tsps": "tsp",
            "grams": "g",
            "gram": "g",
            "kilograms": "kg",
            "milliliters": "ml",
            "liters": "l",
            "cups": "cup",
            "pieces": "piece",
            "cloves": "clove",
            "ounces": "oz",
            "pounds": "lb",
            "katoris": "katori",
            "bowl": "katori",
            "pinches": "pinch",
            "chutki": "pinch",
        }
        cleaned = v.strip().lower()
        return unit_map.get(cleaned, cleaned)
