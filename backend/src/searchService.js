// Tavily search service — replaces Gemini's built-in Google Search grounding.
// Tavily searches the ENTIRE internet and returns REAL URLs + article content.
// Gemini is no longer responsible for finding news — only for summarizing it.

import { tavily } from "@tavily/core";

let client;
function getClient() {
  if (!client) {
    if (!process.env.TAVILY_API_KEY) {
      throw new Error("TAVILY_API_KEY is not set. Get a free key at https://app.tavily.com");
    }
    client = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return client;
}

/**
 * Search the internet for news articles on a given query.
 * Returns an array of raw results: { title, url, content, score, published_date }
 *
 * @param {string} query     - Search query string
 * @param {string[]} excludeDomains - Domains to exclude (e.g. ["youtube.com"])
 * @param {number}  maxResults - Max articles to return per query (default 7)
 */
export async function searchNews(query, excludeDomains = [], maxResults = 7) {
  const tv = getClient();

  try {
    const response = await tv.search(query, {
      searchDepth: "advanced",    // Deep search = better quality results
      topic: "news",              // Focus on news articles only
      maxResults,
      excludeDomains,
      includeAnswer: false,       // We only want raw articles, not AI summary
      includeRawContent: false,   // Excerpts are enough for our summarizer
    });

    // Normalize results
    return (response.results || []).map((r) => ({
      title: (r.title || "").trim(),
      url: (r.url || "").trim(),
      content: (r.content || r.snippet || "").trim(),  // article excerpt
      score: r.score || 0,        // Tavily relevance score 0–1
      published_date: r.publishedDate || null,
    })).filter((r) => r.title && r.url);   // Drop empty results

  } catch (err) {
    console.error(`[Tavily] Search failed for query "${query}":`, err.message);
    return [];   // Don't crash the pipeline — just return empty
  }
}

/**
 * Run all queries for a tab in parallel and merge + deduplicate results.
 * Also applies a geo-relevance filter using mustContainAny keywords.
 *
 * @param {string}   tabKey
 * @param {string[]} queries
 * @param {string[]} excludeDomains
 * @param {string[]} mustContainAny - At least one of these must appear in title/content (lowercase)
 */
export async function searchAllQueriesForTab(tabKey, queries, excludeDomains = [], mustContainAny = []) {
  console.log(`[Tavily] Searching ${queries.length} queries for tab: ${tabKey}`);

  // Run all queries in parallel
  const results = await Promise.all(
    queries.map((q) => searchNews(q, excludeDomains))
  );

  // Flatten + deduplicate by URL
  const seen = new Set();
  const merged = [];

  for (const batch of results) {
    for (const article of batch) {
      if (!seen.has(article.url)) {
        seen.add(article.url);
        merged.push(article);
      }
    }
  }

  // Post-filter: drop articles that don't mention required keywords
  const filtered = mustContainAny.length === 0
    ? merged
    : merged.filter((a) => {
        const text = `${a.title} ${a.content}`.toLowerCase();
        return mustContainAny.some((kw) => text.includes(kw.toLowerCase()));
      });

  const dropped = merged.length - filtered.length;
  if (dropped > 0) {
    console.log(`[Tavily] Tab "${tabKey}": filtered out ${dropped} off-topic articles`);
  }

  // Sort by relevance score descending
  filtered.sort((a, b) => b.score - a.score);

  console.log(`[Tavily] Tab "${tabKey}": found ${filtered.length} unique articles`);
  return filtered;
}
