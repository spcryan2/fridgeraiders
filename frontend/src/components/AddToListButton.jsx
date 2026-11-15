import { useState } from "react";
import { addToShoppingList } from "../api/client.js";

// "Grab these too" items can be plain strings or { name, amount }
function toItem(entry, recipeTitle) {
  return typeof entry === "string"
    ? { name: entry, amount: "", recipe_title: recipeTitle }
    : { name: entry.name, amount: entry.amount || "", recipe_title: recipeTitle };
}

function AddToListButton({ recipe, user }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const missing = recipe.extra_needed || [];

  if (missing.length === 0) return null;

  if (!user) {
    return (
      <p className="text-center text-sm text-forest/60">
        Log in to save the missing bits to a shopping list.
      </p>
    );
  }

  async function handleAdd() {
    setStatus("busy");
    setError(null);
    try {
      await addToShoppingList(missing.map((entry) => toItem(entry, recipe.title)));
      setStatus("added");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  }

  const count = missing.length;
  return (
    <div className="space-y-2">
      <button
        data-sound="pop"
        onClick={handleAdd}
        disabled={status !== "idle"}
        className="w-full rounded-full bg-white py-3.5 font-semibold ring-1 ring-forest/15 transition hover:ring-forest/40 active:scale-[0.98] disabled:active:scale-100"
      >
        {status === "added"
          ? "✓ Added to your shopping list"
          : status === "busy"
            ? "Adding…"
            : `+ Add ${count} missing ${count === 1 ? "item" : "items"} to your shopping list`}
      </button>
      {error && (
        <p role="alert" className="text-center text-sm text-tomato">
          {error}
        </p>
      )}
    </div>
  );
}

export default AddToListButton;
