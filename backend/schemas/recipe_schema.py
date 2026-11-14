from typing import List
from pydantic import BaseModel, Field

class IngredientEntry(BaseModel):
    name: str
    amount: str = Field(description="should include units such as '2 tbsp' rather than '2'")

class Step(BaseModel):
    number: int
    instruction: str
    minutes: int

class Pairing(BaseModel):
    items: List[str]
    reason: str

class Recipe(BaseModel):
    title: str
    summary: str
    servings: int
    time_minutes: int
    ingredients_used: List[IngredientEntry]
    extra_needed: List[IngredientEntry]
    steps: List[Step]
    pairing: Pairing

class RecipeList(BaseModel):
    recipes: List[Recipe]