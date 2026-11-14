import { useState } from "react";
import ScanPage from "./pages/ScanPage.jsx";

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

  function handleStartOver() {
    setIngredients([]);
    setRecipe(null);
    setScreen("scan");
  }
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <main className="max-w-md mx-auto p-4">
        {screen === "scan" && <ScanPage onScanned={handleScanned} />}
        {screen === "review" && (
          <div>
            <p>Review page: {ingredients.length} ingredients</p>
            <button onClick={() => handleComposed({ title: "Test meal" })}>
              Fake compose
            </button>
          </div>
        )}

        {screen === "recipe" && (
          <div>
            <p>Recipe page: {recipe.title}</p>
            <button onClick={handleStartOver}>Start over</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
