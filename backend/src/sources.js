// Per-tab RSS feed configuration.
// Primary: Google News RSS (50,000+ sources, unlimited, free, no API key)
// Supplement: Direct publisher RSS feeds (only verified working ones)
//
// NOTE: Some direct feeds (MoneyControl, LiveLaw, Construction World) blocked
// or return broken XML. Only include feeds that are verified working.

export const TABS = {

  // ── TAB 1: General — Mumbai & India Real Estate ────────────────────────────
  general: {
    label: "General",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      "Mumbai real estate market news",
      "India property housing sector update",
      "Mumbai builder developer housing news",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 2: Projects — Mumbai & India Launches ─────────────────────────────
  projects: {
    label: "Projects",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      "Mumbai new residential project launch",
      "MHADA MMRDA housing scheme Mumbai",
      "India real estate project launch affordable housing",
      "Mumbai metro infrastructure development property",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 3: Laws — Mumbai Courts & India RERA ──────────────────────────────
  laws: {
    label: "Laws",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      "MahaRERA order builder homebuyer penalty",
      "Bombay High Court real estate property ruling",
      "RERA India builder homebuyer court case",
      "Supreme Court India real estate property judgment",
    ],
    directFeeds: [
      { name: "Bar and Bench", url: "https://www.barandbench.com/feed" },
    ],
  },

  // ── TAB 4: Rules & Regulations — Mumbai & India ───────────────────────────
  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai & India",
    lang: "en-IN",
    country: "IN",
    googleNewsQueries: [
      "MahaRERA new rules regulation notification",
      "DCPR Mumbai FSI amendment BMC",
      "India stamp duty property registration policy",
      "Mumbai ready reckoner circle rate revision",
    ],
    directFeeds: [
      { name: "ET Realty", url: "https://realty.economictimes.indiatimes.com/rss/topstories" },
    ],
  },

  // ── TAB 5: AI & Construction Tech — India & Global ────────────────────────
  ai: {
    label: "AI · Construction",
    scope: "India & Global",
    lang: "en",
    country: "US",
    googleNewsQueries: [
      "AI construction technology India PropTech",
      "artificial intelligence construction robotics automation",
      "construction digital twin BIM technology",
      "India smart city construction technology",
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
