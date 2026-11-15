import { useState } from "react";
import SectionHeading from "./SectionHeading.jsx";
import { playSound } from "../utils/sound.js";

// extra_needed items can be plain strings or { name, amount }
function formatItem(item) {
  if (typeof item === "string") return item;
  return item.amount ? `${item.name} (${item.amount})` : item.name;
}

function ShoppingList({ items, title }) {
  const [checked, setChecked] = useState([]); // indexes of ticked-off items
  const [copied, setCopied] = useState(false);

  function toggle(i) {
    setChecked((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  // only send what's still needed
  const remaining = items.filter((_, i) => !checked.includes(i));

  function buildText() {
    const lines = remaining.map((item) => `☐ ${formatItem(item)}`);
    return `🛒 Shopping list for ${title}:\n${lines.join("\n")}\n\nSent from Fridge Raiders`;
  }

  async function handleShare() {
    const text = buildText();

    // phones: open the share sheet (WhatsApp, Messages, etc.)
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shopping list", text });
        return;
      } catch (err) {
        if (err.name === "AbortError") return; // user closed the share sheet
      }
    }

    // laptops, or if sharing failed: copy to the clipboard instead
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      playSound("ding", 0.5);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(text); // last resort so they can copy it by hand
    }
  }

  return (
    <section className="space-y-3">
      <SectionHeading aside={`${remaining.length} to get`}>
        Grab these too
      </SectionHeading>

      <ul className="space-y-2">
        {items.map((item, i) => {
          const isChecked = checked.includes(i);
          return (
            <li key={i}>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-forest/20 px-4 py-2.5">
                {/* sound lives on the checkbox: clicking the label also clicks the
                    checkbox, so putting it on both would pop twice */}
                <input
                  data-sound="pop"
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(i)}
                  className="h-5 w-5 accent-lime"
                />
                <span className={isChecked ? "text-forest/40 line-through" : ""}>
                  {formatItem(item)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        onClick={handleShare}
        disabled={remaining.length === 0}
        className="w-full rounded-full bg-forest py-3 font-semibold text-cream transition active:scale-[0.98] disabled:opacity-40"
      >
        {copied ? "✓ Copied!" : remaining.length === 0 ? "All got! 🎉" : "📤 Send to a flatmate"}
      </button>
    </section>
  );
}

export default ShoppingList;