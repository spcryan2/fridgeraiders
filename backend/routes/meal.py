from flask import Flask, Blueprint, jsonify
from services.gemini_client import generate_recipes
import json

meal = Blueprint('meal', __name__)

with open("../prompts/meal_prompt.txt", encoding="utf-8") as f:
    MEAL_PROMPT_TEMPLATE = f.read()


@meal.route("/api/meal", methods=["GET","POST"])
def meal():
    with open("../frontend/src/mock/mockScan.json") as f:
        try:
            meal = json.load(f)
        except:
            print("ERROR: Malformed JSON or JSON not found")

    mode = "composer"
    max_mins = 30
    servings = 2
    diet = "vegetarian"
    equipment = ["hob", "microwave"]

    meal.update({"mode": mode})
    meal.update({"max_minutes": max_mins})
    meal.update({"servings": servings})
    meal.update({"diet": diet})
    meal.update({"equipment": equipment})

    ingredients = ingredients_to_string(meal)
    constraints = constraints_to_string(meal)

    prompt = MEAL_PROMPT_TEMPLATE.replace("{{INGREDIENTS}}", ingredients)
    prompt = prompt.replace("{{CONSTRAINTS}}", constraints)

    output = generate_recipes(prompt)

    if not output:
        return jsonify(error="no recipe could be made from your selection."), 505
    # need to do sanity checks (step minutes add up to time_minutes, servings matches the request).
    else:
        return jsonify(output=output), 200

def ingredients_to_string(meal):
    ingredients = meal.get("ingredients")
    ingredients_list = []
    for i in range(len(ingredients)):
        ingredient = ("name: " + ingredients[i].get("name") +
                      ", quantity: " + ingredients[i].get("quantity") +
                      ", category: " + ingredients[i].get("category") +
                      ", confidence: " + ingredients[i].get("confidence"))
        ingredients_list.append(ingredient)

    formatted_ingredients = "\n".join(ingredients_list)

    return formatted_ingredients

def constraints_to_string(meal):
    constraints = ["mode", "max_minutes", "servings", "diet", "equipment"]
    constraint_templates = {
        "mode" : "the mode is {}, where classic means the recipe shouldn't be too adventurous and should be a known meal, and composer means explore new options and make a recipe with ingredients you wouldn't think would work well together.",
        "max_minutes" : "the total time (including prep and cooking) must be no more than {} minutes",
        "servings" : "the recipe should serve {} people. You should scale ingredient quantities to match",
        "diet" : "every recipe must be {}. Do not include any recipes that would break this diet under any circumstance",
        "equipment" : "the user only has access to the following appliances: {}, so recipes must not need anything else"
    }
    constraints_list = []

    for i in range(len(constraints)):
        constraint = constraint_templates.get(constraints[i]).format(meal.get(constraints[i]))
        constraints_list.append(constraint)

    formatted_constraints = "\n".join(constraints_list)
    return formatted_constraints
