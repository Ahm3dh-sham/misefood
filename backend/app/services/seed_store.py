from datetime import date, datetime, timedelta, timezone
import re
from uuid import UUID, uuid4

from app.schemas.ingredient import (
    AisleCategory,
    NormalizedIngredient,
    NutritionMeta,
    UnitSystem,
)
from app.schemas.meal_plan import (
    CommunitySchema,
    CookbookSchema,
    MarkCookedResponse,
    PantryItemCreateRequest,
    PantryItemSchema,
    PantryRescueMatch,
    StorageLocation,
)
from app.schemas.recipe import (
    MadeItReviewCreateRequest,
    MadeItReviewSchema,
    ParallelTimelineNode,
    RecipeCreate,
    RecipeRemixRequest,
    RecipeResponse,
    RecipeSourceType,
    TimelineTrack,
)
from app.services.gemini_service import gemini_service
from app.services.unit_converter import convert_ingredient_unit_system


def _slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return f"{slug}-{str(uuid4())[:6]}"


class RecipeCatalogStore:
    """Hybrid store seeded with Indian & Global recipes, normalized ingredients, parallel timeline DAGs,
    pantry stock & barcode database, and collaborative cookbooks/communities.
    """

    def __init__(self) -> None:
        self._recipes: dict[UUID, tuple[RecipeResponse, list[float]]] = {}
        self._pantry: dict[UUID, PantryItemSchema] = {}
        self._communities: list[CommunitySchema] = []
        self._cookbooks: list[CookbookSchema] = []
        self._seed_initial_recipes()
        self._seed_initial_pantry()
        self._seed_social_hub()

    def _seed_initial_recipes(self) -> None:
        now = datetime.now(timezone.utc)
        seed_payloads: list[dict] = [
            {
                "id": UUID("11111111-1111-4111-8111-111111111101"),
                "title": "Smoky Dhaba Paneer Tikka Masala with Garlic Naan",
                "slug": "smoky-dhaba-paneer-tikka-masala",
                "description": "Char-grilled malai paneer cubes marinated in Kashmiri mirch and hung curd, simmered in a velvety onion-tomato-cashew makhani gravy.",
                "cuisine": "North Indian Punjabi",
                "difficulty": "Intermediate",
                "source_type": RecipeSourceType.INSTAGRAM_REEL,
                "source_url": "https://www.instagram.com/reel/misefood-paneer-tikka",
                "prep_time_minutes": 15,
                "cook_time_minutes": 20,
                "servings": 3,
                "estimated_total_cost_inr": 265.0,
                "likes_count": 642,
                "forks_count": 94,
                "author_name": "Chef Ranveer Kapoor",
                "tags": ["high-protein", "vegetarian", "indian-classic", "paneer", "north-indian"],
                "ingredients": [
                    NormalizedIngredient(
                        name="malai paneer (fresh cottage cheese)",
                        quantity=300,
                        unit="g",
                        aisle_category=AisleCategory.DAIRY_EGGS,
                        preparation_note="cut into 1.5-inch tikka cubes, soaked in warm water",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=795.0,
                            protein_g=54.0,
                            carbs_g=9.6,
                            fat_g=60.0,
                            fiber_g=0.0,
                            estimated_cost_inr=135.0,
                            grams_equivalent=300.0,
                            allergens=["dairy"],
                            dietary_flags=["vegetarian", "gluten-free", "high-protein"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="strained hung curd (chakka dahi)",
                        quantity=1,
                        unit="katori",
                        aisle_category=AisleCategory.DAIRY_EGGS,
                        preparation_note="whisked smooth with roasted besan",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=145.0,
                            protein_g=14.5,
                            carbs_g=6.5,
                            fat_g=6.0,
                            fiber_g=0.0,
                            estimated_cost_inr=35.0,
                            grams_equivalent=150.0,
                            allergens=["dairy"],
                            dietary_flags=["vegetarian", "gluten-free", "high-protein"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="red onion",
                        quantity=2,
                        unit="piece",
                        aisle_category=AisleCategory.PRODUCE,
                        preparation_note="finely chopped for bhuna masala",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=88.0,
                            protein_g=2.4,
                            carbs_g=20.0,
                            fat_g=0.2,
                            fiber_g=3.6,
                            estimated_cost_inr=18.0,
                            grams_equivalent=220.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="roma tomato",
                        quantity=3,
                        unit="piece",
                        aisle_category=AisleCategory.PRODUCE,
                        preparation_note="blended into smooth puree",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=66.0,
                            protein_g=3.0,
                            carbs_g=14.4,
                            fat_g=0.6,
                            fiber_g=4.2,
                            estimated_cost_inr=22.0,
                            grams_equivalent=300.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="cumin seeds (jeera)",
                        quantity=1.5,
                        unit="tsp",
                        aisle_category=AisleCategory.SPICES_MASALAS,
                        preparation_note="whole for hot ghee tadka",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=22.0,
                            protein_g=1.1,
                            carbs_g=2.6,
                            fat_g=1.3,
                            fiber_g=0.6,
                            estimated_cost_inr=8.0,
                            grams_equivalent=7.5,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="kashmiri lal mirch & garam masala",
                        quantity=2,
                        unit="tbsp",
                        aisle_category=AisleCategory.SPICES_MASALAS,
                        preparation_note="bloomed in warm oil for deep ruby color",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=48.0,
                            protein_g=1.8,
                            carbs_g=8.5,
                            fat_g=1.9,
                            fiber_g=3.8,
                            estimated_cost_inr=17.0,
                            grams_equivalent=20.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="heavy cream (fresh malai)",
                        quantity=3,
                        unit="tbsp",
                        aisle_category=AisleCategory.DAIRY_EGGS,
                        preparation_note="chilled for finishing swirl",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=150.0,
                            protein_g=1.2,
                            carbs_g=1.5,
                            fat_g=16.0,
                            fiber_g=0.0,
                            estimated_cost_inr=30.0,
                            grams_equivalent=45.0,
                            allergens=["dairy"],
                            dietary_flags=["vegetarian", "gluten-free", "jain-friendly"],
                        ),
                    ),
                ],
                "timeline_steps": [
                    ParallelTimelineNode(
                        step_number=1,
                        title="Whisk Tikka Marinade & Cube Paneer",
                        instruction="Whisk hung curd, 1 tbsp Kashmiri lal mirch, and salt; coat the paneer cubes gently and chop the red onions + puree the tomatoes.",
                        track=TimelineTrack.PREP,
                        duration_seconds=300,
                        start_offset_seconds=0,
                        depends_on_steps=[],
                        equipment=["Mixing Bowl", "Chef's Knife", "Blender"],
                        ingredient_names=[
                            "malai paneer (fresh cottage cheese)",
                            "strained hung curd (chakka dahi)",
                            "kashmiri lal mirch & garam masala",
                        ],
                        timer_label="Prep & Coat (5m)",
                        sensory_cue="Ruby-red yogurt marinade clings thickly to every paneer cube",
                    ),
                    ParallelTimelineNode(
                        step_number=2,
                        title="Rest Paneer in Spiced Hung Curd Marinade",
                        instruction="Let the coated paneer cubes marinate for 12 minutes so the spices penetrate while you build the gravy on the main burner.",
                        track=TimelineTrack.PASSIVE_WAIT,
                        duration_seconds=720,
                        start_offset_seconds=300,
                        depends_on_steps=[1],
                        equipment=["Covered Bowl"],
                        ingredient_names=["malai paneer (fresh cottage cheese)"],
                        timer_label="Marinate Paneer (12m)",
                        sensory_cue="Aromatic smoky-tangy fragrance",
                    ),
                    ParallelTimelineNode(
                        step_number=3,
                        title="Crackle Jeera & Bhuno Onion-Tomato Masala",
                        instruction="While paneer marinates, crackle cumin seeds in hot ghee, caramelize chopped onions for 5 minutes, then simmer tomato puree for 5 minutes until oil separates.",
                        track=TimelineTrack.ACTIVE_COOK,
                        duration_seconds=600,
                        start_offset_seconds=300,
                        depends_on_steps=[1],
                        equipment=["Heavy Brass/Steel Kadhai"],
                        ingredient_names=["cumin seeds (jeera)", "red onion", "roma tomato"],
                        timer_label="Bhuno Masala (10m)",
                        sensory_cue="Glossy crimson droplets rising around the edges of the kadhai",
                    ),
                    ParallelTimelineNode(
                        step_number=4,
                        title="High-Heat Char Paneer Tikka on Cast-Iron Tawa",
                        instruction="Sear marinated paneer cubes on a smoking-hot cast-iron tawa for 4 minutes, turning once until edges develop charred dhaba blisters.",
                        track=TimelineTrack.ACTIVE_COOK,
                        duration_seconds=240,
                        start_offset_seconds=900,
                        depends_on_steps=[2],
                        equipment=["Cast-Iron Tawa"],
                        ingredient_names=["malai paneer (fresh cottage cheese)"],
                        timer_label="Char Tikka (4m)",
                        sensory_cue="Audible sizzle and smoky blistered corners on the paneer",
                    ),
                    ParallelTimelineNode(
                        step_number=5,
                        title="Fold Charred Paneer & Swirl Fresh Cream",
                        instruction="Fold the blistered paneer tikka into the simmering makhani gravy, swirl in 3 tbsp fresh cream and crushed kasuri methi, and serve hot.",
                        track=TimelineTrack.PLATING,
                        duration_seconds=120,
                        start_offset_seconds=1140,
                        depends_on_steps=[3, 4],
                        equipment=["Serving Handi"],
                        ingredient_names=[
                            "malai paneer (fresh cottage cheese)",
                            "heavy cream (fresh malai)",
                        ],
                        timer_label=None,
                        sensory_cue="Velvety saffron-red gravy ribbons with cream swirl",
                    ),
                ],
                "reviews": [
                    MadeItReviewSchema(
                        id=uuid4(),
                        recipe_id=UUID("11111111-1111-4111-8111-111111111101"),
                        author_name="Priya Nair",
                        rating=5,
                        review_note="Used the 1-click Jain Remix for my in-laws and nobody could believe there was no onion or garlic!",
                        photo_caption="Charred tawa paneer in clay handi",
                        tweak_note="Swapped heavy cream for soaked kaju paste",
                        created_at=now,
                    )
                ],
            },
            {
                "id": UUID("11111111-1111-4111-8111-111111111102"),
                "title": "High-Protein Lasooni Palak Toor Dal Tadka & Jeera Rice Thali",
                "slug": "lasooni-palak-toor-dal-tadka-thali",
                "description": "Unpolished toor and moong dal pressure-cooked with iron-rich spinach, crowned with a double burnt-garlic & Kashmiri chili ghee tadka alongside fluffy jeera basmati rice.",
                "cuisine": "Indian Home Thali",
                "difficulty": "Easy",
                "source_type": RecipeSourceType.YOUTUBE_SHORTS,
                "source_url": "https://www.youtube.com/shorts/misefood-dal-palak",
                "prep_time_minutes": 10,
                "cook_time_minutes": 18,
                "servings": 3,
                "estimated_total_cost_inr": 165.0,
                "likes_count": 518,
                "forks_count": 72,
                "author_name": "Chef Meera Joshi",
                "tags": ["thali", "high-protein", "vegetarian", "dal-tadka", "budget-friendly"],
                "ingredients": [
                    NormalizedIngredient(
                        name="unpolished toor & yellow moong dal",
                        quantity=1.5,
                        unit="katori",
                        aisle_category=AisleCategory.PANTRY_DRY,
                        preparation_note="washed 3 times and soaked 15 mins",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=740.0,
                            protein_g=49.5,
                            carbs_g=128.0,
                            fat_g=3.5,
                            fiber_g=24.0,
                            estimated_cost_inr=48.0,
                            grams_equivalent=225.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="fresh palak (spinach)",
                        quantity=250,
                        unit="g",
                        aisle_category=AisleCategory.PRODUCE,
                        preparation_note="washed and finely shredded",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=58.0,
                            protein_g=7.2,
                            carbs_g=9.0,
                            fat_g=1.0,
                            fiber_g=5.5,
                            estimated_cost_inr=30.0,
                            grams_equivalent=250.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="aged basmati rice",
                        quantity=1.5,
                        unit="katori",
                        aisle_category=AisleCategory.PANTRY_DRY,
                        preparation_note="rinsed until clear for fluffy jeera rice",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=765.0,
                            protein_g=15.8,
                            carbs_g=168.0,
                            fat_g=1.5,
                            fiber_g=3.0,
                            estimated_cost_inr=42.0,
                            grams_equivalent=225.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="cultured A2 cow ghee",
                        quantity=2,
                        unit="tbsp",
                        aisle_category=AisleCategory.DAIRY_EGGS,
                        preparation_note="for double jeera-lasooni tadka",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=240.0,
                            protein_g=0.0,
                            carbs_g=0.0,
                            fat_g=27.0,
                            fiber_g=0.0,
                            estimated_cost_inr=35.0,
                            grams_equivalent=30.0,
                            allergens=["dairy"],
                            dietary_flags=["vegetarian", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="cumin seeds (jeera) & hing",
                        quantity=2,
                        unit="tsp",
                        aisle_category=AisleCategory.SPICES_MASALAS,
                        preparation_note="whole cumin + 1 pinch compounded hing",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=28.0,
                            protein_g=1.4,
                            carbs_g=3.2,
                            fat_g=1.6,
                            fiber_g=0.8,
                            estimated_cost_inr=10.0,
                            grams_equivalent=10.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                ],
                "timeline_steps": [
                    ParallelTimelineNode(
                        step_number=1,
                        title="Wash Dal, Rinse Basmati & Shred Palak",
                        instruction="Wash the toor-moong dal blend and aged basmati rice in separate bowls; finely shred the fresh palak leaves.",
                        track=TimelineTrack.PREP,
                        duration_seconds=240,
                        start_offset_seconds=0,
                        depends_on_steps=[],
                        equipment=["Strainer", "Chef's Knife"],
                        ingredient_names=[
                            "unpolished toor & yellow moong dal",
                            "fresh palak (spinach)",
                            "aged basmati rice",
                        ],
                        timer_label="Prep Dal & Greens (4m)",
                        sensory_cue="Rinse water runs crystal clear",
                    ),
                    ParallelTimelineNode(
                        step_number=2,
                        title="Pressure Cook Toor-Moong Dal (3 Whistles)",
                        instruction="Pressure cook the soaked dal with turmeric, salt, and 3.5 katori water for 11 minutes (3 whistles) until creamy.",
                        track=TimelineTrack.PASSIVE_WAIT,
                        duration_seconds=660,
                        start_offset_seconds=240,
                        depends_on_steps=[1],
                        equipment=["3-Litre Pressure Cooker"],
                        ingredient_names=["unpolished toor & yellow moong dal"],
                        timer_label="Pressure Cook Dal (11m)",
                        sensory_cue="Three steady whistles and fragrant turmeric steam",
                    ),
                    ParallelTimelineNode(
                        step_number=3,
                        title="Simmer Fluffy Jeera Basmati Rice on Back Burner",
                        instruction="While dal pressure cooks, temper 1 tsp jeera in 1 tsp ghee in a heavy pot, add rinsed basmati rice and 3 katori water, and steam covered for 10 minutes.",
                        track=TimelineTrack.PASSIVE_WAIT,
                        duration_seconds=600,
                        start_offset_seconds=300,
                        depends_on_steps=[1],
                        equipment=["Heavy Lidded Saucepan"],
                        ingredient_names=["aged basmati rice", "cumin seeds (jeera) & hing"],
                        timer_label="Steam Jeera Rice (10m)",
                        sensory_cue="Each basmati grain stands separate and aromatic",
                    ),
                    ParallelTimelineNode(
                        step_number=4,
                        title="Fold Shredded Palak & Sizzle Double Ghee Tadka",
                        instruction="Whisk shredded palak into the hot pressure-cooked dal for 3 minutes until emerald, then pour sizzling cow ghee, jeera, and hing tadka on top.",
                        track=TimelineTrack.ACTIVE_COOK,
                        duration_seconds=240,
                        start_offset_seconds=900,
                        depends_on_steps=[2],
                        equipment=["Tadka Pan", "Wire Whisk"],
                        ingredient_names=[
                            "fresh palak (spinach)",
                            "cultured A2 cow ghee",
                            "cumin seeds (jeera) & hing",
                        ],
                        timer_label="Tadka Finish (4m)",
                        sensory_cue="Loud crackle as hot ghee hits the emerald dal surface",
                    ),
                ],
                "reviews": [],
            },
            {
                "id": UUID("11111111-1111-4111-8111-111111111103"),
                "title": "Miso-Glazed Black Cod with Charred Bok Choy & Dashi Rice",
                "slug": "miso-glazed-black-cod-charred-bok-choy",
                "description": "Silky caramelized Saikyo sweet miso fish broiled to blistered perfection alongside ginger-infused baby bok choy and aromatic short-grain rice.",
                "cuisine": "Japanese Modern",
                "difficulty": "Intermediate",
                "source_type": RecipeSourceType.WEBSITE_URL,
                "source_url": "https://misefood.app/recipes/miso-black-cod",
                "prep_time_minutes": 15,
                "cook_time_minutes": 18,
                "servings": 2,
                "estimated_total_cost_inr": 420.0,
                "likes_count": 342,
                "forks_count": 48,
                "author_name": "Chef Kenji Sato",
                "tags": ["non-veg", "high-protein", "omega-3", "umami", "dairy-free"],
                "ingredients": [
                    NormalizedIngredient(
                        name="sablefish (black cod) or rawas fillet",
                        quantity=360,
                        unit="g",
                        aisle_category=AisleCategory.MEAT_SEAFOOD,
                        preparation_note="pat dry thoroughly, skin-on",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=702.0,
                            protein_g=52.0,
                            carbs_g=0.0,
                            fat_g=54.0,
                            fiber_g=0.0,
                            estimated_cost_inr=290.0,
                            grams_equivalent=360.0,
                            allergens=["fish"],
                            dietary_flags=["dairy-free", "gluten-free", "pescatarian", "non-veg"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="white saikyo sweet miso paste",
                        quantity=3,
                        unit="tbsp",
                        aisle_category=AisleCategory.CANNED_JARRED,
                        preparation_note="whisked smooth",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=105.0,
                            protein_g=6.0,
                            carbs_g=14.0,
                            fat_g=3.0,
                            fiber_g=2.5,
                            estimated_cost_inr=65.0,
                            grams_equivalent=45.0,
                            allergens=["soy"],
                            dietary_flags=["vegan", "dairy-free", "gluten-free"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="baby shanghai bok choy",
                        quantity=300,
                        unit="g",
                        aisle_category=AisleCategory.PRODUCE,
                        preparation_note="halved lengthwise and rinsed",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=39.0,
                            protein_g=4.5,
                            carbs_g=6.6,
                            fat_g=0.6,
                            fiber_g=3.0,
                            estimated_cost_inr=45.0,
                            grams_equivalent=300.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="toasted sesame oil",
                        quantity=1,
                        unit="tbsp",
                        aisle_category=AisleCategory.SPICES_OILS,
                        preparation_note="cold-pressed",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=120.0,
                            protein_g=0.0,
                            carbs_g=0.0,
                            fat_g=13.6,
                            fiber_g=0.0,
                            estimated_cost_inr=20.0,
                            grams_equivalent=15.0,
                            allergens=["sesame"],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                ],
                "timeline_steps": [
                    ParallelTimelineNode(
                        step_number=1,
                        title="Whisk Saikyo Miso Glaze & Halve Bok Choy",
                        instruction="Whisk the white Saikyo miso until glossy and halve the baby bok choy lengthwise.",
                        track=TimelineTrack.PREP,
                        duration_seconds=240,
                        start_offset_seconds=0,
                        depends_on_steps=[],
                        equipment=["Whisk", "Chef's Knife"],
                        ingredient_names=[
                            "white saikyo sweet miso paste",
                            "baby shanghai bok choy",
                        ],
                        timer_label="Prep & Whisk (4m)",
                        sensory_cue="Satin miso glaze clings to spoon",
                    ),
                    ParallelTimelineNode(
                        step_number=2,
                        title="Broil Miso-Glazed Fish Fillets",
                        instruction="Brush fillets with miso glaze and broil or air-fry at 200°C for 7 minutes until blistered mahogany.",
                        track=TimelineTrack.PASSIVE_WAIT,
                        duration_seconds=420,
                        start_offset_seconds=240,
                        depends_on_steps=[1],
                        equipment=["Broiler Pan / Air-Fryer"],
                        ingredient_names=["sablefish (black cod) or rawas fillet"],
                        timer_label="Broil Fish (7m)",
                        sensory_cue="Caramelized miso blisters on top",
                    ),
                    ParallelTimelineNode(
                        step_number=3,
                        title="Flash-Sear Bok Choy in Toasted Sesame Oil",
                        instruction="While fish broils, sear halved baby bok choy cut-side down in hot sesame oil for 3 minutes until crisp-tender.",
                        track=TimelineTrack.ACTIVE_COOK,
                        duration_seconds=180,
                        start_offset_seconds=420,
                        depends_on_steps=[1],
                        equipment=["Carbon Steel Skillet"],
                        ingredient_names=["baby shanghai bok choy", "toasted sesame oil"],
                        timer_label="Sear Bok Choy (3m)",
                        sensory_cue="Emerald leaves and lightly charred stems",
                    ),
                ],
                "reviews": [],
            },
            {
                "id": UUID("11111111-1111-4111-8111-111111111104"),
                "title": "Crispy Air-Fryer Tandoori Chicken Tikka & Mint Dahi Bowl",
                "slug": "crispy-air-fryer-tandoori-chicken-tikka",
                "description": "Juicy boneless chicken thighs marinated in smoked mustard oil, hung curd, and Kashmiri lal mirch, air-fried in 11 minutes for 58g protein per serving.",
                "cuisine": "Modern Indian Grill",
                "difficulty": "Easy",
                "source_type": RecipeSourceType.YOUTUBE_SHORTS,
                "source_url": "https://www.youtube.com/shorts/misefood-tandoori-airfryer",
                "prep_time_minutes": 12,
                "cook_time_minutes": 11,
                "servings": 2,
                "estimated_total_cost_inr": 245.0,
                "likes_count": 780,
                "forks_count": 115,
                "author_name": "Chef Kabir Bedi",
                "tags": ["non-veg", "high-protein", "air-fryer", "gluten-free", "gym-meal"],
                "ingredients": [
                    NormalizedIngredient(
                        name="boneless chicken thigh tikka cuts",
                        quantity=400,
                        unit="g",
                        aisle_category=AisleCategory.MEAT_SEAFOOD,
                        preparation_note="trimmed and patted dry",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=708.0,
                            protein_g=96.0,
                            carbs_g=0.0,
                            fat_g=32.0,
                            fiber_g=0.0,
                            estimated_cost_inr=180.0,
                            grams_equivalent=400.0,
                            allergens=[],
                            dietary_flags=["high-protein", "gluten-free", "dairy-free", "non-veg"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="strained hung curd (chakka dahi)",
                        quantity=1,
                        unit="katori",
                        aisle_category=AisleCategory.DAIRY_EGGS,
                        preparation_note="whisked with ginger-garlic & Kashmiri mirch",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=145.0,
                            protein_g=14.5,
                            carbs_g=6.5,
                            fat_g=6.0,
                            fiber_g=0.0,
                            estimated_cost_inr=35.0,
                            grams_equivalent=150.0,
                            allergens=["dairy"],
                            dietary_flags=["vegetarian", "gluten-free", "high-protein"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="kashmiri lal mirch & kasuri methi",
                        quantity=1.5,
                        unit="tbsp",
                        aisle_category=AisleCategory.SPICES_MASALAS,
                        preparation_note="crushed between palms",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=36.0,
                            protein_g=1.4,
                            carbs_g=6.0,
                            fat_g=1.2,
                            fiber_g=2.8,
                            estimated_cost_inr=15.0,
                            grams_equivalent=15.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                    NormalizedIngredient(
                        name="fresh mint & coriander leaves",
                        quantity=1,
                        unit="katori",
                        aisle_category=AisleCategory.PRODUCE,
                        preparation_note="blended into green chutney",
                        nutrition_meta=NutritionMeta(
                            calories_kcal=25.0,
                            protein_g=2.2,
                            carbs_g=4.5,
                            fat_g=0.4,
                            fiber_g=3.2,
                            estimated_cost_inr=15.0,
                            grams_equivalent=80.0,
                            allergens=[],
                            dietary_flags=["vegan", "dairy-free", "gluten-free", "jain-friendly"],
                        ),
                    ),
                ],
                "timeline_steps": [
                    ParallelTimelineNode(
                        step_number=1,
                        title="Toss Chicken in Tandoori Hung Curd Marinade",
                        instruction="Coat chicken thigh chunks in hung curd, Kashmiri lal mirch, and crushed kasuri methi.",
                        track=TimelineTrack.PREP,
                        duration_seconds=240,
                        start_offset_seconds=0,
                        depends_on_steps=[],
                        equipment=["Mixing Bowl"],
                        ingredient_names=[
                            "boneless chicken thigh tikka cuts",
                            "strained hung curd (chakka dahi)",
                        ],
                        timer_label="Coat Tikka (4m)",
                        sensory_cue="Bright tandoori crimson coat on every piece",
                    ),
                    ParallelTimelineNode(
                        step_number=2,
                        title="Air-Fry Tandoori Chicken at 200°C",
                        instruction="Arrange chicken in a single layer in the preheated 200°C air-fryer basket and cook for 11 minutes.",
                        track=TimelineTrack.PASSIVE_WAIT,
                        duration_seconds=660,
                        start_offset_seconds=240,
                        depends_on_steps=[1],
                        equipment=["Air-Fryer"],
                        ingredient_names=["boneless chicken thigh tikka cuts"],
                        timer_label="Air-Fry (11m)",
                        sensory_cue="Sizzling charred edges and juicy tender center",
                    ),
                    ParallelTimelineNode(
                        step_number=3,
                        title="Blitz Fresh Mint-Coriander Dahi Chutney",
                        instruction="While chicken air-fries, blend fresh mint, coriander, green chili, and 2 tbsp dahi until vibrant green.",
                        track=TimelineTrack.PREP,
                        duration_seconds=180,
                        start_offset_seconds=360,
                        depends_on_steps=[],
                        equipment=["Chutney Grinder"],
                        ingredient_names=["fresh mint & coriander leaves"],
                        timer_label="Blitz Chutney (3m)",
                        sensory_cue="Bright herbaceous aroma",
                    ),
                ],
                "reviews": [],
            },
        ]

        for item in seed_payloads:
            recipe = RecipeResponse(
                id=item["id"],
                title=item["title"],
                slug=item["slug"],
                description=item["description"],
                cuisine=item["cuisine"],
                difficulty=item["difficulty"],
                source_type=item["source_type"],
                source_url=item["source_url"],
                prep_time_minutes=item["prep_time_minutes"],
                cook_time_minutes=item["cook_time_minutes"],
                servings=item["servings"],
                estimated_total_cost_inr=item["estimated_total_cost_inr"],
                hero_image_url=None,
                ingredients=item["ingredients"],
                timeline_steps=item["timeline_steps"],
                tags=item["tags"],
                likes_count=item["likes_count"],
                forks_count=item["forks_count"],
                author_name=item["author_name"],
                parent_recipe_id=None,
                remix_mode=None,
                remix_note=None,
                similarity_score=None,
                reviews=item["reviews"],
                created_at=now,
            )
            embed_input = self._build_embedding_corpus(recipe)
            embedding = gemini_service.embed_text(embed_input)
            self._recipes[recipe.id] = (recipe, embedding)

    def _seed_initial_pantry(self) -> None:
        today = date.today()
        initial_items = [
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222201"),
                name="malai paneer (fresh cottage cheese)",
                quantity=400,
                unit="g",
                storage_location=StorageLocation.FRIDGE,
                aisle_category=AisleCategory.DAIRY_EGGS,
                barcode_ean="8901262010016",
                expiry_date=today + timedelta(days=2),
                days_until_expiry=2,
                status="expiring_soon",
                nutrition_meta={"calories_kcal": 1060, "protein_g": 72, "estimated_cost_inr": 180},
            ),
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222202"),
                name="fresh palak (spinach)",
                quantity=300,
                unit="g",
                storage_location=StorageLocation.FRIDGE,
                aisle_category=AisleCategory.PRODUCE,
                barcode_ean="8904004400112",
                expiry_date=today + timedelta(days=1),
                days_until_expiry=1,
                status="expiring_soon",
                nutrition_meta={"calories_kcal": 69, "protein_g": 8.7, "estimated_cost_inr": 35},
            ),
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222203"),
                name="unpolished toor & yellow moong dal",
                quantity=4,
                unit="katori",
                storage_location=StorageLocation.DRY_PANTRY,
                aisle_category=AisleCategory.PANTRY_DRY,
                barcode_ean="8901058851243",
                expiry_date=today + timedelta(days=120),
                days_until_expiry=120,
                status="fresh",
                nutrition_meta={"calories_kcal": 1970, "protein_g": 132, "estimated_cost_inr": 128},
            ),
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222204"),
                name="strained hung curd (chakka dahi)",
                quantity=2,
                unit="katori",
                storage_location=StorageLocation.FRIDGE,
                aisle_category=AisleCategory.DAIRY_EGGS,
                barcode_ean="8901725112233",
                expiry_date=today + timedelta(days=3),
                days_until_expiry=3,
                status="expiring_soon",
                nutrition_meta={"calories_kcal": 290, "protein_g": 29, "estimated_cost_inr": 70},
            ),
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222205"),
                name="cumin seeds (jeera)",
                quantity=15,
                unit="tsp",
                storage_location=StorageLocation.SPICE_BOX,
                aisle_category=AisleCategory.SPICES_MASALAS,
                barcode_ean="8901786101018",
                expiry_date=today + timedelta(days=180),
                days_until_expiry=180,
                status="fresh",
                nutrition_meta={"calories_kcal": 220, "protein_g": 11, "estimated_cost_inr": 45},
            ),
            PantryItemSchema(
                id=UUID("22222222-2222-4222-8222-222222222206"),
                name="aged basmati rice",
                quantity=6,
                unit="katori",
                storage_location=StorageLocation.DRY_PANTRY,
                aisle_category=AisleCategory.PANTRY_DRY,
                barcode_ean="8901537001022",
                expiry_date=today + timedelta(days=240),
                days_until_expiry=240,
                status="fresh",
                nutrition_meta={"calories_kcal": 3060, "protein_g": 63, "estimated_cost_inr": 168},
            ),
        ]
        for item in initial_items:
            self._pantry[item.id] = item

    def _seed_social_hub(self) -> None:
        self._communities = [
            CommunitySchema(
                id=UUID("33333333-3333-4333-8333-333333333301"),
                name="High-Protein Indian Meal Prep & Macro Club",
                slug="high-protein-indian-meal-prep",
                description="130g+ daily protein using paneer, soya, dals, hung curd, and air-fryer tikkas under ₹2500/week.",
                banner_tag="14.2k Chefs • Macro Verified",
                members_count=14280,
                featured_tags=["high-protein", "air-fryer", "paneer", "thali"],
            ),
            CommunitySchema(
                id=UUID("33333333-3333-4333-8333-333333333302"),
                name="Jain & Sattvic No-Onion No-Garlic Kitchen",
                slug="jain-sattvic-kitchen",
                description="Ingenious hing, fennel, cashew-magaj, and Kashmiri chili techniques for restaurant-grade Sattvic dishes.",
                banner_tag="8.9k Chefs • 100% Sattvic",
                members_count=8940,
                featured_tags=["jain-friendly", "no-onion-garlic", "vegetarian"],
            ),
            CommunitySchema(
                id=UUID("33333333-3333-4333-8333-333333333303"),
                name="Kinetic Loop 30-Minute Parallel Sunday Prep",
                slug="kinetic-loop-parallel-prep",
                description="Interleaved multi-burner DAG timelines that cook 4 dishes in under 35 minutes.",
                banner_tag="11.6k Chefs • Time-Optimized",
                members_count=11610,
                featured_tags=["parallel-timeline", "sunday-prep", "one-pot"],
            ),
        ]

        self._cookbooks = [
            CookbookSchema(
                id=UUID("44444444-4444-4444-8444-444444444401"),
                title="Sharma Family Weekday Thali & Tiffin Box",
                description="Shared household collection of 20-minute dals, rotis, and high-protein paneer dishes.",
                owner_name="Ananya & Rohan",
                is_collaborative=True,
                recipe_ids=[
                    UUID("11111111-1111-4111-8111-111111111101"),
                    UUID("11111111-1111-4111-8111-111111111102"),
                ],
                members_names=["Ananya", "Rohan", "Nani Ji", "Kabir"],
            ),
            CookbookSchema(
                id=UUID("44444444-4444-4444-8444-444444444402"),
                title="Post-Workout 50g Protein Dinners",
                description="Low-oil air-fryer tikkas, broiled miso fish, and macro-counted bowls.",
                owner_name="Coach Vikram",
                is_collaborative=True,
                recipe_ids=[
                    UUID("11111111-1111-4111-8111-111111111103"),
                    UUID("11111111-1111-4111-8111-111111111104"),
                ],
                members_names=["Vikram", "Meera", "Arjun"],
            ),
        ]

    @staticmethod
    def _build_embedding_corpus(recipe: RecipeResponse | RecipeCreate) -> str:
        ing_names = ", ".join(i.name for i in recipe.ingredients)
        tags_str = ", ".join(recipe.tags)
        return f"{recipe.title}. {recipe.cuisine}. {recipe.description}. Ingredients: {ing_names}. Tags: {tags_str}"

    def list_recipes(
        self,
        search_query: str | None = None,
        unit_system: UnitSystem | None = None,
    ) -> list[RecipeResponse]:
        items = [r for r, _ in self._recipes.values()]
        if search_query and search_query.strip():
            query_vec = gemini_service.embed_text(search_query)
            q_lower = search_query.strip().lower()
            scored: list[RecipeResponse] = []
            for recipe, vec in self._recipes.values():
                sim = gemini_service.cosine_similarity(query_vec, vec)
                corpus = self._build_embedding_corpus(recipe).lower()
                if q_lower in corpus:
                    sim = min(0.99, sim + 0.35)
                copy_item = recipe.model_copy(
                    update={"similarity_score": round(sim, 3)}
                )
                scored.append(copy_item)
            scored.sort(key=lambda r: r.similarity_score or 0.0, reverse=True)
            items = scored

        if unit_system is not None:
            converted_list: list[RecipeResponse] = []
            for r in items:
                conv_ings = [
                    convert_ingredient_unit_system(i, unit_system, 1.0)
                    for i in r.ingredients
                ]
                converted_list.append(r.model_copy(update={"ingredients": conv_ings}))
            return converted_list

        return items

    def get_recipe(
        self,
        recipe_id: UUID,
        servings: int | None = None,
        unit_system: UnitSystem | None = None,
    ) -> RecipeResponse | None:
        entry = self._recipes.get(recipe_id)
        if not entry:
            return None
        recipe = entry[0]
        scale = (servings / max(1, recipe.servings)) if servings else 1.0
        if servings or unit_system:
            target_sys = unit_system or UnitSystem.INDIAN
            conv_ings = [
                convert_ingredient_unit_system(i, target_sys, scale)
                for i in recipe.ingredients
            ]
            return recipe.model_copy(
                update={
                    "servings": servings or recipe.servings,
                    "ingredients": conv_ings,
                    "estimated_total_cost_inr": round(
                        sum(i.nutrition_meta.estimated_cost_inr for i in conv_ings),
                        1,
                    ),
                }
            )
        return recipe

    def create_recipe(
        self, payload: RecipeCreate, author_name: str = "You (Chef Studio)"
    ) -> RecipeResponse:
        new_id = uuid4()
        if payload.parent_recipe_id and payload.parent_recipe_id in self._recipes:
            parent, parent_vec = self._recipes[payload.parent_recipe_id]
            updated_parent = parent.model_copy(
                update={"forks_count": parent.forks_count + 1}
            )
            self._recipes[payload.parent_recipe_id] = (updated_parent, parent_vec)

        total_cost = round(
            sum(i.nutrition_meta.estimated_cost_inr for i in payload.ingredients),
            1,
        )
        recipe = RecipeResponse(
            id=new_id,
            title=payload.title,
            slug=_slugify(payload.title),
            description=payload.description,
            cuisine=payload.cuisine,
            difficulty=payload.difficulty,
            source_type=payload.source_type,
            source_url=payload.source_url,
            prep_time_minutes=payload.prep_time_minutes,
            cook_time_minutes=payload.cook_time_minutes,
            servings=payload.servings,
            estimated_total_cost_inr=total_cost or payload.estimated_total_cost_inr,
            hero_image_url=payload.hero_image_url,
            ingredients=payload.ingredients,
            timeline_steps=payload.timeline_steps,
            tags=payload.tags,
            likes_count=1,
            forks_count=0,
            author_name=author_name,
            parent_recipe_id=payload.parent_recipe_id,
            remix_mode=payload.remix_mode,
            remix_note=payload.remix_note,
            similarity_score=None,
            reviews=[],
            created_at=datetime.now(timezone.utc),
        )
        embedding = gemini_service.embed_text(self._build_embedding_corpus(recipe))
        self._recipes[new_id] = (recipe, embedding)
        return recipe

    def remix_recipe(
        self, recipe_id: UUID, req: RecipeRemixRequest
    ) -> RecipeResponse | None:
        base = self.get_recipe(recipe_id)
        if not base:
            return None

        remixed_ings, remixed_steps, note = gemini_service.apply_ai_remix_to_data(
            base.ingredients,
            base.timeline_steps,
            req.custom_instruction or req.remix_mode.value,
        )
        mode_label = req.remix_mode.value.replace("_", "-").title()
        create_payload = RecipeCreate(
            title=f"{base.title} ({mode_label})",
            description=f"{base.description} — {note}",
            cuisine=base.cuisine,
            difficulty=base.difficulty,
            source_type=RecipeSourceType.AI_REMIX,
            source_url=base.source_url,
            prep_time_minutes=base.prep_time_minutes,
            cook_time_minutes=max(8, base.cook_time_minutes - 4)
            if req.remix_mode.value == "air_fryer"
            else base.cook_time_minutes,
            servings=req.target_servings or base.servings,
            estimated_total_cost_inr=round(
                sum(i.nutrition_meta.estimated_cost_inr for i in remixed_ings), 1
            ),
            hero_image_url=base.hero_image_url,
            ingredients=remixed_ings,
            timeline_steps=remixed_steps,
            tags=sorted(set(base.tags) | {req.remix_mode.value.replace("_", "-")}),
            parent_recipe_id=base.id,
            remix_mode=req.remix_mode.value,
            remix_note=note,
        )
        return self.create_recipe(create_payload, author_name="AI Remix Studio")

    # Pantry & Barcode Methods
    def list_pantry_items(self) -> list[PantryItemSchema]:
        return list(self._pantry.values())

    def add_pantry_item(self, req: PantryItemCreateRequest) -> PantryItemSchema:
        new_id = uuid4()
        exp_date = date.today() + timedelta(days=req.days_until_expiry)
        status = (
            "expiring_soon"
            if req.days_until_expiry <= 3
            else "fresh"
        )
        item = PantryItemSchema(
            id=new_id,
            name=req.name.strip().lower(),
            quantity=req.quantity,
            unit=req.unit.strip().lower(),
            storage_location=req.storage_location,
            aisle_category=req.aisle_category,
            barcode_ean=req.barcode_ean,
            expiry_date=exp_date,
            days_until_expiry=req.days_until_expiry,
            status=status,
            nutrition_meta={"estimated_cost_inr": 65.0},
        )
        self._pantry[new_id] = item
        return item

    def lookup_barcode(self, barcode_ean: str) -> PantryItemSchema:
        catalog: dict[str, PantryItemCreateRequest] = {
            "8901262010016": PantryItemCreateRequest(
                name="amul malai paneer (cubed)",
                quantity=200,
                unit="g",
                storage_location=StorageLocation.FRIDGE,
                aisle_category=AisleCategory.DAIRY_EGGS,
                barcode_ean="8901262010016",
                days_until_expiry=4,
            ),
            "8901058851243": PantryItemCreateRequest(
                name="tata sampann unpolished toor dal",
                quantity=500,
                unit="g",
                storage_location=StorageLocation.DRY_PANTRY,
                aisle_category=AisleCategory.PANTRY_DRY,
                barcode_ean="8901058851243",
                days_until_expiry=180,
            ),
            "8901725112233": PantryItemCreateRequest(
                name="mother dairy classic dahi (curd)",
                quantity=2,
                unit="katori",
                storage_location=StorageLocation.FRIDGE,
                aisle_category=AisleCategory.DAIRY_EGGS,
                barcode_ean="8901725112233",
                days_until_expiry=3,
            ),
            "8901786101018": PantryItemCreateRequest(
                name="everest kashmiri lal mirch",
                quantity=100,
                unit="g",
                storage_location=StorageLocation.SPICE_BOX,
                aisle_category=AisleCategory.SPICES_MASALAS,
                barcode_ean="8901786101018",
                days_until_expiry=240,
            ),
        }
        req = catalog.get(
            barcode_ean.strip(),
            PantryItemCreateRequest(
                name=f"scanned grocery item ({barcode_ean[-4:]})",
                quantity=1,
                unit="katori",
                storage_location=StorageLocation.DRY_PANTRY,
                aisle_category=AisleCategory.PANTRY_DRY,
                barcode_ean=barcode_ean,
                days_until_expiry=30,
            ),
        )
        return self.add_pantry_item(req)

    def mark_recipe_cooked(self, recipe_id: UUID) -> MarkCookedResponse | None:
        recipe = self.get_recipe(recipe_id)
        if not recipe:
            return None
        depleted: list[str] = []
        for ing in recipe.ingredients:
            for p_id, p_item in list(self._pantry.items()):
                if (
                    p_item.name in ing.name
                    or ing.name in p_item.name
                    or any(
                        tok in p_item.name
                        for tok in ing.name.split()
                        if len(tok) > 4
                    )
                ):
                    deduct = (
                        ing.quantity
                        if p_item.unit == ing.unit
                        else max(0.5, p_item.quantity * 0.35)
                    )
                    remaining = round(max(0.0, p_item.quantity - deduct), 2)
                    depleted.append(
                        f"{p_item.name}: {p_item.quantity:g} {p_item.unit} → {remaining:g} {p_item.unit}"
                    )
                    if remaining <= 0.05:
                        del self._pantry[p_id]
                    else:
                        self._pantry[p_id] = p_item.model_copy(
                            update={
                                "quantity": remaining,
                                "status": "low_stock"
                                if remaining <= 1.0
                                else p_item.status,
                            }
                        )
                    break

        return MarkCookedResponse(
            recipe_id=recipe.id,
            recipe_title=recipe.title,
            depleted_items=depleted or ["Standard spice-box tadka quantities deducted"],
            updated_pantry=self.list_pantry_items(),
        )

    def rescue_recipes_with_pantry(self) -> list[PantryRescueMatch]:
        pantry_items = self.list_pantry_items()
        matches: list[PantryRescueMatch] = []

        for recipe, _ in self._recipes.values():
            matched_names: list[str] = []
            rescued_expiring: list[str] = []
            missing: list[NormalizedIngredient] = []

            for ing in recipe.ingredients:
                found_pantry = None
                for p in pantry_items:
                    if (
                        p.name in ing.name
                        or ing.name in p.name
                        or any(
                            tok in p.name
                            for tok in ing.name.split()
                            if len(tok) > 4
                        )
                    ):
                        found_pantry = p
                        break
                if found_pantry is not None:
                    matched_names.append(found_pantry.name)
                    if found_pantry.status == "expiring_soon":
                        rescued_expiring.append(found_pantry.name)
                else:
                    missing.append(ing)

            total = max(1, len(recipe.ingredients))
            pct = round((len(matched_names) / total) * 100.0, 1)
            matches.append(
                PantryRescueMatch(
                    recipe_id=recipe.id,
                    recipe_title=recipe.title,
                    cuisine=recipe.cuisine,
                    match_percentage=pct,
                    matched_pantry_items=matched_names,
                    missing_ingredients=missing,
                    rescues_expiring_items=sorted(set(rescued_expiring)),
                )
            )

        matches.sort(
            key=lambda m: (len(m.rescues_expiring_items), m.match_percentage),
            reverse=True,
        )
        return matches

    # Social Hub Methods
    def list_communities(self) -> list[CommunitySchema]:
        return self._communities

    def list_cookbooks(self) -> list[CookbookSchema]:
        return self._cookbooks

    def add_review(
        self, recipe_id: UUID, req: MadeItReviewCreateRequest
    ) -> MadeItReviewSchema | None:
        entry = self._recipes.get(recipe_id)
        if not entry:
            return None
        recipe, vec = entry
        review = MadeItReviewSchema(
            id=uuid4(),
            recipe_id=recipe_id,
            author_name=req.author_name,
            rating=req.rating,
            review_note=req.review_note,
            photo_caption=req.photo_caption,
            tweak_note=req.tweak_note,
            created_at=datetime.now(timezone.utc),
        )
        updated_recipe = recipe.model_copy(
            update={
                "reviews": [review, *recipe.reviews],
                "likes_count": recipe.likes_count + 1,
            }
        )
        self._recipes[recipe_id] = (updated_recipe, vec)
        return review


catalog_store = RecipeCatalogStore()
