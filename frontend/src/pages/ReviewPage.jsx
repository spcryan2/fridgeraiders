import { useState } from "react";
import IngredientChips from "../components/IngredientChips.jsx";
import { getMeal } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import ConstraintsForm from "../components/ConstraintsForm.jsx";
import SectionHeading from "../components/SectionHeading.jsx";

const COMPOSE_MESSAGES = [
  "Finding the harmony...",
  "Balancing the flavour...",
  "Writing the score...",
];

// the backend values stay classic/composer, only the labels change
const MODES = [
  { value: "classic", label: "Classical", caption: "A dish you know" },
  { value: "composer", label: "Composer", caption: "Unlikely pairings" },
];

function ReviewPage({ ingredients, onChange, onComposed, onBack }) {
  const [mode, setMode] = useState("composer");
  const [constraints, setConstraints] = useState({
    max_minutes: null,
    servings: 2,
    diet: [],
    equipment: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCompose() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ingredients: ingredients
          .filter((item) => item.name.trim())
          .map((item) => ({
            name: item.name.trim(),
            quantity: item.quantity,
            use_first: Boolean(item.use_first),
          })),
        mode,
        servings: constraints.servings,
      };
      if (constraints.max_minutes)
        payload.max_minutes = constraints.max_minutes;
      if (constraints.diet.length) payload.diet = constraints.diet;
      if (constraints.equipment.length)
        payload.equipment = constraints.equipment;
      const meal = await getMeal(payload);
      onComposed(meal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-9">
      {loading && <LoadingState messages={COMPOSE_MESSAGES} />}

      <header className="flex items-center justify-between pt-6 text-sm text-ink-soft">
        <button onClick={onBack} className="hover:text-ink">
          ← Rescan
        </button>
        <span className="font-display italic">Leftover Composer</span>
      </header>

      <section className="space-y-4 motion-safe:animate-rise">
        <SectionHeading numeral="I" aside={`${ingredients.length} players`}>
          The ensemble
        </SectionHeading>
        <IngredientChips ingredients={ingredients} onChange={onChange} />
      </section>

      <div className="motion-safe:animate-rise" style={{ animationDelay: "100ms" }}>
        <ConstraintsForm value={constraints} onChange={setConstraints} />
      </div>

      <section
        className="space-y-4 motion-safe:animate-rise"
        style={{ animationDelay: "200ms" }}
      >
        <SectionHeading numeral="III">The style</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((option) => (
            <button
              key={option.value}
              onClick={() => setMode(option.value)}
              aria-pressed={mode === option.value}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === option.value
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 bg-white/40 hover:border-ink/40"
              }`}
            >
              <span className="block font-display text-xl font-semibold italic">
                {option.label}
              </span>
              <span
                className={`text-sm ${
                  mode === option.value ? "text-paper/70" : "text-ink-soft"
                }`}
              >
                {option.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      {error && <p className="text-center text-sm text-accent">⚠ {error}</p>}

      <button
        onClick={handleCompose}
        disabled={ingredients.length === 0 || loading}
        className="w-full rounded-full bg-accent py-4 text-lg font-semibold text-paper shadow-lg shadow-accent/25 transition active:scale-[0.98] disabled:opacity-30"
      >
        {loading ? "Composing…" : "♪ Compose a meal"}
      </button>
    </div>
  );
}

export default ReviewPage;
