import os
import json
import re
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_design(prompt: str):
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return response.text


def _clean_json_text(text: str) -> str:
    """Strip markdown fences and leading/trailing whitespace from Gemini output."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ```
    text = re.sub(r"^```(?:json)?\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def generate_house_layout(prompt: str, plot_width: float = 30, plot_length: float = 40, plot_unit: str = "meters"):

    json_prompt = f"""
You are a house layout planning AI for DreamScape AI.

Based on the user's requirements below, generate a structured house layout.

USER REQUIREMENTS:
{prompt}

IMPORTANT CONSTRAINTS:
- The plot is exactly {plot_width} × {plot_length} {plot_unit}.
- ALL rooms MUST fit within these boundaries (0,0) to ({plot_width},{plot_length}).
- Room position (x, y) is the TOP-LEFT corner of the room rectangle.
- A room at position (x, y) with width w and length l occupies the rectangle from (x, y) to (x+w, y+l).
- No two room rectangles may overlap.
- Arrange rooms in a compact, realistic floor plan — NOT in a single row.
- Use at least 2 rows of rooms where possible.
- **Center the house within the plot area.** Do not cluster all rooms in the top-left corner (0,0).
- Ensure the entrance hall connects logically to the main living area.
- Place the living room and kitchen near the entrance (lower y values).
- Place bedrooms together, preferably toward the back (higher y values).
- Place bathrooms adjacent to bedrooms when possible.
- Leave small gaps (0.2–0.3 {plot_unit}) between rooms for walls.
- Use realistic room dimensions in {plot_unit}.

Return ONLY valid JSON. Do not use Markdown. Do not add ```json. Do not add explanations outside the JSON.

Use exactly this structure:
{{
    "house_type": "single_story",
    "style": "Modern",
    "total_bedrooms": 3,
    "total_bathrooms": 2,
    "rooms": [
        {{
            "name": "Living Room",
            "width": 6,
            "length": 5,
            "position": {{
                "x": 0,
                "y": 0
            }}
        }}
    ]
}}

Rules:
- x and y represent the room's top-left corner position on the floor plan.
- A room with position (x,y) and dimensions width×length occupies (x, y) to (x+width, y+length).
- Ensure x + width <= {plot_width} and y + length <= {plot_length} for EVERY room.
- No two rooms may share the same coordinates.
- Rooms must not overlap each other — check all pairs.
- Dimensions must be in {plot_unit}.
- Use positive x and y coordinates starting from 0.
- Include all rooms the user requested.
- Keep the layout practical and compact.
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=json_prompt
    )

    cleaned = _clean_json_text(response.text)

    try:
        layout = json.loads(cleaned)
    except json.JSONDecodeError:
        # Try to extract JSON object from the response
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            try:
                layout = json.loads(match.group())
            except json.JSONDecodeError:
                layout = {
                    "house_type": "single_story",
                    "style": "Unknown",
                    "total_bedrooms": 0,
                    "total_bathrooms": 0,
                    "rooms": [],
                }
        else:
            layout = {
                "house_type": "single_story",
                "style": "Unknown",
                "total_bedrooms": 0,
                "total_bathrooms": 0,
                "rooms": [],
            }

    # Ensure required top-level keys exist
    layout.setdefault("house_type", "single_story")
    layout.setdefault("style", "Unknown")
    layout.setdefault("total_bedrooms", 0)
    layout.setdefault("total_bathrooms", 0)
    layout.setdefault("rooms", [])

    return layout