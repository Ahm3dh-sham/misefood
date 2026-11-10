"""Initial MiseFood schema with pgvector extension

Revision ID: 0001_initial_pgvector
Revises:
Create Date: 2026-11-10 12:40:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

revision: str = "0001_initial_pgvector"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("username", sa.String(length=80), nullable=False, unique=True),
        sa.Column("display_name", sa.String(length=120), nullable=False),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "taste_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            unique=True,
        ),
        sa.Column("dietary_preferences", sa.JSON(), nullable=False),
        sa.Column("allergies", sa.JSON(), nullable=False),
        sa.Column("favorite_cuisines", sa.JSON(), nullable=False),
        sa.Column("spice_tolerance", sa.String(length=32), nullable=False),
        sa.Column("taste_embedding", Vector(768), nullable=True),
    )

    op.create_table(
        "recipes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("cuisine", sa.String(length=80), nullable=False),
        sa.Column("difficulty", sa.String(length=40), nullable=False),
        sa.Column("prep_time_minutes", sa.Integer(), nullable=False),
        sa.Column("cook_time_minutes", sa.Integer(), nullable=False),
        sa.Column("servings", sa.Integer(), nullable=False),
        sa.Column("hero_image_url", sa.String(length=500), nullable=True),
        sa.Column("ingredients", sa.JSON(), nullable=False),
        sa.Column("timeline_steps", sa.JSON(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("likes_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("forks_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "author_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "parent_recipe_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("recipes.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("remix_note", sa.String(length=400), nullable=True),
        sa.Column("recipe_embedding", Vector(768), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_recipes_title", "recipes", ["title"])
    op.create_index("ix_recipes_slug", "recipes", ["slug"], unique=True)
    op.create_index("ix_recipes_cuisine", "recipes", ["cuisine"])

    op.create_table(
        "ingredient_catalog",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=140), nullable=False, unique=True),
        sa.Column("aisle_category", sa.String(length=60), nullable=False),
        sa.Column("flavor_profile", sa.String(length=240), nullable=False),
        sa.Column("default_unit", sa.String(length=32), nullable=False),
        sa.Column("nutrition_per_100g", sa.JSON(), nullable=False),
        sa.Column("embedding", Vector(768), nullable=True),
        sa.Column("typical_ratio", sa.Float(), nullable=False, server_default="1.0"),
    )
    op.create_index("ix_ingredient_catalog_name", "ingredient_catalog", ["name"], unique=True)
    op.create_index("ix_ingredient_catalog_aisle", "ingredient_catalog", ["aisle_category"])

    op.create_table(
        "meal_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=160), nullable=False),
        sa.Column("week_start_date", sa.Date(), nullable=False),
        sa.Column("target_daily_calories", sa.Integer(), nullable=False),
        sa.Column("dietary_focus", sa.JSON(), nullable=False),
        sa.Column("days", sa.JSON(), nullable=False),
        sa.Column("grocery_aisles", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("meal_plans")
    op.drop_table("ingredient_catalog")
    op.drop_table("recipes")
    op.drop_table("taste_profiles")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector")
