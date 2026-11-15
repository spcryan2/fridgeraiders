import re

from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from services.database import create_user, find_login, get_user, record_raid

auth_bp = Blueprint("auth", __name__)
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _log_in(user):
    session.clear()
    session.permanent = True
    session["user_id"] = user["id"]


@auth_bp.post("/api/auth/signup")
def signup():
    body = request.get_json(silent=True) or {}
    name = str(body.get("raider_name", "")).strip()
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    if not 2 <= len(name) <= 30:
        return jsonify(error="Raider names need 2 to 30 characters."), 400
    if not EMAIL.match(email):
        return jsonify(error="That email doesn't look right."), 400
    if len(password) < 8:
        return jsonify(error="Passwords need at least 8 characters."), 400
    # pbkdf2 works on every Python; the default (scrypt) is missing from macOS's built-in one
    password_hash = generate_password_hash(password, method="pbkdf2:sha256")
    user = create_user(name, email, password_hash)
    if user is None:
        return jsonify(error="That raider name or email is already taken."), 409
    _log_in(user)
    return jsonify(user=user), 201


@auth_bp.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    user, password_hash = find_login(email)
    # same message either way, so nobody can fish for which emails exist
    if user is None or not check_password_hash(password_hash, password):
        return jsonify(error="Wrong email or password."), 401
    _log_in(user)
    return jsonify(user=user)


@auth_bp.post("/api/auth/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@auth_bp.get("/api/auth/me")
def me():
    user_id = session.get("user_id")
    return jsonify(user=get_user(user_id) if user_id else None)


@auth_bp.post("/api/streak/raid")
def raid():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(error="Log in to keep a streak."), 401
    body = request.get_json(silent=True) or {}
    try:
        grams = max(0, min(int(body.get("grams", 0)), 20000))
    except (TypeError, ValueError):
        grams = 0
    user = record_raid(user_id, grams)
    if user is None:
        session.clear()
        return jsonify(error="Log in to keep a streak."), 401
    return jsonify(user=user)
