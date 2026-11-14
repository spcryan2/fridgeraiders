import { useState } from "react";
import ScanPage from "./pages/ScanPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import RecipePage from "./pages/RecipePage.jsx";
import LeaderboardPage from "./pages/LeaderboardPage.jsx";

function App() {
  const [screen, setScreen] = useState("scan");
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  // which screen the recipe was opened from, so "back" goes to the right place
  const [recipeFrom, setRecipeFrom] = useState("review");

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
        screen === "scan" ? "bg-forest text-cream" : "bg-cream text-forest"
      }`}
    >
      <main className="mx-auto max-w-md px-5 pb-12">
        {screen === "scan" && (
          <ScanPage onScanned={handleScanned} onOpenBoard={handleOpenBoard} />
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
