import { useEffect, useState } from "react";
import ScanPage from "./pages/ScanPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import RecipePage from "./pages/RecipePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { getMe, logOut } from "./api/client.js";
import MyListPage from "./pages/MyListPage.jsx";

function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  // a raid can come back with a few options (quick, healthy, adventurous)
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(0);
  const recipe = recipes[selected] || null;
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

  function handleComposed(meals) {
    setRecipes(meals);
    setSelected(0);
    setRecipeFrom("review");
    setScreen("recipe");
  }

  function handleBackFromRecipe() {
    setScreen(recipeFrom);
  }

  function handleOpenBoard() {
    setScreen("leaderboard");
  }

  // swap in an updated copy (e.g. after an upvote), matched by title
  // so a late reply still lands on the right recipe after switching tabs
  function handleRecipeChange(updated) {
    setRecipes((list) => list.map((item) => (item.title === updated.title ? updated : item)));
  }

  function handleOpenFromBoard(saved) {
    setRecipes([saved]);
    setSelected(0);
    setRecipeFrom("leaderboard");
    setScreen("recipe");
  }

  function handleStartOver() {
    setIngredients([]);
    setRecipes([]);
    setSelected(0);
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
            onOpenList={()=> setScreen("my list")}
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
        {screen === "recipe" && recipe && (
          <RecipePage
            recipe={recipe}
            options={recipes}
            selected={selected}
            onSelect={setSelected}
            user={user}
            onUserChange={setUser}
            from={recipeFrom}
            onRecipeChange={handleRecipeChange}
            onBack={handleBackFromRecipe}
            onStartOver={handleStartOver}
            onOpenBoard={handleOpenBoard}
          />
        )}
        {screen === "leaderboard" && (
          <LeaderboardPage onBack={handleStartOver} onOpen={handleOpenFromBoard} />
        )}
        {screen === "mylist" && <MyListPage onBack={() => setScreen("scan")} />}
      </main>
    </div>
  );
}

export default App;
