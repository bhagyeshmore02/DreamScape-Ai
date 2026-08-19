from fastapi import APIRouter
from schemas.project import ProjectCreate

router = APIRouter(
    prefix="/api/projects",
    tags=["Projects"]
)


@router.post("/")
def create_project(project: ProjectCreate):
    return {
        "message": "Project received successfully",
        "project": project
    }