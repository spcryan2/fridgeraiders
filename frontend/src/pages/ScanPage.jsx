import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload.jsx";
import { scanPhotos } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";

const SCAN_MESSAGES = [
  "Opening the fridge...",
  "Reading the labels...",
  "Tuning the ingredients...",
];

function ScanPage({ onScanned }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleScan() {
    setLoading(true);
    setError(null);
    try {
      const data = await scanPhotos(photos);
      onScanned(data.ingredients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {loading && <LoadingState messages={SCAN_MESSAGES} />}

      <header className="pt-12 text-center motion-safe:animate-rise">
        <p className="text-xs font-semibold tracking-[0.3em] text-accent uppercase">
          Op. 1 · your fridge
        </p>
        <h1 className="mt-3 font-display text-6xl leading-[0.9] font-semibold tracking-tight italic">
          Leftover
          <br />
          Composer
        </h1>
        <div className="mx-auto mt-6 flex w-40 items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-ink/30" />
          <span className="font-display text-xl text-accent">♪</span>
          <span className="h-px flex-1 bg-ink/30" />
        </div>
        <p className="mt-4 text-ink-soft">
          Snap your fridge. We'll compose a meal.
        </p>
      </header>

      <div className="motion-safe:animate-rise" style={{ animationDelay: "120ms" }}>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </div>

      {error && <p className="text-center text-sm text-accent">⚠ {error}</p>}

      <button
        onClick={handleScan}
        disabled={photos.length === 0 || loading}
        className="w-full rounded-full bg-ink py-4 text-lg font-semibold text-paper transition motion-safe:animate-rise active:scale-[0.98] disabled:opacity-30"
        style={{ animationDelay: "240ms" }}
      >
        {loading ? "Reading your fridge…" : "Scan ingredients"}
      </button>
    </div>
  );
}

export default ScanPage;
