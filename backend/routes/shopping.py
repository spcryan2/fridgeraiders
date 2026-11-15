from flask import Blueprint, jsonify, request, session

from services.database import (
    add_shopping,
    clear_checked_shopping,
    delete_shopping_item,
    list_shopping,
    set_shopping_checked,
)

shopping_bp = Blueprint("shopping", __name__)

LOGIN_ERROR = "Log in to use a shopping list."


def _not_logged_in():
    return jsonify(error=LOGIN_ERROR), 401


@shopping_bp.get("/api/shopping")
def get_list():
    user_id = session.get("user_id")
    if not user_id:
        return _not_logged_in()
    return jsonify(items=list_shopping(user_id))


@shopping_bp.post("/api/shopping")
def add_items():
    user_id = session.get("user_id")
    if not user_id:
        return _not_logged_in()
    body = request.get_json(silent=True) or {}
    raw = body.get("items")
    if not isinstance(raw, list) or not raw or len(raw) > 50:
        return jsonify(error="Send a list of items to add."), 400

    items = []
    for entry in raw:
        if not isinstance(entry, dict):
            return jsonify(error="Each item needs a name."), 400
        name = str(entry.get("name") or "").strip()
        amount = str(entry.get("amount") or "").strip()
        recipe_title = str(entry.get("recipe_title") or "").strip()[:120] or None
        if not 1 <= len(name) <= 60:
            return jsonify(error="Item names need 1 to 60 characters."), 400
        if len(amount) > 40:
            return jsonify(error="Amounts can be up to 40 characters."), 400
        items.append({"name": name, "amount": amount, "recipe_title": recipe_title})

    result = add_shopping(user_id, items)
    if result is None:
        return jsonify(error="Your list is full (200 items). Clear some ticked ones first."), 400
    return jsonify(items=result), 201


@shopping_bp.patch("/api/shopping/<int:item_id>")
def tick_item(item_id):
    user_id = session.get("user_id")
    if not user_id:
        return _not_logged_in()
    checked = (request.get_json(silent=True) or {}).get("checked")
    if not isinstance(checked, bool):
        return jsonify(error="checked must be true or false."), 400
    if not set_shopping_checked(user_id, item_id, checked):
        return jsonify(error="Item not found."), 404
    return jsonify(items=list_shopping(user_id))


@shopping_bp.delete("/api/shopping/<int:item_id>")
def remove_item(item_id):
    user_id = session.get("user_id")
    if not user_id:
        return _not_logged_in()
    if not delete_shopping_item(user_id, item_id):
        return jsonify(error="Item not found."), 404
    return jsonify(items=list_shopping(user_id))


@shopping_bp.delete("/api/shopping/checked")
def clear_ticked():
    user_id = session.get("user_id")
    if not user_id:
        return _not_logged_in()
    clear_checked_shopping(user_id)
    return jsonify(items=list_shopping(user_id))
