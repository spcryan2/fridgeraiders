import { useState } from "react";
import IngredientChips from "../components/IngredientChips.jsx";
import { getMeal } from "../api/client.js";

function ReviewPage({ ingredients, onChange, onComposed, onBack }) {
  const [mode, setMode] = useState("composer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCompose() {
    setLoading(true);
    setError(null);
    try {
      // only send the fields the API contract asks for
      const payload = {
        ingredients: ingredients
          .filter((item) => item.name.trim())
          .map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity,
            use_first: Boolean(item.use_first),
          })),
        mode,
      };
      const meal = await getMeal(payload);
      onComposed(meal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between pt-6">
        <button onClick={onBack} className="text-stone-500">
          ← Rescan
        </button>
        <h1 className="text-xl font-bold">Your ingredients</h1>
        <span className="w-16" />
      </header>

      <IngredientChips ingredients={ingredients} onChange={onChange} />

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-stone-200 p-1">
        {["classic", "composer"].map((option) => (
          <button
            key={option}
            onClick={() => setMode(option)}
            className={`rounded-xl py-2 font-medium capitalize ${
              mode === option ? "bg-white shadow" : "text-stone-500"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {error && <p className="text-center text-red-600">{error}</p>}

      <button
        onClick={handleCompose}
        disabled={ingredients.length === 0 || loading}
        className="w-full rounded-2xl bg-stone-900 py-4 text-lg font-semibold text-white disabled:opacity-40"
      >
        {loading ? "Composing…" : "Compose a meal"}
      </button>
    </div>
  );
}

export default ReviewPage;
