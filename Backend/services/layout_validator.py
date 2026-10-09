"""
Layout validation and room arrangement utilities.

Validates Gemini-generated room layouts, prevents overlaps,
keeps rooms within plot boundaries, and arranges rooms in a
compact multi-row layout when the AI output is invalid.
"""

from typing import Any


# ── Helpers ──────────────────────────────────────────────────


def _to_float(val: Any, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(value, hi))


def _center_layout(rooms: list[dict], plot_width: float, plot_length: float) -> list[dict]:
    """Shift all rooms so the bounding box is centered in the plot."""
    if not rooms:
        return rooms

    min_x = min(r["position"]["x"] for r in rooms)
    min_y = min(r["position"]["y"] for r in rooms)
    max_x = max(r["position"]["x"] + r["width"] for r in rooms)
    max_y = max(r["position"]["y"] + r["length"] for r in rooms)

    house_w = max_x - min_x
    house_l = max_y - min_y

    # Only center if the house fits inside the plot
    if house_w <= plot_width + 0.1 and house_l <= plot_length + 0.1:
        desired_x = (plot_width - house_w) / 2
        desired_y = (plot_length - house_l) / 2

        offset_x = desired_x - min_x
        offset_y = desired_y - min_y

        if abs(offset_x) > 0.5 or abs(offset_y) > 0.5:
            for r in rooms:
                r["position"]["x"] = round(r["position"]["x"] + offset_x, 2)
                r["position"]["y"] = round(r["position"]["y"] + offset_y, 2)

    return rooms


# ── Rectangle overlap ───────────────────────────────────────


def _rects_overlap(
    x1: float, y1: float, w1: float, h1: float,
    x2: float, y2: float, w2: float, h2: float,
    tolerance: float = 0.01,
) -> bool:
    """Return True if two axis-aligned rectangles overlap (excluding mere touching)."""
    return (
        x1 + tolerance < x2 + w2
        and x2 + tolerance < x1 + w1
        and y1 + tolerance < y2 + h2
        and y2 + tolerance < y1 + h1
    )


def _any_overlap(rooms: list[dict], index: int) -> bool:
    """Check whether room at *index* overlaps any earlier room."""
    r = rooms[index]
    rx, ry = r["position"]["x"], r["position"]["y"]
    rw, rh = r["width"], r["length"]
    for j in range(index):
        o = rooms[j]
        if _rects_overlap(
            rx, ry, rw, rh,
            o["position"]["x"], o["position"]["y"], o["width"], o["length"],
        ):
            return True
    return False


def _is_inside_plot(room: dict, plot_w: float, plot_l: float) -> bool:
    """Return True if the room rectangle fits within 0..plot_w × 0..plot_l."""
    x = room["position"]["x"]
    y = room["position"]["y"]
    return (
        x >= -0.01
        and y >= -0.01
        and x + room["width"] <= plot_w + 0.01
        and y + room["length"] <= plot_l + 0.01
    )


# ── Sanitise a single room dict ─────────────────────────────


def _sanitise_room(raw: dict, idx: int) -> dict | None:
    """
    Return a clean room dict with guaranteed name / width / length / position,
    or None if the room cannot be salvaged.
    """
    name = raw.get("name") or raw.get("room_name") or f"Room {idx + 1}"
    width = _to_float(raw.get("width"), 0)
    length = _to_float(raw.get("length"), 0)

    # Swap zero/negative dims for sensible minimums
    if width <= 0:
        width = 3.0
    if length <= 0:
        length = 3.0

    pos = raw.get("position") or {}
    x = _to_float(pos.get("x"), 0)
    y = _to_float(pos.get("y"), 0)

    return {
        "name": str(name),
        "width": round(width, 2),
        "length": round(length, 2),
        "position": {"x": round(max(x, 0), 2), "y": round(max(y, 0), 2)},
    }


# ── Multi-row packing (fallback) ────────────────────────────


def _room_category(name: str) -> int:
    """Categorize rooms for logical grouping during packing."""
    lower = name.lower()
    if any(x in lower for x in ["hall", "entry", "foyer", "porch", "living", "lounge"]):
        return 1
    if any(x in lower for x in ["kitchen", "dining", "pantry"]):
        return 2
    if any(x in lower for x in ["bed", "bath", "ensuite", "closet", "wardrobe"]):
        return 3
    return 4


