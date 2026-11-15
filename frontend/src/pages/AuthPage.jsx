import { useState } from "react";
import Flame from "../components/Flame.jsx";
import Logo from "../components/Logo.jsx";
import RaiderFridge from "../components/RaiderFridge.jsx";
import { logIn, signUp } from "../api/client.js";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

// `trailing` is an optional button that sits inside the box on the right
function Field({ id, label, trailing, ...input }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-bold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          required
          {...input}
          className={`w-full rounded-2xl border-2 border-forest/20 bg-white px-4 py-3.5 text-base text-forest outline-none placeholder:text-forest/50 focus:border-forest ${
            trailing ? "pr-20" : ""
          }`}
        />
        {trailing}
      </div>
    </div>
  );
}

function AuthPage({ onAuthed, onGuest }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ raider_name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const signingUp = mode === "signup";

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function switchMode() {
    setMode(signingUp ? "login" : "signup");
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const user = signingUp
        ? await signUp(form)
        : await logIn({ email: form.email, password: form.password });
      onAuthed(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="-mx-5 -mb-12 flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 pt-7">
        <Logo tone="dark" />
        <button
          type="button"
          onClick={onGuest}
          className="text-sm font-semibold text-white/60 hover:text-white"
        >
          Skip for now
        </button>
      </header>

      {signingUp ? (
        <section className="space-y-3 px-6 pt-6 pb-6">
          <p className="text-xs font-bold tracking-[0.2em] text-lime-bright uppercase">
            Your first week
          </p>
          <ol className="grid grid-cols-7 gap-2">
            {DAYS.map((day, i) => (
              <li key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 ${
                    i < 3
                      ? "border-lime-bright bg-lime-bright text-forest"
                      : "border-forest-soft"
                  }`}
                >
                  {i < 3 && <Flame className="h-4 w-4" />}
                </span>
                <span className="text-xs font-bold text-white/60">{day}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-sprout">
            Raid three nights in a row and your streak catches fire.
          </p>
        </section>
      ) : (
        <div className="flex flex-1 items-end justify-center pt-6">
          <RaiderFridge variant="lime" shifty className="-mb-24 h-56 w-auto" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`relative z-10 space-y-4 rounded-t-[2rem] bg-cream px-6 pt-8 pb-10 text-forest ${
          signingUp ? "flex-1" : ""
        }`}
      >
        <div className="space-y-1.5">
          <h1 className="wordmark text-4xl">
            {signingUp ? "Join the crew" : "Welcome back, raider"}
          </h1>
          {!signingUp && (
            <p className="text-forest/70">Your streak is waiting. Don't let it go off.</p>
          )}
        </div>

        {signingUp && (
          <Field
            id="raider_name"
            label="Raider name"
            value={form.raider_name}
            onChange={update}
            placeholder="The Pesto Bandit"
            maxLength={30}
            autoComplete="nickname"
          />
        )}
        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={update}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={update}
          placeholder={signingUp ? "8 characters or more" : ""}
          minLength={signingUp ? 8 : undefined}
          autoComplete={signingUp ? "new-password" : "current-password"}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-2 my-auto h-10 rounded-xl px-3 text-sm font-bold text-leaf hover:bg-sprout"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          }
        />

        {error && (
          <p role="alert" className="rounded-2xl bg-tomato/15 px-4 py-3 text-sm text-forest">
            Raid foiled: {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="wordmark w-full rounded-full bg-lime py-4 text-2xl text-forest shadow-[0_5px_0_var(--color-leaf)] transition active:translate-y-1 active:shadow-[0_1px_0_var(--color-leaf)] disabled:opacity-50"
        >
          {busy ? "Hold on…" : signingUp ? "Start my streak" : "Sneak back in"}
        </button>

        <p className="text-center text-forest/70">
          {signingUp ? "Already a raider? " : "New here? "}
          <button
            type="button"
            onClick={switchMode}
            className="font-bold text-leaf hover:underline"
          >
            {signingUp ? "Sneak back in" : "Join the crew"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default AuthPage;
