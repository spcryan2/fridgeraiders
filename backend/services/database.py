import json
import os
import sqlite3
from contextlib import closing
from datetime import date, timedelta
from pathlib import Path

# Vercel's filesystem is read-only except /tmp, and /tmp is wiped on cold starts,
# so on Vercel the database is temporary. Locally it stays next to the backend.
if os.getenv("VERCEL"):
    DB_PATH = Path("/tmp/fridge_raiders.db")
else:
    DB_PATH = Path(__file__).resolve().parent.parent / "fridge_raiders.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with closing(get_connection()) as conn:
        conn.execute(
             """
            CREATE TABLE IF NOT EXISTS recipes (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                title      TEXT NOT NULL,
                data       TEXT NOT NULL,
                upvotes    INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                raider_name    TEXT NOT NULL UNIQUE COLLATE NOCASE,
                email          TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash  TEXT NOT NULL,
                streak         INTEGER NOT NULL DEFAULT 0,
                best_streak    INTEGER NOT NULL DEFAULT 0,
                last_raid_date TEXT,
                grams_rescued  INTEGER NOT NULL DEFAULT 0,
                created_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS shopping_items (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id      INTEGER NOT NULL REFERENCES users(id),
                name         TEXT NOT NULL,
                amount       TEXT NOT NULL DEFAULT '',
                recipe_title TEXT,
                checked      INTEGER NOT NULL DEFAULT 0,
                created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()

def _row_to_dict(row):
    recipe = json.loads(row["data"])
    recipe["id"] = row["id"]
    recipe["upvotes"] = row["upvotes"]
    return recipe

def save_recipe(recipe: dict) -> int:
    with closing(get_connection()) as conn:
        cursor = conn.execute(
            "INSERT INTO recipes (title, data) VALUES (?, ?)",
            (recipe["title"], json.dumps(recipe)),
        )
        conn.commit()
        return cursor.lastrowid


def list_recipes() -> list[dict]:
    with closing(get_connection()) as conn:
        rows = conn.execute(
            "SELECT * FROM recipes ORDER BY upvotes DESC, created_at DESC"
        ).fetchall()
        return [_row_to_dict(row) for row in rows]


def upvote_recipe(recipe_id: int):
    """Returns the new upvote count, or None if the recipe doesn't exist."""
    with closing(get_connection()) as conn:
        cursor = conn.execute(
            "UPDATE recipes SET upvotes = upvotes + 1 WHERE id = ?", (recipe_id,)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None
        row = conn.execute(
            "SELECT upvotes FROM recipes WHERE id = ?", (recipe_id,)
        ).fetchone()
        return row["upvotes"]


def _user_to_dict(row):
    today = date.today()
    last = date.fromisoformat(row["last_raid_date"]) if row["last_raid_date"] else None
    # a streak only counts if you raided today or yesterday
    alive = last is not None and today - last <= timedelta(days=1)
    return {
        "id": row["id"],
        "raider_name": row["raider_name"],
        "email": row["email"],
        "streak": row["streak"] if alive else 0,
        "best_streak": row["best_streak"],
        "raided_today": last == today,
        "grams_rescued": row["grams_rescued"],
    }


def create_user(raider_name, email, password_hash):
    """Returns the new user, or None if the name or email is taken."""
    with closing(get_connection()) as conn:
        try:
            cursor = conn.execute(
                "INSERT INTO users (raider_name, email, password_hash) VALUES (?, ?, ?)",
                (raider_name, email, password_hash),
            )
        except sqlite3.IntegrityError:
            return None
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return _user_to_dict(row)


def find_login(email):
    """Returns (user, password_hash), or (None, None) if there's no such email."""
    with closing(get_connection()) as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if row is None:
        return None, None
    return _user_to_dict(row), row["password_hash"]


def get_user(user_id):
    with closing(get_connection()) as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _user_to_dict(row) if row else None


def record_raid(user_id, grams):
    """Bumps the streak once a day and adds the rescued grams."""
    today = date.today()
    with closing(get_connection()) as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            return None
        last = date.fromisoformat(row["last_raid_date"]) if row["last_raid_date"] else None
        if last == today:
            streak = row["streak"]
        elif last == today - timedelta(days=1):
            streak = row["streak"] + 1
        else:
            streak = 1
        conn.execute(
            """UPDATE users SET streak = ?, best_streak = MAX(best_streak, ?),
               last_raid_date = ?, grams_rescued = grams_rescued + ? WHERE id = ?""",
            (streak, streak, today.isoformat(), grams, user_id),
        )
        conn.commit()
    return get_user(user_id)


# ---- shopping lists (every query is scoped to one user) ----

def _item_to_dict(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "amount": row["amount"],
        "recipe_title": row["recipe_title"],
        "checked": bool(row["checked"]),
    }


def list_shopping(user_id):
    """Unticked items first, oldest first."""
    with closing(get_connection()) as conn:
        rows = conn.execute(
            "SELECT * FROM shopping_items WHERE user_id = ? ORDER BY checked, id",
            (user_id,),
        ).fetchall()
    return [_item_to_dict(row) for row in rows]


def add_shopping(user_id, items, limit=200):
    """Adds items, skipping names already on the list and not ticked.
    Returns the full list, or None if it would go over the limit."""
    with closing(get_connection()) as conn:
        existing = {
            row["name"].lower()
            for row in conn.execute(
                "SELECT name FROM shopping_items WHERE user_id = ? AND checked = 0", (user_id,)
            )
        }
        count = conn.execute(
            "SELECT COUNT(*) FROM shopping_items WHERE user_id = ?", (user_id,)
        ).fetchone()[0]
        new = []
        for item in items:
            key = item["name"].lower()
            if key in existing:
                continue
            existing.add(key)
            new.append(item)
        if count + len(new) > limit:
            return None
        conn.executemany(
            "INSERT INTO shopping_items (user_id, name, amount, recipe_title) VALUES (?, ?, ?, ?)",
            [(user_id, item["name"], item["amount"], item["recipe_title"]) for item in new],
        )
        conn.commit()
    return list_shopping(user_id)


def set_shopping_checked(user_id, item_id, checked):
    """Returns False if the item doesn't exist or isn't this user's."""
    with closing(get_connection()) as conn:
        cursor = conn.execute(
            "UPDATE shopping_items SET checked = ? WHERE id = ? AND user_id = ?",
            (int(checked), item_id, user_id),
        )
        conn.commit()
        return cursor.rowcount > 0


def delete_shopping_item(user_id, item_id):
    """Returns False if the item doesn't exist or isn't this user's."""
    with closing(get_connection()) as conn:
        cursor = conn.execute(
            "DELETE FROM shopping_items WHERE id = ? AND user_id = ?", (item_id, user_id)
        )
        conn.commit()
        return cursor.rowcount > 0


def clear_checked_shopping(user_id):
    with closing(get_connection()) as conn:
        conn.execute("DELETE FROM shopping_items WHERE user_id = ? AND checked = 1", (user_id,))
        conn.commit()
