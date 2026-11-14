import { useEffect, useState } from "react";
import { listRecipes } from "../api/client.js";
import Logo from "../components/Logo.jsx";
import RaiderFridge from "../components/RaiderFridge.jsx";
import UpvoteButton from "../components/UpvoteButton.jsx";

const MEDALS = ["bg-[#f2c94c]", "bg-[#cfd8cf]", "bg-[#d9a066]"];

function LeaderboardPage({ onBack, onOpen }) {
  const [recipes, setRecipes] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // fetch the board when the page opens, and again when "Try again" is tapped
  useEffect(() => {
    let active = true;
    listRecipes()
      .then((list) => active && setRecipes(list))
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [attempt]);

  function retry() {
    setError(null);
    setRecipes(null);
    setAttempt((n) => n + 1);
  }

  // swap in one updated recipe after a vote, without re-sorting under your finger
  function updateRecipe(updated) {
    setRecipes((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex items-center justify-between pt-6">
        <button
          onClick={onBack}
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-forest/60 hover:bg-forest/5 hover:text-forest"
        >
          ← Home
        </button>
        <Logo />
      </header>

      <div className="motion-safe:animate-rise">
        <p className="text-xs font-semibold tracking-[0.3em] text-leaf uppercase">
          The community board
        </p>
        <h1 className="wordmark mt-1 text-5xl">Most wanted</h1>
        <p className="mt-2 text-forest/70">
          The raids people loved most. Upvote your favourites.
        </p>
      </div>

      {recipes === null && !error && (
        <div className="flex flex-col items-center gap-4 py-12 text-forest/70" role="status">
          <RaiderFridge variant="forest" shifty className="h-24 w-auto" />
          <p>Checking the wanted board…</p>
        </div>
      )}

      {error && (
        <div className="space-y-3 rounded-3xl bg-white p-6 text-center ring-1 ring-forest/10">
          <p className="text-tomato">Couldn't load the board: {error}</p>
          <button
            onClick={retry}
            className="rounded-full bg-forest px-5 py-2 font-semibold text-cream"
          >
            Try again
          </button>
        </div>
      )}

      {recipes?.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-10 text-center ring-1 ring-forest/10">
          <RaiderFridge variant="forest" shifty className="h-24 w-auto" />
          <p className="wordmark text-2xl">Nobody's wanted yet</p>
          <p className="text-forest/70">
            Make a recipe and upvote it to put it on the board.
          </p>
          <button
            onClick={onBack}
            className="wordmark rounded-full bg-lime px-6 py-3 text-xl text-forest shadow-[0_4px_0_var(--color-leaf)]"
          >
            Start a raid →
          </button>
        </div>
      )}

      {recipes?.length > 0 && (
        <ol className="space-y-4">
          {recipes.map((recipe, i) => (
            <li
              key={recipe.id}
              className="space-y-3 rounded-3xl bg-white p-5 ring-1 ring-forest/10 motion-safe:animate-rise"
              style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`wordmark grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg text-forest ${
                    MEDALS[i] || "bg-sprout"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="wordmark text-xl normal-case">{recipe.title}</h2>
                  {recipe.summary && (
                    <p className="mt-1 line-clamp-2 text-sm text-forest/70">
                      {recipe.summary}
                    </p>
                  )}
                </div>
              </div>

              {recipe.pairing?.items?.length > 0 && (
                <p className="rounded-2xl bg-sprout px-3 py-2 text-sm font-semibold">
                  ★ {recipe.pairing.items.join(" + ")}
                </p>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpen(recipe)}
                  className="rounded-full px-1 font-semibold text-leaf hover:underline"
                >
                  Cook this →
                </button>
                <UpvoteButton recipe={recipe} onChange={updateRecipe} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default LeaderboardPage;
