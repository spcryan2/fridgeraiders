from flask import Blueprint, jsonify, request
from services.gemini_client import generate_recipes
from google.genai import errors
from prompts import load_prompt

meal_bp = Blueprint('meal', __name__)

MEAL_PROMPT_TEMPLATE = load_prompt("meal_prompt")

def ingredients_validation(data):
    if not data:
        return "no data sent"
    if not isinstance(data, dict):
        return "The JSON body is malformed"
    ingredients = data.get("ingredients")
    if not isinstance(ingredients,list) or not ingredients or len(ingredients) > 40:
        return "The ingredients datatype is invalid"
    for item in ingredients:
        subdata = item
        if not isinstance(subdata, dict):
            return "the ingredient datatype is invalid"
        name = subdata.get("name")
        if not isinstance(name, str) or "{{" in name or not name.strip() or len(name) > 40:
            return "the name field is malformed"
        category = subdata.get("category")
        if not isinstance(category, str) or "{{" in category or not category.strip() or len(category) > 40:
            return "the category field is malformed"
        confidence = subdata.get("confidence")
        if not isinstance(confidence, str) or "{{" in confidence or not confidence.strip() or len(confidence) > 40:
            return "the confidence field is malformed"
        if subdata.get("quantity") is not None:
            if not isinstance(subdata.get("quantity"), str):
                return ("the quantity field is of incorrect datatype")
            if len(subdata.get("quantity")) > 40 or "{{" in subdata.get("quantity"):
                return "the quantity datatype is malformed"

    return None

def constraints_validation(data):
    mode = data.get("mode")
    if mode is not None and mode not in ["classic","composer"]:
        return "mode must be classic or composer"

    max_minutes = data.get("max_minutes")
    if max_minutes is not None:
        if isinstance(max_minutes, bool) or not isinstance(max_minutes, int):
            return "max_minutes must be a whole number"
        if max_minutes < 5 or max_minutes > 240:
            return "max_minutes must be between 5 and 240"

    servings = data.get("servings")
    if servings is not None:
        if isinstance(servings, bool) or not isinstance(servings, int):
            return "servings must be a whole number"
        if servings < 1 or servings > 12:
            return "servings must be between 1 and 12"

    diet = data.get("diet")
    allowed_diets = ["vegetarian", "vegan", "pescatarian", "gluten-free", "dairy-free"]
    diets = diet if isinstance(diet, list) else [diet]  # frontend sends a list
    if diet is not None and any(d not in allowed_diets for d in diets):
        return "diet must be one of: " + ", ".join(allowed_diets)

    equipment = data.get("equipment")
    allowed_equipment = ["hob", "oven", "microwave", "air fryer", "grill", "slow cooker"]
    if equipment is not None:
        if not isinstance(equipment, list):
            return "equipment must be a list"
        if len(equipment) > 10:
            return "equipment can have at most 10 items"
        for item in equipment:
            if item not in allowed_equipment:
                return "equipment items must be from: " + ", ".join(allowed_equipment)

    return None

def extra_validation(data):
    for ingredient in data.get("ingredients"):
        use_first = ingredient.get("use_first")
        if use_first is not None and not isinstance(use_first, bool):
            return "use_first must be true or false"
    return None

def recipe_validation(recipe, data):
    """Sanity checks on the recipe Gemini sends back. Returns an error message,
    or None if it's fine. Small problems get fixed in place instead."""
    if not isinstance(recipe, dict):
        return "the recipe came back in the wrong shape"
    title = recipe.get("title")
    if not isinstance(title, str) or not title.strip():
        return "no recipe could be made from your selection."
    steps = recipe.get("steps")
    if not isinstance(steps, list) or not steps:
        return "no recipe could be made from your selection."
    for number, step in enumerate(steps, start=1):
        if not isinstance(step, dict):
            return "a recipe step came back in the wrong shape"
        instruction = step.get("instruction")
        if not isinstance(instruction, str) or not instruction.strip():
            return "a recipe step was empty"
        minutes = step.get("minutes")
        if isinstance(minutes, bool) or not isinstance(minutes, int) or minutes < 0:
            return "a recipe step had an invalid time"
        step["number"] = number  # keep steps numbered 1, 2, 3...
    if not isinstance(recipe.get("ingredients_used"), list) or not isinstance(recipe.get("extra_needed"), list):
        return "the recipe ingredients came back in the wrong shape"

    # the prompt says time_minutes is the sum of the steps, so make it true
    recipe["time_minutes"] = sum(step["minutes"] for step in steps)
    max_minutes = data.get("max_minutes")
    if max_minutes and recipe["time_minutes"] > max_minutes:
        return "couldn't fit a recipe into {} minutes. Try a longer time limit.".format(max_minutes)

    if not recipe.get("difficulty"):
        recipe["difficulty"] = "easy"
    if data.get("mode") == "classic":
        recipe["pairing"] = None  # classic mode has no composer pairing
    return None

