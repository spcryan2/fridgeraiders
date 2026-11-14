import { useEffect, useState } from "react";

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
    }
  }, [running, secondsLeft]);

  function goTo(i) {
    setIndex(i);
    setSecondsLeft((steps[i].minutes || 0) * 60);
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 z-50 m-0 flex flex-col bg-ink px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-paper">
      {/* one bar per step, like a row of notes */}
      <div className="flex gap-1.5">
        {steps.map((s, i) => (
          <button
            key={s.number}
            onClick={() => goTo(i)}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < index ? "bg-paper/60" : i === index ? "bg-accent" : "bg-paper/15"
            }`}
          />
        ))}
      </div>

      <header className="mt-4 flex items-baseline justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Step {index + 1} <span className="text-paper/40">of {steps.length}</span>
        </p>
        <button onClick={onExit} className="text-sm text-paper/50 hover:text-paper">
          ✕ Exit
        </button>
      </header>

      {/* faint stave lines behind the step */}
      <div className="stave pointer-events-none absolute inset-x-0 top-1/4 h-1/2 opacity-60 [--stave-ink:rgb(243_236_223/0.07)]" aria-hidden="true" />

      {/* key makes the step fade in fresh each time it changes */}
      <div key={index} className="relative motion-safe:animate-step-in flex flex-1 flex-col justify-center gap-8">
        <p className="font-display text-4xl font-medium leading-tight sm:text-5xl">
          {step.instruction}
        </p>

        {totalSeconds > 0 && (
          <div className="flex items-center gap-6">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={RING_RADIUS} fill="none" strokeWidth="8" className="stroke-paper/10" />
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
                    done ? "stroke-ochre" : "stroke-accent"
                  }`}
                />
              </svg>
              <span
                className={`absolute inset-0 flex items-center justify-center text-2xl font-bold tabular-nums ${
                  done ? "animate-pulse text-ochre" : ""
                }`}
              >
                {done ? "Done!" : formatTime(secondsLeft)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setRunning(!running)}
                disabled={done}
                className="rounded-full bg-accent px-6 py-2.5 font-semibold shadow-lg shadow-accent/30 active:scale-95 disabled:opacity-40"
              >
                {running ? "❚❚ Pause" : "▶ Start"}
              </button>
              <button
                onClick={() => goTo(index)}
                className="rounded-full px-6 py-2 text-sm text-paper/60 hover:text-paper"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {nextStep && (
        <p className="mb-4 truncate text-sm text-paper/40">
          Up next: {nextStep.instruction}
        </p>
      )}

      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-full border border-paper/20 py-4 text-lg active:scale-95 disabled:opacity-30"
        >
          ←
        </button>
        <button
          onClick={() => (isLast ? onExit() : goTo(index + 1))}
          className="rounded-full bg-paper py-4 text-lg font-semibold text-ink active:scale-95"
        >
          {isLast ? "Bravo ♪" : "Next step →"}
        </button>
      </div>
    </div>
  );
}

export default CookMode;
