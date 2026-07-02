// Read-only sanitizer for analytics INPUT (Google Sheets rows, tracking
// logs). The category architecture is deterministic routing-key-only —
// this module MUST NOT infer, remap, or transform category values.
//
// Behavior:
//   - Trim, strip known row-prefix, lowercase, reject malformed shapes.
//   - Return the raw value only when it matches a known canonical slug.
//   - Return null otherwise. No alias translation, no fallback mapping.
//
// STRICT CONSTRAINTS:
//   - Used ONLY when reading analytics data.
//   - MUST NOT be called from image-dataset paths (manifest, category
//     pages, search, components, hd.js).
//   - MUST NOT modify img.category on any manifest entry.
//
// The authoritative category for any real image is always the manifest
// entry looked up by filename. This normalizer is a last-resort check
// for rows where the filename is missing or doesn't resolve.

// Known canonical slugs present in the current manifest. Kept here
// (rather than imported from categoryData.js) so this module stays
// analytics-scoped with no UI coupling.
const CANONICAL_CATEGORIES = new Set([
  'art-galleries',
  'bokeh-backgrounds',
  'bookshelves',
  'bookshelves-bright',
  'bookshelves-dark',
  'christmas-backgrounds',
  'coffee-shops',
  'easter-backgrounds',
  'fall-backgrounds',
  'gardens-patios',
  'halloween-backgrounds',
  'historic-spaces',
  'home-office',
  'kitchens',
  'libraries',
  'living-rooms',
  'nature-landscapes',
  'neutral-backgrounds',
  'office-spaces',
  'spring-backgrounds',
  'summer-backgrounds',
  'urban-lofts',
  'valentines-backgrounds',
  'wall-shelves',
  'wall-shelves-bright',
  'wall-shelves-dark',
]);

function normalizeAnalyticsCategory(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let value = raw.trim();
  if (!value) return null;

  if (value.startsWith('MeetBackdrops-')) {
    value = value.slice('MeetBackdrops-'.length);
  } else if (value.startsWith('StreamBackdrops-')) {
    value = value.slice('StreamBackdrops-'.length);
  }
  value = value.toLowerCase();

  if (value.includes('.') || value.includes('/') || value.length > 40) {
    return null;
  }

  return CANONICAL_CATEGORIES.has(value) ? value : null;
}

// Event-type strings that represent a successful image "use" in the Sheets
// analytics log — all counted as downloads by aggregation/scoring code.
// The download tracker (lib/useImageDownload.js) defaults to
// 'cat_image_download' and uses 'modal_download' for modal downloads;
// older rows used the bare 'download' value. 'zoom_apply' is the in-Zoom
// equivalent — applying a background to the user's camera via the Zoom App
// (pages/zoom-app/index.js) — and is weighted the same as a free download
// so the most-popular page reflects usage across both surfaces.
// (Note: 'zoom_install_click', the "Use in Zoom" button on the site, is an
// install-funnel intent, NOT usage, and is intentionally excluded.)
const DOWNLOAD_EVENTS = new Set([
  'download',
  'cat_image_download',
  'modal_download',
  'zoom_apply',
]);

function isDownloadEvent(eventType) {
  return DOWNLOAD_EVENTS.has(eventType);
}

module.exports = {
  normalizeAnalyticsCategory,
  CANONICAL_CATEGORIES,
  DOWNLOAD_EVENTS,
  isDownloadEvent,
};
