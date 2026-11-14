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