def _pack_rooms(rooms: list[dict], plot_width: float, plot_length: float, gap: float = 0.1) -> list[dict]:
    """
    Pack rooms left-to-right, top-to-bottom within the plot rectangle.
    Uses a simple shelf / strip-packing algorithm.
    """
    # Sort by logical category first (to group zones), then largest-first
    rooms_sorted = sorted(rooms, key=lambda r: (_room_category(r["name"]), -(r["width"] * r["length"])))

    x = 0.0
    y = 0.0
    row_height = 0.0

    for room in rooms_sorted:
        w = room["width"]
        h = room["length"]

        # If the room itself is wider than the plot, try rotating it
        if w > plot_width and h <= plot_width:
            room["width"], room["length"] = h, w
            w, h = h, w

        # Start a new row if this room won't fit
        if x > 0 and x + w > plot_width + 0.01:
            x = 0.0
            y += row_height + gap
            row_height = 0.0

        room["position"] = {"x": round(x, 2), "y": round(y, 2)}
        x += w + gap
        row_height = max(row_height, h)

    return rooms_sorted


# ── Public API ───────────────────────────────────────────────


def validate_and_fix_layout(
    layout: dict,
    plot_width: float,
    plot_length: float,
    plot_unit: str = "meters",
) -> dict:
    """
    Validate a Gemini-generated layout dict.

    • Sanitises every room (dimensions, positions).
    • Detects overlaps and out-of-bounds rooms.
    • Re-arranges rooms via packing when problems are found.
    • Returns the layout dict with an added ``warnings`` list.
    """
    warnings: list[str] = []

    # ── 1. Ensure we have a rooms list ──
    raw_rooms = layout.get("rooms")
    if not isinstance(raw_rooms, list) or len(raw_rooms) == 0:
        warnings.append("No rooms were returned by the AI. Using an empty layout.")
        layout["rooms"] = []
        layout["warnings"] = warnings
        return layout

    # ── 2. Sanitise individual rooms ──
    clean_rooms: list[dict] = []
    for idx, raw in enumerate(raw_rooms):
        if not isinstance(raw, dict):
            warnings.append(f"Skipped invalid room entry at index {idx}.")
            continue
        room = _sanitise_room(raw, idx)
        if room:
            clean_rooms.append(room)

    if not clean_rooms:
        warnings.append("All room entries were invalid. Layout is empty.")
        layout["rooms"] = []
        layout["warnings"] = warnings
        return layout

    # ── 3. Check for overlaps and boundary violations ──
    has_overlap = False
    has_out_of_bounds = False

    for i, room in enumerate(clean_rooms):
        if _any_overlap(clean_rooms, i):
            has_overlap = True
        if not _is_inside_plot(room, plot_width, plot_length):
            has_out_of_bounds = True

    needs_repack = has_overlap or has_out_of_bounds

    if has_overlap:
        warnings.append("Overlapping rooms detected — layout has been re-arranged.")
    if has_out_of_bounds:
        warnings.append("Some rooms extended outside the plot — layout has been adjusted.")

    # ── 4. Re-pack if needed ──
    if needs_repack:
        clean_rooms = _pack_rooms(clean_rooms, plot_width, plot_length)

    # ── 5. Final boundary check — warn if rooms still overflow ──
    total_area_needed = sum(r["width"] * r["length"] for r in clean_rooms)
    plot_area = plot_width * plot_length

    if total_area_needed > plot_area * 0.95:
        warnings.append(
            f"Total room area ({total_area_needed:.1f} m²) is close to or exceeds "
            f"the plot area ({plot_area:.1f} m²). Consider a larger plot or fewer rooms."
        )

    # Check if any room still exceeds the plot after packing
    any_still_outside = False
    for room in clean_rooms:
        if not _is_inside_plot(room, plot_width, plot_length):
            any_still_outside = True
            break

    if any_still_outside:
        warnings.append(
            "WARNING: Some rooms could not fit within the plot boundaries. "
            "The layout extends beyond the plot. Consider increasing the plot size "
            "or reducing room dimensions."
        )

    # ── 6. Center the layout in the plot ──
    clean_rooms = _center_layout(clean_rooms, plot_width, plot_length)

    layout["rooms"] = clean_rooms
    layout["warnings"] = warnings
    layout["plot_width"] = plot_width
    layout["plot_length"] = plot_length
    layout["plot_unit"] = plot_unit

    return layout
