import { useEffect, useState } from "react";
import RaiderFridge from "./RaiderFridge.jsx";

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
      className="fixed inset-0 z-50 m-0 flex flex-col items-center justify-center gap-8 bg-forest px-6 text-white"
    >
      <RaiderFridge
        variant="lime"
        shifty
        className="h-40 w-auto motion-safe:animate-hop"
      />
      {/* key restarts the fade for each new message */}
      <p key={index} className="wordmark text-center text-3xl motion-safe:animate-step-in">
        {messages[index]}
      </p>
      <div className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2.5 w-2.5 rounded-full bg-lime motion-safe:animate-hop"
            style={{ animationDelay: `${dot * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default LoadingState;
