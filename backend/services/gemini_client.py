from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODEL, MOCK_GEMINI
from prompts import load_prompt
from schemas.ingredient_schema import IngredientList
from schemas.recipe_schema import RecipeList, SwapSuggestion
import time

from google.genai import errors

SCAN_PROMPT= load_prompt("scan_prompt")
SWAP_PROMPT = load_prompt("swap_prompt")
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
        return {"recipes": [{
  "title": "Chorizo and apple fried rice with pesto yogurt",
  "summary": "A quick fried rice that uses up the leftover rice and spinach, with a cool pesto yogurt on top.",
  "servings": 2,
  "time_minutes": 20,
  "difficulty": "easy",
  "ingredients_used": [
    { "name": "cooked rice", "amount": "1 tub" },
    { "name": "chorizo", "amount": "half a ring" },
    { "name": "apple", "amount": "1" },
    { "name": "spinach", "amount": "2 handfuls" },
    { "name": "eggs", "amount": "2" },
    { "name": "red onion", "amount": "1" },
    { "name": "green pesto", "amount": "1 tbsp" },
    { "name": "natural yogurt", "amount": "3 tbsp" }
  ],
  "extra_needed": [{ "name": "soy sauce", "amount": "1 tbsp" }],
  "steps": [
    {
      "number": 1,
      "instruction": "Slice the chorizo and red onion, and cut the apple into small cubes.",
      "minutes": 4
    },
    {
      "number": 2,
      "instruction": "Fry the chorizo in a dry pan until it releases its red oil, then add the onion.",
      "minutes": 4
    },
    {
      "number": 3,
      "instruction": "Add the apple and rice. Fry on high, stirring, until the rice starts to crisp. Splash in the soy sauce.",
      "minutes": 6
    },
    {
      "number": 4,
      "instruction": "Push the rice aside, scramble the eggs in the gap, then stir everything together with the spinach until it wilts.",
      "minutes": 4
    },
    {
      "number": 5,
      "instruction": "Stir the pesto into the yogurt and spoon it over the top to serve.",
      "minutes": 2
    }
  ],
  "pairing": {
    "items": ["chorizo", "apple", "pesto yogurt"],
    "reason": "The apple's sharp sweetness cuts through the smoky, fatty chorizo the way a high note cuts through a bass line. The cool pesto yogurt then brings the dish back down, like a rest at the end of a bar."
  }
}]}
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

def suggest_swap(missing: str, recipe_title: str, have: list[str]) -> dict:
    if MOCK_GEMINI:
        return {"found": True, "swap": "Worcestershire sauce",
                "tip": "Use half as much, it's stronger and saltier."}

    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file")

    prompt = (SWAP_PROMPT
              .replace("{{RECIPE}}", recipe_title)
              .replace("{{MISSING}}", missing)
              .replace("{{HAVE}}", ", ".join(have) or "nothing listed"))

    response = _generate_with_retry(
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SwapSuggestion,
            temperature=0.3,
        ),
    )
    if response.parsed is None:
        raise RuntimeError("AI Output failed")
    return response.parsed.model_dump()