import { estimateRescue, formatWeight } from "../utils/waste.js";

function WasteSaved({ recipe, tally }) {
  const { grams, pounds } = estimateRescue(recipe.ingredients_used);
  const raids = tally.raids.length;

  return (
    <section className="rounded-3xl bg-lime-bright p-5 text-forest shadow-[0_4px_0_rgb(31_61_43/0.15)]">
      <h3 className="text-xs font-bold tracking-[0.2em] uppercase">Loot rescued from the bin</h3>
      <p className="wordmark mt-1 text-5xl normal-case">~{formatWeight(grams)}</p>
      <p className="mt-1 font-semibold">worth about £{pounds.toFixed(2)}</p>
      <p className="mt-3 border-t border-forest/15 pt-3 text-sm text-forest/80">
        {raids > 0
          ? `Your haul so far: ${formatWeight(tally.grams)} (£${tally.pounds.toFixed(2)}) across ${raids} ${raids === 1 ? "raid" : "raids"}.`
          : "Hit Start cooking to add it to your haul."}
      </p>
      <p className="mt-1 text-xs text-forest/60">
        Rough estimate from typical weights and UK prices.
      </p>
    </section>
  );
}

export default WasteSaved;
