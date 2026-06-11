// Per-tab configuration: specific queries for Tavily + Gemini supplement queries.
// NO mustContainAny filter — query specificity controls relevance instead.
// Property LISTING portals are excluded (magicbricks, 99acres show listings, not news).

const EXCLUDED_ALWAYS = [
  "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
  // Property listing portals — return old listings, NOT news
  "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
  "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
  "olx.in", "sulekha.com",
];

export const TABS = {

  // ── TAB 1: General Mumbai Real Estate ──────────────────────────────────────
  general: {
    label: "General",
    scope: "Mumbai",
    // Tavily queries — broad but real-estate focused
    queries: [
      "Mumbai real estate market news June 2025",
      "India property market housing sector update 2025",
      "Mumbai developer builder project announcement 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      "kitco.com", "tradingview.com", "investing.com",
    ],
    // Gemini supplement query — triggers if Tavily returns < 5 articles
    geminiQuery: "latest Mumbai real estate news India property market 2025",
    geminiMinTrigger: 5, // use Gemini if Tavily finds fewer than this
  },

  // ── TAB 2: New Projects & Launches ─────────────────────────────────────────
  projects: {
    label: "Projects",
    scope: "Mumbai",
    queries: [
      "Mumbai new residential project launch 2025",
      "MHADA MMRDA housing project Mumbai Maharashtra 2025",
      "Mumbai SRA redevelopment scheme news 2025",
      "Mumbai metro new line infrastructure property 2025",
      "Thane Navi Mumbai new real estate project 2025",
    ],
    excludeDomains: [...EXCLUDED_ALWAYS],
    geminiQuery: "new real estate project launch Mumbai Maharashtra MHADA MMRDA 2025",
    geminiMinTrigger: 4,
  },

  // ── TAB 3: Legal News (Bombay HC, MahaRERA, Supreme Court) ─────────────────
  laws: {
    label: "Laws",
    scope: "Mumbai",
    queries: [
      "Bombay High Court real estate property ruling 2025",
      "MahaRERA Maharashtra RERA builder penalty order 2025",
      "Supreme Court India property real estate judgment 2025",
      "Mumbai builder homebuyer court case India 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      // Finance sites — not legal news
      "kitco.com", "tradingview.com", "investing.com", "moneycontrol.com",
    ],
    // Gemini is MUCH better at finding Indian legal news → lower trigger threshold
    geminiQuery: "Bombay High Court MahaRERA ruling India real estate builder homebuyer 2025",
    geminiMinTrigger: 2, // trigger Gemini even if Tavily finds 1-2
  },

  // ── TAB 4: Rules & Regulations ──────────────────────────────────────────────
  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai",
    queries: [
      "DCPR 2034 Mumbai FSI amendment regulation 2025",
      "MahaRERA new rule notification circular 2025",
      "Mumbai ready reckoner circle rate revision Maharashtra 2025",
      "BMC Mumbai development regulation circular 2025",
      "Maharashtra stamp duty property registration 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      "kitco.com", "tradingview.com", "investing.com",
    ],
    geminiQuery: "DCPR MahaRERA BMC Mumbai real estate regulation FSI stamp duty India 2025",
    geminiMinTrigger: 4,
  },

  // ── TAB 5: AI & Construction Technology (Global) ───────────────────────────
  ai: {
    label: "AI · Construction",
    scope: "Global",
    queries: [
      "artificial intelligence construction technology news 2025",
      "AI building robotics automation construction news 2025",
      "construction digital twin BIM software technology 2025",
      "AI quantity takeoff cost estimating construction 2025",
      "PropTech real estate technology innovation India 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
    ],
    geminiQuery: "AI construction technology PropTech real estate innovation news 2025",
    geminiMinTrigger: 5,
  },

};

// Validate tab key
export function isValidTab(tabKey) {
  return Object.prototype.hasOwnProperty.call(TABS, tabKey);
}
