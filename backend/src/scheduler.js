// Background scheduler: every 30 min, fetch fresh news from Tavily for all tabs,
// summarize with Gemini, and store in SQLite. Users always get instant DB reads.

import cron from "node-cron";
import { TABS } from "./sources.js";
import { searchAllQueriesForTab } from "./searchService.js";
import { summarizeBatch } from "./summarizer.js";
import { upsertMany, deleteOldArticles, getTabCounts } from "./db.js";

const CRON_EXPR = process.env.FEED_REFRESH_CRON || "*/30 * * * *"; // every 30 min

/**
 * Run the full pipeline for a single tab:
 *   Tavily search → filter → Gemini summarize → DB upsert
 */
export async function refreshTab(tabKey) {
  const tab = TABS[tabKey];
  if (!tab) return;

  console.log(`[Scheduler] Refreshing tab: ${tabKey} (${tab.label})`);
  const startTime = Date.now();

  try {
    // Step 1: Search internet via Tavily
    const rawArticles = await searchAllQueriesForTab(
      tabKey,
      tab.queries,
      tab.excludeDomains,
      tab.mustContainAny || []
    );

    if (!rawArticles.length) {
      console.warn(`[Scheduler] No articles found for tab: ${tabKey}`);
      return;
    }

    // Step 2: Take top 15 by relevance score (avoid over-summarizing)
    const top = rawArticles.slice(0, 15);

    // Step 3: Summarize with Gemini (batch call — single API request)
    const summarized = await summarizeBatch(top, tab.label);

    // Step 4: Map to DB schema and upsert
    const toStore = summarized.map((a) => ({
      tab: tabKey,
      title: a.title,
      tldr: a.tldr,
      url: a.url,
      source: extractSource(a.url),
      published_at: a.published_date || new Date().toISOString(),
      relevance: Math.round((a.score || 0.5) * 10), // 0-10 scale
    }));

    upsertMany(toStore);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Scheduler] Tab "${tabKey}" done: ${toStore.length} articles stored in ${elapsed}s`
    );
  } catch (err) {
    console.error(`[Scheduler] Error refreshing tab "${tabKey}":`, err.message);
  }
}

/**
 * Refresh ALL tabs — runs sequentially to avoid hitting API rate limits.
 */
export async function refreshAllTabs() {
  console.log("[Scheduler] Starting full refresh of all tabs...");

  // Run tabs one by one (sequential) with a small delay between each
  // to avoid hammering Gemini summarizer simultaneously (causes 503s)
  for (const tabKey of Object.keys(TABS)) {
    await refreshTab(tabKey);
    // 5s pause between tabs — gives Gemini time to recover
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Cleanup: delete articles older than 7 days
  const deleted = deleteOldArticles(7);
  console.log(`[Scheduler] Cleanup: removed ${deleted.changes} old articles`);

  // Log DB stats
  const counts = getTabCounts();
  console.log("[Scheduler] DB stats:", counts.map((c) => `${c.tab}:${c.count}`).join(", "));
}

/**
 * Start the cron scheduler and run an initial refresh immediately on boot.
 */
export function startScheduler() {
  console.log(`[Scheduler] Starting with cron: "${CRON_EXPR}"`);

  // Validate cron expression
  if (!cron.validate(CRON_EXPR)) {
    console.error(`[Scheduler] Invalid cron expression: "${CRON_EXPR}". Using default.`);
  }

  // Schedule recurring job
  cron.schedule(CRON_EXPR, () => {
    refreshAllTabs().catch((err) =>
      console.error("[Scheduler] Uncaught error in refresh:", err)
    );
  });

  // Run once immediately on startup (so DB has data right away)
  console.log("[Scheduler] Running initial refresh on startup...");
  refreshAllTabs().catch((err) =>
    console.error("[Scheduler] Initial refresh failed:", err)
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Extract readable domain name from URL as source label */
function extractSource(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return "Source";
  }
}
