import { useEffect, useState } from "react";
import ScanPage from "./pages/ScanPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import RecipePage from "./pages/RecipePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { getMe, logOut } from "./api/client.js";

function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  // which screen the recipe was opened from, so "back" goes to the right place
  const [recipeFrom, setRecipeFrom] = useState("review");

  const dark = ["scan", "auth", "loading"].includes(screen);

  // colour the page behind the app too, so scrolling past the ends doesn't flash cream
  useEffect(() => {
    document.body.style.backgroundColor = dark ? "var(--color-forest)" : "var(--color-cream)";
  }, [dark]);

  // already logged in from last time? go straight to scanning
  useEffect(() => {
    getMe().then((me) => {
      setUser(me);
      setScreen(me ? "scan" : "auth");
    });
  }, []);

  function handleAuthed(me) {
    setUser(me);
    setScreen("scan");
  }

  async function handleLogOut() {
    await logOut().catch(() => {});
    setUser(null);
    setScreen("auth");
  }

  function handleScanned(scanned) {
    setIngredients(scanned);
    setScreen("review");
  }

  function handleComposed(meal) {
    setRecipe(meal);
    setRecipeFrom("review");
    setScreen("recipe");
  }

  function handleBackFromRecipe() {
    setScreen(recipeFrom);
  }

  function handleOpenBoard() {
    setScreen("leaderboard");
  }

  function handleOpenFromBoard(saved) {
    setRecipe(saved);
    setRecipeFrom("leaderboard");
    setScreen("recipe");
  }

  function handleStartOver() {
    setIngredients([]);
    setRecipe(null);
    setScreen("scan");
  }
  return (
    <div
      className={`min-h-screen ${
        dark ? "bg-forest text-cream" : "bg-cream text-forest"
      }`}
    >
      <main className="mx-auto max-w-md px-5 pb-12">
        {screen === "auth" && (
          <AuthPage onAuthed={handleAuthed} onGuest={() => setScreen("scan")} />
        )}
        {screen === "scan" && (
          <ScanPage
            user={user}
            onScanned={handleScanned}
            onOpenBoard={handleOpenBoard}
            onLogIn={() => setScreen("auth")}
            onLogOut={handleLogOut}
          />
        )}
        {screen === "review" && (
          <ReviewPage
            ingredients={ingredients}
            onChange={setIngredients}
            onComposed={handleComposed}
            onBack={handleStartOver}
          />
        )}
        {screen === "recipe" && (
          <RecipePage
            recipe={recipe}
            user={user}
            onUserChange={setUser}
            from={recipeFrom}
            onRecipeChange={setRecipe}
            onBack={handleBackFromRecipe}
            onStartOver={handleStartOver}
            onOpenBoard={handleOpenBoard}
          />
        )}
        {screen === "leaderboard" && (
          <LeaderboardPage onBack={handleStartOver} onOpen={handleOpenFromBoard} />
        )}
      </main>
    </div>
  );
}

export default App;
