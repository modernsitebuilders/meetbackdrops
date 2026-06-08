// lib/collections/facets.js
//
// Canonical facet vocabulary for persona/industry collections.
//
// The manifest carries ~657 noisy free-text tags (`bookshelf` vs
// `bookshelves`, `creative` / `creative space` / `creative atmosphere`).
// Collection membership must never be decided by that raw soup. Instead,
// every image is folded into a small, controlled set of CANONICAL FACETS —
// derived deterministically from its tags AND its category — and persona
// rules are written purely against those facets + category.
//
// deriveFacets(image) is pure and side-effect free. Same input → same output.
// No network, no scores, no ML. This is the substrate the deterministic
// persona rules (data/collections/personas.js) stand on.

// Each facet maps to a list of lowercase substrings. If any of an image's
// tags CONTAINS one of these substrings, the image carries that facet.
const TAG_FACET_RULES = {
  'formal-executive': [
    'executive', 'boardroom', 'corporate', 'sophisticated', 'conference',
    'professional', 'refined', 'authoritative', 'formal',
  ],
  'cozy-warm': [
    'cozy', 'warm lighting', 'warm tone', 'inviting', 'rustic', 'soft lighting',
    'snug', 'homely', 'intimate',
  ],
  'minimal-clean': [
    'minimalist', 'minimal', 'clean line', 'clean', 'modern', 'sleek',
    'uncluttered', 'contemporary',
  ],
  'bright-airy': [
    'bright', 'natural light', 'spacious', 'airy', 'sunlit', 'light-filled',
    'open',
  ],
  'bookshelf-library': [
    'bookshelf', 'bookshelves', 'shelving', 'shelves', 'shelf', 'library',
    'books', 'reading',
  ],
  'nature-greenery': [
    'greenery', 'plant', 'nature', 'garden', 'botanical', 'outdoor', 'foliage',
    'landscape', 'patio',
  ],
  'home-casual': [
    'living room', 'home', 'kitchen', 'bedroom', 'lounge', 'domestic',
    'apartment',
  ],
  'creative-arty': [
    'gallery', 'art', 'creative', 'loft', 'industrial', 'studio', 'eclectic',
    'design',
  ],
  'hospitality': [
    'coffee', 'cafe', 'café', 'espresso', 'barista', 'restaurant',
  ],
  'serene-calm': [
    'serene', 'calm', 'tranquil', 'peaceful', 'soothing', 'quiet', 'zen',
  ],
  'wood-natural': [
    'wood', 'wooden', 'oak', 'walnut', 'timber', 'natural material',
  ],
  'neutral-palette': [
    'neutral palette', 'neutral', 'monochrome', 'muted', 'beige', 'greige',
  ],
};

// Category → facets these images structurally guarantee, regardless of tags.
// (A bookshelves image is a bookshelf even if its tags drifted.)
const CATEGORY_FACET_RULES = {
  'bookshelves': ['bookshelf-library'],
  'wall-shelves': ['bookshelf-library'],
  'libraries': ['bookshelf-library'],
  'office-spaces': ['formal-executive'],
  'home-office': ['home-casual'],
  'living-rooms': ['home-casual'],
  'kitchens': ['home-casual'],
  'coffee-shops': ['hospitality'],
  'art-galleries': ['creative-arty'],
  'urban-lofts': ['creative-arty'],
  'gardens-patios': ['nature-greenery'],
  'nature-landscapes': ['nature-greenery'],
  'historic-spaces': ['formal-executive'],
};

// Seasonal / occasion categories. Persona collections target year-round
// professional use, so these are excluded by default (a lawyer does not want
// a Halloween background on a client call).
const SEASONAL_CATEGORIES = new Set([
  'christmas-backgrounds',
  'halloween-backgrounds',
  'valentines-backgrounds',
  'easter-backgrounds',
  'spring-backgrounds',
  'summer-backgrounds',
]);

/**
 * Derive the canonical facet Set for a single manifest image.
 * @param {{ tags?: string[], keywords?: string[], category?: string }} image
 * @returns {Set<string>}
 */
function deriveFacets(image) {
  const facets = new Set();
  if (!image) return facets;

  const tags = Array.isArray(image.tags)
    ? image.tags
    : (Array.isArray(image.keywords) ? image.keywords : []);
  const lowerTags = tags.map((t) => String(t).toLowerCase());

  for (const [facet, substrings] of Object.entries(TAG_FACET_RULES)) {
    if (lowerTags.some((tag) => substrings.some((s) => tag.includes(s)))) {
      facets.add(facet);
    }
  }

  const catFacets = CATEGORY_FACET_RULES[image.category];
  if (catFacets) catFacets.forEach((f) => facets.add(f));

  return facets;
}

function isSeasonal(image) {
  return !!image && SEASONAL_CATEGORIES.has(image.category);
}

module.exports = {
  deriveFacets,
  isSeasonal,
  SEASONAL_CATEGORIES,
  TAG_FACET_RULES,
  CATEGORY_FACET_RULES,
};
