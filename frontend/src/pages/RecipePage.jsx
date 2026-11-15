import { useState } from "react";
import RecipeCard from "../components/RecipeCard.jsx";
import CookMode from "../components/CookMode.jsx";
import Logo from "../components/Logo.jsx";
import UpvoteButton from "../components/UpvoteButton.jsx";
import { estimateRescue, readTally, recordRescue } from "../utils/waste.js";
import { recordRaid } from "../api/client.js";
import { newBadges } from "../utils/badges.js";
import BadgeUnlocked from "../components/BadgeUnlocked.jsx";

function RecipePage({
  recipe,
  user,
  onUserChange,
  from,
  onRecipeChange,
  onBack,
  onStartOver,
  onOpenBoard,
}) {
  const [cooking, setCooking] = useState(false);
  const [tally, setTally] = useState(readTally);
  const [unlocked, setUnlocked] = useState([]);
  const fromBoard = from === "leaderboard";

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center justify-between pt-6">
        <button
          data-sound="pop"
          onClick={onBack}
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/60 hover:bg-forest/5 hover:text-forest"
        >
          {fromBoard ? "← Most wanted" : "← The loot"}
        </button>
        <button onClick={onStartOver} aria-label="Start over">
          <Logo />
        </button>
      </header>

      <RecipeCard recipe={recipe} />

      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white px-5 py-4 ring-1 ring-forest/10">
        <div>
          <p className="wordmark text-lg">
            {user ? `Good raid, ${user.raider_name}?` : "Good raid?"}
          </p>
          <button
            data-sound="pop"
            onClick={onOpenBoard}
            className="text-sm font-semibold whitespace-nowrap text-leaf hover:underline"
          >
            Most wanted →
          </button>
        </div>
        <UpvoteButton recipe={recipe} onChange={onRecipeChange} />
      </div>

      {recipe.steps.length > 0 && (
        <button
          data-sound="pop"
          onClick={() => {
            const next = recordRescue(recipe);
            if (user) {
              // the streak counts every day you cook; grams only count once per recipe
              const isNew = next.raids.length > tally.raids.length;
              recordRaid(isNew ? estimateRescue(recipe.ingredients_used).grams : 0)
                .then((updated) => {
                  onUserChange(updated);
                  const fresh = newBadges(user, updated);
                  if (fresh.length > 0) setUnlocked(fresh);
                })
                .catch(() => {});
            }
            setTally(next);
            setCooking(true);
          }}
          className="wordmark w-full rounded-full bg-lime py-5 text-2xl text-forest shadow-[0_5px_0_var(--color-leaf)] transition active:translate-y-1 active:shadow-[0_1px_0_var(--color-leaf)]"
        >
          ▶ Start cooking
        </button>
      )}

      {cooking && (
        <CookMode
          steps={recipe.steps}
          title={recipe.title}
          onExit={() => setCooking(false)}
          onFinish={()=>{
            addRescued(recipe.ingredients_used.length);
            setCooking(false);
          }}
        />
      )}

      {unlocked.length > 0 && (
        <BadgeUnlocked badges={unlocked} onClose={() => setUnlocked([])} />
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          data-sound="pop"
          onClick={onBack}
          className="rounded-full bg-white py-3.5 font-semibold ring-1 ring-forest/15 transition hover:ring-forest/40 active:scale-[0.98]"
        >
          {fromBoard ? "Back to board" : "Try another"}
        </button>
        <button
          data-sound="pop"
          onClick={onStartOver}
          className="rounded-full bg-white py-3.5 font-semibold ring-1 ring-forest/15 transition hover:ring-forest/40 active:scale-[0.98]"
        >
          New raid
        </button>
      </div>
    </div>
  );
}

export default RecipePage;
