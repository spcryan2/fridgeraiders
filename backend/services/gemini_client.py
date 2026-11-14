from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, MOCK_GEMINI
from prompts import load_prompt
from schemas.ingredient_schema import IngredientList
from schemas.recipe_schema import Recipe
import json
import time
from pathlib import Path

from google.genai import errors

SCAN_PROMPT= load_prompt("scan_prompt")
MOCK_MEAL_PATH = Path(__file__).resolve().parents[2] / "frontend" / "src" / "mock" / "mockMeal.json"
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

def analyse_image(image_bytes: bytes, mime_type:str)->list[str]:
    if MOCK_GEMINI:
        return ["egg", "milk", "cheddar cheese", "spinach"]
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file")
    
    response = _generate_with_retry(
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            SCAN_PROMPT,
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=IngredientList,
            temperature=0.2
        ),
    )
    seen, cleaned = set(),[]
    for item in response.parsed.ingredients:
            name = item.strip().lower()
            if name and name not in seen:
                 seen.add(name)
                 cleaned.append(name)
    return cleaned


def generate_meal(prompt: str) -> dict:
    if MOCK_GEMINI:
        return json.loads(MOCK_MEAL_PATH.read_text(encoding="utf-8"))
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file")

    response = _generate_with_retry(
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Recipe,
            temperature=0.7,
        ),
    )
    if response.parsed is None:
        raise ValueError("Gemini sent back a recipe we couldn't read")
    return response.parsed.model_dump()
