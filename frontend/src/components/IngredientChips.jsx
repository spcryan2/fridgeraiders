import { useState } from "react";

function IngredientChips({ ingredients, onChange }) {
  const [newName, setNewName] = useState("");

  // swap one ingredient for an updated copy, leave the rest alone
  function updateItem(index, changes) {
    onChange(
      ingredients.map((item, i) =>
        i === index ? { ...item, ...changes } : item,
      ),
    );
  }

  function removeItem(index) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  function handleAdd(e) {
    e.preventDefault(); // stop the form reloading the page
    const name = newName.trim();
    if (!name) return;
    onChange([
      ...ingredients,
      {
        name,
        quantity: "",
        category: "other",
        confidence: "high",
        use_first: false,
      },
    ]);
    setNewName("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ingredients.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 ${
              item.use_first
                ? "border-emerald-500 bg-emerald-50"
                : item.confidence === "low"
                  ? "border-dashed border-amber-400 bg-amber-50"
                  : "border-stone-300 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => updateItem(i, { use_first: !item.use_first })}
              className={item.use_first ? "text-emerald-600" : "text-stone-400"}
              aria-label="Use first"
            >
              {item.use_first ? "★" : "☆"}
            </button>
            <input
              value={item.name}
              onChange={(e) =>
                updateItem(i, { name: e.target.value, confidence: "high" })
              }
              size={Math.max(item.name.length, 3)}
              className="bg-transparent outline-none"
            />
            {item.quantity && (
              <span className="text-xs text-stone-500">{item.quantity}</span>
            )}
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-stone-400 hover:text-red-600"
              aria-label={`Remove ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add something we missed"
          className="flex-1 rounded-full border border-stone-300 px-4 py-2 outline-none focus:border-stone-500"
        />
        <button
          type="submit"
          className="rounded-full bg-stone-200 px-4 font-medium"
        >
          Add
        </button>
      </form>

      <p className="text-xs text-stone-500">
        ☆ tap to use it up first · dashed = not sure, tap the name to fix it
      </p>
    </div>
  );
}

export default IngredientChips;
