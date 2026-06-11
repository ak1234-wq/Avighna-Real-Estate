// Per-tab search query configuration for Tavily.
// KEY INSIGHT: Property portals (magicbricks, 99acres, housing.com) return LISTINGS not NEWS.
// They must be excluded from all tabs. Only news/media domains should appear.

export const TABS = {
  general: {
    label: "General",
    scope: "Mumbai",
    queries: [
      "Mumbai real estate market news 2025",
      "Mumbai property prices developer builder 2025",
      "Mumbai housing construction news Maharashtra",
    ],
    excludeDomains: [
      // Social / video
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      // Property listing portals — these return LISTINGS not NEWS
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
    ],
    mustContainAny: [
      "mumbai", "maharashtra", "mhada", "mmrda", "bmc",
      "navi mumbai", "thane", "kalyan", "panvel", "vasai"
    ],
  },

  projects: {
    label: "Projects",
    scope: "Mumbai",
    queries: [
      "Mumbai new residential project launch news 2025",
      "MHADA MMRDA housing scheme Mumbai 2025",
      "Mumbai SRA redevelopment news 2025",
      "Mumbai metro infrastructure news 2025",
      "Navi Mumbai Thane new project news 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      // CRITICAL: Exclude ALL property portals — they return old listings not news
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
    ],
    mustContainAny: [
      "mumbai", "mhada", "mmrda", "sra",
      "navi mumbai", "thane", "kalyan", "panvel"
    ],
  },

  laws: {
    label: "Laws",
    scope: "Mumbai",
    queries: [
      "Bombay High Court real estate ruling 2025",
      "MahaRERA order penalty builder 2025",
      "Maharashtra property court judgment 2025",
      "RERA Maharashtra homebuyer ruling 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
    ],
    // Laws filter: Bombay HC / MahaRERA / Maharashtra courts specifically
    mustContainAny: [
      "mumbai", "maharashtra", "bombay", "mahareera",
      "bombay high court", "rera", "mhada", "navi mumbai"
    ],
  },

  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai",
    queries: [
      "DCPR 2034 Mumbai FSI amendment 2025",
      "MahaRERA new rules regulation 2025",
      "Mumbai ready reckoner rate revision 2025",
      "BMC Mumbai development circular 2025",
      "Maharashtra stamp duty property regulation 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      // Finance/commodity sites — not real estate regulatory news
      "kitco.com", "tradingview.com", "investing.com", "moneycontrol.com",
    ],
    mustContainAny: [
      "mumbai", "maharashtra", "mahareera", "bmc", "dcpr",
      "mhada", "ready reckoner", "stamp duty", "fsi", "mmrda"
    ],
  },

  ai: {
    label: "AI · Construction",
    scope: "Global",
    queries: [
      "artificial intelligence construction technology news 2025",
      "AI building construction robotics automation 2025",
      "construction digital twin BIM technology news 2025",
      "AI quantity takeoff cost estimating construction software",
      "generative AI structural engineering design 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com",
    ],
    mustContainAny: [], // Global tab — no geo filter
  },
};

// Validate tab key
export function isValidTab(tabKey) {
  return Object.prototype.hasOwnProperty.call(TABS, tabKey);
}
