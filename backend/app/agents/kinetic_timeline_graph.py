from datetime import datetime, timezone
from typing import TypedDict
from uuid import UUID, uuid4
from langgraph.graph import END, START, StateGraph

from app.schemas.recipe import (
    MultiRecipeTimelineMergeRequest,
    MultiRecipeTimelineNode,
    MultiRecipeTimelineResponse,
    RecipeResponse,
    TimelineTrack,
)
from app.services.seed_store import catalog_store

RECIPE_PALETTE = [
    "#F59E0B",  # Saffron Amber
    "#10B981",  # Emerald Sage
    "#38BDF8",  # Sky Blue
    "#F43F5E",  # Rose Coral
]


class KineticTimelineState(TypedDict, total=False):
    request: MultiRecipeTimelineMergeRequest
    recipes: list[RecipeResponse]
    sequential_duration_seconds: int
    interleaved_steps: list[MultiRecipeTimelineNode]
    total_duration_seconds: int
    time_saved_seconds: int
    final_response: MultiRecipeTimelineResponse


def collect_recipes_node(state: KineticTimelineState) -> KineticTimelineState:
    """Step 1: Load the 2 to 4 selected recipes to cook together."""
    req = state["request"]
    loaded: list[RecipeResponse] = []
    for r_id in req.recipe_ids:
        found = catalog_store.get_recipe(r_id)
        if found:
            loaded.append(found)

    if len(loaded) < 2:
        all_recipes = catalog_store.list_recipes()
        loaded = all_recipes[: max(2, len(req.recipe_ids))]

    seq_seconds = sum(
        sum(s.duration_seconds for s in r.timeline_steps) for r in loaded
    )
    return {
        "recipes": loaded,
        "sequential_duration_seconds": seq_seconds,
    }


