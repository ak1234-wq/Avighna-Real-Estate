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
      "MahaRERA order penalty builder homebuyer real estate",
      "Bombay High Court real estate property ruling judgment",
      "Maharashtra real estate property court case ruling",
      "Mumbai property construction dispute court order",
      "Mumbai redevelopment legal dispute court real estate",
      // ── India ──
      "RERA India real estate builder homebuyer court ruling",
      "Supreme Court India real estate property judgment",
      "India property law real estate construction court ruling",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
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
      "MahaRERA new rules regulation real estate notification",
      "DCPR Mumbai FSI amendment BMC real estate construction",
      "Mumbai ready reckoner circle rate property real estate",
      "Mumbai BMC development regulation circular construction",
      "Maharashtra stamp duty registration property real estate",
      // ── India ──
      "India RERA regulation real estate update",
      "India real estate construction policy stamp duty",
      "India property real estate registration rule change",
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
