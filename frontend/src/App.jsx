import { useState } from "react";
import ScanPage from "./pages/ScanPage.jsx";
import ReviewPage from "./pages/ReviewPage.jsx";
import RecipePage from "./pages/RecipePage.jsx";

function App() {
  const [screen, setScreen] = useState("scan");
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);

  function handleScanned(scanned) {
    setIngredients(scanned);
    setScreen("review");
  }

  function handleComposed(meal) {
    setRecipe(meal);
    setScreen("recipe");
  }

  function handleBackToReview() {
    setScreen("review");
  }

  function handleStartOver() {
    setIngredients([]);
    setRecipe(null);
    setScreen("scan");
  }
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="mx-auto max-w-md px-5 pb-12">
        {screen === "scan" && <ScanPage onScanned={handleScanned} />}
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
            onBack={handleBackToReview}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  );
}

export default App;
