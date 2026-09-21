from pydantic import BaseModel, Field
from typing import List, Optional


class ProjectCreate(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=60)
    description: Optional[str] = None

    house_style: str

    plot_width: float = Field(..., gt=0)
    plot_length: float = Field(..., gt=0)
    plot_unit: str = "meters"
    plot_shape: str

    bedrooms: int = Field(..., ge=1)
    bathrooms: int = Field(..., ge=1)

    additional_rooms: List[str] = []

    budget: float = Field(..., gt=0)
    construction_priority: str

    special_features: List[str] = []

    ai_prompt: Optional[str] = None