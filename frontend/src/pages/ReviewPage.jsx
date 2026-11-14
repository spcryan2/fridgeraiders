import { useState } from "react";
import IngredientChips from "../components/IngredientChips.jsx";
import { getMeal } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import ConstraintsForm from "../components/ConstraintsForm.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import Logo from "../components/Logo.jsx";

const COMPOSE_MESSAGES = [
  "Planning the job...",
  "Pairing the unlikely...",
  "Composing the getaway meal...",
];

// the backend values stay classic/composer, only the labels change
const MODES = [
  { value: "classic", label: "Play it safe", caption: "A dish you know" },
  { value: "composer", label: "Composer", caption: "Weird pairings that work" },
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
            quantity: item.quantity || "",
            category: item.category || "other",
            confidence: item.confidence || "high",
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
    <div className="space-y-8">
      {loading && <LoadingState messages={COMPOSE_MESSAGES} />}

      <header className="flex items-center justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/60 hover:bg-forest/5 hover:text-forest"
        >
          ← Rescan
        </button>
        <Logo />
      </header>

      <section className="space-y-4 motion-safe:animate-rise">
        <SectionHeading aside={`${ingredients.length} items`}>
          The loot
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
        <SectionHeading>Pick your style</SectionHeading>
        <div className="grid grid-cols-2 gap-3">
          {MODES.map((option) => (
            <button
              key={option.value}
              onClick={() => setMode(option.value)}
              aria-pressed={mode === option.value}
              className={`rounded-3xl p-4 text-left transition active:scale-[0.97] ${
                mode === option.value
                  ? "bg-forest text-white shadow-[0_4px_0_var(--color-lime)]"
                  : "bg-white text-forest ring-1 ring-forest/10 hover:ring-forest/30"
              }`}
            >
              <span className="wordmark block text-xl">{option.label}</span>
              <span
                className={`mt-1 block text-sm ${
                  mode === option.value ? "text-lime-bright" : "text-forest/60"
                }`}
              >
                {option.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-2xl bg-tomato/10 px-4 py-3 text-center text-sm text-tomato">
          Raid foiled: {error}
        </p>
      )}

      <button
        onClick={handleCompose}
        disabled={ingredients.length === 0 || loading}
        className="wordmark w-full rounded-full bg-lime py-5 text-2xl text-forest shadow-[0_5px_0_var(--color-leaf)] transition active:translate-y-1 active:shadow-[0_1px_0_var(--color-leaf)] disabled:opacity-30 disabled:shadow-none"
      >
        {loading ? "Planning…" : "Pull off the raid →"}
      </button>
    </div>
  );
}

export default ReviewPage;
