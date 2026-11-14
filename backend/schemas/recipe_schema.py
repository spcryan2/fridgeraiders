from typing import List, Optional

from pydantic import BaseModel


class IngredientAmount(BaseModel):
    name: str
    amount: str


class Step(BaseModel):
    number: int
    instruction: str
    minutes: int


class Pairing(BaseModel):
    items: List[str]
    reason: str


# matches the /api/meal response in the API contract
class Recipe(BaseModel):
    title: str
    summary: str
    servings: int
    time_minutes: int
    difficulty: str
    ingredients_used: List[IngredientAmount]
    extra_needed: List[IngredientAmount]
    steps: List[Step]
    pairing: Optional[Pairing]
