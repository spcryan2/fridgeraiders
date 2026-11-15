// ---- storage (same try/catch pattern as votes.js) ----
const TICKS_KEY = "fridge-raiders-ticks";
const LIST_KEY = "fridge-raiders-my-list";

function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked (private mode): the list still works until reload
  }
}

// #1 ticks per recipe: { "Chorizo fried rice": ["soy sauce"] }
export function loadTicks(title) {
  return read(TICKS_KEY, {})[title] || [];
}

export function saveTicks(title, names) {
  const all = read(TICKS_KEY, {});
  all[title] = names;
  write(TICKS_KEY, all);
}

// ---- #4 aisles, in the order you'd walk round a shop ----
export const AISLES = [
  { id: "fruit & veg", label: "🥕 Fruit & veg" },
  { id: "bakery", label: "🥖 Bakery" },
  { id: "meat & fish", label: "🥩 Meat & fish" },
  { id: "dairy & eggs", label: "🧀 Dairy & eggs" },
  { id: "cupboard", label: "🥫 Cupboard" },
  { id: "spices & sauces", label: "🧂 Spices & sauces" },
  { id: "frozen", label: "🧊 Frozen" },
  { id: "other", label: "🛒 Other" },
];

function aisleOf(item) {
  return AISLES.some((a) => a.id === item.aisle) ? item.aisle : "other";
}

// [{ id, label, items: [...] }], leaving out empty aisles
export function groupByAisle(items) {
  return AISLES.map((aisle) => ({
    ...aisle,
    items: items.filter((item) => aisleOf(item) === aisle.id),
  })).filter((group) => group.items.length > 0);
}

export function formatPrice(n) {
  return `£${n.toFixed(2)}`;
}

// ---- #6 sharing ----
export function buildListText(heading, items) {
  const sections = groupByAisle(items).map(
    (group) =>
      `${group.label}\n` +
      group.items
        .map((i) => `☐ ${i.amount ? `${i.name} (${i.amount})` : i.name}`)
        .join("\n")
  );
  return `🛒 ${heading}\n\n${sections.join("\n\n")}\n\nSent from Fridge Raiders`;
}

// returns "shared", "copied", "cancelled" or "failed"
export async function shareText(text) {
  if (navigator.share) {
    try {
      await navigator.share({ title: "Shopping list", text });
      return "shared";
    } catch (err) {
      if (err.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    alert(text);
    return "failed";
  }
}

export function openWhatsApp(text) {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
}

// ---- #5 one combined list across recipes ----
export function getMyList() {
  return read(LIST_KEY, []);
}

export function addToMyList(items, recipeTitle) {
  const list = getMyList();
  for (const item of items) {
    const name = item.name.trim().toLowerCase();
    const existing = list.find((entry) => entry.name === name);

    if (!existing) {
      list.push({
        name,
        amounts: item.amount ? [item.amount] : [],
        aisle: aisleOf(item),
        price: item.estimated_price || 0,
        recipes: [recipeTitle],
        checked: false,
      });
    } else if (!existing.recipes.includes(recipeTitle)) {
      // same item from a different recipe: merge it into one line
      if (item.amount) existing.amounts.push(item.amount);
      existing.price += item.estimated_price || 0;
      existing.recipes.push(recipeTitle);
      existing.checked = false;
    }
    // same recipe added twice: do nothing, so it isn't counted twice
  }
  write(LIST_KEY, list);
  return list;
}

export function toggleMyListItem(name) {
  const list = getMyList().map((entry) =>
    entry.name === name ? { ...entry, checked: !entry.checked } : entry
  );
  write(LIST_KEY, list);
  return list;
}

export function clearTicked() {
  const list = getMyList().filter((entry) => !entry.checked);
  write(LIST_KEY, list);
  return list;
}