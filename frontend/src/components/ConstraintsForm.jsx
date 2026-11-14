import { useState } from "react";

const TIME_OPTIONS = [15, 30, 45, 60];
const DIET_OPTIONS = ["vegetarian", "vegan", "gluten-free", "dairy-free"];
const EQUIPMENT_OPTIONS = ["hob", "oven", "microwave", "air fryer"];

// add the item if it's missing, remove it if it's there
function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
        selected
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-300 bg-white text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}

function ConstraintsForm({ value, onChange }) {
  const [open, setOpen] = useState(false);

  // copy the current constraints and change one field
  function update(field, newValue) {
    onChange({ ...value, [field]: newValue });
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 font-medium"
      >
        <span>Options</span>
        <span className="text-stone-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-stone-200 p-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Time</h4>
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={value.max_minutes === null}
                onClick={() => update("max_minutes", null)}
              >
                Any
              </Chip>
              {TIME_OPTIONS.map((mins) => (
                <Chip
                  key={mins}
                  selected={value.max_minutes === mins}
                  onClick={() => update("max_minutes", mins)}
                >
                  {mins} min
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Servings</h4>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.max(1, value.servings - 1))
                }
                className="h-9 w-9 rounded-full border border-stone-300 text-lg"
                aria-label="Fewer servings"
              ></button>
              <span className="w-6 text-center text-lg font-semibold">
                {value.servings}
              </span>
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.min(8, value.servings + 1))
                }
                className="h-9 w-9 rounded-full border border-stone-300 text-lg"
                aria-label="More servings"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Diet</h4>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((diet) => (
                <Chip
                  key={diet}
                  selected={value.diet.includes(diet)}
                  onClick={() => update("diet", toggle(value.diet, diet))}
                >
                  {diet}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Equipment you have</h4>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  selected={value.equipment.includes(item)}
                  onClick={() =>
                    update("equipment", toggle(value.equipment, item))
                  }
                >
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ConstraintsForm;
