// data/collections/themes.js
//
// THEME VOCABULARY — the reusable "what kind of space" axis of discovery.
//
// A theme is a CURATED VIEW over the existing catalog, decided deterministically
// by the SAME rule engine that powers persona collections
// (lib/collections/engine.js → matches / rankedImages). A theme therefore reuses
// canonical facets (lib/collections/facets.js) + category — no new images, no new
// matching logic.
//
// Themes are consumed in two places:
//   1. Platform × theme programmatic pages  (/zoom-backgrounds/office …)  — LIVE
//   2. Standalone style/room/color collection pages (/styles/office …)   — future
//
// This is deliberate: the theme is the compounding unit. Add one theme and it
// instantly becomes discoverable across every platform (×4 pages today) and is
// ready for a standalone collection page tomorrow — without touching a template.
//
// Rule semantics (identical to personas.js, evaluated in engine.matches):
//   include = (categoriesAny ∋ image.category  OR categoriesAny absent)
//          AND (facetsAny ∩ facets ≠ ∅          OR facetsAny absent)
//          AND (facetsAll ⊆ facets              OR facetsAll absent)
//   reject if seasonal, or image.category ∈ exclude.categoriesAny,
//          or exclude.facetsAny ∩ facets ≠ ∅
//
// minCount is the anti-thin-content guard. A theme that resolves to fewer than
// minCount images is NOT published — engine drops it from every route and every
// link. Better to ship nothing than a thin doorway page. (Same gate personas use.)
//
// Field contract (per theme):
//   slug        URL segment + stable id. kebab-case, matches search modifier.
//   label       Display noun, Title Case. ("Office", "Conference Room")
//   modifier    Lowercase phrase as it appears mid-sentence. ("office", "book-lined")
//   plural      Lowercase headword for copy. ("office backgrounds")
//   descBit     ~40–75 char intent clause used to compose meta descriptions.
//   blurb       One-sentence theme summary (used on landing-page theme cards).
//   intro       One paragraph of theme-specific body copy (rendered on the page).
//   rule        The membership rule (see semantics above).
//   exclude     Optional rejection rule.
//   minCount    Publish gate (default 12).
//   maxShown    Grid cap (default 48).

