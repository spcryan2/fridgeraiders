import { useEffect, useRef } from "react";
import { useConversation, useConversationClientTool } from "@elevenlabs/react";

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID;

function MicIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

// the browser's own voice, used when the chef isn't connected
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

// talks to the ElevenLabs agent. It must sit inside a ConversationProvider.
// The agent "presses" cook mode's buttons through the tools below.
function VoiceChef({ title, steps, index, stepText, timersDone, describeStep, onNext, onBack, onStartTimer, onPauseTimer }) {
  const { status, message, isSpeaking, startSession, endSession, sendContextualUpdate, sendUserMessage } =
    useConversation();
  const connected = status === "connected";
  const connecting = status === "connecting";

  // names must match the client tools set up in the ElevenLabs dashboard exactly
  useConversationClientTool("next_step", () => onNext());
  useConversationClientTool("previous_step", () => onBack());
  useConversationClientTool("start_timer", () => onStartTimer());
  useConversationClientTool("pause_timer", () => onPauseTimer());
  useConversationClientTool("get_current_step", () => describeStep());

  // if the user taps Next or Back by hand, tell the chef where they are now
  const lastIndex = useRef(index);
  useEffect(() => {
    if (connected && lastIndex.current !== index) {
      sendContextualUpdate(`The user is now on ${describeStep()}`);
    }
    lastIndex.current = index;
  }, [connected, index, describeStep, sendContextualUpdate]);

  // a step timer just finished: the chef says it, or the browser voice does
  const lastTimersDone = useRef(timersDone);
  useEffect(() => {
    if (timersDone === lastTimersDone.current) return;
    lastTimersDone.current = timersDone;
    if (connected) sendUserMessage("(The step timer just went off.)");
    else speak("Time's up.");
  }, [timersDone, connected, sendUserMessage]);

  // stop the browser voice if cook mode closes mid-sentence
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const readAloud = (
    <button
      type="button"
      onClick={() => speak(stepText)}
      className="rounded-full px-3 py-1.5 text-sm font-semibold text-lime-bright ring-1 ring-lime-bright/40 hover:bg-white/5"
    >
      Read this step aloud
    </button>
  );

  // no agent set up: just offer the browser voice
  if (!AGENT_ID) return <div className="mb-4">{readAloud}</div>;

  // browsers only allow the mic on localhost or https
  if (!navigator.mediaDevices?.getUserMedia) {
    return (
      <div className="mb-4 space-y-2 rounded-2xl bg-forest-soft px-4 py-3 text-sm text-white/70">
        <p>The voice chef needs a secure (https) page to use the mic.</p>
        {readAloud}
      </div>
    );
  }

  function handleToggle() {
    if (connected || connecting) {
      endSession();
      return;
    }
    startSession({
      agentId: AGENT_ID,
      dynamicVariables: {
        recipe_title: title || "this recipe",
        recipe_steps: steps
          .map((s, i) => `${i + 1}. ${s.instruction} (${s.minutes || 0} min)`)
          .join("\n"),
      },
    });
  }

  let label = "Talk to the chef";
  if (connecting) label = "Calling the chef…";
  if (connected) label = isSpeaking ? "Chef's talking…" : "Listening…";

  return (
    <div className="mb-4 space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={connected}
        className={`flex w-full items-center gap-3 rounded-full px-5 py-3 font-semibold transition active:scale-[0.98] ${
          connected ? "bg-lime-bright text-forest" : "bg-forest-soft text-cream hover:bg-forest-soft/70"
        }`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            connected ? "bg-forest text-lime-bright" : "bg-lime text-forest"
          } ${connected && isSpeaking ? "motion-safe:animate-pulse" : ""}`}
        >
          <MicIcon className="h-5 w-5" />
        </span>
        <span className="flex-1 text-left">{label}</span>
        {connected && <span className="text-sm opacity-70">Tap to hang up</span>}
      </button>
      {status === "error" && (
        <div className="space-y-2 px-2 text-sm text-white/70">
          <p>
            Couldn't reach the chef{message ? `: ${message}` : ""}. Check the mic is allowed
            and try again.
          </p>
          {readAloud}
        </div>
      )}
    </div>
  );
}

export default VoiceChef;
