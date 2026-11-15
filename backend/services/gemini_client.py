from pathlib import Path
import json
from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, MOCK_GEMINI
from prompts import load_prompt
from schemas.ingredient_schema import IngredientList
from schemas.recipe_schema import RecipeList
import time

from google.genai import errors

SCAN_PROMPT= load_prompt("scan_prompt")
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(timeout=30_000),   # milliseconds = 30 seconds
) if GEMINI_API_KEY else None

def _generate_with_retry(contents, config, attempts=5):
    models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL]
    for attempt in range(attempts):
        model = models[attempt % len(models)]      
        try:
            return client.models.generate_content(
                model=model, contents=contents, config=config
            )
        except errors.ServerError:                 
            if attempt == attempts - 1:
                raise                               
            time.sleep(2 ** attempt)               

def analyse_images(images: list[tuple[bytes, str]]) -> list[dict]:
    if MOCK_GEMINI:
        return [
            {"name": "egg", "count": 6},
            {"name": "milk", "count": 2},
            {"name": "cheddar cheese", "count": 1},
            {"name": "spinach", "count": 1},
        ]

    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file.")

    parts = [types.Part.from_bytes(data=data, mime_type=mime) for data, mime in images]

    response = _generate_with_retry(
        contents=[*parts, SCAN_PROMPT],         
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=IngredientList,
            temperature=0.2,                     
        ),
    )

    result = response.parsed
    if result is None:                           
        result = IngredientList.model_validate_json(response.text)

    
    totals: dict[str, int] = {}
    for item in result.ingredients:
        name = item.name.strip().lower()
        if name:
            totals[name] = totals.get(name, 0) + max(1, item.count)
    return [{"name": name, "count": count} for name, count in totals.items()]

def generate_recipes(prompt: str):
    if MOCK_GEMINI:
        # three sample recipes (quick, healthy, adventurous) in the same shape Gemini returns
        with open(Path(__file__).with_name("mock_recipes.json")) as f:
            return json.load(f)
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file")

    response = _generate_with_retry(
        contents=[
            prompt,
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RecipeList,
            temperature=0.5
        ),
    )

    seen, cleaned = set(), []
    if response.parsed == None:
        raise RuntimeError("AI Output failed")
    return {"recipes": [recipe.model_dump() for recipe in response.parsed.recipes]}