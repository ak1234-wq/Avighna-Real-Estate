// Summarizer: takes raw Tavily articles and uses Gemini to generate
// a clean 2-line tldr for each. Gemini does NOT search here —
// it only reads the content we already fetched from Tavily.

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * Given a batch of raw Tavily articles, ask Gemini to produce a tldr for each.
 * Gemini does NOT use web search here — we pass the article content directly.
 *
 * @param {Array} articles - Raw articles from Tavily
 * @param {string} tabLabel - Tab name for context ("Laws", "Projects" etc.)
 * @returns {Array} - Same articles with `tldr` field added
 */
export async function summarizeBatch(articles, tabLabel = "Real Estate") {
  if (!articles.length) return [];

  // Build a numbered list of articles for Gemini
  const articleList = articles
    .map(
      (a, i) =>
        `[${i + 1}] Title: ${a.title}\nContent: ${a.content?.slice(0, 400) || "N/A"}`
    )
    .join("\n\n");

  const prompt = `You are a news editor for a Mumbai Real Estate intelligence platform.
Category: "${tabLabel}"

Below are ${articles.length} news article excerpts fetched from the internet.
For each article, write a factual 1–2 sentence tldr that explains WHY this matters to a real estate developer.

Return ONLY a JSON array (no markdown, no extra text) in this exact format:
[
  { "index": 1, "tldr": "..." },
  { "index": 2, "tldr": "..." }
]

Rules:
- Keep each tldr under 220 characters
- Be factual, no hype
- If the content is too vague, write "Details awaited." as the tldr

Articles:
${articleList}`;

  // Retry up to 3 times on 503/429 (Gemini overload)
  let retries = 3;
  let delay = 3000;

  while (true) {
    try {
      const response = await getClient().models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 1500,
          temperature: 0.1,
          thinkingConfig: { thinkingBudget: 0 },
          // NO googleSearch tool — Gemini only reads what we give it
        },
      });

      const raw = (response.text || "").trim();

      // Extract JSON array from response
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]");
      if (start === -1 || end === -1) throw new Error("No JSON array in response");

      const parsed = JSON.parse(raw.slice(start, end + 1));

      // Map tldrs back to articles
      return articles.map((article, i) => {
        const match = parsed.find((p) => p.index === i + 1);
        return {
          ...article,
          tldr: match?.tldr || "Summary not available.",
        };
      });

    } catch (err) {
      const status = err?.status || err?.error?.code;
      const isOverload = status === 503 || status === 429 ||
        (err.message || "").includes("503") || (err.message || "").includes("429");

      if (isOverload && retries > 0) {
        retries--;
        console.warn(`[Summarizer] Gemini overloaded (${status}), retrying in ${delay/1000}s... (${retries} left)`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2; // exponential backoff: 3s → 6s → 12s
        continue;
      }

      console.error("[Summarizer] Failed after retries:", err.message);
      // Fallback: use raw content snippet as tldr
      return articles.map((a) => ({
        ...a,
        tldr: a.content?.slice(0, 220) || "Summary not available.",
      }));
    }
  }
}
