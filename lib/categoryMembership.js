// Central, explicit merged-category membership config.
//
// This is the ONLY place in the codebase that may expand a category slug
// to its constituent manifest category values. Category filtering is
// either strict equality (img.category === slug) OR explicit membership
// from this map. No prefix matching, no filename inference, no fuzzy
// logic anywhere else.
//
// If you add a merged category here, also add it to getStaticPaths in
// pages/category/[slug]/index.js.

const CATEGORY_MEMBERSHIP = Object.freeze({
  bookshelves: ['bookshelves', 'bookshelves-bright', 'bookshelves-dark'],
  'wall-shelves': ['wall-shelves', 'wall-shelves-bright', 'wall-shelves-dark'],
});

function resolveCategoryMembers(slug) {
  if (!slug) return [];
  if (CATEGORY_MEMBERSHIP[slug]) return CATEGORY_MEMBERSHIP[slug];
  return [slug];
}

function isMemberOf(slug, category) {
  if (!slug || !category) return false;
  return resolveCategoryMembers(slug).includes(category);
}

module.exports = {
  CATEGORY_MEMBERSHIP,
  resolveCategoryMembers,
  isMemberOf,
};
