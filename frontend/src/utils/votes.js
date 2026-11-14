// remembers which recipes this browser has upvoted, so it's one vote per device.
// localStorage can be blocked (private mode), so every call is wrapped in try/catch.
const KEY = "fridge-raiders-votes";

function readVotes() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function hasVoted(id) {
  return id != null && readVotes().includes(id);
}

export function rememberVote(id) {
  try {
    const votes = readVotes();
    if (!votes.includes(id)) {
      localStorage.setItem(KEY, JSON.stringify([...votes, id]));
    }
  } catch {
    // can't store it, the vote still counts on the server
  }
}
