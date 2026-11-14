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
      className="fixed inset-0 z-50 m-0 flex flex-col items-center justify-center gap-8 bg-paper/95 backdrop-blur-sm"
    >
      <div className="stave flex h-[33px] w-48 items-end justify-center gap-2" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={`h-16 w-3 origin-bottom rounded-full motion-safe:animate-eq ${
              bar % 2 ? "bg-accent" : "bg-ink"
            }`}
            style={{ animationDelay: `${bar * 0.15}s` }}
          />
        ))}
      </div>
      {/* key restarts the fade for each new message */}
      <p
        key={index}
        className="font-display text-2xl italic motion-safe:animate-step-in"
      >
        {messages[index]}
      </p>
    </div>
  );
}

export default LoadingState;
