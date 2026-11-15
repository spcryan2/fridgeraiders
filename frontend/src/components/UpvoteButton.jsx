import { useState } from "react";
import { saveRecipe, upvoteRecipe } from "../api/client.js";
import { hasVoted, rememberVote } from "../utils/votes.js";

// one tap = one vote. A brand new recipe gets saved first so it has an id.
function UpvoteButton({ recipe, onChange, tone = "light" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const count = recipe.upvotes || 0;
  const voted = hasVoted(recipe.id);

  async function handleVote() {
    if (busy || voted) return;
    setBusy(true);
    setError(null);

    // show the vote straight away, then check with the server
    onChange({ ...recipe, upvotes: count + 1 });

    let id = recipe.id;
    try {
      if (id == null) id = await saveRecipe(recipe);
      const upvotes = await upvoteRecipe(id);
      rememberVote(id);
      onChange({ ...recipe, id, upvotes });
    } catch (err) {
      // undo the vote but keep the id, so we never save the same recipe twice
      onChange({ ...recipe, id });
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const idle =
    tone === "dark"
      ? "bg-forest-soft text-cream hover:bg-forest-soft/70"
      : "bg-white text-forest ring-1 ring-forest/15 hover:ring-forest/40";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        data-sound="ding"
        onClick={handleVote}
        disabled={busy || voted}
        aria-pressed={voted}
        aria-label={voted ? `Upvoted, ${count} votes` : `Upvote, ${count} votes`}
        className={`flex items-center gap-2 rounded-full px-4 py-2 font-bold transition active:scale-95 ${
          voted
            ? "bg-lime text-forest shadow-[0_3px_0_var(--color-leaf)]"
            : idle
        } ${busy ? "opacity-70" : ""}`}
      >
        <span aria-hidden="true" className={busy ? "motion-safe:animate-hop" : ""}>
          ▲
        </span>
        <span>{voted ? "Upvoted" : "Upvote"}</span>
        <span className="rounded-full bg-forest/10 px-2 text-sm tabular-nums">
          {count}
        </span>
      </button>
      {error && <p className="text-xs text-tomato">Vote didn't count: {error}</p>}
    </div>
  );
}

export default UpvoteButton;
