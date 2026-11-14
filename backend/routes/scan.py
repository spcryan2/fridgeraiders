from flask import Blueprint, jsonify, request

from services.gemini_client import analyse_image

scan_bp = Blueprint("scan",__name__)

@scan_bp.post("/api/scan")
def scan():
    files = request.files.getlist("photos")
    if not files:
        return jsonify(error="no photos uploaded."), 400

    names = []
    for file in files:
        mime_type = file.mimetype or ""
        if not mime_type.startswith("image/"):
            return jsonify(error="that file is not an image."), 400
        try:
            names.extend(analyse_image(file.read(), mime_type))
        except RuntimeError as exc:
            return jsonify(error=str(exc)), 500
        except Exception as exc:
            return jsonify(error=f"Gemini request failed: {exc}"), 502

    # drop duplicates across photos, keep the order, match the API contract
    unique = list(dict.fromkeys(names))
    ingredients = [
        {"name": n, "quantity": "", "category": "other", "confidence": "high"}
        for n in unique
    ]
    return jsonify(ingredients=ingredients)

