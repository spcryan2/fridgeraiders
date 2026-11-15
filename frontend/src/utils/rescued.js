// running total of fridge ingredients this browser has cooked instead of binning
// its own key: waste.js already uses "fridge-raiders-rescued" for the grams total
const KEY = "fridge-raiders-rescued-count";

export function getRescued() {
  try {
    return Number(localStorage.getItem(KEY)) || 0;
  } catch {
    return 0;
  }
}

export function addRescued(count) {
  try {
    localStorage.setItem(KEY, getRescued() + count);
  } catch {
    // storage blocked (private mode), so the counter just won't save
  }
}