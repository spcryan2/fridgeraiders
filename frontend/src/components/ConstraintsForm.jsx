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
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition active:scale-95 ${
        selected
          ? "bg-forest text-white"
          : "bg-cream text-forest ring-1 ring-forest/12 hover:ring-forest/30"
      }`}
    >
      {children}
    </button>
  );
}

function Label({ title, hint }) {
  return (
    <h4 className="mb-2 text-sm font-semibold">
      {title} <span className="font-normal text-forest/50">· {hint}</span>
    </h4>
  );
}

function ConstraintsForm({ value, onChange }) {
  const [open, setOpen] = useState(false);
  // the shops question drops down once a time has been picked
  const [pickedTime, setPickedTime] = useState(false);

  // copy the current constraints and change one field
  function update(field, newValue) {
    onChange({ ...value, [field]: newValue });
  }

  function pickTime(minutes) {
    update("max_minutes", minutes);
    setPickedTime(true);
  }

  return (
    <section className="rounded-3xl bg-white ring-1 ring-forest/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <span className="wordmark text-xl">House rules</span>
        <span className="text-sm text-forest/50">time, diet, kit</span>
        <span
          className={`ml-auto grid h-8 w-8 place-items-center rounded-full bg-cream transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-5 px-5 pb-5 motion-safe:animate-step-in">
          <div>
            <Label title="Time limit" hint="tops" />
            <div className="flex flex-wrap gap-2">
              <Chip
                selected={value.max_minutes === null}
                onClick={() => pickTime(null)}
              >
                Any
              </Chip>
              {TIME_OPTIONS.map((mins) => (
                <Chip
                  key={mins}
                  selected={value.max_minutes === mins}
                  onClick={() => pickTime(mins)}
                >
                  <span className="normal-case">{mins} min</span>
                </Chip>
              ))}
            </div>

            {pickedTime && (
              <div className="mt-4 rounded-2xl bg-cream p-3 motion-safe:animate-step-in">
                <Label title="Up for a trip to the shops?" hint="shopping time doesn't count" />
                <div className="flex flex-wrap gap-2">
                  <Chip
                    selected={!value.shopping_trip}
                    onClick={() => update("shopping_trip", false)}
                  >
                    <span className="normal-case">Fridge only</span>
                  </Chip>
                  <Chip
                    selected={Boolean(value.shopping_trip)}
                    onClick={() => update("shopping_trip", true)}
                  >
                    <span className="normal-case">I'll pop out</span>
                  </Chip>
                </div>
                <p className="mt-2 text-xs text-forest/60">
                  {value.shopping_trip
                    ? "Recipes can use up to 4 things you'd need to buy."
                    : "Only what you've got, plus salt, pepper, oil and water."}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label title="Servings" hint="how many people" />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.max(1, value.servings - 1))
                }
                className="h-10 w-10 rounded-full bg-cream text-lg ring-1 ring-forest/12 active:scale-95"
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="wordmark w-8 text-center text-3xl">
                {value.servings}
              </span>
              <button
                type="button"
                onClick={() =>
                  update("servings", Math.min(8, value.servings + 1))
                }
                className="h-10 w-10 rounded-full bg-cream text-lg ring-1 ring-forest/12 active:scale-95"
                aria-label="More servings"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <Label title="Diet" hint="we never break it" />
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
            <Label title="Kit" hint="what you have" />
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
