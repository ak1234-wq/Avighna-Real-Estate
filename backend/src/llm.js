// Single AI dependency for the whole app: news summaries AND the Ask assistant both run
// through here. Uses Google Gemini with the built-in Google Search grounding tool, which
// does the live web search and returns real source citations.
// Swap the provider here if you ever move off Gemini — keep the runWithWebSearch() contract.

import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Runs a single prompt with Google Search grounding and returns { text, citations }.
// Retries once on transient 429/503 (Gemini's free tier returns these under load).
export async function runWithWebSearch(prompt, { maxTokens = 2048 } = {}) {
  const request = {
    model: MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      maxOutputTokens: maxTokens,
      temperature: 0.2,
      // Disable the model's "thinking" phase — on 2.5-flash it can consume the entire
      // output-token budget and truncate the answer (we saw finishReason: MAX_TOKENS with
      // empty/partial JSON). Grounding still works; we just want direct output.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  let response;
  try {
    response = await getClient().models.generateContent(request);
  } catch (err) {
    if (err?.status === 429 || err?.status === 503) {
      await new Promise((r) => setTimeout(r, 1500));
      response = await getClient().models.generateContent(request);
    } else {
      throw err;
    }
  }

  const text = (response.text || "").trim();
  const citations = extractCitations(response);

  return { text, citations };
}

// Pull grounded sources out of Gemini's groundingMetadata.
function extractCitations(response) {
  const chunks = response?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const citations = [];
  const seen = new Set();
  for (const chunk of chunks) {
    const web = chunk?.web;
    if (!web?.uri || seen.has(web.uri)) continue;
    seen.add(web.uri);
    citations.push({ title: web.title || web.uri, url: web.uri });
  }
  return citations;
}

// Best-effort extraction of a JSON object from a model reply that may have stray text
// or markdown code fences around it.
export function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  let jsonString = text.slice(start, end + 1);
  // Remove literal newlines and control characters that break JSON.parse
  jsonString = jsonString.replace(/[\n\r\t]/g, " ").replace(/[\u0000-\u001F]+/g, "");
  return JSON.parse(jsonString);
}
