from fastapi import APIRouter, Depends
from pydantic import BaseModel
import base64
from schemas.project import ProjectCreate
from services.gemini_service import generate_design, generate_house_layout
from services.layout_validator import validate_and_fix_layout
from services.auth_service import verify_token

class RenderRequest(BaseModel):
    style: str
    house_type: str
    bedrooms: int
    plot_width: float
    plot_length: float
    plot_unit: str



router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


@router.post("/")
def create_project(project: ProjectCreate, user: dict = Depends(verify_token)):

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
def generate_project_layout(project: ProjectCreate, user: dict = Depends(verify_token)):

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

@router.post("/exterior-render")
def create_exterior_render(req: RenderRequest, user: dict = Depends(verify_token)):
    prompt = f"""
    A photorealistic architectural visualization of a high-end {req.style} style {req.house_type.replace('_', ' ')}.
    It is a {req.bedrooms}-bedroom house designed on a {req.plot_width}x{req.plot_length} {req.plot_unit} plot.
    Beautiful cinematic lighting, sunny day, blue sky, modern landscaping with small garden and pathway.
    Shot from an angled front perspective, showcasing the beautiful exterior facade, roofing, and windows.
    High resolution, 8k, architectural digest style.
    """
    
    try:
        try:
            from services.free_image_service import generate_exterior_image_free
            image_bytes = generate_exterior_image_free(prompt)
        except Exception as free_err:
            print(f"Free image provider failed: {free_err}. Falling back to OpenAI...")
            from services.openai_service import generate_exterior_image_openai
            image_bytes = generate_exterior_image_openai(prompt)
            
        b64 = base64.b64encode(image_bytes).decode('utf-8')
        return {"image": f"data:image/jpeg;base64,{b64}"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/exterior-3d")
def create_exterior_3d(req: RenderRequest, user: dict = Depends(verify_token)):
    """Generate a photorealistic house image, then convert it to a 3D GLB model."""

    # Step 1 — Generate the house image
    prompt = f"""
    A photorealistic architectural visualization of a high-end {req.style} style {req.house_type.replace('_', ' ')}.
    It is a {req.bedrooms}-bedroom house designed on a {req.plot_width}x{req.plot_length} {req.plot_unit} plot.
    Beautiful cinematic lighting, sunny day, blue sky, modern landscaping with small garden and pathway.
    Shot from an angled front perspective, showcasing the beautiful exterior facade, roofing, and windows.
    High resolution, 8k, architectural digest style.
    """

    try:
        try:
            from services.free_image_service import generate_exterior_image_free
            image_bytes = generate_exterior_image_free(prompt)
        except Exception as free_err:
            print(f"Free image provider failed: {free_err}. Falling back to OpenAI...")
            from services.openai_service import generate_exterior_image_openai
            image_bytes = generate_exterior_image_openai(prompt)
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Image generation failed: {e}")

    image_b64 = base64.b64encode(image_bytes).decode('utf-8')

    # Step 2 — Convert image to 3D GLB via TRELLIS
    try:
        from services.image_to_3d_service import generate_3d_from_image
        glb_bytes = generate_3d_from_image(image_bytes)
        glb_b64 = base64.b64encode(glb_bytes).decode('utf-8')
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail=f"Image was generated but 3D conversion failed: {e}",
        )

    return {
        "image": f"data:image/jpeg;base64,{image_b64}",
        "glb": f"data:model/gltf-binary;base64,{glb_b64}",
    }