@meal_bp.post("/api/meal")
def meal():
    data = request.get_json(silent=True)

    error = ingredients_validation(data)
    if not error:
        error = constraints_validation(data)
    if not error:
        error = extra_validation(data)
    if error:
        return jsonify(error=error), 400

    ingredients = ingredients_to_string(data)
    constraints = constraints_to_string(data)

    prompt = MEAL_PROMPT_TEMPLATE.replace("{{CONSTRAINTS}}", constraints)
    prompt = prompt.replace("{{INGREDIENTS}}", ingredients)

    try:
        output = generate_recipes(prompt)
    except errors.ClientError as e:
        if e.code == 429:
            return jsonify(error="The recipe service is busy right now. Please try again in a moment."), 503
        return jsonify(error="The recipe service couldn't process this request."), 502
    except errors.ServerError:
        return jsonify(error="The recipe service is having problems. Please try again shortly."), 503
    except RuntimeError:
        return jsonify(error="The recipe service is not available right now."), 500
    except Exception as e:
        print(e)
        return jsonify(error="Something went wrong generating your recipe."), 500


    if not isinstance(output,dict):
        return jsonify(error="output datatype is incorrect"), 502
    if not isinstance(output.get("recipes"),list):
        return jsonify(error="recipes datatype is incorrect"),502
    if not output.get("recipes"):
        return jsonify(error="no recipe could be made from your selection."), 422

    recipe = output["recipes"][0]
    error = recipe_validation(recipe, data)
    if error:
        return jsonify(error=error), 422

    return jsonify(recipe), 200

def ingredients_to_string(data):
    lines = []
    for ingredient in data.get("ingredients"):
        line = ingredient.get("name").strip()

        details = []

        quantity = ingredient.get("quantity")
        if quantity and quantity.strip():
            details.append("quantity: " + quantity.strip())

        category = ingredient.get("category")
        if category and category.strip():
            details.append("category: " + category.strip())

        confidence = ingredient.get("confidence")
        if confidence and confidence.strip():
            details.append("confidence: " + confidence.strip())

        if ingredient.get("use_first"):
            details.append("use this up first")

        if details:
            line += " (" + ", ".join(details) + ")"

        lines.append(line)

    return "\n".join(lines)


def constraints_to_string(data):
    lines = []

    if data.get("diet"):
        lines.append(
            "every recipe must be {}. Do not include any recipes that would break this diet under any circumstance".format(
                ", ".join(data['diet']) if isinstance(data['diet'], list) else data['diet']))
    if data.get("max_minutes"):
        lines.append("the total time (including prep and cooking) must be no more than {} minutes".format(data['max_minutes']))
    if data.get("servings"):
        lines.append("the recipe should serve {} people. You should scale ingredient quantities to match".format(data['servings']))
    if data.get("equipment"):
        lines.append(
            "the user only has access to the following appliances: {}, so recipes must not need anything else".format(', '.join(data['equipment'])))
    if data.get("mode"):
        lines.append(
            "the mode is {}, where classic means the recipe shouldn't be too adventurous and should be a known meal, and composer means explore new options and make a recipe with ingredients you wouldn't think would work well together.".format(data['mode']))

    if not lines:
        return "There are no special requirements."

    return "\n".join(lines)

