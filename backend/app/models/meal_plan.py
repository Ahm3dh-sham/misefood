import uuid
from datetime import date, datetime, timezone
from typing import Any
from pgvector.sqlalchemy import Vector
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(160), default="Weekly Smart Plan")
    week_start_date: Mapped[date] = mapped_column(Date)
    target_daily_calories: Mapped[int] = mapped_column(Integer, default=2000)
    target_daily_protein_g: Mapped[int] = mapped_column(Integer, default=130)
    max_weekly_budget_inr: Mapped[float] = mapped_column(Float, default=2500.0)
    estimated_weekly_cost_inr: Mapped[float] = mapped_column(Float, default=1950.0)
    dietary_focus: Mapped[list[str]] = mapped_column(JSON, default=list)
    prep_ahead_strategy: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Structured composite daily slots
    days: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    # Aggregated grocery list grouped by aisle_category
    grocery_aisles: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    slots: Mapped[list["MealSlot"]] = relationship(
        back_populates="meal_plan", cascade="all, delete-orphan"
    )


class MealSlot(Base):
    """Supports both Western single-dish slots and Indian multi-dish Thali slots
    (e.g., Lunch = Rice + Dal/Gravy + Sabji + Curd).
    """

    __tablename__ = "meal_slots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meal_plan_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meal_plans.id", ondelete="CASCADE"), index=True
    )
    day_index: Mapped[int] = mapped_column(Integer, default=0)
    day_name: Mapped[str] = mapped_column(String(32))
    slot_type: Mapped[str] = mapped_column(String(32))
    slot_structure: Mapped[str] = mapped_column(
        String(40), default="indian_thali_combo"
    )
    dish_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    slot_macro_rollup: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    meal_plan: Mapped["MealPlan"] = relationship(back_populates="slots")


class PantryItem(Base):
    """Tracks Fridge, Freezer, Dry Pantry & Spice Box stock with expiry and pgvector rescue."""

    __tablename__ = "pantry_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(140), index=True)
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(32))
    storage_location: Mapped[str] = mapped_column(String(40), default="fridge")
    aisle_category: Mapped[str] = mapped_column(String(60), default="produce")
    barcode_ean: Mapped[str | None] = mapped_column(String(64), nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    min_threshold_quantity: Mapped[float] = mapped_column(Float, default=1.0)
    nutrition_meta: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    item_embedding: Mapped[list[float] | None] = mapped_column(
        Vector(768), nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class GroceryList(Base):
    """Consolidated household grocery cart with Quick-Commerce export metadata."""

    __tablename__ = "grocery_lists"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    meal_plan_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("meal_plans.id", ondelete="SET NULL"),
        nullable=True,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(160))
    household_share_code: Mapped[str] = mapped_column(
        String(32), unique=True, index=True
    )
    total_estimated_cost_inr: Mapped[float] = mapped_column(Float, default=0.0)
    aisle_groups: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class CookingTimeline(Base):
    """Kinetic Loop Multi-Recipe Parallel Timeline (2 to 4 recipes interleaved)."""

    __tablename__ = "cooking_timelines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(200))
    recipe_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
    total_duration_seconds: Mapped[int] = mapped_column(Integer, default=1800)
    time_saved_seconds: Mapped[int] = mapped_column(Integer, default=600)
    interleaved_steps: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )


class Community(Base):
    """Samsung Food style culinary communities."""

    __tablename__ = "communities"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(140))
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    banner_tag: Mapped[str] = mapped_column(String(80))
    members_count: Mapped[int] = mapped_column(Integer, default=120)
    featured_tags: Mapped[list[str]] = mapped_column(JSON, default=list)


class Cookbook(Base):
    """Shared collaborative family/housemate recipe boxes."""

    __tablename__ = "cookbooks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    community_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("communities.id", ondelete="SET NULL"),
        nullable=True,
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    is_collaborative: Mapped[bool] = mapped_column(Boolean, default=True)
    recipe_ids: Mapped[list[str]] = mapped_column(JSON, default=list)
