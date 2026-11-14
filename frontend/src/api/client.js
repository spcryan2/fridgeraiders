import mockScan from "../mock/mockScan.json";
import mockMeal from "../mock/mockMeal.json";
import { resizeImage } from "../utils/resizeImage.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
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
  if (USE_MOCK) {
    await sleep(1500);
    return structuredClone(mockScan);
  }

  const resized = await Promise.all(files.map((file) => resizeImage(file)));

  const formData = new FormData();
  for (const file of resized) {
    formData.append("photos", file);
  }
  return request("/api/scan", { method: "POST", body: formData });
}

export async function getMeal(payload) {
  if (USE_MOCK) {
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
