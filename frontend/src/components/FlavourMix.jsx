import { useEffect, useState } from "react";

// every word in the pairing, e.g. ["pesto yogurt"] -> pesto, yogurt
function pairingWords(pairing) {
  if (!pairing) return new Set();
  return new Set(
    pairing.items
      .flatMap((item) => item.toLowerCase().split(/\s+/))
      .filter((word) => word.length > 2),
  );
}

function FlavourMix({ ingredients, pairing }) {
  const [up, setUp] = useState(false);

  // faders start at zero, then slide up once the card is on screen
  useEffect(() => {
    const id = setTimeout(() => setUp(true), 60);
    return () => clearTimeout(id);
  }, []);

  const stars = pairingWords(pairing);
  const channels = ingredients.slice(0, 8).map((item, i) => {
    const words = item.name.toLowerCase().split(/\s+/);
    const solo = words.some((word) => stars.has(word));
    // earlier in the list = bigger part of the dish
    const level = Math.min(95, Math.max(30, 90 - i * 9) + (solo ? 10 : 0));
    return { name: item.name, short: words[words.length - 1], level, solo };
  });

  if (channels.length < 3) return null;

  // phones fit 6 faders, so drop the quietest ones that aren't in the pairing
  const quiet = channels
    .filter((ch) => !ch.solo)
    .sort((a, b) => a.level - b.level)
    .slice(0, Math.max(0, channels.length - 6));
  for (const ch of quiet) ch.phoneHidden = true;

  return (
    <section className="space-y-3 rounded-3xl bg-forest p-5 text-white">
      <h3 className="text-xs font-bold tracking-[0.2em] text-lime-bright uppercase">
        The mix
      </h3>

      <ul
        className="grid grid-cols-[repeat(min(6,var(--channels)),minmax(0,1fr))] gap-1 rounded-2xl bg-[#183223] px-1.5 pt-3 pb-2 sm:grid-cols-[repeat(var(--channels),minmax(0,1fr))]"
        style={{ "--channels": channels.length }}
      >
        {channels.map((ch, i) => {
          const delay = { transitionDelay: `${i * 80}ms` };
          return (
            <li
              key={ch.name}
              className={`flex flex-col items-center gap-2 ${ch.phoneHidden ? "max-sm:hidden" : ""}`}
            >
              {/* the SOLO light, lit for the star pairing */}
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${
                  ch.solo ? "bg-lime-bright shadow-[0_0_8px_var(--color-lime-bright)]" : "bg-[#24402f]"
                }`}
              />
              <div aria-hidden="true" className="relative h-28 w-1.5 rounded-full bg-[#0f2017]">
                <div
                  className={`absolute inset-x-0 bottom-0 rounded-full motion-safe:transition-all motion-safe:duration-700 ${
                    ch.solo ? "bg-lime" : "bg-forest-soft"
                  }`}
                  style={{ ...delay, height: up ? `${ch.level}%` : "0%" }}
                />
                <div
                  className={`absolute -left-2.5 h-3 w-6.5 rounded border-2 border-[#0f2017] motion-safe:transition-all motion-safe:duration-700 ${
                    ch.solo ? "bg-lime-bright" : "bg-sprout"
                  }`}
                  style={{ ...delay, bottom: up ? `calc(${ch.level}% - 8px)` : "-8px" }}
                />
              </div>
              <span
                title={ch.name}
                className={`w-full truncate text-center text-[9px] font-semibold tracking-tight ${
                  ch.solo ? "text-white" : "text-white/70"
                }`}
              >
                {ch.short}
              </span>
              {ch.solo && <span className="sr-only">(star of the pairing)</span>}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-white/60">
        Fader height: how big a part it plays. Lit up: the star pairing.
      </p>
    </section>
  );
}

export default FlavourMix;
