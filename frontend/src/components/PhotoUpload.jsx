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
      <label className="stave group block w-full cursor-pointer rounded-3xl border border-ink/15 bg-white/40 px-6 py-10 text-center transition hover:border-ink/40">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ink text-3xl font-light text-paper transition group-hover:scale-105 group-active:scale-95">
          +
        </span>
        <span className="mt-4 inline-block rounded-full bg-paper px-3 text-lg font-semibold">
          Add photos
        </span>
        <span className="mt-1 block">
          <span className="rounded-full bg-paper px-3 text-sm text-ink-soft">
            Fridge, cupboard, anything
          </span>
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
              className={`relative aspect-square rounded-xl bg-white p-1.5 shadow-md shadow-ink/10 ${
                i % 2 ? "rotate-2" : "-rotate-2"
              }`}
            >
              {previews[i] && (
                <img
                  src={previews[i]}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-sm text-paper shadow"
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
