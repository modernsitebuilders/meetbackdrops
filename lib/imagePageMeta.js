/**
 * Rendered <title> / meta description for individual image pages
 * (pages/category/[slug]/[imageSlug].js — the site's largest page class).
 *
 * ⚠️  Shared, single source of truth: this module is imported by the page AND
 * required by scripts/check-seo-meta.js, which length-checks all ~1,759
 * manifest entries through these exact functions. Keep it CommonJS so the
 * plain-Node check script can require it. Change the scheme here only.
 *
 * Why the manifest's stored copy can't ship verbatim:
 *   - Every `title` in final_manifest.json already ends with " | MeetBackdrops"
 *     (mandated by the vision prompt in image-pipeline/vision-full.js), so the
 *     page must not append the brand a second time.
 *   - ~1,076 older entries carry a templated marketing tail after an em dash
 *     ("… — Studio-Designed Background for Teams & Zoom"). It's boilerplate
 *     repeated across a thousand pages and it alone blows the 65-char budget,
 *     so it is dropped at render time. The descriptive head is the part that
 *     carries the search intent.
 *   - Descriptive heads still run up to ~83 chars, so the head is trimmed on a
 *     word boundary to whatever the brand suffix leaves.
 *   - 191 descriptions are shorter than the 110-char floor; they get a platform
 *     tail so search engines index our copy instead of rewriting it.
 *
 * Budgets are the ones in CLAUDE.md → "SEO meta budgets", enforced by
 * scripts/check-seo-meta.js: title 20-65, description 110-160.
 *
 * BRAND VOICE: corporate video calls (Zoom / Microsoft Teams / Google Meet).
 * Never introduce gamer / streamer / Twitch / esports framing here.
 */

const BRAND_SUFFIX = ' | MeetBackdrops';
const TITLE_MAX = 65;
const DESC_MIN = 110;
const DESC_MAX = 160;
const HEAD_MAX = TITLE_MAX - BRAND_SUFFIX.length; // 49 chars of descriptive room

// Appended to descriptions below the 110-char floor. Sized so that every
// manifest description (shortest is 85 chars) lands inside 110-160 with it.
// A future entry short enough that this tail can't reach the floor is a data
// problem, not a render problem — check-seo-meta.js fails the build and names
// the slug so the manifest copy gets fixed instead of papered over here.
const DESC_TAIL = ' Free download for Zoom, Teams, and Google Meet.';

// Words that read as truncation debris when a trim lands on them.
const DANGLING = /\s+(?:with|and|&|in|on|at|for|of|to|a|an|the|by|from|plus|featuring|over|under|near)$/i;

// Words that open a descriptive clause ("… with Holiday Decor", "… and Warm
// Lighting"). A trim that lands inside one of these clauses drops the whole
// clause rather than keeping a half of it ("Cozy Living Room with Christmas
// Tree", not "Cozy Living Room with Christmas Tree and Natural").
const CLAUSE_OPENERS = new Set(['with', 'and', '&', 'featuring', 'plus', 'in', 'over', 'under', 'near']);

// Below this, dropping a clause has cut away too much to still describe the
// image — keep the mid-clause trim instead.
const MIN_CLAUSE_TRIM = 15;

/** Trim to `max` chars on a word boundary, preferring a complete-clause cut. */
function trimToWords(text, max) {
  if (text.length <= max) return text;
  const words = text.split(/\s+/);

  // Greedily keep whole words up to the budget.
  let kept = 0;
  let len = 0;
  while (kept < words.length) {
    const add = (kept === 0 ? 0 : 1) + words[kept].length;
    if (len + add > max) break;
    len += add;
    kept += 1;
  }
  if (kept === 0) return text.slice(0, max).trim(); // single word longer than the budget

  // If the dropped words continue a clause we already started, back up to the
  // last clause opener so we end on a complete phrase.
  const droppedStartsNewClause = CLAUSE_OPENERS.has(words[kept].toLowerCase());
  if (!droppedStartsNewClause) {
    for (let i = kept - 1; i > 0; i--) {
      if (!CLAUSE_OPENERS.has(words[i].toLowerCase())) continue;
      const candidate = words.slice(0, i).join(' ');
      if (candidate.length >= MIN_CLAUSE_TRIM) return candidate;
      break;
    }
  }

  // No usable clause boundary — trim trailing punctuation and connectors.
  let out = words.slice(0, kept).join(' ');
  let prev;
  do {
    prev = out;
    out = out.replace(/[\s,;:\u2013\u2014-]+$/, '').replace(DANGLING, '');
  } while (out !== prev);
  return out || words.slice(0, kept).join(' ');
}

/**
 * Build the complete <title> for an image page.
 * Returns the full string shown in search results — the caller appends nothing.
 */
function buildImagePageTitle(rawTitle) {
  let base = String(rawTitle || '').trim();
  // Strip every trailing brand suffix the stored copy already carries.
  let prev;
  do {
    prev = base;
    base = base.replace(/\s*\|\s*MeetBackdrops(?:\s+Studio)?\s*$/i, '').trim();
  } while (base !== prev);
  // Drop the templated marketing tail after an em/en dash; keep the head.
  const head = base.split(/\s+[—–]\s+/)[0].trim();
  if (!head) return `Virtual Background${BRAND_SUFFIX}`;
  return trimToWords(head, HEAD_MAX) + BRAND_SUFFIX;
}

/**
 * Build the meta description for an image page.
 * `categoryName` seeds the fallback when an entry has no stored description.
 */
function buildImagePageDescription(rawDescription, categoryName = 'virtual') {
  let desc = String(rawDescription || '').trim();
  if (!desc) {
    desc = `Download this free ${String(categoryName).toLowerCase()} virtual background for Zoom, Microsoft Teams, and Google Meet. Studio-designed, no signup, no watermarks.`;
  }
  if (desc.length < DESC_MIN && desc.length + DESC_TAIL.length <= DESC_MAX) {
    desc += DESC_TAIL;
  }
  if (desc.length > DESC_MAX) desc = trimToWords(desc, DESC_MAX);
  return desc;
}

module.exports = {
  buildImagePageTitle,
  buildImagePageDescription,
  IMAGE_TITLE_MAX: TITLE_MAX,
  IMAGE_DESC_MIN: DESC_MIN,
  IMAGE_DESC_MAX: DESC_MAX,
};
