import SectionHeading from "./SectionHeading.jsx";

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

// step 3 -> "III", falls back to the plain number past 15
function toNumeral(n) {
  return NUMERALS[n - 1] || String(n);
}

function formatExtra(item) {
  if (typeof item === "string") return item;
  return item.amount ? `${item.name} (${item.amount})` : item.name;
}

function RecipeCard({ recipe }) {
  return (
    <article className="space-y-8 rounded-3xl border border-ink/10 bg-white/55 p-6 shadow-sm shadow-ink/5 motion-safe:animate-rise">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
          Tonight's composition
        </p>
        <h2 className="font-display text-4xl leading-[1.05] font-semibold italic">
          {recipe.title}
        </h2>
        <p className="text-ink-soft">{recipe.summary}</p>
        <p className="flex flex-wrap justify-center gap-x-3 text-xs font-semibold tracking-[0.15em] text-ink uppercase">
          <span>{recipe.time_minutes} min</span>
          <span className="text-accent">·</span>
          <span>Serves {recipe.servings}</span>
          {recipe.difficulty && (
            <>
              <span className="text-accent">·</span>
              <span>{recipe.difficulty}</span>
            </>
          )}
        </p>
      </header>

      {recipe.pairing && (
        <section className="border-l-2 border-accent py-1 pl-4">
          <h3 className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            ♪ Programme note
          </h3>
          <p className="mt-2 font-display text-xl font-semibold italic">
            {recipe.pairing.items.map((item, i) => (
              <span key={item}>
                {i > 0 && <span className="font-sans font-normal text-accent not-italic"> + </span>}
                {item}
              </span>
            ))}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {recipe.pairing.reason}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <SectionHeading numeral="I">The ensemble</SectionHeading>
        <ul className="space-y-1.5">
          {recipe.ingredients_used.map((item, i) => (
            <li key={i} className="flex items-baseline">
              <span>{item.name}</span>
              {/* dotted leader, like a programme's running order */}
              <span className="mx-2 flex-1 border-b border-dotted border-ink/30" />
              <span className="text-ink-soft">{item.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      {recipe.extra_needed.length > 0 && (
        <section className="space-y-3">
          <SectionHeading numeral="II">Guest players</SectionHeading>
          <ul className="space-y-1.5 text-ink-soft">
            {recipe.extra_needed.map((item, i) => (
              <li key={i}>+ {formatExtra(item)}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <SectionHeading
          numeral={recipe.extra_needed.length > 0 ? "III" : "II"}
        >
          Movements
        </SectionHeading>
        <ol className="space-y-4">
          {recipe.steps.map((step) => (
            <li key={step.number} className="flex gap-4">
              <span className="w-9 shrink-0 pt-0.5 text-right font-display text-lg font-semibold text-accent italic">
                {toNumeral(step.number)}
              </span>
              <div>
                <p className="leading-relaxed">{step.instruction}</p>
                {step.minutes > 0 && (
                  <p className="mt-0.5 text-xs font-semibold tracking-[0.15em] text-ink-soft uppercase">
                    {step.minutes} min
                  </p>
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
