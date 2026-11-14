import RecipeCard from "../components/RecipeCard.jsx";

function RecipePage({ recipe, onBack, onStartOver }) {
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
        onClick={onBack}
        className="w-full rounded-2xl border-2 border-stone-900 py-4 text-lg font-semibold"
      >
        Compose something else
      </button>
    </div>
  );
}

export default RecipePage;
