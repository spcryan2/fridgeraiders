import mockScan from "../mock/mockScan.json";
import mockMeal from "../mock/mockMeal.json";
import { resizeImage } from "../utils/resizeImage.js";

const MOCK_SCAN = import.meta.env.VITE_MOCK_SCAN === "true";
const MOCK_MEAL = import.meta.env.VITE_MOCK_MEAL === "true";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(url, options) {
  const res = await fetch(url, options);

  if (!res.ok) {
    let message = `Something went wrong (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      // not JSON, keep fallback message
    }
    throw new Error(message);
  }

  return res.json();
}

export async function scanPhotos(files) {
  if (MOCK_SCAN) {
    await sleep(1500);
    return structuredClone(mockScan);
  }

  const resized = await Promise.all(files.map((file) => resizeImage(file)));

  const formData = new FormData();
  for (const file of resized) {
    formData.append("photos", file);
  }
  const data = await request("/api/scan", { method: "POST", body: formData });

  // the backend sends { name, count } (older versions sent plain strings),
  // so fill in everything a chip needs
  const ingredients = (data.ingredients || []).map((item) => {
    if (typeof item === "string") item = { name: item };
    return {
      name: item.name,
      quantity: item.quantity || (item.count ? String(item.count) : ""),
      category: item.category || "other",
      confidence: item.confidence || "high",
    };
  });
  return { ingredients };
}

// nutrition should be one { calories, protein } object, but tidy up a list or a gap
function tidyNutrition(nutrition) {
  const value = Array.isArray(nutrition) ? nutrition[0] : nutrition;
  return value && typeof value.calories === "number" ? value : null;
}

// the backend sends { recipes: [...] } (quick, healthy, adventurous); older versions sent one recipe
function toRecipeList(data) {
  const list = Array.isArray(data?.recipes) ? data.recipes : [data];
  return list
    .filter((recipe) => recipe && recipe.title)
    .map((recipe) => ({ ...recipe, nutrition: tidyNutrition(recipe.nutrition) }));
}

// always resolves to a list of recipes
export async function getMeal(payload) {
  if (MOCK_MEAL) {
    await sleep(1500);
    const meals = toRecipeList(structuredClone(mockMeal));
    if (payload.mode === "classic") meals.forEach((meal) => (meal.pairing = null));
    return meals;
  }
  const data = await request("/api/meal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const meals = toRecipeList(data);
  if (meals.length === 0) throw new Error("no recipe could be made from your selection.");
  return meals;
}

// ---- saved recipes and upvotes ----

const MOCK_RECIPES = import.meta.env.VITE_MOCK_RECIPES === "true";

// pretend database for mock mode, it lasts until the page reloads
const mockDb = [];

// community recipes can be missing bits, so fill the gaps before the UI sees them
function tidyRecipe(recipe) {
  return {
    ...recipe,
    title: recipe.title || "Mystery raid",
    summary: recipe.summary || "",
    ingredients_used: recipe.ingredients_used || [],
    extra_needed: recipe.extra_needed || [],
    steps: recipe.steps || [],
    pairing: recipe.pairing || null,
    nutrition: tidyNutrition(recipe.nutrition),
    upvotes: recipe.upvotes || 0,
  };
}

export async function listRecipes() {
  if (MOCK_RECIPES) {
    await sleep(500);
    return mockDb
      .toSorted((a, b) => b.upvotes - a.upvotes)
      .map((recipe) => tidyRecipe(structuredClone(recipe)));
  }
  const data = await request("/api/recipes");
  return (data.recipes || []).map(tidyRecipe);
}

export async function saveRecipe(recipe) {
  // the database gives out its own id and count, so don't send ours
  const clean = structuredClone(recipe);
  delete clean.id;
  delete clean.upvotes;

  if (MOCK_RECIPES) {
    await sleep(300);
    const id = mockDb.length + 1;
    mockDb.push({ ...clean, id, upvotes: 0 });
    return id;
  }
  const data = await request("/api/recipes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(clean),
  });
  return data.id;
}

export async function upvoteRecipe(id) {
  if (MOCK_RECIPES) {
    await sleep(300);
    const recipe = mockDb.find((r) => r.id === id);
    if (!recipe) throw new Error("Recipe not found.");
    recipe.upvotes += 1;
    return recipe.upvotes;
  }
  const data = await request(`/api/recipes/${id}/upvote`, { method: "POST" });
  return data.upvotes;
}

function sendJson(url, body) {
  return request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

// null when logged out or the backend isn't running
export async function getMe() {
  try {
    return (await request("/api/auth/me")).user;
  } catch {
    return null;
  }
}

export async function signUp(details) {
  return (await sendJson("/api/auth/signup", details)).user;
}

export async function logIn(details) {
  return (await sendJson("/api/auth/login", details)).user;
}

export async function logOut() {
  await sendJson("/api/auth/logout");
}

export async function recordRaid(grams) {
  return (await sendJson("/api/streak/raid", { grams })).user;
}

export async function getSwap({ missing, recipe, have }) {
  if (MOCK_MEAL) {
    await sleep(800);
    return { found: true, swap: "Worcestershire sauce", tip: "Use half as much, it's stronger." };
  }
  return sendJson("/api/swap", { missing, recipe, have });
}