const THEMES = [
  {
    slug: 'office',
    label: 'Office',
    modifier: 'office',
    plural: 'office backgrounds',
    descBit: 'Corporate offices, boardrooms, and clean workspaces that read as professional on camera.',
    blurb: 'Corporate offices and workspaces built to look established on a call.',
    intro:
      'An office background is the safe, universally professional choice — it signals “I am at work and paying attention” without any of the guesswork of a personal room. These environments span open-plan floors, private offices, and boardrooms, all composed for camera so the depth reads naturally behind you instead of looking like a flat poster.',
    rule: {
      categoriesAny: ['office-spaces', 'home-office', 'urban-lofts'],
      facetsAny: ['formal-executive', 'minimal-clean', 'bright-airy'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'bookshelf',
    label: 'Bookshelf',
    modifier: 'bookshelf',
    plural: 'bookshelf backgrounds',
    descBit: 'Book-lined shelves and library walls that signal credibility and expertise.',
    blurb: 'Book-lined shelves that quietly signal expertise and authority.',
    intro:
      'A wall of books is the single most requested professional backdrop, and for good reason: it reads as knowledgeable and established the instant a call connects, without pulling focus. These bookshelf and shelving scenes are arranged and lit so titles stay legible-but-not-distracting and the shelves hold their depth through webcam compression.',
    rule: {
      categoriesAny: ['bookshelves', 'wall-shelves', 'libraries'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'home-office',
    label: 'Home Office',
    modifier: 'home office',
    plural: 'home office backgrounds',
    descBit: 'Warm, tidy work-from-home setups that stay professional without feeling corporate.',
    blurb: 'Work-from-home setups that stay professional without feeling sterile.',
    intro:
      'The home office background threads a needle: professional enough for a client, human enough that you still look like a person working from home. These setups pair a real desk-and-shelf sense of place with clean sightlines, so remote and hybrid workers get warmth without the clutter of an actual home office behind them.',
    rule: {
      categoriesAny: ['home-office', 'living-rooms'],
      facetsAny: ['home-casual', 'cozy-warm', 'minimal-clean', 'bright-airy'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'executive',
    label: 'Executive',
    modifier: 'executive',
    plural: 'executive backgrounds',
    descBit: 'Refined, senior-level offices and interiors that project quiet authority.',
    blurb: 'Refined interiors that project seniority and quiet authority.',
    intro:
      'When the call is with a board, a buyer, or a founder, the room behind you should read as senior before you say a word. These executive environments — paneled offices, refined boardrooms, and established interiors — are composed to feel in-command and expensive-but-restrained, the kind of space a decision-maker is expected to occupy.',
    rule: {
      categoriesAny: ['office-spaces', 'historic-spaces', 'libraries', 'bookshelves'],
      facetsAny: ['formal-executive', 'wood-natural', 'bookshelf-library'],
    },
    exclude: { facetsAny: ['hospitality', 'nature-greenery'] },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'minimalist',
    label: 'Minimalist',
    modifier: 'minimalist',
    plural: 'minimalist backgrounds',
    descBit: 'Clean lines, neutral walls, and uncluttered space for a calm, modern look.',
    blurb: 'Clean, uncluttered spaces for a calm and modern presence.',
    intro:
      'A minimalist background does one job perfectly: it keeps every bit of attention on you. Neutral walls, clean lines, and negative space give the eye nothing to wander toward, which is exactly why they work so well for high-stakes calls where you want zero distraction — and why they compress cleanly on any connection.',
    rule: {
      categoriesAny: ['neutral-backgrounds', 'office-spaces', 'home-office', 'urban-lofts', 'wall-shelves'],
      facetsAny: ['minimal-clean', 'neutral-palette'],
    },
    exclude: { facetsAny: ['cozy-warm', 'nature-greenery'] },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'modern',
    label: 'Modern',
    modifier: 'modern',
    plural: 'modern backgrounds',
    descBit: 'Contemporary, design-forward spaces with clean architecture and good light.',
    blurb: 'Design-forward, contemporary spaces with clean architecture.',
    intro:
      'The modern background reads as current and intentional — the visual language of a team that cares about how things are made. Think contemporary lofts, design-forward offices, and light-filled interiors with confident architecture. It is the natural fit for tech, creative, and product-led work where a dated room quietly undercuts you.',
    rule: {
      categoriesAny: ['urban-lofts', 'office-spaces', 'home-office', 'art-galleries'],
      facetsAny: ['minimal-clean', 'creative-arty', 'bright-airy'],
    },
    exclude: { facetsAny: ['cozy-warm'] },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'conference-room',
    label: 'Conference Room',
    modifier: 'conference room',
    plural: 'conference room backgrounds',
    descBit: 'Boardrooms and meeting rooms that make a solo call feel like a real workplace.',
    blurb: 'Boardrooms and meeting rooms that anchor a serious, in-office feel.',
    intro:
      'A conference-room background frames you as though you have stepped into a real meeting space — useful for group calls, presentations, and any moment you want to feel institutionally backed rather than home-alone. These boardrooms and meeting rooms carry enough architectural depth to look convincing without turning into visual noise.',
    rule: {
      categoriesAny: ['office-spaces', 'historic-spaces'],
      facetsAny: ['formal-executive'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'library',
    label: 'Library',
    modifier: 'library',
    plural: 'library backgrounds',
    descBit: 'Floor-to-ceiling library rooms for an academic, scholarly, well-read look.',
    blurb: 'Floor-to-ceiling library rooms for a scholarly, well-read look.',
    intro:
      'The library background is the bookshelf’s grander cousin — full rooms of floor-to-ceiling shelving that read as academic, thoughtful, and deeply credentialed. It is a favourite of educators, researchers, authors, and anyone whose authority rests on knowing things. Warm lighting keeps it inviting rather than austere.',
    rule: {
      categoriesAny: ['libraries', 'bookshelves'],
      facetsAny: ['bookshelf-library'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'neutral',
    label: 'Neutral & Plain',
    modifier: 'neutral',
    plural: 'neutral backgrounds',
    descBit: 'Plain off-white, greige, and soft-gray walls for a distraction-free frame.',
    blurb: 'Plain, soft-toned walls for a completely distraction-free frame.',
    intro:
      'Sometimes the right background is almost no background at all. These plain and neutral walls — off-white, greige, soft gray — give you a clean, distraction-free frame that flatters skin tones and never competes with what you are saying. They are the closest thing to a physical seamless backdrop, ready for any platform.',
    rule: {
      categoriesAny: ['neutral-backgrounds', 'wall-shelves', 'home-office'],
      facetsAny: ['neutral-palette', 'minimal-clean'],
    },
    exclude: { facetsAny: ['cozy-warm', 'creative-arty', 'nature-greenery'] },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'cozy',
    label: 'Cozy',
    modifier: 'cozy',
    plural: 'cozy backgrounds',
    descBit: 'Warm, soft-lit rooms that feel approachable and put people at ease.',
    blurb: 'Warm, soft-lit rooms that feel human and put people at ease.',
    intro:
      'A cozy background lowers the temperature of a call in the best way — warm light, natural materials, and lived-in comfort that make you approachable rather than formal. It is the right call for coaching, counselling, mentoring, and any conversation where the goal is for the other person to relax and open up.',
    rule: {
      categoriesAny: ['home-office', 'living-rooms', 'kitchens', 'coffee-shops', 'bookshelves'],
      facetsAny: ['cozy-warm', 'home-casual'],
    },
    exclude: { facetsAny: ['formal-executive', 'minimal-clean'] },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'bright',
    label: 'Bright & Airy',
    modifier: 'bright',
    plural: 'bright backgrounds',
    descBit: 'Light-filled, open spaces that keep you looking fresh and energetic.',
    blurb: 'Light-filled, open spaces that keep you looking fresh and awake.',
    intro:
      'Bright, airy backgrounds do something subtle but powerful: they make you look more awake and energetic by surrounding you with light. Big windows, pale palettes, and open sightlines lift the whole frame — a strong choice for early calls, sales, and any time you want to project optimism and momentum.',
    rule: {
      categoriesAny: ['office-spaces', 'home-office', 'living-rooms', 'kitchens', 'urban-lofts'],
      facetsAny: ['bright-airy'],
    },
    minCount: 12,
    maxShown: 48,
  },
  {
    slug: 'creative',
    label: 'Creative Studio',
    modifier: 'creative',
    plural: 'creative backgrounds',
    descBit: 'Lofts, studios, and gallery spaces with character for design-led work.',
    blurb: 'Lofts, studios, and galleries with character for design-led work.',
    intro:
      'The creative background trades corporate polish for character — exposed brick, gallery walls, studio light, and the kind of space that says the work is interesting. It suits designers, agencies, artists, and founders who would rather look original than institutional, while still holding together cleanly on camera.',
    rule: {
      categoriesAny: ['urban-lofts', 'art-galleries'],
      facetsAny: ['creative-arty'],
    },
    minCount: 12,
    maxShown: 48,
  },
];

// Use-case vocabulary per theme. Powers the metadata-driven "Great for …" line
// on image detail pages (lib/discovery/imageDiscovery.js): an image's use-cases
// are the union of the use-cases of the themes it matches. Kept here so the data
// stays cohesive with the theme it describes and a NEW theme ships its own
// use-cases — no per-image authoring, ever.
const THEME_USE_CASES = {
  office: ['team meetings', 'client calls', 'presentations'],
  bookshelf: ['interviews', 'client calls', 'expert panels'],
  'home-office': ['remote work', 'one-to-ones', 'hybrid meetings'],
  executive: ['board meetings', 'investor calls', 'client meetings'],
  minimalist: ['interviews', 'focus calls', 'presentations'],
  modern: ['product demos', 'sales calls', 'startup meetings'],
  'conference-room': ['presentations', 'webinars', 'team meetings'],
  library: ['lectures', 'tutoring', 'expert interviews'],
  neutral: ['interviews', 'formal calls', 'looking sharp on camera'],
  cozy: ['coaching', 'counselling', 'mentoring'],
  bright: ['morning calls', 'sales calls', 'webinars'],
  creative: ['design reviews', 'portfolio calls', 'agency pitches'],
};

// Self-policing validation, mirroring data/collections/personas.js. A malformed
// theme throws at module load so the build fails loudly instead of shipping a
// broken route.
function validateThemes(defs) {
  const seen = new Set();
  for (const d of defs) {
    if (!d.slug || seen.has(d.slug)) {
      throw new Error(`themes: missing or duplicate slug "${d.slug}"`);
    }
    seen.add(d.slug);
    for (const k of ['label', 'modifier', 'plural', 'descBit', 'blurb', 'intro']) {
      if (typeof d[k] !== 'string' || !d[k].trim()) {
        throw new Error(`themes: "${d.slug}" missing string field "${k}"`);
      }
    }
    // descBit feeds composed meta descriptions; keep it tight enough that the
    // composed description (see lib/platforms/engine.js) stays within budget for
    // the longest platform name ("Microsoft Teams").
    if (d.descBit.length > 95) {
      throw new Error(`themes: "${d.slug}" descBit length ${d.descBit.length} > 95`);
    }
    if (!d.rule || typeof d.rule !== 'object') {
      throw new Error(`themes: "${d.slug}" missing rule`);
    }
    if (!Array.isArray(THEME_USE_CASES[d.slug]) || THEME_USE_CASES[d.slug].length === 0) {
      throw new Error(`themes: "${d.slug}" missing THEME_USE_CASES entry`);
    }
  }
  return defs;
}

module.exports = { THEMES: validateThemes(THEMES), THEME_USE_CASES };
