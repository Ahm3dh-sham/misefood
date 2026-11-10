import uuid
from datetime import datetime, timezone
from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(120))
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    preferred_unit_system: Mapped[str] = mapped_column(String(32), default="indian")
    daily_calorie_target: Mapped[int] = mapped_column(Integer, default=2000)
    daily_protein_target_g: Mapped[int] = mapped_column(Integer, default=130)
    weekly_budget_inr: Mapped[float] = mapped_column(Float, default=2500.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    taste_profile: Mapped["TasteProfile | None"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    recipes: Mapped[list["Recipe"]] = relationship(back_populates="author")


class TasteProfile(Base):
    __tablename__ = "taste_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    dietary_preferences: Mapped[list[str]] = mapped_column(JSON, default=list)
    allergies: Mapped[list[str]] = mapped_column(JSON, default=list)
    favorite_cuisines: Mapped[list[str]] = mapped_column(JSON, default=list)
    spice_tolerance: Mapped[str] = mapped_column(String(32), default="medium")
    taste_embedding: Mapped[list[float] | None] = mapped_column(
        Vector(768), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="taste_profile")
