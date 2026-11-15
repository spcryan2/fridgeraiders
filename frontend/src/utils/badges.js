// streak badges use your best streak, so they stay unlocked after a streak ends
export const BADGES = [
  { id: "petty-thief", name: "Petty Thief", kind: "streak", goal: 3, short: "3", label: "3 nights" },
  { id: "cat-burglar", name: "Cat Burglar", kind: "streak", goal: 7, short: "7", label: "7 nights" },
  { id: "heist-crew", name: "Heist Crew", kind: "streak", goal: 14, short: "14", label: "14 nights" },
  { id: "fridge-kingpin", name: "Fridge Kingpin", kind: "streak", goal: 30, short: "30", label: "30 nights" },
  { id: "bin-dodger", name: "Bin Dodger", kind: "grams", goal: 1000, short: "1kg", label: "1kg saved" },
  { id: "waste-warden", name: "Waste Warden", kind: "grams", goal: 5000, short: "5kg", label: "5kg saved" },
];

export function hasBadge(user, badge) {
  if (!user) return false;
  const value = badge.kind === "streak" ? user.best_streak : user.grams_rescued;
  return value >= badge.goal;
}

// badges the latest raid just unlocked
export function newBadges(before, after) {
  if (!before || !after) return [];
  return BADGES.filter((badge) => hasBadge(after, badge) && !hasBadge(before, badge));
}
