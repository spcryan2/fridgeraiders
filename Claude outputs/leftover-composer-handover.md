# Leftover Composer, DurHack 2026: handover for a new chat

Paste or attach this at the start of the new chat. Up to date as of Sat 14 Nov 2026, 18:50.

## Who I am and how I want to work
- I'm Jack, doing the **frontend** at DurHack 2026 (24 hours, theme "composition"). Teammates: **Bethany** (scan backend) and **Sean** (meal backend).
- I'm new to React. Explain React ideas briefly, with an analogy for anything complicated.
- I write the code myself. When I ask for code, give it in chat with short line-by-line explanations. Don't edit my files unless I say "implement it".
- Before changing any file, show the exact change and wait for my OK.
- Short answers. Be direct and honest if something is a bad idea.
- Never commit, push or merge. I handle git myself. Only use read-only git commands on my folder (`git --no-optional-locks ...`), never `git fetch`/`pull`/`status` without that flag.
- I'm on a MacBook with VS Code. Project folder: `~/Desktop/Projects/durhack2026` (`frontend/` and `backend/`). Repo: github.com/spcryan2/fridgeraiders.

## The project
Photo of fridge, Gemini reads the ingredients, the user corrects the list, the app composes a meal. "Composer" mode pairs unusual ingredients and explains why they work. Pitch: "Your fridge is full of ingredients that were never meant to go together. We compose them into a meal that works."

Stack: React 19 + Vite 8 + Tailwind v4 (frontend), Flask + Gemini (backend).

## API contract (agreed, don't change field names)
- `POST /api/scan`: multipart, field **`photos`** (one or more). Returns `{ "ingredients": [{ "name", "quantity", "category", "confidence" }] }`. category is one of veg/fruit/dairy/meat/sauce/grain/other; confidence is high/low.
- `POST /api/meal`: JSON `{ ingredients: [{ name, quantity, use_first }], mode: "classic"|"composer", max_minutes?, servings?, diet?: [..], equipment?: [..] }`. Returns `{ title, summary, servings, time_minutes, difficulty, ingredients_used: [{name, amount}], extra_needed: [], steps: [{number, instruction, minutes}], pairing: {items, reason} | null }`. pairing is null in classic mode. `extra_needed` item shape not confirmed; the frontend handles strings or `{name, amount}`.
- Errors: `{ "error": "message" }` with a 4xx/5xx status.

## Frontend: DONE and working (all on `main`)
- `src/api/client.js`: `scanPhotos(files)` and `getMeal(payload)`, shared `request()` helper with error handling, `sleep()` for the mock delay, mock mode via `VITE_USE_MOCK` in `.env.local`, photos resized before upload.
- `src/utils/resizeImage.js`: longest side 1024px, JPEG 80%, falls back to the original file. Tested in Chrome.
- `src/mock/mockScan.json` (9 ingredients, 2 low confidence) and `mockMeal.json` (chorizo and apple fried rice, composer pairing, 5 steps).
- `src/App.jsx`: state `screen` / `ingredients` / `recipe`; handlers `handleScanned`, `handleComposed`, `handleBackToReview`, `handleStartOver`; `max-w-md mx-auto` layout.
- `src/pages/ScanPage.jsx` + `components/PhotoUpload.jsx`: multi-photo picker with previews and remove buttons.
- `src/pages/ReviewPage.jsx` + `components/IngredientChips.jsx`: editable chips (☆ use first, amber dashed = low confidence, edit name, remove, add). Chip width uses `ch` units. Classic/Composer toggle inline.
- `components/ConstraintsForm.jsx`: collapsible Options (time, servings 1 to 8, diet, equipment). Only set values go in the payload. Payload verified against the contract in Chrome.
- `components/LoadingState.jsx`: full-screen purple equaliser bars plus rotating messages. Custom `animate-eq` keyframes in `index.css` via `@theme`.
- `src/pages/RecipePage.jsx` + `components/RecipeCard.jsx`: purple "♪ The composition" pairing box (hidden in classic), ingredients, extras, numbered method.
- `vite.config.js`: `host: true`, proxy `/api` to `http://localhost:5001`.
- Tested on my phone over wifi. Works.

## Next frontend step (code already written and tested, not yet in my files)
Go live on scan while the meal stays mocked:
1. In `client.js`, replace `USE_MOCK` with `MOCK_SCAN = import.meta.env.VITE_MOCK_SCAN === "true"` and `MOCK_MEAL = import.meta.env.VITE_MOCK_MEAL === "true"`, and use one in each function.
2. In `scanPhotos`, convert plain-string ingredients into `{ name, quantity: "", category: "other", confidence: "high" }` objects (safety net, because the backend currently returns strings).
3. `.env.local`: `VITE_MOCK_SCAN=false` and `VITE_MOCK_MEAL=true`, then restart `npm run dev`.
4. Test the backend first with `MOCK_GEMINI=1 python app.py`, then with real Gemini.

## Backend status (on `origin/main`): blocking the full demo
- Flask now runs on **port 5001** (moved off 5000 because of macOS AirPlay). Tell everyone.
- **Scan:** typos fixed, retries/timeout/mock mode added. Still reads `request.files.get("image")`; needs `getlist("photos")` plus a loop (Bethany). This is the one change blocking real scans. It still returns plain strings, not objects; the frontend safety net covers that for now.
- **Meal (Sean):** not usable. Not registered in `app.py`; ignores the request (hardcoded constraints, loads `mockScan.json`); never calls Gemini; POSTs to `localhost:5173` instead of `return jsonify(recipe)`; `prompt.jsonify()` crashes; test code at the bottom runs on import; `recipe_schema.py` is empty; treats `diet` as a string, but the frontend sends a list.
- A 502 from `/api/scan` means Gemini failed (check the red error text or the Flask terminal: model name, API key, quota, timeout). `config.py` defaults the model to `gemini-3.8-flash`, which may need to be `gemini-flash-latest`.

## Housekeeping
- Delete a stray lock file left by an earlier `git fetch`: `rm .git/objects/maintenance.lock` (from the project root).
- Small tidy-ups: `client.js` import of resizeImage is missing `.js`; empty catch comment says "a little comment :)"; `SCAN_MESSAGE` could be `SCAN_MESSAGES`.
- A shared `frontend/.env` with mock defaults isn't committed yet (only my `.env.local`).
- Teammate on Windows: Node via nodejs.org LTS; frontend uses npm (`npm install`, `npm run dev`), backend uses pip. Never `pip install vite`.

## Remaining frontend work, in priority order
1. Go live on scan (above), then on meal once Sean's route works.
2. Cook mode: one step at a time, big text, Next/Back, countdown from each step's `minutes`.
3. Theme polish: display font, consistent accent, subtle music touches.
4. Small fixes: `URL.revokeObjectURL` for previews, move the mode toggle into `ModeToggle.jsx`, empty state when every chip is removed.
