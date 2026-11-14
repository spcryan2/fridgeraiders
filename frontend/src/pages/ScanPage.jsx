import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload.jsx";
import { scanPhotos } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import Logo from "../components/Logo.jsx";

const SCAN_MESSAGES = [
  "Casing the fridge...",
  "Counting the loot...",
  "Checking for witnesses...",
];

function ScanPage({ onScanned, onOpenBoard }) {
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
    <div className="space-y-9">
      {loading && <LoadingState messages={SCAN_MESSAGES} />}

      <header className="pt-12 text-center motion-safe:animate-rise">
        <Logo size="lg" tone="dark" />
        <p className="mt-5 text-sm font-semibold tracking-[0.35em] text-lime-bright uppercase">
          Snap it. Cook it.
        </p>
      </header>

      <div className="motion-safe:animate-rise" style={{ animationDelay: "120ms" }}>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </div>

      {error && (
        <p className="rounded-2xl bg-tomato/25 px-4 py-3 text-center text-sm text-cream">
          Raid foiled: {error}
        </p>
      )}

      <button
        onClick={handleScan}
        disabled={photos.length === 0 || loading}
        className="wordmark w-full rounded-full bg-lime py-5 text-2xl text-forest shadow-[0_5px_0_var(--color-leaf)] transition motion-safe:animate-rise active:translate-y-1 active:shadow-[0_1px_0_var(--color-leaf)] disabled:opacity-30 disabled:shadow-none"
        style={{ animationDelay: "240ms" }}
      >
        {loading ? "Raiding…" : "Scan the loot →"}
      </button>

      <button
        onClick={onOpenBoard}
        className="mx-auto block rounded-full px-5 py-2.5 font-semibold text-lime-bright ring-2 ring-forest-soft transition hover:ring-lime-bright/60 active:scale-95"
      >
        Most wanted recipes
      </button>
    </div>
  );
}

export default ScanPage;
