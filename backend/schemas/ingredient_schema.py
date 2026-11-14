from typing import List

from pydantic import BaseModel, Field

class Ingredient(BaseModel):
    name: str = Field(description="Lowercase, singular where natural, e.g. 'cheddar cheese'.")
    count: int = Field(description="How many separate items of this ingredient are visible in total.")


class IngredientList(BaseModel):
    ingredients: List[Ingredient]