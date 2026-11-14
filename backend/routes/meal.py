from flask import Flask, Blueprint
#from scan import xxx
import requests
import json

meal = Blueprint('meal', __name__)

@meal.route("/api/meal", methods=["GET","POST"])
def meal():
    meal = {
  "ingredients": [
    {
      "name": "eggs",
      "quantity": "6",
      "category": "dairy",
      "confidence": "high"
    },
    {
      "name": "green pesto",
      "quantity": "half a jar",
      "category": "sauce",
      "confidence": "low"
    }
    ]
    }
    #if request.get_json(silent=True) == None:
        #print("JSON NOT FOUND PLACEHOLDER")

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

    meals = ingredients_to_string(meal)

    url = "http://localhost:5173"
    payload = meals.jsonify()
    requests.post(url, json=payload)

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
        "mode" : "classic means the recipe shouldn't be too adventurous and should be a known meal, whilst composer means explore new options and make a recipe with ingredients you wouldn't think would work well together. The mode is {}.",
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

#FOR TESTING PURPOSES
meal = {
  "ingredients": [
    {
      "name": "eggs",
      "quantity": "6",
      "category": "dairy",
      "confidence": "high"
    },
    {
      "name": "green pesto",
      "quantity": "half a jar",
      "category": "sauce",
      "confidence": "low"
    }
    ]
    }

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

ingredients_out = ingredients_to_string(meal)
constraint_out = constraints_to_string(meal)

print("INGREDIENTS\n" + ingredients_out)
print("\n")
print("CONSTRAINTS\n" + constraint_out)