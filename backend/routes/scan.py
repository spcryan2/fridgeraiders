from flask import Blueprint, jsonify, request

from services.gemini_client import analyse_image

scan_bp = Blueprint("scan",__name__)

@scan_bp.post("/api/scan")
def scan():
    file = request.files.get("image")
    if file is None:
        return jsonify(error="no photos uploaded."), 400

    mime_type = file.mimetype or ""
    if not mime_type.startswith("image/"):
        return jsonify(error="that file is not an image."), 400

    try:
        ingredients = analyse_image(file.read(), mime_type)
    except RuntimeError as exc:
        return jsonify(error=str(exc)),500
    except Exception as exc:
        return jsonify(error=f"Gemini request failed: {exc}"), 502

    return jsonify(ingredients=ingredients)

