import RaiderFridge from "./RaiderFridge.jsx";

// big stacked version for the home screen, small inline one for headers
function Logo({ size = "sm", tone = "light" }) {
  const top = tone === "dark" ? "text-cream" : "text-forest";
  const bottom = tone === "dark" ? "text-lime-bright" : "text-leaf";

  if (size === "lg") {
    return (
      <div className="flex flex-col items-center gap-5">
        <RaiderFridge variant="lime" shifty className="h-36 w-auto" />
        <h1 className="wordmark text-center text-7xl">
          <span className={`block ${top}`}>Fridge</span>
          <span className={`block ${bottom}`}>Raiders</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <RaiderFridge variant={tone === "dark" ? "lime" : "forest"} className="h-9 w-auto" />
      <span className="wordmark text-base">
        <span className={`block ${top}`}>Fridge</span>
        <span className={`block ${bottom}`}>Raiders</span>
      </span>
    </div>
  );
}

export default Logo;
