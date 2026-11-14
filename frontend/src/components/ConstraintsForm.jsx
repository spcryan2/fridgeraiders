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
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition ${
        selected
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 bg-white/50 text-ink hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ title, hint }) {
  return (
    <h4 className="mb-2 text-sm font-semibold">
      {title} <span className="font-normal text-ink-soft">· {hint}</span>
    </h4>
  );
}

function ConstraintsForm({ value, onChange }) {
  const [open, setOpen] = useState(false);

  // copy the current constraints and change one field
  function update(field, newValue) {
    onChange({ ...value, [field]: newValue });
  }

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-baseline gap-3 border-b border-ink/15 pb-2 text-left"
      >
        <span className="font-display text-lg text-accent italic">II.</span>
        <span className="font-display text-2xl font-semibold">
          Tempo &amp; instruments
        </span>
        <span
          className={`ml-auto text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-5 pt-4 motion-safe:animate-step-in">
          <div>
            <Label title="Tempo" hint="time limit" />
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
                  <span className="normal-case">{mins} min</span>
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label title="Servings" hint="how many people" />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.max(1, value.servings - 1))
                }
                className="h-10 w-10 rounded-full border border-ink/20 bg-white/50 text-lg active:scale-95"
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="w-8 text-center font-display text-3xl font-semibold">
                {value.servings}
              </span>
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.min(8, value.servings + 1))
                }
                className="h-10 w-10 rounded-full border border-ink/20 bg-white/50 text-lg active:scale-95"
                aria-label="More servings"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <Label title="Diet" hint="never broken" />
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
            <Label title="Instruments" hint="equipment you have" />
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
