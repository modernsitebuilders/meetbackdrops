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
// older rows used the bare 'download' value. The rest are per-surface
// equivalents, each weighted the same as a free download so the
// most-popular page and insights reflect usage across ALL surfaces:
//   'zoom_apply'          — applying a background in the Zoom App (pages/zoom-app)
//   'meet_download'       — downloading from the Google Meet add-on (pages/meet-addon)
//   'email_bonus_download'— the email-gated download shown at the rate-limit wall
//                           (lib/useImageDownload.js handleEmailBonus)
//   'free_sample_download'— the standalone 4K free-sample download (pages/free-sample)
// Each is a SOLE signal for its download (it does not also fire
// 'cat_image_download'), so including them here does not double-count.
// Deliberately EXCLUDED: intent/funnel markers that fire alongside a real
// download or aren't a use — 'popular_download' (fires next to a
// 'cat_image_download' on the most-popular grid → would double-count),
// 'zoom_install_click' (install intent, not usage). Revenue events live in
// REVENUE_EVENTS below, not here (their filename is a product-id list, which
// would pollute per-image scoring).
const DOWNLOAD_EVENTS = new Set([
  'download',
  'cat_image_download',
  'modal_download',
  'zoom_apply',
  'meet_download',
  'email_bonus_download',
  'free_sample_download',
]);

function isDownloadEvent(eventType) {
  return DOWNLOAD_EVENTS.has(eventType);
}

// Event-type strings that represent actual REVENUE, not image usage. Kept
// separate from DOWNLOAD_EVENTS because these are money events, not per-image
// uses (their filename field is an email or a comma-joined product-id list, so
// counting them as downloads would corrupt per-image popularity scoring).
// Consumed by the conversion/revenue section of scripts/data-platform/insights.mjs
// and highlighted by pages/api/cron/flush-analytics.js.
//   'hd_purchase'    — one-off HD Edition purchase(s)   (pages/hd-download.js)
//   'hd_subscription'— HD subscription activation       (pages/api/subscription-activate.js)
//   'license_purchase'— commercial/extended license buy (pages/license-success.js)
const REVENUE_EVENTS = new Set([
  'hd_purchase',
  'hd_subscription',
  'license_purchase',
]);

function isRevenueEvent(eventType) {
  return REVENUE_EVENTS.has(eventType);
}

module.exports = {
  normalizeAnalyticsCategory,
  CANONICAL_CATEGORIES,
  DOWNLOAD_EVENTS,
  isDownloadEvent,
  REVENUE_EVENTS,
  isRevenueEvent,
};
