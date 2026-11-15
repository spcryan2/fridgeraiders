import { useEffect, useRef } from "react";
import RaiderFridge from "./RaiderFridge.jsx";
import { BadgeIcon } from "./BadgeShelf.jsx";

// pops up over cook mode when a raid earns a new badge
function BadgeUnlocked({ badges, onClose }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-[60] m-0 grid place-items-center bg-forest/80 p-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="badge-title"
        className="w-full max-w-sm space-y-5 rounded-[2rem] bg-cream p-6 text-center text-forest shadow-[0_6px_0_var(--color-leaf)] motion-safe:animate-rise"
      >
        <RaiderFridge variant="forest" shifty className="mx-auto h-20 w-auto" />
        <div className="space-y-1">
          <p className="text-xs font-bold tracking-[0.2em] text-leaf uppercase">
            {badges.length > 1 ? "Badges unlocked" : "Badge unlocked"}
          </p>
          <h2 id="badge-title" className="wordmark text-4xl">
            {badges.map((badge) => badge.name).join(" + ")}
          </h2>
        </div>
        <ul className="flex justify-center gap-3">
          {badges.map((badge) => (
            <li key={badge.id}>
              <BadgeIcon badge={badge} unlocked className="h-20 w-20 text-2xl" />
            </li>
          ))}
        </ul>
        <button
          ref={buttonRef}
          onClick={onClose}
          className="wordmark w-full rounded-full bg-lime py-4 text-xl text-forest shadow-[0_5px_0_var(--color-leaf)] transition active:translate-y-1 active:shadow-[0_1px_0_var(--color-leaf)]"
        >
          Keep raiding
        </button>
      </div>
    </div>
  );
}

export default BadgeUnlocked;
