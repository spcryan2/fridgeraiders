function PhotoUpload({ photos, onChange }) {
  function handleAdd(e) {
    const picked = [...e.target.files];
    onChange([...photos, ...picked]);
    e.target.value = "";
  }

  function handleRemove(index) {
    onChange(photos.filter((_, i) => i !== index));
  }
  return (
    <div className="space-y-4">
      <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center hover:border-stone-500">
        <span className="text-lg font-medium">📷 Add photos</span>
        <span className="block text-sm text-stone-500">
          Fridge, cupboard, anything
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
        <div className="grid grid-cols-3 gap-2">
          {photos.map((file, i) => (
            <div key={i} className="relative aspect-square">
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 rounded-full bg-black/60 px-2 text-white"
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
