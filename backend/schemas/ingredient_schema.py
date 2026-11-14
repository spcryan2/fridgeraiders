from typing import List

from pydantic import BaseModel, Field

class IngredientList(BaseModel):
    ingredients: List[str] = Field(
        description="Distinct food items visible in the image, lowercase, singular where natural"
    )