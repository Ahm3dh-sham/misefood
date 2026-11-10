import uuid
from datetime import datetime, timezone
from typing import Any
from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(200), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    cuisine: Mapped[str] = mapped_column(String(80), index=True)
    difficulty: Mapped[str] = mapped_column(String(40), default="Intermediate")
    source_type: Mapped[str] = mapped_column(String(40), default="manual")
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    prep_time_minutes: Mapped[int] = mapped_column(Integer, default=15)
    cook_time_minutes: Mapped[int] = mapped_column(Integer, default=25)
    servings: Mapped[int] = mapped_column(Integer, default=4)
    estimated_total_cost_inr: Mapped[float] = mapped_column(Float, default=240.0)
    hero_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Canonical normalized ingredients list:
    # [{ name, quantity, unit, aisle_category, preparation_note, nutrition_meta }]
    ingredients: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    # Parallel cooking timeline nodes (DAG tracks: prep, active_cook, passive_wait, plating)
    timeline_steps: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    forks_count: Mapped[int] = mapped_column(Integer, default=0)

    author_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    parent_recipe_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True
    )
    remix_mode: Mapped[str | None] = mapped_column(String(64), nullable=True)
    remix_note: Mapped[str | None] = mapped_column(String(400), nullable=True)

    # 768-dim Gemini embedding (gemini-embedding-2)
    recipe_embedding: Mapped[list[float] | None] = mapped_column(
        Vector(768), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    author: Mapped["User | None"] = relationship(back_populates="recipes")
    normalized_ingredient_rows: Mapped[list["Ingredient"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["MadeItReview"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan"
    )


class Ingredient(Base):
    """Relational NormalizedIngredient table with pgvector embedding for granular search & substitutions."""

    __tablename__ = "ingredients"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    recipe_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(140), index=True)
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(32))
    aisle_category: Mapped[str] = mapped_column(String(60), index=True)
    preparation_note: Mapped[str | None] = mapped_column(String(240), nullable=True)
    nutrition_meta: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    ingredient_embedding: Mapped[list[float] | None] = mapped_column(
        Vector(768), nullable=True
    )

    recipe: Mapped["Recipe"] = relationship(back_populates="normalized_ingredient_rows")


class IngredientEmbeddingCatalog(Base):
    """Stores vector embeddings for individual canonical ingredients to power semantic substitutions."""

    __tablename__ = "ingredient_catalog"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    aisle_category: Mapped[str] = mapped_column(String(60), index=True)
    flavor_profile: Mapped[str] = mapped_column(String(240), default="")
    default_unit: Mapped[str] = mapped_column(String(32), default="g")
    nutrition_per_100g: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    embedding: Mapped[list[float] | None] = mapped_column(Vector(768), nullable=True)
    typical_ratio: Mapped[float] = mapped_column(Float, default=1.0)


class MadeItReview(Base):
    """Samsung Food style 'Made It' user photo reviews and recipe tweak notes."""

    __tablename__ = "made_it_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    recipe_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("recipes.id", ondelete="CASCADE"), index=True
    )
    author_name: Mapped[str] = mapped_column(String(120))
    rating: Mapped[int] = mapped_column(Integer, default=5)
    review_note: Mapped[str] = mapped_column(Text)
    photo_caption: Mapped[str | None] = mapped_column(String(240), nullable=True)
    tweak_note: Mapped[str | None] = mapped_column(String(240), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    recipe: Mapped["Recipe"] = relationship(back_populates="reviews")
