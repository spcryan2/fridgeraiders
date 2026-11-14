from flask import Blueprint, jsonify, request

from services.database import list_recipes, save_recipe, upvote_recipe

recipes_bp = Blueprint("recipes", __name__)

@recipes_bp.get("/api/recipes")
def get_recipes():
    return jsonify(recipes=list_recipes())

@recipes_bp.post("/api/recipes")
def create_recipe():
    recipe = request.get_json(silent=True)
    if not isinstance(recipe, dict) or not str(recipe.get("title","")).strip():
        return jsonify(error="A recipe with a title is required."), 400
    recipe_id = save_recipe(recipe)
    return jsonify(id=recipe_id), 201      # 201 = "created"

@recipes_bp.post("/api/recipes/<int:recipe_id>/upvote")
def upvote(recipe_id):
    upvotes = upvote_recipe(recipe_id)
    if upvotes is None:
        return jsonify(error="Recipe not found."), 404
    return jsonify(id=recipe_id, upvotes=upvotes)