// Per-tab search query configuration for Tavily.
// KEY RULES:
// 1. Exclude property LISTING portals (magicbricks, 99acres) — they return listings not news
// 2. mustContainAny: balanced — strict enough to block US/UK, loose enough to get India results
// 3. Laws tab needs broader filter since Indian legal sites may not mention "mumbai" in snippet

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
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
    ],
    mustContainAny: [
      "mumbai", "maharashtra", "mhada", "mmrda", "bmc",
      "navi mumbai", "thane", "kalyan", "panvel", "vasai",
      "india real estate", "india property", "indian real estate",
    ],
  },

  projects: {
    label: "Projects",
    scope: "Mumbai",
    queries: [
      "Mumbai new residential project launch 2025",
      "MHADA MMRDA housing scheme Mumbai 2025",
      "Mumbai SRA redevelopment news 2025",
      "Mumbai metro infrastructure news 2025",
      "Thane Navi Mumbai project launch 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      "commonfloor.com", "nobroker.com", "makaan.com", "proptiger.com",
    ],
    mustContainAny: [
      "mumbai", "mhada", "mmrda", "sra",
      "navi mumbai", "thane", "kalyan", "panvel", "vasai",
      "india real estate", "india property", "india project",
    ],
  },

  laws: {
    label: "Laws",
    scope: "Mumbai",
    queries: [
      "Bombay High Court real estate ruling 2025",
      "MahaRERA order penalty builder 2025",
      "Maharashtra property court judgment 2025",
      "RERA Maharashtra homebuyer order 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
    ],
    // Broader filter for laws — Indian legal news sites may not say "mumbai" in snippet
    mustContainAny: [
      "mumbai", "maharashtra", "bombay", "mahareera", "rera",
      "mhada", "navi mumbai", "thane", "india real estate",
      "india property", "india builder", "india developer",
      "high court", "supreme court india",
    ],
  },

  rules: {
    label: "Rules & Regulations",
    scope: "Mumbai",
    queries: [
      "DCPR 2034 Mumbai FSI amendment 2025",
      "MahaRERA new rules notification 2025",
      "Mumbai ready reckoner circle rate 2025",
      "BMC Mumbai development circular 2025",
      "Maharashtra stamp duty property 2025",
    ],
    excludeDomains: [
      "youtube.com", "reddit.com", "quora.com", "twitter.com", "x.com",
      "magicbricks.com", "99acres.com", "housing.com", "squareyards.com",
      "kitco.com", "tradingview.com", "investing.com",
    ],
    mustContainAny: [
      "mumbai", "maharashtra", "mahareera", "bmc", "dcpr",
      "mhada", "mmrda", "ready reckoner", "stamp duty",
      "india real estate", "india property", "rera india",
      "fsi", "tdr", "india regulation",
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
