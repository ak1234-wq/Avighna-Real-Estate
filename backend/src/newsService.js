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

  const prompt = buildFeedPrompt(tabKey);
  const { text } = await runWithWebSearch(prompt, { maxTokens: 2200 });

  let stories = [];
  try {
    const parsed = extractJson(text);
    stories = Array.isArray(parsed.stories) ? parsed.stories : [];
  } catch (err) {
    console.error(`[feed:${tabKey}] failed to parse model output:`, err.message);
    throw new Error("Could not parse news feed from AI response");
  }

  stories = stories
    .filter((s) => s && s.title && s.url)
    .map((s) => ({
      title: String(s.title).trim(),
      tldr: String(s.tldr || "").trim(),
      source: String(s.source || "Source").trim(),
      url: String(s.url).trim(),
      published: String(s.published || "recent").trim(),
    }));

  const payload = {
    tab: tabKey,
    scope: TABS[tabKey].scope,
    stories,
    updatedAt: new Date().toISOString(),
  };

  cache.set(tabKey, { at: Date.now(), payload });
  return { ...payload, cached: false };
}
