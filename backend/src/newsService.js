// News service: reads from SQLite instantly.
// Background scheduler keeps DB fresh every 2 hours.
//
// REFRESH BUTTON: RSS is fast (<3s), so force refresh is SYNCHRONOUS —
// fetches RSS → summarizes → updates DB → returns fresh news instantly.
// (No background job needed — unlike Tavily which took 30-40s)

import { getArticlesByTab, deleteArticlesByTab } from "./db.js";
import { refreshTab } from "./scheduler.js";
import { TABS, isValidTab } from "./sources.js";

export { isValidTab };

/**
 * Get the news feed for a tab.
 *
 * Normal load  → DB read, instant (<50ms)
 * force=true   → RSS fetch + Gemini summarize + DB update → return FRESH news
 *                Takes ~8-10 seconds (RSS=2s + Gemini=6s) — acceptable for a refresh click
 */
export async function getFeed(tabKey, { force = false } = {}) {
  // Force refresh: fetch fresh RSS, summarize, update DB, return new data
  if (force) {
    console.log(`[newsService] Force refresh for "${tabKey}" — fetching fresh RSS...`);
    try {
      // Delete old articles for this tab so fresh ones take their place
      deleteArticlesByTab(tabKey);
      // Fetch RSS + summarize + store in DB
      await refreshTab(tabKey);
      console.log(`[newsService] Force refresh done for "${tabKey}"`);
    } catch (err) {
      console.error(`[newsService] Force refresh failed for "${tabKey}":`, err.message);
      // If refresh fails, we'll still return whatever's in DB
    }
  }

  const rows = getArticlesByTab(tabKey, 10);

  // First boot / tab never fetched → wait for one real fetch
  if (rows.length === 0) {
    console.log(`[newsService] No data for "${tabKey}", awaiting first fetch...`);
    await refreshTab(tabKey);
    const freshRows = getArticlesByTab(tabKey, 10);
    return buildResponse(tabKey, freshRows, false);
  }

  return buildResponse(tabKey, rows, !force);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildResponse(tabKey, rows, cached) {
  const tab = TABS[tabKey];
  const stories = rows.map((row) => ({
    title: row.title,
    tldr: row.tldr || "",
    source: row.source || "Source",
    url: row.url,
    published: formatPublished(row.published_at),
  }));

  return {
    tab: tabKey,
    scope: tab?.scope || "Mumbai & India",
    stories,
    updatedAt: rows[0]?.fetched_at || new Date().toISOString(),
    cached,
  };
}

function formatPublished(dateStr) {
  if (!dateStr) return "recent";
  try {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
    return `${Math.floor(diffDays / 30)} month${diffDays >= 60 ? "s" : ""} ago`;
  } catch {
    return "recent";
  }
}
