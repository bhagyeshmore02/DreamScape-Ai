from fastapi import APIRouter
from schemas.project import ProjectCreate
from services.gemini_service import generate_design

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