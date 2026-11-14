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

  // older backend sent plain strings, so turn any of those into chip objects
  const ingredients = (data.ingredients || []).map((item) =>
    typeof item === "string"
      ? { name: item, quantity: "", category: "other", confidence: "high" }
      : item,
  );
  return { ingredients };
}

export async function getMeal(payload) {
  if (MOCK_MEAL) {
    await sleep(1500);
    const meal = structuredClone(mockMeal);
    if (payload.mode === "classic") meal.pairing = null;
    return meal;
  }
  return request("/api/meal", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
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
