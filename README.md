# 🥬 Fridge Raiders

> Pull off the perfect kitchen heist. Snap your fridge, and we'll plan a meal from what you've already got.

## Built at DurHack 2026

Fridge Raiders was built in 24 hours at **DurHack 2026**, Durham University's student hackathon, on **14–15 November 2026**. The theme was **"composition"**.

We started with a problem everyone knows: opening a fridge full of random leftovers, having no idea what to make, and ordering a takeaway while the food goes off. "Composition" made us think of putting a dish together from parts. So we built an app that looks at what you already have and composes a meal from it, cutting down on food waste along the way.

Everything here, from the first fridge scan to the voice chef, was designed, built and merged by our team of three over one night at DurHack.

## What it does

1. **Case the joint.** Take a photo of your fridge. Gemini lists every ingredient it can see.
2. **Check the loot.** Edit the list, star the "use first" items before they go off, and set your house rules: time, servings, diet, kitchen kit, and whether you're up for a trip to the shops.
3. **Plan the heist.** Get up to three recipes (quick, healthy and adventurous), each with calories and protein per serving.
4. **Pull it off.** Cook mode gives you step by step instructions with timers and read aloud, plus a voice chef powered by ElevenLabs you can talk to while you cook.

### Extras

- **Accounts** with hashed passwords, cooking streaks and unlockable badges
- **Most wanted:** an upvote leaderboard of the crew's favourite recipes
- **Shopping list:** grouped by aisle, shareable on WhatsApp, with ingredient swaps and a map of nearby shops
- **Food rescued counter:** keeps track of how much food you've saved from the bin

## How we used "composition"

- **Ingredients become recipes.** Gemini composes dishes from what's actually in your fridge, not from a shopping trip.
- **Balanced options.** Each set of results mixes speed, health and adventure, so you can choose what suits your night.
- **Constraints shape the dish.** Your time, servings, diet and kitchen kit all decide what gets made.

## Tech stack

| Layer    | Tools                                                                    |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React 19, Vite 8, Tailwind CSS v4, `@elevenlabs/react`, Leaflet          |
| Backend  | Flask, SQLite, Werkzeug password hashing                                 |
| AI       | Google Gemini (`google-genai`) with Pydantic structured output schemas   |
| Voice    | ElevenLabs conversational agent, browser speech synthesis for read aloud |

## Running it locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
GEMINI_API_KEY=your_key_here
SECRET_KEY=any_long_random_string   # keeps you logged in across reloads
MOCK_GEMINI=1                       # optional: sample recipes, no API calls
```

Then run:

```bash
python app.py   # runs on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Vite proxies /api to Flask on :5001
HTTPS=1 npm run dev  # use this on a phone so the mic works
```

Optional `frontend/.env.local`:

```
VITE_ELEVENLABS_AGENT_ID=your_agent_id
```

## Project structure

```
backend/
  app.py                 Flask app and blueprints
  routes/                scan, meal, auth, recipes, swap
  services/              Gemini client, SQLite database, mock recipes
  prompts/, schemas/     Gemini prompts and Pydantic models
frontend/src/
  pages/                 scan, review, recipes, my list
  components/            CookMode, VoiceChef, ShoppingList, ShopMap, BadgeShelf…
  api/client.js          calls to the backend
```

## Challenges

- Getting Gemini to reliably return valid structured recipes. We validate every response, keep the good recipes, and retry once for any category that's missing.
- Mobile browsers only allow the mic over HTTPS, so the voice chef needed an HTTPS dev server.
- Three people merging into one repo overnight.

## The crew

- **Jack Page:** frontend and design
- **Sean Cryan** ([@spcryan2](https://github.com/spcryan2)): meal planning backend and Gemini recipe generation
- **Bethany Cay:** fridge scanning backend, database, shopping list and shop map

Made with too much caffeine at DurHack 2026 🦝🧊
