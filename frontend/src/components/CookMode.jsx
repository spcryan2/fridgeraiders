import { useEffect, useState } from "react";
import { playSound } from "../utils/sound.js";
import RaiderFridge from "./RaiderFridge.jsx";

const RING_RADIUS = 54;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function CookMode({ steps, onExit }) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState((steps[0].minutes || 0) * 60);
  const [running, setRunning] = useState(false);

  const step = steps[index];
  const nextStep = steps[index + 1];
  const isLast = index === steps.length - 1;
  const totalSeconds = (step.minutes || 0) * 60;
  const done = totalSeconds > 0 && secondsLeft === 0;

  // tick down once a second while running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // stop at zero and buzz the phone
  useEffect(() => {
    if (running && secondsLeft === 0) {
      setRunning(false);
      navigator.vibrate?.([300, 100, 300]);
      playSound("ding",0.8);
    }
  }, [running, secondsLeft]);

  function goTo(i) {
    setIndex(i);
    setSecondsLeft((steps[i].minutes || 0) * 60);
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 z-50 m-0 flex flex-col bg-forest px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-white">
      {/* one bar per step, like a row of notes */}
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.number}
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < index ? "bg-lime" : i === index ? "bg-lime-bright" : "bg-forest-soft"
            }`}
          />
        ))}
      </div>

      <header className="mt-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-lime-bright uppercase">
          <RaiderFridge variant="lime" className="h-7 w-auto" />
          Step {index + 1} <span className="text-white/40">of {steps.length}</span>
        </p>
        <button onClick={onExit} className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white">
          ✕ Exit
        </button>
      </header>

      {/* key makes the step fade in fresh each time it changes */}
      <div key={index} className="relative motion-safe:animate-step-in flex flex-1 flex-col justify-center gap-8">
        <p className="text-3xl leading-snug font-semibold sm:text-4xl">
          {step.instruction}
        </p>

        {totalSeconds > 0 && (
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="8" className="stroke-forest-soft" />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={RING_LENGTH * (1 - secondsLeft / totalSeconds)}
                  className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${
                    done ? "stroke-cream" : "stroke-lime-bright"
                  }`}
                />
              </svg>
              <span
                className={`absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums ${
                  done ? "animate-pulse text-cream" : ""
                }`}
              >
                {done ? "Done!" : formatTime(secondsLeft)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setRunning(!running)}
                disabled={done}
                className="rounded-full bg-lime px-6 py-2.5 font-bold text-forest shadow-[0_4px_0_var(--color-leaf)] active:translate-y-1 active:shadow-none disabled:opacity-40"
              >
                {running ? "❚❚ Pause" : "▶ Start"}
              </button>
              <button
                onClick={() => goTo(index)}
                className="rounded-full px-6 py-2 text-sm text-white/60 hover:text-white"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {nextStep && (
        <p className="mb-4 truncate text-sm text-white/45">
          Up next: {nextStep.instruction}
        </p>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-full border-2 border-forest-soft py-4 text-lg active:scale-95 disabled:opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => (isLast ? onExit() : goTo(index + 1))}
          className="wordmark rounded-full bg-lime py-4 text-xl text-forest shadow-[0_4px_0_var(--color-leaf)] active:translate-y-1 active:shadow-none"
        >
          {isLast ? "Job done! ★" : "Next step →"}
        </button>
      </div>
    </div>
  );
}

export default CookMode;
