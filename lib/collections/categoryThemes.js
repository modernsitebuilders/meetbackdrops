// lib/collections/categoryThemes.js
//
// PURE, client-safe category → theme derivation. Imports ONLY the small theme
// definitions (no manifest, no engine), so it is cheap to import into a client
// component for the category-page "browse by style" strip without dragging the
// image manifest into the browser bundle.
//
// A theme is relevant to a category when that category is one of the theme's
// source categories (rule.categoriesAny). Ordered by the theme's own position
// so the broad, high-volume themes (office, bookshelf …) surface first.

const { THEMES } = require('../../data/collections/themes');

function getThemesForCategory(categorySlug, limit = 6) {
  if (!categorySlug) return [];
  const out = [];
  for (const t of THEMES) {
    const cats = t.rule?.categoriesAny;
    if (Array.isArray(cats) && cats.includes(categorySlug)) {
      out.push({ slug: t.slug, label: t.label });
    }
    if (out.length >= limit) break;
  }
  return out;
}

module.exports = { getThemesForCategory };
