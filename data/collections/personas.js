// data/collections/personas.js
//
// Persona / industry collection definitions. Each collection is a CURATED
// view over the EXISTING catalog — no new images. Membership is decided by a
// deterministic rule over canonical facets (lib/collections/facets.js) plus
// category. The SEO value is the curation + unique copy + buyer intent, not
// unique images, so reusing an image across collections is expected and safe.
//
// Rule semantics (evaluated in lib/collections/engine.js):
//   include = (categoriesAny ∋ image.category  OR categoriesAny absent)
//          AND (facetsAny ∩ facets ≠ ∅          OR facetsAny absent)
//          AND (facetsAll ⊆ facets              OR facetsAll absent)
//   reject if seasonal, or image.category ∈ exclude.categoriesAny,
//          or exclude.facetsAny ∩ facets ≠ ∅
//
// minCount is the anti-thin-content guard: a collection that resolves to
// fewer than minCount images is NOT published (engine drops it from paths and
// the hub). Better to ship nothing than a thin doorway page.

const SUFFIX = 'MeetBackdrops';

const PERSONAS = [
  {
    slug: 'zoom-backgrounds-for-lawyers',
    persona: 'Lawyers & Legal',
    title: 'Zoom Backgrounds for Lawyers & Legal Pros | MeetBackdrops',
    h1: 'Virtual Backgrounds for Lawyers',
    description:
      'Studio-designed virtual backgrounds for attorneys on Zoom, Teams, and Google Meet — law-library shelves and offices that read as credible on client calls.',
    eyebrow: 'For Legal Professionals',
    intro: [
      'On a client call or a remote deposition, your background is part of your credibility. These environments — book-lined shelves, paneled offices, and quietly authoritative interiors — are designed to read as established and trustworthy on camera, without distracting from what you are saying.',
      'Every image is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays crisp on Zoom, Microsoft Teams, and Google Meet. Curated from the MeetBackdrops catalog for the legal profession.',
    ],
    rule: {
      categoriesAny: ['bookshelves', 'wall-shelves', 'libraries', 'office-spaces', 'historic-spaces', 'home-office'],
      facetsAny: ['bookshelf-library', 'formal-executive', 'neutral-palette', 'wood-natural'],
    },
    exclude: { facetsAny: ['hospitality', 'nature-greenery'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-therapists',
    persona: 'Therapists & Counselors',
    title: 'Zoom Backgrounds for Therapists & Counselors',
    h1: 'Virtual Backgrounds for Therapists',
    description:
      'Warm, calming virtual backgrounds for therapists and counselors on Zoom, Teams, and Google Meet. Soft, inviting spaces designed to put clients at ease.',
    eyebrow: 'For Therapists & Counselors',
    intro: [
      'A teletherapy session asks a lot of your space: it should feel warm and safe, never clinical or cluttered. These environments lean into soft light, natural materials, and calm, uncluttered interiors that help a client settle in the moment the call connects.',
      'Each background is studio-designed and 4K-upscaled, composed for camera so it stays gentle and unobtrusive on Zoom, Microsoft Teams, and Google Meet. Curated for therapists, counselors, and mental-health professionals.',
    ],
    rule: {
      categoriesAny: ['living-rooms', 'home-office', 'gardens-patios', 'nature-landscapes', 'kitchens'],
      facetsAny: ['serene-calm', 'cozy-warm', 'home-casual', 'nature-greenery'],
    },
    exclude: { facetsAny: ['hospitality', 'formal-executive'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-realtors',
    persona: 'Real Estate Agents',
    title: 'Zoom Backgrounds for Realtors & Real Estate',
    h1: 'Virtual Backgrounds for Realtors',
    description:
      'Bright, aspirational virtual backgrounds for real estate agents on Zoom, Teams, and Google Meet. Polished modern interiors that signal taste and class.',
    eyebrow: 'For Real Estate Agents',
    intro: [
      'You sell space for a living, so the space behind you on a listing call matters. These bright, aspirational interiors — airy living rooms, modern kitchens, and clean offices — signal taste and professionalism to buyers and sellers alike.',
      'Every environment is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it holds up on Zoom, Microsoft Teams, and Google Meet. Curated from the catalog for real estate professionals.',
    ],
    rule: {
      categoriesAny: ['living-rooms', 'kitchens', 'home-office', 'urban-lofts'],
      facetsAny: ['bright-airy', 'home-casual', 'minimal-clean'],
    },
    exclude: { facetsAny: ['hospitality', 'formal-executive', 'bookshelf-library'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-consultants',
    persona: 'Consultants & Executives',
    title: 'Zoom Backgrounds for Consultants & Executives',
    h1: 'Virtual Backgrounds for Consultants',
    description:
      'Sharp, executive virtual backgrounds for consultants and advisors on Zoom, Teams, and Google Meet. Minimal, modern offices built to project quiet authority.',
    eyebrow: 'For Consultants & Executives',
    intro: [
      'Consulting runs on perceived authority, and your background sets the tone before you say a word. These sharp, modern offices and minimal interiors are designed to read as senior and in-command on camera — polished, never showy.',
      'Each image is studio-designed and 4K-upscaled, composed for camera and engineered for codec compression so it stays clean on Zoom, Microsoft Teams, and Google Meet. Curated for consultants, advisors, and executives.',
    ],
    rule: {
      categoriesAny: ['office-spaces', 'home-office', 'urban-lofts'],
      facetsAny: ['minimal-clean', 'bright-airy', 'formal-executive'],
    },
    exclude: { facetsAny: ['hospitality', 'nature-greenery', 'cozy-warm', 'bookshelf-library', 'home-casual'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-financial-advisors',
    persona: 'Financial Advisors',
    title: 'Zoom Backgrounds for Financial Advisors',
    h1: 'Virtual Backgrounds for Financial Advisors',
    description:
      'Trustworthy virtual backgrounds for financial advisors on Zoom, Teams, and Google Meet. Established, book-lined offices that signal stability and experience.',
    eyebrow: 'For Financial Advisors',
    intro: [
      'Money conversations turn on trust, and a stable, established backdrop quietly reinforces it. These book-lined offices and refined interiors are designed to signal experience and permanence on camera — exactly what a client wants to feel before handing over a portfolio.',
      'Every background is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays sharp on Zoom, Microsoft Teams, and Google Meet. Curated for financial advisors and wealth professionals.',
    ],
    rule: {
      categoriesAny: ['bookshelves', 'wall-shelves', 'libraries', 'office-spaces', 'historic-spaces'],
      facetsAny: ['bookshelf-library', 'formal-executive', 'wood-natural', 'neutral-palette'],
    },
    exclude: { facetsAny: ['hospitality', 'creative-arty'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-healthcare',
    persona: 'Healthcare & Telehealth',
    title: 'Zoom Backgrounds for Healthcare & Telehealth',
    h1: 'Virtual Backgrounds for Healthcare',
    description:
      'Clean, calm virtual backgrounds for healthcare and telehealth providers on Zoom, Teams, and Google Meet. Bright, uncluttered spaces that reassure patients.',
    eyebrow: 'For Healthcare & Telehealth',
    intro: [
      'A telehealth visit should feel calm, clean, and professional the instant a patient joins. These bright, uncluttered interiors are designed to reassure rather than distract — neutral, orderly, and easy on the eye through a webcam.',
      'Each environment is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays clear on Zoom, Microsoft Teams, and Google Meet. Curated for clinicians and telehealth providers.',
    ],
    rule: {
      categoriesAny: ['office-spaces', 'home-office', 'living-rooms'],
      facetsAny: ['serene-calm', 'minimal-clean', 'bright-airy', 'neutral-palette'],
    },
    exclude: { facetsAny: ['hospitality', 'creative-arty', 'bookshelf-library'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-teachers',
    persona: 'Teachers & Educators',
    title: 'Zoom Backgrounds for Teachers & Educators',
    h1: 'Virtual Backgrounds for Teachers',
    description:
      'Inviting virtual backgrounds for teachers and online educators on Zoom, Teams, and Google Meet. Warm, book-lined spaces that keep students focused and at ease.',
    eyebrow: 'For Teachers & Educators',
    intro: [
      'Teaching online is hard enough without a busy background pulling focus. These warm, book-lined, and lightly inviting spaces are designed to feel approachable to students while staying calm enough to keep attention on the lesson.',
      'Every image is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays legible on Zoom, Microsoft Teams, and Google Meet. Curated for teachers, tutors, and online educators.',
    ],
    rule: {
      categoriesAny: ['bookshelves', 'wall-shelves', 'libraries', 'home-office', 'living-rooms'],
      facetsAny: ['bookshelf-library', 'bright-airy', 'cozy-warm', 'nature-greenery'],
    },
    exclude: { facetsAny: ['hospitality'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-tech-professionals',
    persona: 'Tech & Startup',
    title: 'Zoom Backgrounds for Tech & Startup Pros',
    h1: 'Virtual Backgrounds for Tech Professionals',
    description:
      'Modern, minimal virtual backgrounds for tech and startup professionals on Zoom, Teams, and Google Meet. Clean lofts and design-forward offices built for camera.',
    eyebrow: 'For Tech & Startup Professionals',
    intro: [
      'Tech culture reads design instantly, and a generic blurred room undercuts it. These modern, minimal lofts and design-forward offices are built to look intentional on camera — clean lines, good light, nothing fussy.',
      'Each background is studio-designed and 4K-upscaled, composed for camera and engineered for codec compression so it stays crisp on Zoom, Microsoft Teams, and Google Meet. Curated for engineers, founders, and product teams.',
    ],
    rule: {
      categoriesAny: ['urban-lofts', 'office-spaces', 'home-office'],
      facetsAny: ['minimal-clean', 'creative-arty', 'bright-airy', 'formal-executive'],
    },
    exclude: { facetsAny: ['hospitality', 'bookshelf-library', 'cozy-warm'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-recruiters',
    persona: 'Recruiters & HR',
    title: 'Zoom Backgrounds for Recruiters & HR Teams',
    h1: 'Virtual Backgrounds for Recruiters',
    description:
      'Approachable, professional virtual backgrounds for recruiters and HR teams on Zoom, Teams, and Google Meet. Bright, welcoming offices built for interviews.',
    eyebrow: 'For Recruiters & HR',
    intro: [
      'A first interview is a two-way impression, and your background sets the tone for the candidate too. These bright, welcoming offices are designed to feel open and human on camera — professional enough to signal a real workplace, warm enough to put nervous candidates at ease.',
      'Every environment is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays clean on Zoom, Microsoft Teams, and Google Meet. Curated for recruiters, talent teams, and HR professionals.',
    ],
    rule: {
      categoriesAny: ['home-office', 'office-spaces', 'living-rooms'],
      facetsAny: ['bright-airy', 'minimal-clean', 'formal-executive'],
    },
    exclude: { facetsAny: ['hospitality', 'cozy-warm', 'bookshelf-library', 'nature-greenery'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-sales',
    persona: 'Sales Professionals',
    title: 'Zoom Backgrounds for Sales Professionals',
    h1: 'Virtual Backgrounds for Sales Professionals',
    description:
      'Confident, polished virtual backgrounds for sales professionals on Zoom, Teams, and Google Meet. Modern offices designed to build trust on every pitch.',
    eyebrow: 'For Sales Professionals',
    intro: [
      'A pitch is won or lost on trust, and a sharp, confident backdrop quietly does some of that work for you. These modern, polished offices are designed to read as successful and credible on camera — the kind of room a prospect expects a closer to call from.',
      'Each image is studio-designed and 4K-upscaled, composed for camera and engineered for codec compression so it stays crisp on Zoom, Microsoft Teams, and Google Meet. Curated for account executives, SDRs, and sales leaders.',
    ],
    rule: {
      categoriesAny: ['office-spaces', 'urban-lofts', 'home-office'],
      facetsAny: ['formal-executive', 'minimal-clean', 'bright-airy'],
    },
    exclude: { facetsAny: ['hospitality', 'nature-greenery', 'bookshelf-library'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-coaches',
    persona: 'Coaches & Mentors',
    title: 'Zoom Backgrounds for Coaches & Mentors',
    h1: 'Virtual Backgrounds for Coaches',
    description:
      'Warm, motivating virtual backgrounds for life and business coaches on Zoom, Teams, and Google Meet. Inviting spaces designed to build rapport with clients.',
    eyebrow: 'For Coaches & Mentors',
    intro: [
      'Coaching runs on connection, and a warm, personal space helps a client open up. These inviting interiors — soft light, books, greenery, and unhurried calm — are designed to feel approachable and grounded on camera, never corporate or cold.',
      'Every background is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays gentle on Zoom, Microsoft Teams, and Google Meet. Curated for life coaches, business coaches, and mentors.',
    ],
    rule: {
      categoriesAny: ['home-office', 'living-rooms', 'bookshelves', 'libraries'],
      facetsAny: ['cozy-warm', 'home-casual', 'serene-calm'],
    },
    exclude: { facetsAny: ['hospitality', 'minimal-clean', 'formal-executive'] },
    minCount: 12,
    maxShown: 60,
  },
  {
    slug: 'zoom-backgrounds-for-accountants',
    persona: 'Accountants & Bookkeepers',
    title: 'Zoom Backgrounds for Accountants & CPAs',
    h1: 'Virtual Backgrounds for Accountants',
    description:
      'Orderly, trustworthy virtual backgrounds for accountants and bookkeepers on Zoom, Teams, and Google Meet. Established offices that signal precision and care.',
    eyebrow: 'For Accountants & Bookkeepers',
    intro: [
      'Clients hand accountants their numbers, and an orderly, established backdrop quietly reassures them those numbers are in careful hands. These tidy, book-lined offices are designed to read as precise, stable, and detail-minded on camera.',
      'Each environment is studio-designed and 4K-upscaled, composed for camera and tuned for codec compression so it stays sharp on Zoom, Microsoft Teams, and Google Meet. Curated for accountants, CPAs, and bookkeepers.',
    ],
    rule: {
      categoriesAny: ['bookshelves', 'wall-shelves', 'libraries', 'office-spaces', 'home-office'],
      facetsAny: ['bookshelf-library', 'formal-executive', 'neutral-palette', 'minimal-clean'],
    },
    exclude: { facetsAny: ['hospitality', 'nature-greenery', 'creative-arty'] },
    minCount: 12,
    maxShown: 60,
  },
];

// Self-policing meta budgets, mirroring lib/seo/seo.js. A persona whose title
// or description falls outside the indexable budget throws at module load, so
// the build fails loudly rather than shipping an out-of-budget page.
function validatePersonas(defs) {
  const seen = new Set();
  for (const d of defs) {
    if (!d.slug || seen.has(d.slug)) {
      throw new Error(`personas: missing or duplicate slug "${d.slug}"`);
    }
    seen.add(d.slug);
    if (typeof d.title !== 'string' || d.title.length < 20 || d.title.length > 65) {
      throw new Error(`personas: "${d.slug}" title length ${d.title?.length} outside 20–65`);
    }
    if (typeof d.description !== 'string' || d.description.length < 110 || d.description.length > 160) {
      throw new Error(`personas: "${d.slug}" description length ${d.description?.length} outside 110–160`);
    }
    if (typeof d.h1 !== 'string' || !d.h1) {
      throw new Error(`personas: "${d.slug}" missing h1`);
    }
  }
  return defs;
}

module.exports = { PERSONAS: validatePersonas(PERSONAS) };
