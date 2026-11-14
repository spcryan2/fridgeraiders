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

def generate_recipes(prompt: str):
    if MOCK_GEMINI:
        return {
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
}
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
    return response.parsed.recipes.model_dump()