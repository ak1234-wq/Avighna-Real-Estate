// Conversational assistant service. Answers a free-text question (optionally scoped to a
// specific story) using live web search, returning a plain-language answer plus source links.

import { runWithWebSearch } from "./llm.js";
import { buildAskPrompt } from "./prompts.js";

export async function ask(question, storyContext) {
  const prompt = buildAskPrompt(question, storyContext);
  const { text, citations } = await runWithWebSearch(prompt, { maxTokens: 1200 });

  return {
    answer: text,
    sources: citations,
    answeredAt: new Date().toISOString(),
  };
}
