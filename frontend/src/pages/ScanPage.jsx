import { useState } from "react";
import PhotoUpload from "../components/PhotoUpload.jsx";
import { scanPhotos } from "../api/client.js";

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
    <div className="space-y-6">
      <header className="pt-6 text-center">
        <h1 className="text-3xl font-bold">Leftover Composer</h1>
        <p className="mt-1 text-stone-500">
          Snap your fridge. We'll compose a meal.
        </p>
      </header>

      <PhotoUpload photos={photos} onChange={setPhotos} />

      {error && <p className="text-center text-red-600">{error}</p>}

      <button
        onClick={handleScan}
        disabled={photos.length === 0 || loading}
        className="w-full rounded-2xl bg-stone-900 py-4 text-lg font-semibold text-white disabled:opacity-40"
      >
        {loading ? "Reading your fridge…" : "Scan ingredients"}
      </button>
    </div>
  );
}

export default ScanPage;
