# Mumbai Real Estate Brief

An AI-powered news intelligence tool for real-estate development teams. A self-updating,
tabbed feed of Mumbai property news — projects, laws, rules — plus a global construction-AI
tab, each story summarised as a TL;DR with a link to the source. A built-in **Ask AI**
assistant searches the web live and answers in plain language.

```
mumbai-real-estate-brief/
├── backend/     → Express API (deploy to Render)
└── frontend/    → React + Vite app (deploy to Vercel)
```

---

## 1. What APIs you need (and where they go)

This app uses **one** external API: the **Google Gemini API** (Google AI Studio), which does both the web search
and the summarising. You do **not** need a separate search API — Gemini's built-in
**Google Search grounding** fetches live results and returns real source citations.

| What | Where to get it | Where it goes |
|------|-----------------|---------------|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | **Backend only** — `backend/.env` locally, Render env var in production |

> The key lives **only on the backend**. The frontend never sees it; it just calls your
> backend. Never put the API key in the frontend or commit it to git.

**Exactly which source files use it:**

- `backend/src/llm.js` — reads `process.env.GEMINI_API_KEY` and creates the Gemini client
  (line ~14). This is the single place the key is used. The news feed and the assistant both
  go through `runWithWebSearch()` here, which enables the `googleSearch` grounding tool.
- `backend/src/newsService.js` — builds each tab's feed.
- `backend/src/askService.js` — powers the Ask AI assistant.
- `backend/src/prompts.js` — the search briefs per tab and the assistant prompt. **Edit this
  file to tune what each tab searches for.**

### Swapping providers (optional)
If you ever want to use a different provider (Anthropic / OpenAI / Perplexity), the only file
to change is `backend/src/llm.js` — keep the `runWithWebSearch(prompt)` → `{ text, citations }`
contract and the rest of the app keeps working.

---

## 2. Run it locally

You need **two terminals**.

**Terminal 1 — backend**
```bash
cd backend
cp .env.example .env          # then paste your GEMINI_API_KEY into .env
npm install
npm run dev                   # → http://localhost:8787
```

**Terminal 2 — frontend**
```bash
cd frontend
cp .env.example .env          # leave VITE_API_BASE_URL BLANK for local dev
npm install
npm run dev                   # → http://localhost:5173
```

In dev, Vite proxies `/api` → `http://localhost:8787`, so there's no CORS to fight.

### Preview the UI without a backend/key
Want to see the design before wiring up the API? Run the frontend with mock data:
```bash
cd frontend
VITE_USE_MOCK=1 npm run dev
```
This serves sample stories and a sample assistant reply (see `frontend/src/mocks.js`).

---

## 3. Deploy the backend to Render

1. Push this repo to GitHub.
2. In Render: **New + → Web Service** → connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. **Environment → Add Environment Variable:**
   - `GEMINI_API_KEY` = your key (mark as secret)
   - `FRONTEND_ORIGIN` = your Vercel URL (add this after step 4 below; locks down CORS)
5. Deploy. Render gives you a URL like `https://mumbai-brief-api.onrender.com`.
   Test it: open `https://<your-render-url>/api/health` → should return `{ "ok": true }`.

> A `backend/render.yaml` blueprint is included, so you can also use
> **New + → Blueprint** and point it at the repo. You still set `GEMINI_API_KEY` in the
> dashboard (it's marked `sync: false` so it stays secret).
>
> Note: Render's free tier sleeps after inactivity, so the first request after idle is slow.

---

## 4. Deploy the frontend to Vercel

1. In Vercel: **Add New → Project** → import the same repo.
2. Settings:
   - **Root Directory:** `frontend`
   - Framework preset: **Vite** (auto-detected)
   - Build Command: `npm run build`, Output: `dist` (auto-detected)
3. **Environment Variables:**
   - `VITE_API_BASE_URL` = your Render URL, e.g. `https://mumbai-brief-api.onrender.com`
     (no trailing slash)
4. Deploy. You'll get a URL like `https://mumbai-brief.vercel.app`.
5. **Go back to Render** and set `FRONTEND_ORIGIN` to that Vercel URL, then redeploy the
   backend so CORS allows your live site.

That's the whole loop: **Vercel frontend → calls → Render backend → calls → Gemini.**

---

## 5. Tuning

- **What each tab searches for:** `backend/src/prompts.js` (the `TABS` object).
- **Feed cache length:** `FEED_CACHE_TTL_MS` (default 10 min) — how long before a tab re-fetches.
- **Model:** `GEMINI_MODEL` (default `gemini-2.5-flash`). Must support Google Search grounding.
- **Auto-refresh interval (frontend):** `AUTO_REFRESH_MS` in `frontend/src/App.jsx` (default 5 min).

## API reference

- `GET /api/news?tab=general|projects|laws|rules|ai[&force=1]` → `{ tab, scope, stories[], updatedAt }`
- `POST /api/ask` body `{ "question": "...", "storyContext": "optional story title" }` →
  `{ answer, sources[], answeredAt }`
- `GET /api/health` → `{ ok: true }`


