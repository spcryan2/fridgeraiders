import Flame from "./Flame.jsx";
import { BADGES, hasBadge } from "../utils/badges.js";

function Leaf({ className = "" }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M14 2C6 2 2 6 2 11c0 1 .3 2 .8 3C4 9 7 6 11 5 8 7 5.5 10 4.5 14.5 10 14 14 10 14 2z" fill="currentColor" />
    </svg>
  );
}

export function BadgeIcon({ badge, unlocked, className = "h-12 w-12 text-sm" }) {
  const Icon = badge.kind === "streak" ? Flame : Leaf;
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full border-2 font-extrabold ${
        unlocked
          ? "border-lime-bright bg-lime-bright text-forest shadow-[0_3px_0_var(--color-leaf)]"
          : "border-forest-soft text-white/40"
      } ${className}`}
    >
      <span className="flex flex-col items-center leading-none">
        <Icon className="mb-0.5 h-[0.8em] w-[0.8em]" />
        {badge.short}
      </span>
    </span>
  );
}

function BadgeShelf({ user }) {
  if (!user) return null;

  return (
    <section className="space-y-3 rounded-3xl bg-forest-soft/40 p-4">
      <h2 className="text-xs font-bold tracking-[0.2em] text-lime-bright uppercase">Your badges</h2>
      <ul className="grid grid-cols-6 gap-1.5">
        {BADGES.map((badge) => {
          const unlocked = hasBadge(user, badge);
          return (
            <li key={badge.id} className="flex flex-col items-center gap-1.5 text-center">
              <BadgeIcon badge={badge} unlocked={unlocked} />
              <span
                aria-hidden="true"
                className={`text-[10px] leading-tight font-semibold ${
                  unlocked ? "text-cream" : "text-white/50"
                }`}
              >
                {unlocked ? badge.name : badge.label}
              </span>
              <span className="sr-only">
                {unlocked ? `${badge.name}, unlocked` : `${badge.name}, locked until ${badge.label}`}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default BadgeShelf;
