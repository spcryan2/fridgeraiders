from typing import List, Optional
from pydantic import BaseModel, Field

class IngredientEntry(BaseModel):
    name: str
    amount: str = Field(description="should include units such as '2 tbsp' rather than '2'")

AISLES = ["fruit & veg", "bakery", "meat & fish", "dairy & eggs","cupboard", "spices & sauces", "frozen", "other"]
class ShoppingItem(IngredientEntry):
    estimated_price: float = Field(
        description="rough UK supermarket price in GBP for the smallest pack you can buy, e.g 1.25"
    )
    aisle:str = Field(description="one of: " + ",".join(AISLES))
class Step(BaseModel):
    number: int
    instruction: str
    minutes: int

class Pairing(BaseModel):
    items: List[str]
    reason: str

class Nutrition(BaseModel):
    calories: int
    protein: int

class Recipe(BaseModel):
    title: str
    summary: str
    servings: int
    nutrition: Nutrition
    category: str
    time_minutes: int
    difficulty: str = Field(description="one of: easy, medium, hard")
    ingredients_used: List[IngredientEntry]
    extra_needed: List[ShoppingItem]
    steps: List[Step]
    pairing: Optional[Pairing]

class RecipeList(BaseModel):
    recipes: List[Recipe]

class SwapSuggestion(BaseModel):
    found: bool = Field(description="true if something the user already has works instead")
    swap: str = Field(description="what to use instead, e.g. 'Worcestershire sauce'. Empty if found is false")
    tip: str = Field(description="one short sentence on how to use the swap, or whether it's fine to skip")