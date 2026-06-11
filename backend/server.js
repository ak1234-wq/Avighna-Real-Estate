// Mumbai Real Estate Brief — API server.
// Two endpoints: GET /api/news (the tabbed feed) and POST /api/ask (the assistant).

import "dotenv/config";
import express from "express";
import cors from "cors";

import { getFeed, isValidTab } from "./src/newsService.js";
import { ask } from "./src/askService.js";
import { startScheduler } from "./src/scheduler.js";
import { getTabCounts } from "./src/db.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS: allow the Vercel frontend (set FRONTEND_ORIGIN in production) and local dev.
const allowedOrigin = process.env.FRONTEND_ORIGIN || "*";
app.use(
  cors({
    origin: allowedOrigin === "*" ? true : allowedOrigin.split(",").map((s) => s.trim()),
  })
);

// Health check — shows DB article counts per tab
app.get("/api/health", (_req, res) => {
  const counts = getTabCounts();
  res.json({ ok: true, time: new Date().toISOString(), db: counts });
});

// GET /api/news?tab=general[&force=1]
app.get("/api/news", async (req, res) => {
  const tab = String(req.query.tab || "general").toLowerCase();
  const force = req.query.force === "1" || req.query.force === "true";

  if (!isValidTab(tab)) {
    return res.status(400).json({ error: `Unknown tab "${tab}"` });
  }

  console.log(`[API] Fetching news for tab: ${tab}, force: ${force}`);
  try {
    const feed = await getFeed(tab, { force });
    res.json(feed);
  } catch (err) {
    console.error("[/api/news]", err);
    res.status(502).json({ error: "Failed to build the news feed", detail: err.message });
  }
});

// POST /api/ask  { question, storyContext? }
app.post("/api/ask", async (req, res) => {
  const question = String(req.body?.question || "").trim();
  const storyContext = req.body?.storyContext ? String(req.body.storyContext).trim() : null;

  if (!question) {
    return res.status(400).json({ error: "A question is required" });
  }

  try {
    const result = await ask(question, storyContext);
    res.json(result);
  } catch (err) {
    console.error("[/api/ask]", err);
    res.status(502).json({ error: "The assistant could not answer", detail: err.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`Mumbai Real Estate Brief API listening on :${PORT}`);

  // Start background news refresh scheduler (Tavily → Gemini → SQLite)
  startScheduler();
});
