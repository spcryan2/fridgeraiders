import { useState } from "react";

function IngredientChips({ ingredients, onChange }) {
  const [newName, setNewName] = useState("");

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
    e.preventDefault();
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
      {ingredients.length === 0 ? (
        <p className="rounded-3xl bg-white p-5 text-center text-forest/60 ring-1 ring-forest/10">
          The fridge is bare. Add something below.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {ingredients.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 rounded-full py-1 pr-1 pl-2.5 font-medium transition ${
                item.use_first
                  ? "bg-lime text-forest shadow-[0_3px_0_var(--color-leaf)]"
                  : item.confidence === "low"
                    ? "border-2 border-dashed border-leaf/60 bg-sprout"
                    : "bg-white ring-1 ring-forest/12"
              }`}
            >
              <button
                type="button"
                onClick={() => updateItem(i, { use_first: !item.use_first })}
                className={item.use_first ? "text-forest" : "text-forest/30 hover:text-leaf"}
                aria-label="Use first"
                aria-pressed={Boolean(item.use_first)}
              >
                {item.use_first ? "★" : "☆"}
              </button>
              <input
                value={item.name}
                onChange={(e) =>
                  updateItem(i, { name: e.target.value, confidence: "high" })
                }
                style={{ width: `${Math.max(item.name.length, 3) + 0.5}ch` }}
                className="bg-transparent outline-none"
              />
              {item.quantity && (
                <span
                  className={`text-xs ${item.use_first ? "text-forest/70" : "text-forest/50"}`}
                >
                  {item.quantity}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="grid h-7 w-7 place-items-center rounded-full text-forest/35 hover:bg-forest/10 hover:text-forest"
                aria-label={`Remove ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add something we missed"
          className="flex-1 rounded-full bg-white px-4 py-3 ring-1 ring-forest/12 outline-none placeholder:text-forest/40 focus:ring-2 focus:ring-forest"
        />
        <button
          type="submit"
          className="rounded-full bg-forest px-5 font-semibold text-white active:scale-95"
        >
          Add
        </button>
      </form>

      <p className="text-xs text-forest/60">
        <span className="text-leaf">★</span> use it up first ·{" "}
        <span className="font-semibold text-leaf">dashed</span> = we're
        not sure, tap the name to fix it
      </p>
    </div>
  );
}

export default IngredientChips;