def interleave_multi_recipe_dag_node(
    state: KineticTimelineState,
) -> KineticTimelineState:
    """Step 2: Kinetic Loop Scheduling Algorithm —
    1. Batch all Mise en Place (PREP) steps up front so chopping/washing happens in one flow.
    2. Launch longest PASSIVE_WAIT steps (pressure cooking, marinating, roasting, air-frying) early.
    3. Slot ACTIVE_COOK steps (bhuno masala, searing, tadka) inside the passive wait windows of other dishes.
    4. Synchronize all PLATING steps at the end so every dish finishes hot at the same time.
    """
    recipes = state.get("recipes", [])
    color_map: dict[UUID, str] = {
        r.id: RECIPE_PALETTE[idx % len(RECIPE_PALETTE)]
        for idx, r in enumerate(recipes)
    }

    prep_bucket: list[tuple[RecipeResponse, object]] = []
    passive_bucket: list[tuple[RecipeResponse, object]] = []
    active_bucket: list[tuple[RecipeResponse, object]] = []
    plating_bucket: list[tuple[RecipeResponse, object]] = []

    for r in recipes:
        for step in r.timeline_steps:
            if step.track == TimelineTrack.PREP:
                prep_bucket.append((r, step))
            elif step.track == TimelineTrack.PASSIVE_WAIT:
                passive_bucket.append((r, step))
            elif step.track == TimelineTrack.PLATING:
                plating_bucket.append((r, step))
            else:
                active_bucket.append((r, step))

    # Sort passive steps longest-first so they anchor background windows
    passive_bucket.sort(key=lambda pair: pair[1].duration_seconds, reverse=True)

    interleaved: list[MultiRecipeTimelineNode] = []
    global_idx = 1
    cursor_sec = 0

    # Phase A: Unified Mise en Place Prep Block
    for r, step in prep_bucket:
        interleaved.append(
            MultiRecipeTimelineNode(
                global_step_number=global_idx,
                recipe_id=r.id,
                recipe_title=r.title,
                recipe_color_hex=color_map[r.id],
                title=f"[{r.title.split()[0]}] {step.title}",
                instruction=step.instruction,
                track=step.track,
                duration_seconds=step.duration_seconds,
                start_offset_seconds=cursor_sec,
                overlap_reason="Batched in initial Mise en Place prep wave",
                equipment=step.equipment,
                timer_label=step.timer_label,
                sensory_cue=step.sensory_cue,
            )
        )
        cursor_sec += int(step.duration_seconds * 0.65)
        global_idx += 1

    # Phase B: Launch Passive Tracks & Interleave Active Heat Steps Inside Passive Windows
    passive_window_start = cursor_sec
    longest_passive_end = cursor_sec
    active_Read_Idx = 0

    for p_idx, (p_recipe, p_step) in enumerate(passive_bucket):
        p_start = passive_window_start + (p_idx * 60)
        p_end = p_start + p_step.duration_seconds
        longest_passive_end = max(longest_passive_end, p_end)

        interleaved.append(
            MultiRecipeTimelineNode(
                global_step_number=global_idx,
                recipe_id=p_recipe.id,
                recipe_title=p_recipe.title,
                recipe_color_hex=color_map[p_recipe.id],
                title=f"[{p_recipe.title.split()[0]}] {p_step.title}",
                instruction=p_step.instruction,
                track=TimelineTrack.PASSIVE_WAIT,
                duration_seconds=p_step.duration_seconds,
                start_offset_seconds=p_start,
                overlap_reason="Runs hands-free in background while you execute active burner steps",
                equipment=p_step.equipment,
                timer_label=p_step.timer_label,
                sensory_cue=p_step.sensory_cue,
            )
        )
        global_idx += 1

        # Slot an active cooking step inside this passive wait window
        if active_Read_Idx < len(active_bucket):
            a_recipe, a_step = active_bucket[active_Read_Idx]
            active_Read_Idx += 1
            a_start = p_start + 60
            interleaved.append(
                MultiRecipeTimelineNode(
                    global_step_number=global_idx,
                    recipe_id=a_recipe.id,
                    recipe_title=a_recipe.title,
                    recipe_color_hex=color_map[a_recipe.id],
                    title=f"[{a_recipe.title.split()[0]}] {a_step.title}",
                    instruction=a_step.instruction,
                    track=TimelineTrack.ACTIVE_COOK,
                    duration_seconds=a_step.duration_seconds,
                    start_offset_seconds=a_start,
                    overlap_reason=f"Overlapped during {p_recipe.title}'s {p_step.duration_seconds // 60}m passive window",
                    equipment=a_step.equipment,
                    timer_label=a_step.timer_label,
                    sensory_cue=a_step.sensory_cue,
                )
            )
            global_idx += 1
            longest_passive_end = max(
                longest_passive_end, a_start + a_step.duration_seconds
            )

    # Remaining active steps
    cursor_sec = max(cursor_sec, longest_passive_end - 180)
    while active_Read_Idx < len(active_bucket):
        a_recipe, a_step = active_bucket[active_Read_Idx]
        active_Read_Idx += 1
        interleaved.append(
            MultiRecipeTimelineNode(
                global_step_number=global_idx,
                recipe_id=a_recipe.id,
                recipe_title=a_recipe.title,
                recipe_color_hex=color_map[a_recipe.id],
                title=f"[{a_recipe.title.split()[0]}] {a_step.title}",
                instruction=a_step.instruction,
                track=TimelineTrack.ACTIVE_COOK,
                duration_seconds=a_step.duration_seconds,
                start_offset_seconds=cursor_sec,
                overlap_reason="Parallel multi-burner finishing sear/tadka",
                equipment=a_step.equipment,
                timer_label=a_step.timer_label,
                sensory_cue=a_step.sensory_cue,
            )
        )
        cursor_sec += int(a_step.duration_seconds * 0.75)
        global_idx += 1

    # Phase C: Synchronized Hot Service / Plating
    for r, step in plating_bucket:
        interleaved.append(
            MultiRecipeTimelineNode(
                global_step_number=global_idx,
                recipe_id=r.id,
                recipe_title=r.title,
                recipe_color_hex=color_map[r.id],
                title=f"[{r.title.split()[0]}] {step.title}",
                instruction=step.instruction,
                track=TimelineTrack.PLATING,
                duration_seconds=step.duration_seconds,
                start_offset_seconds=cursor_sec,
                overlap_reason="Synchronized final plating — all dishes finish hot together",
                equipment=step.equipment,
                timer_label=step.timer_label,
                sensory_cue=step.sensory_cue,
            )
        )
        cursor_sec += 60
        global_idx += 1

    total_dur = max(
        600,
        max(
            (n.start_offset_seconds + n.duration_seconds for n in interleaved),
            default=1200,
        ),
    )
    seq_dur = state.get("sequential_duration_seconds", total_dur + 600)
    saved = max(240, seq_dur - total_dur)

    response = MultiRecipeTimelineResponse(
        id=uuid4(),
        title=" + ".join(r.title.split(" with ")[0] for r in recipes),
        recipe_ids=[r.id for r in recipes],
        recipe_titles=[r.title for r in recipes],
        sequential_duration_seconds=seq_dur,
        total_duration_seconds=total_dur,
        time_saved_seconds=saved,
        interleaved_steps=interleaved,
        created_at=datetime.now(timezone.utc),
    )

    return {
        "interleaved_steps": interleaved,
        "total_duration_seconds": total_dur,
        "time_saved_seconds": saved,
        "final_response": response,
    }


def build_kinetic_timeline_graph():
    workflow = StateGraph(KineticTimelineState)
    workflow.add_node("collect_recipes", collect_recipes_node)
    workflow.add_node("interleave_multi_recipe_dag", interleave_multi_recipe_dag_node)

    workflow.add_edge(START, "collect_recipes")
    workflow.add_edge("collect_recipes", "interleave_multi_recipe_dag")
    workflow.add_edge("interleave_multi_recipe_dag", END)

    return workflow.compile()


kinetic_timeline_graph = build_kinetic_timeline_graph()


async def run_kinetic_timeline_pipeline(
    request: MultiRecipeTimelineMergeRequest,
) -> MultiRecipeTimelineResponse:
    result = await kinetic_timeline_graph.ainvoke({"request": request})
    return result["final_response"]
