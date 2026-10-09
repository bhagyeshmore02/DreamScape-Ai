"""
Test cases for layout_validator.py

Validates overlap detection, boundary enforcement, packing logic,
and edge cases with malformed data.
"""

import sys
import os

# Add parent directory to sys.path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.layout_validator import validate_and_fix_layout


def test_clean_layout():
    """Non-overlapping rooms inside plot — should pass unchanged."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 2,
        "total_bathrooms": 1,
        "rooms": [
            {"name": "Living Room", "width": 6, "length": 5, "position": {"x": 0, "y": 0}},
            {"name": "Kitchen", "width": 4, "length": 5, "position": {"x": 6.3, "y": 0}},
            {"name": "Bedroom 1", "width": 4, "length": 4, "position": {"x": 0, "y": 5.3}},
            {"name": "Bedroom 2", "width": 4, "length": 4, "position": {"x": 4.3, "y": 5.3}},
            {"name": "Bathroom", "width": 2, "length": 3, "position": {"x": 8.5, "y": 5.3}},
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=15, plot_length=12)
    assert len(result["rooms"]) == 5, f"Expected 5 rooms, got {len(result['rooms'])}"
    assert len(result["warnings"]) == 0, f"Expected 0 warnings, got: {result['warnings']}"
    print("✅ test_clean_layout PASSED")


def test_overlapping_rooms():
    """Two rooms at same position — should be repacked."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 1,
        "total_bathrooms": 1,
        "rooms": [
            {"name": "Living Room", "width": 5, "length": 5, "position": {"x": 0, "y": 0}},
            {"name": "Kitchen", "width": 4, "length": 4, "position": {"x": 2, "y": 2}},  # overlaps
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=15, plot_length=12)
    warnings = result["warnings"]
    assert any("overlap" in w.lower() for w in warnings), f"Expected overlap warning, got: {warnings}"
    # After repacking, rooms should not overlap
    rooms = result["rooms"]
    for i, r in enumerate(rooms):
        for j in range(i + 1, len(rooms)):
            o = rooms[j]
            rx1, ry1 = r["position"]["x"], r["position"]["y"]
            rx2 = rx1 + r["width"]
            ry2 = ry1 + r["length"]
            ox1, oy1 = o["position"]["x"], o["position"]["y"]
            ox2 = ox1 + o["width"]
            oy2 = oy1 + o["length"]
            assert not (rx1 < ox2 and ox1 < rx2 and ry1 < oy2 and oy1 < ry2), \
                f"Rooms {r['name']} and {o['name']} still overlap after fix"
    print("✅ test_overlapping_rooms PASSED")


def test_out_of_bounds():
    """Room extends beyond plot — should be repacked or warned."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 1,
        "total_bathrooms": 0,
        "rooms": [
            {"name": "Living Room", "width": 8, "length": 6, "position": {"x": 10, "y": 0}},  # x+w=18 > 15
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=15, plot_length=12)
    warnings = result["warnings"]
    assert len(warnings) > 0, "Expected at least one warning about boundary"
    print("✅ test_out_of_bounds PASSED")


def test_single_row_prevention():
    """Many rooms should NOT all end up in a single row."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 3,
        "total_bathrooms": 2,
        "rooms": [
            {"name": "Living Room", "width": 6, "length": 5, "position": {"x": 0, "y": 0}},
            {"name": "Kitchen", "width": 4, "length": 4, "position": {"x": 6, "y": 0}},
            {"name": "Bedroom 1", "width": 4, "length": 4, "position": {"x": 10, "y": 0}},
            {"name": "Bedroom 2", "width": 4, "length": 4, "position": {"x": 14, "y": 0}},
            {"name": "Bedroom 3", "width": 4, "length": 4, "position": {"x": 18, "y": 0}},
            {"name": "Bathroom 1", "width": 3, "length": 3, "position": {"x": 22, "y": 0}},
            {"name": "Bathroom 2", "width": 3, "length": 3, "position": {"x": 25, "y": 0}},
        ],
    }
    # These all at y=0 and many extend past plot_width=15
    result = validate_and_fix_layout(layout, plot_width=15, plot_length=15)
    rooms = result["rooms"]
    y_values = set(r["position"]["y"] for r in rooms)
    assert len(y_values) > 1, f"Expected multiple rows, but all rooms at y values: {y_values}"
    print("✅ test_single_row_prevention PASSED")


