// News feed service: fetches + summarises stories per tab, with a short in-memory cache
// so we don't hit the AI/web-search API on every page load.

import { runWithWebSearch, extractJson } from "./llm.js";
import { buildFeedPrompt, TABS } from "./prompts.js";

const CACHE_TTL_MS = Number(process.env.FEED_CACHE_TTL_MS || 10 * 60 * 1000); // 10 min
const cache = new Map(); // tabKey -> { at, payload }

export function isValidTab(tabKey) {
  return Object.prototype.hasOwnProperty.call(TABS, tabKey);
}

export async function getFeed(tabKey, { force = false } = {}) {
  const cached = cache.get(tabKey);
  if (!force && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ...cached.payload, cached: true };
  }

  const excludeTitles = (force && cached && cached.payload.stories) 
    ? cached.payload.stories.map(s => s.title) 
    : [];

  const prompt = buildFeedPrompt(tabKey, excludeTitles);
  const { text, citations } = await runWithWebSearch(prompt, { maxTokens: 2200 });

  let stories = [];
  try {
    const parsed = extractJson(text);
    if (parsed && Array.isArray(parsed.stories)) {
      stories = parsed.stories.map((s, index) => {
        if (!s || !s.title) return null;
        // Use real grounded citation URL if available to prevent 404s, fallback to AI generated
        let rawUrl = (citations && citations[index] && citations[index].url) ? citations[index].url : s.url;
        let url = rawUrl ? String(rawUrl).trim() : "";
        
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }
        return {
          title: String(s.title).trim(),
          tldr: String(s.tldr || "").trim(),
          source: String(s.source || "Source").trim(),
          url: url,
          published: String(s.published || "recent").trim(),
        };
      });
      // Filter out invalid items AFTER mapping to preserve citation indices
      stories = stories.filter((s) => s !== null && s.url);
    }
  } catch (err) {
    console.error(`[feed:${tabKey}] failed to parse model output:`, err.message);
    throw new Error("Could not parse news feed from AI response");
  }

  // Parse relative date string to sort chronologically (newest first)
  const parseRelativeDate = (str) => {
    const s = String(str).toLowerCase();
    const num = parseInt(s) || 1;
    if (s.includes("min") || s.includes("hour") || s.includes("today") || s.includes("now")) return 0;
    if (s.includes("day")) return num;
    if (s.includes("week")) return num * 7;
    if (s.includes("month")) return num * 30;
    if (s.includes("year")) return num * 365;
    return 999;
  };

  stories.sort((a, b) => parseRelativeDate(a.published) - parseRelativeDate(b.published));

  const payload = {
    tab: tabKey,
    scope: TABS[tabKey].scope,
    stories,
    updatedAt: new Date().toISOString(),
  };

  cache.set(tabKey, { at: Date.now(), payload });
  return { ...payload, cached: false };
}
