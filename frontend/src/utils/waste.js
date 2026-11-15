// rough grams for a typical amount, UK price per kg, and whether it's counted in units
// (ballpark supermarket figures, good enough for an estimate)
const FOODS = [
  ["rice", 200, 2], ["pasta", 200, 1.5], ["bread", 120, 2], ["potato", 170, 1, true],
  ["egg", 55, 5, true], ["chicken", 200, 7], ["chorizo", 110, 12], ["bacon", 100, 9],
  ["ham", 80, 10], ["sausage", 65, 6, true], ["mince", 250, 6], ["cheese", 60, 9],
  ["yogurt", 60, 3], ["milk", 200, 1], ["cream", 75, 5], ["butter", 20, 8],
  ["apple", 150, 2.5, true], ["banana", 120, 1.2, true], ["lemon", 100, 4, true],
  ["tomato", 100, 3, true], ["onion", 150, 1.2, true], ["pepper", 160, 4, true],
  ["carrot", 70, 1, true], ["courgette", 200, 3, true], ["mushroom", 20, 5, true],
  ["spinach", 60, 6], ["broccoli", 150, 3], ["pesto", 20, 10], ["sauce", 30, 4],
];
const FALLBACK = [null, 100, 4];
const KEY = "fridge-raiders-rescued";

function unitCount(amount) {
  const text = String(amount || "").toLowerCase();
  if (text.startsWith("half")) return 0.5;
  const n = parseFloat(text);
  return n > 0 && n < 20 ? n : 1;
}

export function estimateRescue(ingredients) {
  let grams = 0;
  let pounds = 0;
  for (const item of ingredients) {
    const name = item.name.toLowerCase();
    const [, each, perKg, counted] = FOODS.find(([word]) => name.includes(word)) || FALLBACK;
    // use real weights if the amount gives one, e.g. "200g"
    const weighed = String(item.amount || "").match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
    const g = weighed
      ? parseFloat(weighed[1]) * (weighed[2].toLowerCase() === "kg" ? 1000 : 1)
      : each * (counted ? unitCount(item.amount) : 1);
    grams += g;
    pounds += (g / 1000) * perKg;
  }
  return { grams: Math.round(grams), pounds };
}

export function readTally() {
  const empty = { grams: 0, pounds: 0, raids: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    // ignore anything that isn't our shape (an older version saved a plain number here)
    return saved && Array.isArray(saved.raids) ? saved : empty;
  } catch {
    return empty;
  }
}

// adds a recipe to the running total, once per recipe
export function recordRescue(recipe) {
  const tally = readTally();
  if (tally.raids.includes(recipe.title)) return tally;
  const { grams, pounds } = estimateRescue(recipe.ingredients_used);
  const next = {
    grams: tally.grams + grams,
    pounds: tally.pounds + pounds,
    raids: [...tally.raids, recipe.title],
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private browsing, the total just won't stick
  }
  return next;
}

export function formatWeight(grams) {
  return grams < 1000 ? `${grams}g` : `${(grams / 1000).toFixed(1)}kg`;
}
