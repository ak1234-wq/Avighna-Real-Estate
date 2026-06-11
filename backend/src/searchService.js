// Dual search engine: Tavily (primary) + Gemini grounded (supplement/fallback)
// Tavily gives real URLs. Gemini supplements when Tavily finds too few results.

import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

// ── Tavily client ─────────────────────────────────────────────────────────────
let tavilyClient;
function getTavily() {
  if (!tavilyClient) {
    if (!process.env.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not set");
    tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return tavilyClient;
}

// ── Gemini client ─────────────────────────────────────────────────────────────
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let geminiClient;
function getGemini() {
  if (!geminiClient) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// ── Tavily search ─────────────────────────────────────────────────────────────

/**
 * Search via Tavily for news articles.
 * Returns: [{ title, url, content, score, published_date }]
 */
export async function searchNews(query, excludeDomains = [], maxResults = 7) {
  try {
    const response = await getTavily().search(query, {
      searchDepth: "advanced",
      topic: "news",
      maxResults,
      excludeDomains,
      includeAnswer: false,
      includeRawContent: false,
    });
    return (response.results || [])
      .map((r) => ({
        title: (r.title || "").trim(),
        url: (r.url || "").trim(),
        content: (r.content || r.snippet || "").trim(),
        score: r.score || 0,
        published_date: r.publishedDate || null,
      }))
      .filter((r) => r.title && r.url);
  } catch (err) {
    console.error(`[Tavily] Search failed for "${query}":`, err.message);
    return [];
  }
}

/**
 * Run all Tavily queries for a tab in parallel, deduplicate by URL.
 */
export async function searchAllQueriesForTab(tabKey, queries, excludeDomains = []) {
  console.log(`[Tavily] Searching ${queries.length} queries for tab: ${tabKey}`);

  const results = await Promise.all(
    queries.map((q) => searchNews(q, excludeDomains))
  );

  // Deduplicate by URL
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

  merged.sort((a, b) => b.score - a.score);
  console.log(`[Tavily] Tab "${tabKey}": found ${merged.length} unique articles`);
  return merged;
}

// ── Gemini grounded search (supplement) ──────────────────────────────────────

/**
 * Use Gemini's Google Search grounding to find real estate news articles.
 * Returns articles in the same format as Tavily results.
 * Used as supplement when Tavily returns too few results.
 */
export async function searchWithGemini(geminiQuery, tabLabel) {
  console.log(`[Gemini] Supplemental search for tab: ${tabLabel}`);

  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Today is ${today}. You are a news researcher specializing in Indian real estate.

Use Google Search to find 5 recent news articles about: ${geminiQuery}

Return ONLY a JSON array (no markdown, no extra text):
[
  {
    "title": "exact article headline",
    "url": "https://direct-link-to-article",
    "source": "Publication name",
    "content": "2-3 sentence summary of the article",
    "published_date": "YYYY-MM-DD or relative like '2 days ago'"
  }
]

Rules:
- Only include REAL articles you actually found via search
- Only real estate, property, construction, legal/regulatory news related to India/Mumbai
- No YouTube, Reddit, Quora links
- No property listing pages (magicbricks, 99acres, housing.com)
- Must be from last 30 days
- Return valid JSON array only`;

  let retries = 2;
  let delay = 3000;

  while (true) {
    try {
      const response = await getGemini().models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          maxOutputTokens: 1500,
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      const raw = (response.text || "").trim();
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start === -1 || end === -1) return [];

      const parsed = JSON.parse(raw.slice(start, end + 1));

      // Normalize to same format as Tavily
      const articles = parsed
        .filter((a) => a && a.title && a.url)
        .filter((a) => a.url.startsWith("http"))
        .map((a) => ({
          title: String(a.title).trim(),
          url: String(a.url).trim(),
          content: String(a.content || "").trim(),
          score: 0.7, // default relevance for Gemini results
          published_date: a.published_date || null,
          source: a.source || null,
        }));

      console.log(`[Gemini] Tab "${tabLabel}": found ${articles.length} articles`);
      return articles;
    } catch (err) {
      const isOverload = (err?.status === 429 || err?.status === 503 ||
        (err.message || "").includes("503") || (err.message || "").includes("429"));

      if (isOverload && retries > 0) {
        retries--;
        console.warn(`[Gemini] Overloaded, retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      console.error(`[Gemini] Supplement search failed for "${tabLabel}":`, err.message);
      return [];
    }
  }
}

/**
 * Merge Tavily + Gemini results, deduplicate by URL.
 * Gemini results go at the END (Tavily is primary).
 */
export function mergeResults(tavilyResults, geminiResults) {
  const seen = new Set(tavilyResults.map((a) => a.url));
  const newFromGemini = geminiResults.filter((a) => !seen.has(a.url));
  return [...tavilyResults, ...newFromGemini];
}
