import { useEffect, useState } from "react";

function PhotoUpload({ photos, onChange }) {
  const [previews, setPreviews] = useState([]);

  // make preview links for the photos, and free them when the photos change
  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [photos]);

  function handleAdd(e) {
    const picked = [...e.target.files];
    onChange([...photos, ...picked]);
    e.target.value = "";
  }

  function handleRemove(index) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-5">
      <label className="group block w-full cursor-pointer rounded-3xl border-2 border-dashed border-lime-bright/50 bg-forest-soft px-6 py-9 text-center transition hover:border-lime-bright">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-4xl font-bold text-forest shadow-[0_4px_0_var(--color-leaf)] transition group-hover:scale-105 group-active:translate-y-1 group-active:shadow-none">
          +
        </span>
        <span className="wordmark mt-4 block text-2xl text-white">
          Show us the fridge
        </span>
        <span className="mt-1 block text-sm text-white/60">
          Fridge, cupboard, anything. We're not judging.
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleAdd}
        />
      </label>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((file, i) => (
            <div
              key={i}
              className={`relative aspect-square rounded-2xl bg-white p-1.5 shadow-lg shadow-black/30 ${
                i % 2 ? "rotate-2" : "-rotate-2"
              }`}
            >
              {previews[i] && (
                <img
                  src={previews[i]}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full rounded-xl object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-lime text-sm font-bold text-forest shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoUpload;
