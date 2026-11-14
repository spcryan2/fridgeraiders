from flask import Blueprint, jsonify
scan_bp = Blueprint("scan",__name__)

@scan_bp.post("/api/scan")
def scan():
    return jsonify(ingredients=["egg","milk","cheddar cheese"])

