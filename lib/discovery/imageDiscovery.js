// lib/discovery/imageDiscovery.js
//
// Turns a single manifest image into a set of discovery-graph edges, entirely
// from metadata the pipeline already produces (category + tags → facets). No
// per-image authoring; a future Midjourney image benefits automatically the
// moment it lands in the manifest with tags.
//
// Reuses the ONE matching engine (lib/collections/engine.matches) against the
// published themes — the same membership logic behind /backgrounds/{theme} and
// the platform matrix — so an image's theme chips are guaranteed consistent with
// the theme pages they link to.
//
// Everything here is pure and deterministic (server-side, called from the image
// page's getStaticProps).

const { matches } = require('../collections/engine');
const { getPublishedThemes } = require('../collections/themeEngine');
const { THEMES, THEME_USE_CASES } = require('../../data/collections/themes');
const { PLATFORMS } = require('../../data/platforms');

// Themes this image belongs to, in canonical THEME order (broad → specific).
// engine.matches already rejects seasonal images, so seasonal image pages simply
// carry no theme chips — correct, since themes exclude seasonal categories.
function themesForImage(image) {
  const published = new Set(getPublishedThemes().map((t) => t.slug));
  return THEMES
    .filter((t) => published.has(t.slug) && matches(image, t))
    .map((t) => ({ slug: t.slug, label: t.label, modifier: t.modifier }));
}

// A compact, deduped use-case list = union of the matched themes' use-cases,
// preserving theme order, capped. Drives the metadata-driven "Great for …" line.
function useCasesFor(themeList, cap = 4) {
  const out = [];
  const seen = new Set();
  for (const t of themeList) {
    for (const uc of (THEME_USE_CASES[t.slug] || [])) {
      const key = uc.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(uc);
      if (out.length >= cap) return out;
    }
  }
  return out;
}

// The full discovery bundle for an image page. `platforms` deep-links into the
// platform × theme matrix when the image has a primary theme, else into the
// platform landing — so "Available for Zoom" lands on the most specific page.
function getImageDiscovery(image) {
  const themes = themesForImage(image);
  const primaryThemeSlug = themes.length ? themes[0].slug : null;

  const platforms = PLATFORMS.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
    href: primaryThemeSlug ? `/${p.slug}/${primaryThemeSlug}` : `/${p.slug}`,
  }));

  return {
    themes,
    primaryThemeSlug,
    platforms,
    useCases: useCasesFor(themes),
  };
}

// Similarity-ranked "related" images, replacing the old next-6-in-category
// selection. Ranks same-category siblings by TAG OVERLAP with the current image
// (the strongest cheap similarity signal we have), tiebroken by popularity
// score, then by manifest order for full determinism. Falls back to sequential
// order when an image has no tags, so behaviour degrades gracefully and never
// returns fewer results than before.
function getSimilarImages(image, siblings, scoreMap = {}, count = 6) {
  const others = siblings.filter((s) => s && s.slug && s.slug !== image.slug);
  const myTags = new Set((image.tags || image.keywords || []).map((t) => String(t).toLowerCase()));

  if (myTags.size === 0) {
    return others.slice(0, count);
  }

  const scoreOf = (s) => {
    const base = String(s.image_webp || '').replace(/\.(webp|png|jpe?g)$/i, '');
    const v = scoreMap[s.image_webp] ?? scoreMap[`${base}.webp`] ?? scoreMap[`${base}.png`];
    return typeof v === 'object' && v ? (v.score ?? 0) : (v ?? 0);
  };

  const ranked = others
    .map((s, idx) => {
      const tags = (s.tags || s.keywords || []).map((t) => String(t).toLowerCase());
      let overlap = 0;
      for (const t of tags) if (myTags.has(t)) overlap += 1;
      return { s, overlap, score: scoreOf(s), idx };
    })
    .sort((a, b) => (b.overlap - a.overlap) || (b.score - a.score) || (a.idx - b.idx));

  // If nothing shares a tag, keep the original sequential neighbours rather than
  // an arbitrary score sort — avoids "random"-feeling related on sparse tags.
  if (ranked.every((r) => r.overlap === 0)) {
    return others.slice(0, count);
  }

  return ranked.slice(0, count).map((r) => r.s);
}

module.exports = { getImageDiscovery, getSimilarImages, themesForImage, useCasesFor };
