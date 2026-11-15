import { useState } from "react";
import { playSound } from "../utils/sound.js";
import {
  getMyList,
  toggleMyListItem,
  clearTicked,
  groupByAisle,
  buildListText,
  shareText,
  openWhatsApp,
  formatPrice,
} from "../utils/shoppingList.js";

function MyListPage({ onBack }) {
  const [list, setList] = useState(getMyList);
  const [copied, setCopied] = useState(false);

  const needed = list.filter((entry) => !entry.checked);
  const total = needed.reduce((sum, entry) => sum + entry.price, 0);
  const text = buildListText(
    "My shopping list",
    needed.map((entry) => ({ ...entry, amount: entry.amounts.join(" + ") }))
  );

  async function handleShare() {
    if ((await shareText(text)) === "copied") {
      playSound("ding", 0.5);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-6 pt-6 pb-8">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/60 hover:bg-forest/5 hover:text-forest"
        >
          ← Back
        </button>
        <h1 className="wordmark text-2xl">My list</h1>
      </header>

      {list.length === 0 ? (
        <p className="rounded-3xl bg-white p-6 text-center ring-1 ring-forest/10">
          Nothing here yet. Press <b>＋ Add to my list</b> on a recipe.
        </p>
      ) : (
        <>
          {total > 0 && (
            <p className="rounded-2xl bg-sprout px-4 py-3 font-semibold">
              About {formatPrice(total)} for everything left
            </p>
          )}

          {groupByAisle(list).map((group) => (
            <div key={group.id} className="space-y-2">
              <h2 className="text-xs font-bold tracking-[0.2em] text-forest/50 uppercase">
                {group.label}
              </h2>
              <ul className="space-y-2">
                {group.items.map((entry) => (
                  <li key={entry.name}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-forest/10">
                      <input
                        data-sound="pop"
                        type="checkbox"
                        checked={entry.checked}
                        onChange={() => setList(toggleMyListItem(entry.name))}
                        className="h-5 w-5 accent-lime"
                      />
                      <span className="flex-1">
                        <span className={entry.checked ? "text-forest/40 line-through" : ""}>
                          {entry.name}
                          {entry.amounts.length > 0 && ` (${entry.amounts.join(" + ")})`}
                        </span>
                        <span className="block text-xs text-forest/50">
                          for {entry.recipes.join(", ")}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              disabled={needed.length === 0}
              className="rounded-full bg-forest py-3 font-semibold text-cream disabled:opacity-40"
            >
              {copied ? "✓ Copied!" : "📤 Share"}
            </button>
            <button
              onClick={() => openWhatsApp(text)}
              disabled={needed.length === 0}
              className="rounded-full bg-[#25D366] py-3 font-semibold text-white disabled:opacity-40"
            >
              💬 WhatsApp
            </button>
          </div>

          <button
            onClick={() => setList(clearTicked())}
            className="mx-auto block text-sm font-semibold text-forest/60 hover:underline"
          >
            Clear ticked items
          </button>
        </>
      )}
    </div>
  );
}

export default MyListPage;