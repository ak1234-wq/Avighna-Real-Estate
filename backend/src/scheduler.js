// Background scheduler: every 30 min, fetch fresh news for all tabs via
// Tavily (primary) + Gemini grounded search (supplement), then store in SQLite.
// Users always get instant DB reads — no AI wait on their requests.

import cron from "node-cron";
import { TABS } from "./sources.js";
import { searchAllQueriesForTab, searchWithGemini, mergeResults } from "./searchService.js";
import { summarizeBatch } from "./summarizer.js";
import { upsertMany, deleteOldArticles, getTabCounts } from "./db.js";

const CRON_EXPR = process.env.FEED_REFRESH_CRON || "*/30 * * * *";

/**
 * Refresh a single tab:
 *  1. Tavily search (primary, real URLs)
 *  2. Gemini grounded search (supplement if Tavily count < geminiMinTrigger)
 *  3. Gemini summarize batch → generate tldr per article
 *  4. Upsert into SQLite
 */
export async function refreshTab(tabKey) {
  const tab = TABS[tabKey];
  if (!tab) return;

  console.log(`[Scheduler] Refreshing tab: ${tabKey} (${tab.label})`);
  const startTime = Date.now();

  try {
    // Step 1: Primary — Tavily internet search
    let articles = await searchAllQueriesForTab(
      tabKey,
      tab.queries,
      tab.excludeDomains
    );

    // Step 2: Supplement — Gemini grounded search if Tavily gives too few
    const minNeeded = tab.geminiMinTrigger ?? 5;
    if (articles.length < minNeeded && tab.geminiQuery) {
      console.log(
        `[Scheduler] Tab "${tabKey}": only ${articles.length} from Tavily ` +
        `(threshold: ${minNeeded}) → triggering Gemini supplement...`
      );
      const geminiArticles = await searchWithGemini(tab.geminiQuery, tab.label);
      articles = mergeResults(articles, geminiArticles);
      console.log(`[Scheduler] Tab "${tabKey}": ${articles.length} total after merge`);
    }

    if (!articles.length) {
      console.warn(`[Scheduler] No articles found for tab: ${tabKey}`);
      return;
    }

    // Step 3: Take top 15 by relevance score
    const top = articles.slice(0, 15);

    // Step 4: Summarize with Gemini (single batch call — has retry logic)
    const summarized = await summarizeBatch(top, tab.label);

    // Step 5: Map to DB schema and upsert (duplicates ignored by URL)
    const toStore = summarized.map((a) => ({
      tab: tabKey,
      title: a.title,
      tldr: a.tldr,
      url: a.url,
      source: a.source || extractSource(a.url),
      published_at: a.published_date || new Date().toISOString(),
      relevance: Math.round((a.score || 0.5) * 10),
    }));

    upsertMany(toStore);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Scheduler] Tab "${tabKey}" done: ${toStore.length} articles stored in ${elapsed}s`);

  } catch (err) {
    console.error(`[Scheduler] Error refreshing tab "${tabKey}":`, err.message);
  }
}

/**
 * Refresh ALL tabs sequentially with a 5s gap between each tab
 * to avoid hammering Gemini summarizer simultaneously (503 overload).
 */
export async function refreshAllTabs() {
  console.log("[Scheduler] Starting full refresh of all tabs...");

  for (const tabKey of Object.keys(TABS)) {
    await refreshTab(tabKey);
    // 5s pause — lets Gemini recover between tabs
    await new Promise((r) => setTimeout(r, 5000));
  }

  // Cleanup: delete articles older than 7 days
  const deleted = deleteOldArticles(7);
  console.log(`[Scheduler] Cleanup: removed ${deleted.changes} old articles`);

  const counts = getTabCounts();
  console.log("[Scheduler] DB stats:", counts.map((c) => `${c.tab}:${c.count}`).join(", "));
}

/**
 * Start the cron scheduler and run an immediate refresh on boot.
 */
export function startScheduler() {
  console.log(`[Scheduler] Starting with cron: "${CRON_EXPR}"`);

  cron.schedule(CRON_EXPR, () => {
    refreshAllTabs().catch((err) =>
      console.error("[Scheduler] Uncaught error in refresh:", err)
    );
  });

  // Run immediately on startup so DB has data right away
  console.log("[Scheduler] Running initial refresh on startup...");
  refreshAllTabs().catch((err) =>
    console.error("[Scheduler] Initial refresh failed:", err)
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────

function extractSource(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}
