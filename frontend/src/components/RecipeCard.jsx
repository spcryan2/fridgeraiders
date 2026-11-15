import SectionHeading from "./SectionHeading.jsx";
import FlavourMix from "./FlavourMix.jsx";
import ShoppingList from "./ShoppingList.jsx";

function formatExtra(item) {
  if (typeof item === "string") return item;
  return item.amount ? `${item.name} (${item.amount})` : item.name;
}

function RecipeCard({ recipe }) {
  return (
    <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-forest/10 motion-safe:animate-rise">
      <header className="space-y-3 bg-forest px-6 pt-6 pb-7 text-white">
        <p className="text-xs font-semibold tracking-[0.3em] text-lime-bright uppercase">
          Tonight's getaway meal{recipe.category ? ` · ${recipe.category}` : ""}
        </p>
        <h2 className="wordmark text-4xl text-white normal-case">
          {recipe.title}
        </h2>
        <p className="text-white/75">{recipe.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1 text-sm font-semibold">
          <span className="rounded-full bg-forest-soft px-3 py-1">
            ⏱ {recipe.time_minutes} min
          </span>
          <span className="rounded-full bg-forest-soft px-3 py-1">
            🍽 Serves {recipe.servings}
          </span>
          {recipe.difficulty && (
            <span className="rounded-full bg-forest-soft px-3 py-1 capitalize">
              {recipe.difficulty}
            </span>
          )}
          {recipe.nutrition && (
            <>
              <span className="rounded-full bg-forest-soft px-3 py-1">
                {recipe.nutrition.calories} kcal
              </span>
              <span className="rounded-full bg-forest-soft px-3 py-1">
                {recipe.nutrition.protein}g protein
              </span>
              <span className="self-center text-xs font-normal text-white/60">per serving</span>
            </>
          )}
        </div>
      </header>

      <div className="space-y-8 p-6">
        {recipe.pairing && (
          <section className="-mt-12 rounded-3xl bg-lime-bright p-5 text-forest shadow-[0_4px_0_rgb(31_61_43/0.15)]">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase">
              ★ Why this works
            </h3>
            <p className="wordmark mt-2 text-xl normal-case">
              {recipe.pairing.items.map((item, i) => (
                <span key={item}>
                  {i > 0 && <span className="text-leaf"> + </span>}
                  {item}
                </span>
              ))}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-forest/80">
              {recipe.pairing.reason}
            </p>
          </section>
        )}

        <FlavourMix
          key={recipe.title}
          ingredients={recipe.ingredients_used}
          pairing={recipe.pairing}
        />

        <section className="space-y-3">
          <SectionHeading>From your fridge</SectionHeading>
          <ul className="divide-y divide-forest/8">
            {recipe.ingredients_used.map((item, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span>{item.name}</span>
                <span className="rounded-full bg-sprout px-2.5 py-0.5 text-sm text-forest/80">
                  {item.amount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {recipe.extra_needed.length > 0 && (
          <section className="space-y-3">
            <SectionHeading>Grab these too</SectionHeading>
            <ul className="flex flex-wrap gap-2">
              {recipe.extra_needed.map((item, i) => (
                <li
                  key={i}
                  className="rounded-full border-2 border-dashed border-forest/20 px-3 py-1 text-sm"
                >
                  + {formatExtra(item)}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-4">
          <SectionHeading aside={`${recipe.steps.length} steps`}>
            The plan
          </SectionHeading>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="wordmark grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-lg text-forest">
                  {step.number}
                </span>
                <div className="pt-1">
                  <p className="leading-relaxed">{step.instruction}</p>
                  {step.minutes > 0 && (
                    <p className="mt-1 text-xs font-semibold text-forest/50">
                      ⏱ {step.minutes} min
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}

export default RecipeCard;
