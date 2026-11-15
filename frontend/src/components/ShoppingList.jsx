import { useState } from "react";
import SectionHeading from "./SectionHeading.jsx";
import { playSound } from "../utils/sound.js";
import { getSwap } from "../api/client.js";
import {
  loadTicks,
  saveTicks,
  addToMyList,
  groupByAisle,
  buildListText,
  shareText,
  openWhatsApp,
  formatPrice,
} from "../utils/shoppingList.js";

function ShoppingList({ items, title, have = [] }) {
  // older saved recipes may store items as plain strings
  const list = items.map((item) => (typeof item === "string" ? { name: item } : item));

  const [checked, setChecked] = useState(() => loadTicks(title)); // #1 names ticked off
  const [swaps, setSwaps] = useState({}); // #3 name -> { found, swap, tip } or { error }
  const [swapping, setSwapping] = useState(null); // name we're asking Gemini about
  const [status, setStatus] = useState(null); // short "✓ Copied!" style message

  function flash(message) {
    setStatus(message);
    setTimeout(() => setStatus(null), 2000);
  }

  function toggle(name) {
    const next = checked.includes(name)
      ? checked.filter((n) => n !== name)
      : [...checked, name];
    setChecked(next);
    saveTicks(title, next); // #1 survives a reload
  }

  async function handleSwap(name) {
    setSwapping(name);
    try {
      const result = await getSwap({
        missing: name,
        recipe: title,
        have: have.map((h) => h.name),
      });
      setSwaps((prev) => ({ ...prev, [name]: result }));
      if (result.found) playSound("ding", 0.5);
    } catch (err) {
      setSwaps((prev) => ({ ...prev, [name]: { error: err.message } }));
    } finally {
      setSwapping(null);
    }
  }

  // still to buy = not ticked and not swapped for something you have
  const needed = list.filter(
    (item) => !checked.includes(item.name) && !swaps[item.name]?.found
  );
  const hasPrices = list.some((item) => typeof item.estimated_price === "number");
  const total = needed.reduce((sum, item) => sum + (item.estimated_price || 0), 0);
  const text = buildListText(`Shopping list for ${title}`, needed);

  async function handleShare() {
    if ((await shareText(text)) === "copied") {
      playSound("ding", 0.5);
      flash("✓ Copied!");
    }
  }

  function handleAdd() {
    addToMyList(needed, title);
    flash("✓ Added to my list");
  }

  return (
    <section className="space-y-4">
      <SectionHeading aside={`${needed.length} to get`}>Grab these too</SectionHeading>

      {/* #2 rough total */}
      {hasPrices && needed.length > 0 && (
        <p className="rounded-2xl bg-sprout px-4 py-3 font-semibold">
          About {formatPrice(total)} to complete this meal
        </p>
      )}

      {/* #4 grouped by aisle */}
      {groupByAisle(list).map((group) => (
        <div key={group.id} className="space-y-2">
          <h4 className="text-xs font-bold tracking-[0.2em] text-forest/50 uppercase">
            {group.label}
          </h4>
          <ul className="space-y-2">
            {group.items.map((item) => {
              const isChecked = checked.includes(item.name);
              const swap = swaps[item.name];
              const crossedOut = isChecked || swap?.found;

              return (
                <li
                  key={item.name}
                  className="rounded-2xl border-2 border-dashed border-forest/20 px-4 py-2.5"
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      data-sound="pop"
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(item.name)}
                      className="h-5 w-5 accent-lime"
                    />
                    <span className={`flex-1 ${crossedOut ? "text-forest/40 line-through" : ""}`}>
                      {item.amount ? `${item.name} (${item.amount})` : item.name}
                    </span>
                    {typeof item.estimated_price === "number" && (
                      <span className="text-sm text-forest/60">
                        {formatPrice(item.estimated_price)}
                      </span>
                    )}
                  </label>

                  {/* #3 swap result or button */}
                  {swap?.found && (
                    <p className="mt-1 pl-8 text-sm text-leaf">
                      🔄 Use {swap.swap} instead. {swap.tip}
                    </p>
                  )}
                  {swap && !swap.found && !swap.error && (
                    <p className="mt-1 pl-8 text-sm text-forest/60">
                      Nothing in your fridge works. {swap.tip}
                    </p>
                  )}
                  {swap?.error && (
                    <p className="mt-1 pl-8 text-sm text-tomato">{swap.error}</p>
                  )}
                  {(!swap || swap.error) && !isChecked && (
                    <button
                      onClick={() => handleSwap(item.name)}
                      disabled={swapping === item.name}
                      className="mt-1 ml-8 text-sm font-semibold text-leaf hover:underline disabled:opacity-50"
                    >
                      {swapping === item.name ? "Checking your fridge…" : "Don't have it? Swap it"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {/* #6 share + WhatsApp */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleShare}
          disabled={needed.length === 0}
          className="rounded-full bg-forest py-3 font-semibold text-cream transition active:scale-[0.98] disabled:opacity-40"
        >
          📤 Share
        </button>
        <button
          onClick={() => openWhatsApp(text)}
          disabled={needed.length === 0}
          className="rounded-full bg-[#25D366] py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          💬 WhatsApp
        </button>
      </div>

      {/* #5 add to the combined list */}
      <button
        onClick={handleAdd}
        disabled={needed.length === 0}
        className="w-full rounded-full bg-white py-3 font-semibold ring-1 ring-forest/15 transition hover:ring-forest/40 disabled:opacity-40"
      >
        {status || (needed.length ? "＋ Add to my list" : "All got! 🎉")}
      </button>
    </section>
  );
}

export default ShoppingList;