def test_malformed_room_data():
    """Rooms with missing/invalid fields should be sanitised."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 0,
        "total_bathrooms": 0,
        "rooms": [
            {"name": "Room A", "width": "not_a_number", "length": 4, "position": {"x": 0, "y": 0}},
            {"width": 5, "length": 5},  # missing name and position
            "not_a_dict",  # completely invalid
            {"name": "Room C", "width": 4, "length": -2, "position": {"x": 0, "y": 0}},
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=20, plot_length=20)
    # Should have skipped the string entry
    warnings = result["warnings"]
    assert any("invalid" in w.lower() or "skipped" in w.lower() for w in warnings), \
        f"Expected warning about invalid entry, got: {warnings}"
    # Remaining rooms should have valid dimensions
    for r in result["rooms"]:
        assert r["width"] > 0, f"Room {r['name']} has invalid width {r['width']}"
        assert r["length"] > 0, f"Room {r['name']} has invalid length {r['length']}"
    print("✅ test_malformed_room_data PASSED")


def test_empty_rooms():
    """Empty rooms list should produce a warning."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 0,
        "total_bathrooms": 0,
        "rooms": [],
    }
    result = validate_and_fix_layout(layout, plot_width=10, plot_length=10)
    assert len(result["rooms"]) == 0
    assert len(result["warnings"]) > 0
    print("✅ test_empty_rooms PASSED")


def test_rooms_too_large_for_plot():
    """Rooms that physically cannot fit should produce a clear warning."""
    layout = {
        "house_type": "single_story",
        "style": "Modern",
        "total_bedrooms": 1,
        "total_bathrooms": 1,
        "rooms": [
            {"name": "Huge Room", "width": 12, "length": 10, "position": {"x": 0, "y": 0}},
            {"name": "Another Big Room", "width": 8, "length": 8, "position": {"x": 0, "y": 10}},
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=10, plot_length=10)
    warnings = result["warnings"]
    # Should warn that rooms don't fit
    assert len(warnings) > 0, "Expected warnings about rooms not fitting"
    print("✅ test_rooms_too_large_for_plot PASSED")


def test_plot_dimensions_in_output():
    """Output should include plot_width, plot_length, plot_unit."""
    layout = {
        "rooms": [
            {"name": "Room", "width": 4, "length": 4, "position": {"x": 0, "y": 0}},
        ],
    }
    result = validate_and_fix_layout(layout, plot_width=20, plot_length=15, plot_unit="feet")
    assert result["plot_width"] == 20
    assert result["plot_length"] == 15
    assert result["plot_unit"] == "feet"
    print("✅ test_plot_dimensions_in_output PASSED")


def test_small_plot_with_many_rooms():
    """Stress test: many rooms in a small plot."""
    rooms = []
    for i in range(8):
        rooms.append({
            "name": f"Room {i+1}",
            "width": 3,
            "length": 3,
            "position": {"x": 0, "y": 0},  # all at same position
        })
    layout = {"rooms": rooms}
    result = validate_and_fix_layout(layout, plot_width=10, plot_length=12)
    assert len(result["rooms"]) == 8, f"Expected 8 rooms, got {len(result['rooms'])}"
    print("✅ test_small_plot_with_many_rooms PASSED")


if __name__ == "__main__":
    test_clean_layout()
    test_overlapping_rooms()
    test_out_of_bounds()
    test_single_row_prevention()
    test_malformed_room_data()
    test_empty_rooms()
    test_rooms_too_large_for_plot()
    test_plot_dimensions_in_output()
    test_small_plot_with_many_rooms()
    print("\n🎉 All tests passed!")
