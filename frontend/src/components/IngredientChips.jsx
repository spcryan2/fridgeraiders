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
      <div className="flex flex-wrap gap-2">
        {ingredients.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 rounded-full border py-1 pr-1 pl-2.5 transition ${
              item.use_first
                ? "border-accent bg-accent/10"
                : item.confidence === "low"
                  ? "border-dashed border-ochre bg-ochre/10"
                  : "border-ink/20 bg-white/50"
            }`}
          >
            <button
              type="button"
              onClick={() => updateItem(i, { use_first: !item.use_first })}
              className={item.use_first ? "text-accent" : "text-ink/35 hover:text-ink"}
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
              <span className="text-xs text-ink-soft">{item.quantity}</span>
            )}
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="grid h-7 w-7 place-items-center rounded-full text-ink/40 hover:bg-ink/10 hover:text-accent"
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
          className="flex-1 rounded-full border border-ink/20 bg-white/50 px-4 py-2.5 outline-none placeholder:text-ink/40 focus:border-ink"
        />
        <button
          type="submit"
          className="rounded-full bg-ink px-5 font-semibold text-paper active:scale-95"
        >
          Add
        </button>
      </form>

      <p className="text-xs text-ink-soft">
        <span className="text-accent">★</span> use it up first ·{" "}
        <span className="text-ochre">dashed</span> = not sure, tap the name to
        fix it
      </p>
    </div>
  );
}

export default IngredientChips;
