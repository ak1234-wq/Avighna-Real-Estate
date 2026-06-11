// Category definitions + prompt builders for the Mumbai Real Estate Brief.
// Each tab maps to a focused search brief so the model knows exactly what to look for.

export const TABS = {
  general: {
    label: "General",
    scope: "Mumbai",
    brief:
      "the most important recent Mumbai real-estate and property-market news overall: " +
      "major project launches, market trends, prices, infrastructure that moves property demand, " +
      "and significant regulatory or legal headlines.",
  },
  projects: {
    label: "Projects",
    scope: "Mumbai",
    brief:
      "new residential and commercial project launches, redevelopment and SRA schemes, " +
      "MHADA and MMRDA activity, and infrastructure projects (metro, roads, sea links) " +
      "that shape property demand across the Mumbai Metropolitan Region.",
  },
  laws: {
    label: "Laws",
    scope: "Mumbai",
    brief:
      "legal developments affecting Mumbai real estate: Bombay High Court and Supreme Court " +
      "rulings on property and redevelopment, MahaRERA orders and enforcement actions, " +
      "and tenancy or land-title judgements.",
  },
  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai",
    brief:
      "regulatory shifts affecting Mumbai property: DCPR 2034 amendments, ready-reckoner " +
      "(circle rate) revisions, FSI and premium changes, MahaRERA rule changes, and BMC / " +
      "state government circulars affecting development.",
  },
  ai: {
    label: "AI · Construction",
    scope: "Global",
    brief:
      "worldwide construction technology and AI news (NOT Mumbai-specific): AI estimating and " +
      "quantity takeoff, construction robotics, generative/structural design tools, digital twins, " +
      "and how AI is reshaping the global construction industry.",
  },
};

// Prompt that asks the model to web-search and return a clean JSON feed of stories.
export function buildFeedPrompt(tabKey) {
  const tab = TABS[tabKey] || TABS.general;
  const today = new Date().toISOString().slice(0, 10);

  return `You are the news engine for the "Mumbai Real Estate Brief". Today is ${today}.

Use web search to find ${tab.brief}

Find 3 to 7 of the most relevant and RECENT stories (prefer the last 2-3 weeks). If you can't find 5, just return as many as you found. Use only real
articles you actually found via search. Never invent stories, sources, or URLs.

Return ONLY a JSON object (no markdown, no commentary) in exactly this shape:
{
  "stories": [
    {
      "title": "The original headline, lightly cleaned",
      "tldr": "One or two sentences summarising why it matters. Plain, factual, no hype.",
      "source": "Publication name (e.g. ET Realty, Hindustan Times, Mint, LiveLaw)",
      "url": "https://direct-link-to-the-article",
      "published": "Relative time such as '2 days ago' or '1 week ago'"
    }
  ]
}

Rules:
- Every "url" must be a real link to the specific article.
- Keep each "tldr" under 240 characters.
- Order chronologically, with the MOST RECENT news first.
- Output valid JSON only.`;
}

// Prompt for the conversational assistant.
export function buildAskPrompt(question, storyContext) {
  const today = new Date().toISOString().slice(0, 10);
  const context = storyContext
    ? `\n\nThe user is asking in the context of this specific story: "${storyContext}". ` +
      `Keep your answer focused around it (e.g. similar coverage, background, or what it means for a developer).`
    : "";

  return `You are the assistant inside the "Mumbai Real Estate Brief". Today is ${today}.
You help real-estate development teams stay on top of Mumbai construction, projects, laws and
regulations (and global construction AI when asked).${context}

User question: "${question}"

Use web search to answer with REAL, current information. Then reply in plain language:
- Lead with a one-line direct answer.
- Follow with 2-4 short bullet points, each ending with the source name.
- Be concise and factual. Never invent facts or links.
Keep the whole answer under 180 words.`;
}
