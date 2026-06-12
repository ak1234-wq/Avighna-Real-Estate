// Background scheduler: every 2 hours, fetch fresh news from RSS feeds,
// summarize with Gemini, and store in SQLite.
// Users always get instant DB reads — no AI wait on requests.

import cron from "node-cron";
import { TABS } from "./sources.js";
import { fetchAllForTab } from "./searchService.js";
import { summarizeBatch } from "./summarizer.js";
import { upsertMany, deleteOldArticles, getTabCounts } from "./db.js";

const CRON_EXPR = process.env.FEED_REFRESH_CRON || "0 */2 * * *"; // every 2 hours

/**
 * Refresh a single tab:
 *  1. Fetch RSS feeds (Google News + direct publishers)
 *  2. Take top 15 newest articles
 *  3. Summarize with Gemini (single batch call)
 *  4. Store in SQLite
 */
export async function refreshTab(tabKey) {
  const tab = TABS[tabKey];
  if (!tab) return;

  console.log(`[Scheduler] Refreshing tab: ${tabKey} (${tab.label})`);
  const startTime = Date.now();

  try {
    // Step 1: Fetch all RSS feeds for this tab
    const articles = await fetchAllForTab(tabKey, tab);

    if (!articles.length) {
      console.warn(`[Scheduler] No articles found for tab: ${tabKey}`);
      return;
    }

    // Step 2: Take top 15 (already sorted by date — newest first)
    const top = articles.slice(0, 15);

    // Step 3: Summarize with Gemini
    const summarized = await summarizeBatch(top, tab.label);

    // Step 4: Store in DB
    const toStore = summarized.map((a) => ({
      tab: tabKey,
      title: a.title,
      tldr: a.tldr,
      url: a.url,
      source: a.source || extractSource(a.url),
      published_at: a.publishedDate || new Date().toISOString(),
      relevance: 5,
    }));

    upsertMany(toStore);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Scheduler] Tab "${tabKey}" done: ${toStore.length} articles stored in ${elapsed}s`);

  } catch (err) {
    console.error(`[Scheduler] Error refreshing tab "${tabKey}":`, err.message);
  }
}

/**
 * Refresh ALL tabs sequentially with a 3s gap between each tab.
 */
export async function refreshAllTabs() {
  console.log("[Scheduler] Starting full refresh of all tabs...");

  for (const tabKey of Object.keys(TABS)) {
    await refreshTab(tabKey);
    // 3s pause between tabs — RSS is fast but Gemini summarizer needs breathing room
    await new Promise((r) => setTimeout(r, 3000));
  }

  // Cleanup: delete articles older than 7 days
  const deleted = deleteOldArticles(7);
  console.log(`[Scheduler] Cleanup: removed ${deleted.changes} old articles`);

  const counts = getTabCounts();
  console.log("[Scheduler] DB stats:", counts.map((c) => `${c.tab}:${c.count}`).join(", "));
}

/**
 * Start cron scheduler + immediate first fetch on boot.
 */
export function startScheduler() {
  console.log(`[Scheduler] Starting with cron: "${CRON_EXPR}"`);

  cron.schedule(CRON_EXPR, () => {
    refreshAllTabs().catch((err) =>
      console.error("[Scheduler] Uncaught error in refresh:", err)
    );
  });

  // Run immediately on startup
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
