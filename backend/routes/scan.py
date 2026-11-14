from flask import Blueprint, current_app, jsonify, request
from google.genai import errors
from services.gemini_client import analyse_images

scan_bp = Blueprint("scan",__name__)

MAX_PHOTOS = 5

@scan_bp.post("/api/scan")
def scan():
    files = request.files.getlist("photos")       
    if not files:
        return jsonify(error="No image uploaded."), 400
    if len(files) > MAX_PHOTOS:
        return jsonify(error=f"Please upload at most {MAX_PHOTOS} photos."), 400

    images = []
    for f in files:
        mime_type = f.mimetype or ""
        if not mime_type.startswith("image/"):
            return jsonify(error="That file is not an image."), 400
        images.append((f.read(), mime_type))

    try:
        ingredients = analyse_images(images)
    except RuntimeError as exc:
        return jsonify(error=str(exc)), 500
    except errors.ClientError as exc:
        if exc.code == 429:
            return jsonify(error="Daily Gemini limit reached. Please try again later."), 429
        current_app.logger.exception("Scan failed")
        return jsonify(error=f"Gemini request failed: {exc}"), 502
    except Exception as exc:
        current_app.logger.exception("Scan failed")
        return jsonify(error=f"Gemini request failed: {exc}"), 502

    return jsonify(ingredients=ingredients)