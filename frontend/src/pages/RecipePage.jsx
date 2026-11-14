import { useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import CookMode from "../components/CookMode.jsx";

function RecipePage({ recipe, onBack, onStartOver }) {
  const [cooking, setCooking] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center justify-between pt-6">
        <button onClick={onBack} className="text-stone-500">
          ← Ingredients
        </button>
        <button onClick={onStartOver} className="text-stone-500">
          Start over
        </button>
      </header>

      <RecipeCard recipe={recipe} />

      <button
        onClick={() => setCooking(true)}
        className="w-full rounded-2xl bg-violet-600 py-4 text-lg font-semibold text-white"
      >
        ▶ Start cooking
      </button>

      {cooking && (
        <CookMode steps={recipe.steps} onExit={() => setCooking(false)} />
      )}

      <button
        onClick={onBack}
        className="w-full rounded-2xl border-2 border-stone-900 py-4 text-lg font-semibold"
      >
        Compose something else
      </button>
    </div>
  );
}

export default RecipePage;
