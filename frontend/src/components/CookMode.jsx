import { useEffect, useState } from "react";

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
  const isLast = index === steps.length - 1;

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
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900 p-6 text-white">
      <header className="flex items-center justify-between text-stone-400">
        <span>
          Step {index + 1} of {steps.length}
        </span>
        <button onClick={onExit}>✕ Exit</button>
      </header>

      <p className="my-auto text-3xl font-semibold leading-snug">
        {step.instruction}
      </p>

      {step.minutes > 0 && (
        <div className="mb-8 text-center">
          <p className="text-6xl font-bold tabular-nums">
            {secondsLeft === 0 ? "Done!" : formatTime(secondsLeft)}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setRunning(!running)}
              disabled={secondsLeft === 0}
              className="rounded-full bg-violet-500 px-6 py-2 font-semibold disabled:opacity-40"
            >
              {running ? "Pause" : "Start timer"}
            </button>
            <button
              onClick={() => goTo(index)}
              className="rounded-full border border-stone-600 px-6 py-2"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          className="rounded-2xl border border-stone-600 py-4 text-lg disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={() => (isLast ? onExit() : goTo(index + 1))}
          className="rounded-2xl bg-white py-4 text-lg font-semibold text-stone-900"
        >
          {isLast ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}

export default CookMode;
