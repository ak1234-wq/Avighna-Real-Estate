// RSS-based search service.
// Primary: Google News RSS (50,000+ sources, unlimited, free, no API key)
// Supplement: Direct publisher RSS feeds for guaranteed coverage of key Indian sources
//
// This replaces Tavily entirely — zero API cost for search.

import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000, // 10s timeout per feed
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; AvighnaBrief/1.0)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [["media:content", "media"], ["dc:creator", "creator"]],
  },
});

// ── Google News RSS ──────────────────────────────────────────────────────────

/**
 * Fetch articles from Google News RSS for a search query.
 * Google News indexes 50,000+ publishers — covers the entire internet.
 * No API key needed. No rate limits.
 *
 * @param {string} query - Search query (e.g. "Mumbai real estate")
 * @param {string} lang - Language code (default: en-IN)
 * @param {string} country - Country code (default: IN)
 * @returns {Array} Normalized article objects
 */
export async function fetchGoogleNewsRSS(query, lang = "en-IN", country = "IN") {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=${lang}&gl=${country}&ceid=${country}:${lang.split("-")[0]}`;

  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => normalizeArticle(item, "Google News"));
  } catch (err) {
    console.error(`[RSS] Google News failed for "${query}":`, err.message);
    return [];
  }
}

// ── Direct Publisher RSS ──────────────────────────────────────────────────────

/**
 * Fetch articles from a direct publisher RSS feed URL.
 *
 * @param {string} feedUrl - RSS feed URL
 * @param {string} sourceName - Publisher name for display
 * @returns {Array} Normalized article objects
 */
export async function fetchDirectRSS(feedUrl, sourceName) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items || []).map((item) => normalizeArticle(item, sourceName));
  } catch (err) {
    console.error(`[RSS] Direct feed failed for "${sourceName}" (${feedUrl}):`, err.message);
    return [];
  }
}

// ── Tab-level aggregation ────────────────────────────────────────────────────

/**
 * Fetch all RSS feeds for a tab config, merge, deduplicate, sort by date.
 *
 * @param {string} tabKey - Tab identifier
 * @param {object} tabConfig - Tab config from sources.js
 * @returns {Array} Deduplicated, sorted articles
 */
export async function fetchAllForTab(tabKey, tabConfig) {
  console.log(`[RSS] Fetching feeds for tab: ${tabKey} (${tabConfig.label})`);

  const promises = [];

  // Google News queries (primary — covers entire internet)
  for (const query of tabConfig.googleNewsQueries || []) {
    promises.push(
      fetchGoogleNewsRSS(query, tabConfig.lang || "en-IN", tabConfig.country || "IN")
    );
  }

  // Direct publisher feeds (supplement — guaranteed key publishers)
  for (const feed of tabConfig.directFeeds || []) {
    promises.push(fetchDirectRSS(feed.url, feed.name));
  }

  const results = await Promise.all(promises);

  // Flatten + deduplicate by cleaned URL
  const seen = new Set();
  const merged = [];

  for (const batch of results) {
    for (const article of batch) {
      const cleanUrl = cleanURL(article.url);
      if (cleanUrl && !seen.has(cleanUrl)) {
        seen.add(cleanUrl);
        merged.push(article);
      }
    }
  }

  // Sort by date (newest first)
  merged.sort((a, b) => {
    const da = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const db = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return db - da;
  });

  console.log(`[RSS] Tab "${tabKey}": ${merged.length} unique articles from ${promises.length} feeds`);
  return merged;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize an RSS item into our standard article format.
 */
function normalizeArticle(item, fallbackSource) {
  // Google News wraps actual article URL in a redirect — extract the real one
  let url = item.link || item.guid || "";

  // Google News sometimes uses redirect URLs like:
  // https://news.google.com/rss/articles/... → extract real URL from content
  // But the RSS <link> is usually the direct publisher URL, so this is fine.

  // Extract source from title: "Headline - Publisher Name"
  let title = (item.title || "").trim();
  let source = fallbackSource;

  // Google News format: "Article Title - Publisher Name"
  const dashIdx = title.lastIndexOf(" - ");
  if (dashIdx > 0 && fallbackSource === "Google News") {
    source = title.slice(dashIdx + 3).trim();
    title = title.slice(0, dashIdx).trim();
  }

  // Clean up HTML from description/content
  const rawContent = item.contentSnippet || item.content || item.summary || "";
  const content = rawContent
    .replace(/<[^>]+>/g, "")  // strip HTML
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 500);

  return {
    title,
    url,
    content,
    source,
    publishedDate: item.isoDate || item.pubDate || null,
    score: 1, // RSS doesn't have relevance scores — all equal
  };
}

/**
 * Clean URL for deduplication: remove tracking params, normalize.
 */
function cleanURL(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    // Remove common tracking params
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    u.searchParams.delete("ref");
    u.searchParams.delete("source");
    return u.toString();
  } catch {
    return url;
  }
}
