from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL
from prompts import load_prompt
from schemas.ingredient_schema import IngredientList

SCAN_PROMPT= load_prompt("scan_prompt")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def analyse_image(image_bytes: bytes, mime_type:str)->list[str]:
    if client is None:
        raise RuntimeError("GEMINI_API_KEY is not set. Add it to your .env file")
    
    response = client.models.generate_content(
        model="gemini-flash-latest",
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
