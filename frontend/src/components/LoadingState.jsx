import { useEffect, useState } from "react";

function LoadingState({ messages }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-stone-50/95 backdrop-blur-sm"
    >
      <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className="h-full w-3 origin-bottom rounded-full bg-violet-500 motion-safe:animate-eq"
            style={{ animationDelay: `${bar * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-lg font-medium text-stone-700">{messages[index]}</p>
    </div>
  );
}

export default LoadingState;
