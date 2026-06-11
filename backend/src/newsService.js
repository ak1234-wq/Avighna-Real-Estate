// News service: reads from SQLite instantly.
// Background scheduler (scheduler.js) keeps DB fresh every 30 minutes.
// Force refresh fires a background job and returns current data immediately
// (avoids Render's 30s request timeout).

import { getArticlesByTab } from "./db.js";
import { refreshTab } from "./scheduler.js";
import { TABS, isValidTab } from "./sources.js";

export { isValidTab };

// Track tabs currently being refreshed — prevents duplicate concurrent jobs
const refreshingTabs = new Set();

/**
 * Get the news feed for a tab.
 *
 * Normal load  → DB read, instant (<50ms)
 * force=true   → fires background refresh, returns CURRENT data immediately.
 *               Frontend re-fetches after 35s to show the fresh results.
 */
export async function getFeed(tabKey, { force = false } = {}) {
  const rows = getArticlesByTab(tabKey, 10);

  // First boot / tab never fetched → wait for one real fetch
  if (rows.length === 0) {
    console.log(`[newsService] No data for "${tabKey}", awaiting first fetch...`);
    await refreshTab(tabKey);
    const freshRows = getArticlesByTab(tabKey, 10);
    return buildResponse(tabKey, freshRows, false);
  }

  // Force refresh: fire-and-forget background job, return current data NOW
  if (force && !refreshingTabs.has(tabKey)) {
    refreshingTabs.add(tabKey);
    console.log(`[newsService] Background refresh started for "${tabKey}"`);
    refreshTab(tabKey)
      .then(() => console.log(`[newsService] Background refresh done for "${tabKey}"`))
      .catch((err) => console.error(`[newsService] Refresh error for "${tabKey}":`, err.message))
      .finally(() => refreshingTabs.delete(tabKey));
  } else if (force) {
    console.log(`[newsService] Refresh already running for "${tabKey}", skipping`);
  }

  // Return current data immediately — frontend will auto re-fetch in 35s
  return { ...buildResponse(tabKey, rows, false), backgroundRefresh: force };
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
