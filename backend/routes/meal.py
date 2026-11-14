from flask import Blueprint, jsonify, request

from prompts import load_prompt
from services.gemini_client import generate_meal

meal_bp = Blueprint("meal", __name__)

MEAL_PROMPT_TEMPLATE = load_prompt("meal_prompt")

MODE_TEXT = {
    "classic": "the mode is classic: the recipe shouldn't be too adventurous and should be a known meal. Set pairing to null.",
    "composer": "the mode is composer: explore new options and pair ingredients you wouldn't think would work well together. Explain the pairing in the pairing field.",
}


@meal_bp.post("/api/meal")
def meal():
    data = request.get_json(silent=True) or {}

    ingredients = data.get("ingredients") or []
    if not ingredients:
        return jsonify(error="no ingredients sent."), 400

    mode = data.get("mode", "classic")
    if mode not in MODE_TEXT:
        return jsonify(error="mode must be classic or composer."), 400

    prompt = MEAL_PROMPT_TEMPLATE.replace("{{INGREDIENTS}}", ingredients_to_string(ingredients))
    prompt = prompt.replace("{{CONSTRAINTS}}", constraints_to_string(data, mode))

    try:
        recipe = generate_meal(prompt)
    except RuntimeError as exc:
        return jsonify(error=str(exc)), 500
    except Exception as exc:
        return jsonify(error=f"Gemini request failed: {exc}"), 502

    # the prompt asks for an empty recipe when nothing sensible can be made
    if not recipe.get("title") or not recipe.get("steps"):
        return jsonify(error="Couldn't compose a sensible meal from those ingredients. Try adding a few more."), 422

    if mode == "classic":
        recipe["pairing"] = None

    return jsonify(recipe)


def ingredients_to_string(ingredients):
    lines = []
    for item in ingredients:
        line = f"name: {item.get('name', '')}"
        if item.get("quantity"):
            line += f", quantity: {item['quantity']}"
        if item.get("use_first"):
            line += ", use this up first"
        lines.append(line)
    return "\n".join(lines)


def constraints_to_string(data, mode):
    lines = [MODE_TEXT[mode]]

    if data.get("max_minutes"):
        lines.append(f"the total time (including prep and cooking) must be no more than {data['max_minutes']} minutes")

    servings = data.get("servings") or 2
    lines.append(f"the recipe should serve {servings} people. You should scale ingredient quantities to match")

    # diet and equipment arrive as lists from the frontend
    if data.get("diet"):
        lines.append(f"every recipe must be {', '.join(data['diet'])}. Do not include any recipes that would break this diet under any circumstance")

    if data.get("equipment"):
        lines.append(f"the user only has access to the following appliances: {', '.join(data['equipment'])}, so recipes must not need anything else")

    return "\n".join(lines)
