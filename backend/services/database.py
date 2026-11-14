import json
import sqlite3
from contextlib import closing
from pathlib import Path

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