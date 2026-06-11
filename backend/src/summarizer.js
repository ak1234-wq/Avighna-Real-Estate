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

  try {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 1500,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 },
        // NO googleSearch tool here — Gemini only reads what we give it
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
    console.error("[Summarizer] Failed to summarize batch:", err.message);
    // Fallback: use raw content snippet as tldr
    return articles.map((a) => ({
      ...a,
      tldr: a.content?.slice(0, 200) || "Summary not available.",
    }));
  }
}
