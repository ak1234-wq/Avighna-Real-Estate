// Sample data used ONLY when VITE_USE_MOCK=1. Lets you preview the UI without a
// running backend or API key. The real feed comes from the backend in production.

const STORIES = {
  general: [
    {
      title: "MahaRERA tightens project registration and disclosure norms",
      tldr: "Developers must now file quarterly progress with geo-tagged site photos; lapses can trigger penalties and a freeze on new registrations.",
      source: "ET Realty",
      url: "https://example.com/maharera-norms",
      published: "2 days ago",
    },
    {
      title: "Coastal Road’s Worli–Bandra link opens to traffic",
      tldr: "The new connector sharply cuts the South Mumbai to western-suburbs commute and is expected to lift demand along the sea-facing corridor.",
      source: "Hindustan Times",
      url: "https://example.com/coastal-road",
      published: "4 days ago",
    },
    {
      title: "Ready-reckoner rates revised across the MMR",
      tldr: "Maharashtra raises circle rates by 3–6% in several Mumbai wards, nudging up stamp duty and registration costs for home buyers.",
      source: "Free Press Journal",
      url: "https://example.com/ready-reckoner",
      published: "6 days ago",
    },
    {
      title: "Luxury launches cluster in Worli and Lower Parel",
      tldr: "Three new sea-view towers were announced this quarter as central-business-district redevelopment pipelines mature.",
      source: "Mint",
      url: "https://example.com/luxury-launches",
      published: "1 week ago",
    },
  ],
  projects: [
    {
      title: "MHADA invites tenders for Bandra Reclamation layout upgrades",
      tldr: "Infrastructure works precede a large redevelopment push across ageing board colonies on the western sea face.",
      source: "ET Realty",
      url: "https://example.com/mhada-bandra",
      published: "3 days ago",
    },
    {
      title: "MMRDA fast-tracks Metro Line 3 final stretch",
      tldr: "Full Colaba–SEEPZ opening nears, easing the island-city commute and reshaping office demand along the corridor.",
      source: "Hindustan Times",
      url: "https://example.com/metro-3",
      published: "5 days ago",
    },
  ],
  laws: [
    {
      title: "Bombay High Court stays a contested society redevelopment",
      tldr: "Order turns on tenant-consent shortfalls, reinforcing scrutiny of majority-consent claims in SRA projects.",
      source: "LiveLaw",
      url: "https://example.com/bhc-redevelopment",
      published: "2 days ago",
    },
    {
      title: "MahaRERA orders refund with interest in delayed-handover case",
      tldr: "Authority reaffirms buyers’ right to exit and recover money when possession timelines slip materially.",
      source: "Bar & Bench",
      url: "https://example.com/maharera-refund",
      published: "1 week ago",
    },
  ],
  rules: [
    {
      title: "DCPR 2034 amendment revises fungible FSI premiums",
      tldr: "Premium recalibration changes project economics for mid-segment redevelopment across the suburbs.",
      source: "Free Press Journal",
      url: "https://example.com/dcpr-fsi",
      published: "4 days ago",
    },
    {
      title: "BMC circular standardises occupancy-certificate checks",
      tldr: "New checklist aims to cut OC delays but adds upfront compliance steps for builders.",
      source: "Mid-Day",
      url: "https://example.com/bmc-oc",
      published: "1 week ago",
    },
  ],
  ai: [
    {
      title: "Autonomous bricklaying robot clears 1,000 units a day on US site",
      tldr: "Site robotics demonstrate meaningful productivity gains on mid-rise builds, though human crews still finish and supervise.",
      source: "Construction Dive",
      url: "https://example.com/bricklaying-robot",
      published: "3 days ago",
    },
    {
      title: "Generative design tool trims structural steel by 18%",
      tldr: "AI optimisation in early design lowers material use, cutting both embodied carbon and cost on tested commercial projects.",
      source: "Architizer",
      url: "https://example.com/generative-design",
      published: "5 days ago",
    },
    {
      title: "Digital twins move from pilot to standard on megaprojects",
      tldr: "Major contractors now run live twin models for clash detection and real-time progress tracking across large sites.",
      source: "ENR",
      url: "https://example.com/digital-twins",
      published: "1 week ago",
    },
  ],
};

const SCOPE = { ai: "Global" };

export function mockFeed(tab) {
  return Promise.resolve({
    tab,
    scope: SCOPE[tab] || "Mumbai",
    stories: STORIES[tab] || STORIES.general,
    updatedAt: new Date().toISOString(),
    cached: true,
  });
}

export function mockAsk(question) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          answer:
            `Here’s the latest on “${question}”:\n` +
            "• Cluster redevelopment cleared for Bandra (W) chawls under DCPR cluster norms.\n" +
            "• MHADA invites tenders for Bandra Reclamation layout upgrades ahead of redevelopment.\n" +
            "• Bombay High Court stays a contested society redevelopment over tenant-consent shortfalls.",
          sources: [
            { title: "Free Press Journal", url: "https://example.com/fpj" },
            { title: "ET Realty", url: "https://example.com/etrealty" },
            { title: "LiveLaw", url: "https://example.com/livelaw" },
          ],
          answeredAt: new Date().toISOString(),
        }),
      900
    )
  );
}
