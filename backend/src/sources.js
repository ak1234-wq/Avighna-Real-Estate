// Per-tab configuration: Tavily queries + Gemini supplement queries.
// Scope: Mumbai (primary) + India (secondary) for tabs 1-4
//        India (primary) + Global (secondary) for tab 5 (AI)

const EXCLUDED_ALWAYS = [
  "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
  // Property listing portals — return old listings, NOT news
  "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
  "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
  "olx.in", "sulekha.com",
];

export const TABS = {

  // ── TAB 1: General — Mumbai + India Real Estate ───────────────────────────
  general: {
    label: "General",
    scope: "Mumbai & India",
    queries: [
      // Mumbai first
      "Mumbai real estate property market news 2025",
      "Mumbai builder developer housing update 2025",
      // India-wide
      "India real estate property market news 2025",
      "India housing sector developer update 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      "kitco.com", "tradingview.com", "investing.com",
    ],
    geminiQuery:
      "latest Mumbai real estate news AND India property market update 2025",
    geminiMinTrigger: 5,
  },

  // ── TAB 2: Projects — Mumbai + India Launches ─────────────────────────────
  projects: {
    label: "Projects",
    scope: "Mumbai & India",
    queries: [
      // Mumbai / MMR projects
      "Mumbai new residential commercial project launch 2025",
      "MHADA MMRDA housing scheme Mumbai Maharashtra 2025",
      "Mumbai SRA redevelopment metro infrastructure 2025",
      // India-wide project launches
      "India new real estate project launch city 2025",
      "India affordable housing scheme government 2025",
    ],
    excludeDomains: [...EXCLUDED_ALWAYS],
    geminiQuery:
      "new real estate project launch Mumbai Maharashtra AND India housing scheme 2025",
    geminiMinTrigger: 4,
  },

  // ── TAB 3: Laws — Mumbai Courts + India RERA ──────────────────────────────
  laws: {
    label: "Laws",
    scope: "Mumbai & India",
    queries: [
      // Mumbai / Maharashtra courts
      "Bombay High Court real estate ruling 2025",
      "MahaRERA Maharashtra builder penalty order 2025",
      // India-wide legal
      "Supreme Court India real estate property judgment 2025",
      "RERA India builder homebuyer court case 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      "kitco.com", "tradingview.com", "investing.com", "moneycontrol.com",
    ],
    geminiQuery:
      "Bombay High Court MahaRERA ruling AND India RERA Supreme Court real estate builder homebuyer 2025",
    geminiMinTrigger: 2, // Gemini is better at Indian legal news → trigger early
  },

  // ── TAB 4: Rules & Regulations — Mumbai + India ───────────────────────────
  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai & India",
    queries: [
      // Mumbai / Maharashtra regulations
      "DCPR 2034 Mumbai FSI amendment 2025",
      "MahaRERA new rule notification circular 2025",
      "Mumbai ready reckoner circle rate BMC regulation 2025",
      // India-wide regulations
      "India real estate regulation RERA rule 2025",
      "India stamp duty property registration policy 2025",
    ],
    excludeDomains: [
      ...EXCLUDED_ALWAYS,
      "kitco.com", "tradingview.com", "investing.com",
    ],
    geminiQuery:
      "DCPR MahaRERA BMC Mumbai regulation AND India RERA stamp duty real estate policy 2025",
    geminiMinTrigger: 4,
  },

  // ── TAB 5: AI & Construction Tech — India first, then Global ─────────────
  ai: {
    label: "AI · Construction",
    scope: "India & Global",
    queries: [
      // India PropTech / construction AI — priority
      "India PropTech real estate technology news 2025",
      "India construction technology AI innovation 2025",
      "India smart city housing technology startup 2025",
      // Global construction AI — secondary
      "AI construction technology robotics news global 2025",
      "construction digital twin BIM AI software 2025",
    ],
    excludeDomains: [...EXCLUDED_ALWAYS],
    geminiQuery:
      "India PropTech construction technology AI innovation AND global AI construction robotics news 2025",
    geminiMinTrigger: 5,
  },

};

// Validate tab key
export function isValidTab(tabKey) {
  return Object.prototype.hasOwnProperty.call(TABS, tabKey);
}
