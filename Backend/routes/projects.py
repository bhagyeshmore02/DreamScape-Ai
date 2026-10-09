from fastapi import APIRouter
from schemas.project import ProjectCreate
from services.gemini_service import generate_design, generate_house_layout
from services.layout_validator import validate_and_fix_layout



router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


@router.post("/")
def create_project(project: ProjectCreate):

    prompt = f"""
You are an AI house design assistant for DreamScape AI.

Create a practical house design recommendation based on these requirements:

Project Name: {project.project_name}
Description: {project.description}
House Style: {project.house_style}

Plot Width: {project.plot_width} {project.plot_unit}
Plot Length: {project.plot_length} {project.plot_unit}
Plot Shape: {project.plot_shape}

Bedrooms: {project.bedrooms}
Bathrooms: {project.bathrooms}

Additional Rooms:
{", ".join(project.additional_rooms)}

Budget: {project.budget}
Construction Priority: {project.construction_priority}

Special Features:
{", ".join(project.special_features)}

User's AI Prompt:
{project.ai_prompt}

Give a clear house design recommendation including:
1. Overall design concept
2. Room arrangement
3. Recommended layout
4. Important design features
5. Suggestions for the user

Keep the response practical and easy to understand.
"""

    ai_response = generate_design(prompt)

    return {
        "message": "Project generated successfully",
        "project": project,
        "ai_design": ai_response
    }

@router.post("/layout")
def generate_project_layout(project: ProjectCreate):

    prompt = f"""
Create a practical house layout using these requirements.

Project Name: {project.project_name}
House Style: {project.house_style}

Plot Width: {project.plot_width} {project.plot_unit}
Plot Length: {project.plot_length} {project.plot_unit}
Plot Shape: {project.plot_shape}

Bedrooms: {project.bedrooms}
Bathrooms: {project.bathrooms}

Additional Rooms: {", ".join(project.additional_rooms)}
Budget: {project.budget}
Construction Priority: {project.construction_priority}
Special Features: {", ".join(project.special_features)}

User Prompt: {project.ai_prompt}
"""

    layout = generate_house_layout(
        prompt,
        plot_width=project.plot_width,
        plot_length=project.plot_length,
        plot_unit=project.plot_unit,
    )

    # Validate, fix overlaps, enforce boundaries
    layout = validate_and_fix_layout(
        layout,
        plot_width=project.plot_width,
        plot_length=project.plot_length,
        plot_unit=project.plot_unit,
    )

    return {
        "message": "House layout generated successfully",
        "layout": layout
    }