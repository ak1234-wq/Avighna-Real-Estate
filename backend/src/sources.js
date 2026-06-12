// Per-tab RSS feed configuration.
// Primary: Google News RSS (50,000+ sources, unlimited, free, no API key)
// Supplement: Direct publisher RSS feeds (verified working ones)
//
// PRIORITY ORDER:
//   Tabs 1-4: Mumbai queries FIRST → India queries AFTER
//   Tab 5:    India queries FIRST → International queries AFTER
//
// More queries = more variety of news. Each query returns 60-100 articles.

export const TABS = {

  // ── TAB 1: General — Mumbai FIRST, then India ─────────────────────────────
  general: {
    label: "General",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      // ── Mumbai priority ──
      "Mumbai real estate news",
      "Mumbai property market update",
      "Mumbai builder developer news",
      "Mumbai housing construction news",
      // ── India ──
      "India real estate market news",
      "India property housing sector update",
      "India real estate developer investment",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 2: Projects — Mumbai FIRST, then India ────────────────────────────
  projects: {
    label: "Projects",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      // ── Mumbai priority ──
      "Mumbai new residential project launch",
      "Mumbai redevelopment SRA project news",
      "MHADA MMRDA housing scheme Mumbai",
      "Mumbai metro infrastructure development",
      "Navi Mumbai Thane real estate project",
      // ── India ──
      "India real estate project launch",
      "India affordable housing scheme PMAY",
      "India commercial real estate project",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 3: Laws — Mumbai FIRST, then India ────────────────────────────────
  laws: {
    label: "Laws",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      // ── Mumbai priority ──
      "MahaRERA order builder homebuyer penalty",
      "Bombay High Court real estate ruling",
      "Maharashtra real estate court case",
      "Mumbai property dispute court order",
      // ── India ──
      "RERA India builder homebuyer court",
      "Supreme Court India real estate judgment",
      "India property law court ruling",
    ],
    directFeeds: [
      { name: "Bar and Bench", url: "https://www.barandbench.com/feed" },
    ],
  },

  // ── TAB 4: Rules & Regulations — Mumbai FIRST, then India ─────────────────
  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      // ── Mumbai priority ──
      "MahaRERA new rules regulation notification",
      "DCPR Mumbai FSI amendment BMC",
      "Mumbai ready reckoner circle rate",
      "Mumbai BMC development regulation circular",
      "Maharashtra stamp duty registration",
      // ── India ──
      "India RERA regulation update",
      "India real estate policy stamp duty",
      "India property registration rule change",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 5: AI & Construction — INDIA FIRST, then International ────────────
  ai: {
    label: "AI · Construction",
    scope: "India & Global",
    lang: "en-IN",    // India first!
    country: "IN",    // India first!
    googleNewsQueries: [
      // ── India priority ──
      "India PropTech real estate technology",
      "India construction technology news",
      "India smart city construction innovation",
      "India AI real estate startup",
      // ── International ──
      "AI construction technology global",
      "construction robotics automation news",
      "construction digital twin BIM technology",
      "AI building design engineering",
    ],
    directFeeds: [
      { name: "Construction Dive", url: "https://www.constructiondive.com/feeds/news/" },
    ],
  },

};

// Validate tab key
export function isValidTab(tabKey) {
  return Object.prototype.hasOwnProperty.call(TABS, tabKey);
}
