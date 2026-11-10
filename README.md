# MiseFood — AI Sous Chef, Social Recipe Hub & Smart Meal Planner

MiseFood is a full-stack culinary intelligence platform combining:
- **Social Recipe Hub**: Discover, fork/remix, scale, and semantically substitute ingredients in recipes.
- **AI Sous Chef & OCR Studio**: Extract recipes from photos/handwritten cards (Tesseract.js + `gemini-3.8-flash`), normalize every ingredient, and compile parallel cooking timelines (Prep + Active + Passive DAG tracks).
- **Hands-Free Cooking Mode**: Voice-controlled step navigation, live Q&A, and hardware-accelerated multi-track timers powered by the Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- **Smart Meal Planner**: Weekly schedule orchestration with `pgvector` taste-matching and automatic aisle-sorted grocery list aggregation.

## Canonical Ingredient Schema Contract
Every ingredient across the entire stack conforms to:
```json
{
  "name": "garlic clove",
  "quantity": 4,
  "unit": "piece",
  "aisle_category": "produce",
  "preparation_note": "thinly sliced",
  "nutrition_meta": {
    "calories_kcal": 18,
    "protein_g": 0.8,
    "carbs_g": 4.0,
    "fat_g": 0.1,
    "fiber_g": 0.3,
    "allergens": [],
    "dietary_flags": ["vegan", "gluten-free"]
  }
}
```

## Quickstart

### 1. Start PostgreSQL with `pgvector`
```bash
docker compose up -d postgres
```

### 2. Run the FastAPI + LangGraph Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Run the Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
