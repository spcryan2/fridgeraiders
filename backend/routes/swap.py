from flask import Blueprint, jsonify, request
from google.genai import errors
from services.gemini_client import suggest_swap

swap_bp = Blueprint("swap", __name__)

@swap_bp.post("/api/swap")
def swap():
    data = request.get_json(silent=True) or {}
    missing = str(data.get("missing", "")).strip()
    recipe = str(data.get("recipe", "")).strip()
    have = data.get("have", [])

    # check the input before spending a Gemini call on it
    if not missing or not recipe:
        return jsonify(error="Tell us what's missing and which recipe it's for."), 400
    if not isinstance(have, list) or not all(isinstance(h, str) for h in have):
        return jsonify(error="'have' must be a list of ingredient names."), 400
    if len(missing) > 100 or len(recipe) > 200:
        return jsonify(error="That request is too long."), 400

    try:
        return jsonify(suggest_swap(missing, recipe, have[:50]))
    except errors.ClientError as e:
        if e.code == 429:
            return jsonify(error="The swap service is busy. Try again in a moment."), 503
        return jsonify(error="Couldn't find a swap for that."), 502
    except (errors.ServerError, RuntimeError):
        return jsonify(error="The swap service isn't available right now."), 503
