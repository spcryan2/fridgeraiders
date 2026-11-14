import { useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import CookMode from "../components/CookMode.jsx";

function RecipePage({ recipe, onBack, onStartOver }) {
  const [cooking, setCooking] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center justify-between pt-6 text-sm text-ink-soft">
        <button onClick={onBack} className="hover:text-ink">
          ← Ingredients
        </button>
        <button onClick={onStartOver} className="hover:text-ink">
          Start over
        </button>
      </header>

      <RecipeCard recipe={recipe} />

      <button
        data-sound="pop"
        onClickCapture={() => setCooking(true)}
        onClick={() => setCooking(true)}
        className="w-full rounded-full bg-accent py-4 text-lg font-semibold text-paper shadow-lg shadow-accent/25 transition active:scale-[0.98]"
      >
        ▶ Start cooking
      </button>

      {cooking && (
        <CookMode steps={recipe.steps} onExit={() => setCooking(false)} />
      )}

      <button
        onClick={onBack}
        className="w-full rounded-full border border-ink/30 py-4 text-lg font-semibold transition hover:border-ink active:scale-[0.98]"
      >
        Compose something else
      </button>
    </div>
  );
}

export default RecipePage;
