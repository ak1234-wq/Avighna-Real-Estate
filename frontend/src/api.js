// Tiny API client. In production set VITE_API_BASE_URL to your Render URL.
// In dev it's empty, so requests hit /api and Vite proxies them to the backend.

import { mockFeed, mockAsk } from "./mocks.js";

const BASE = import.meta.env.VITE_API_BASE_URL || "";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "1";

export async function fetchNews(tab, { force = false } = {}) {
  if (USE_MOCK) return mockFeed(tab);
  const params = new URLSearchParams({ tab });
  if (force) params.set("force", "1");
  const res = await fetch(`${BASE}/api/news?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || "Failed to load news");
  }
  return res.json();
}

export async function askAssistant(question, storyContext) {
  if (USE_MOCK) return mockAsk(question);
  const res = await fetch(`${BASE}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, storyContext }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.error || "The assistant could not answer");
  }
  return res.json();
}
