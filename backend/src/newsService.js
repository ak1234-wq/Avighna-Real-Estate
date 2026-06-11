// News service: now reads from SQLite instead of calling AI on every request.
// The background scheduler (scheduler.js) keeps the DB fresh every 30 minutes.
// If the DB is empty for a tab, we trigger an on-demand refresh.

import { getArticlesByTab } from "./db.js";
import { refreshTab } from "./scheduler.js";
import { TABS, isValidTab } from "./sources.js";

export { isValidTab };

/**
 * Get the news feed for a tab.
 * Reads from DB (instant). If DB is empty, triggers a live refresh.
 *
 * @param {string} tabKey
 * @param {object} options
 * @param {boolean} options.force - If true, trigger a fresh Tavily fetch now
 */
export async function getFeed(tabKey, { force = false } = {}) {
  if (force) {
    // User clicked Refresh — fetch fresh from Tavily right now
    await refreshTab(tabKey);
  }

  const rows = getArticlesByTab(tabKey, 10);

  // If DB is empty (first boot, tab never fetched), do a live refresh
  if (rows.length === 0) {
    console.log(`[newsService] No data for tab "${tabKey}", triggering live fetch...`);
    await refreshTab(tabKey);
    const freshRows = getArticlesByTab(tabKey, 10);
    return buildResponse(tabKey, freshRows, false);
  }

  return buildResponse(tabKey, rows, !force);
}

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
    scope: tab?.scope || "Mumbai",
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
