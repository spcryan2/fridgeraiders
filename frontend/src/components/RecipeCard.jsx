function formatExtra(item) {
  if (typeof item === "string") return item;
  return item.amount ? `${item.name} (${item.amount})` : item.name;
}

function RecipeCard({ recipe }) {
  return (
    <article className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold leading-tight">{recipe.title}</h2>
        <p className="text-stone-600">{recipe.summary}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-stone-100 px-3 py-1">
            ⏱ {recipe.time_minutes} min
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1">
            🍽 Serves {recipe.servings}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 capitalize">
            {recipe.difficulty}
          </span>
        </div>
      </header>

      {recipe.pairing && (
        <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-700">
            ♪ The composition
          </h3>
          <p className="mt-1 font-medium">{recipe.pairing.items.join(" + ")}</p>
          <p className="mt-2 text-sm text-stone-700">{recipe.pairing.reason}</p>
        </section>
      )}

      <section>
        <h3 className="mb-2 font-semibold">From your fridge</h3>
        <ul className="space-y-1">
          {recipe.ingredients_used.map((item, i) => (
            <li
              key={i}
              className="flex justify-between border-b border-stone-100 py-1"
            >
              <span>{item.name}</span>
              <span className="text-stone-500">{item.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {recipe.extra_needed.length > 0 && (
        <section>
          <h3 className="mb-2 font-semibold">You'll also need</h3>
          <ul className="list-disc pl-5 text-stone-700">
            {recipe.extra_needed.map((item, i) => (
              <li key={i}>{formatExtra(item)}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 font-semibold">Method</h3>
        <ol className="space-y-3">
          {recipe.steps.map((step) => (
            <li key={step.number} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold text-white">
                {step.number}
              </span>
              <div>
                <p>{step.instruction}</p>
                {step.minutes && (
                  <p className="text-xs text-stone-500">{step.minutes} min</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

export default RecipeCard;
