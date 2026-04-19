// Single derivation layer between the canonical manifest (lib/manifest.js)
// and frontend reads (browse search, category pages). This module is the
// only place outside lib/manifest.js permitted to shape manifest entries
// for UI consumption — never import final_manifest.json directly.
//
// CATEGORY INVARIANT: img.category is assigned once by the ingestion
// pipeline and is immutable thereafter. This module filters by strict
// equality OR explicit membership (lib/categoryMembership.js). No
// prefix, filename, slug, or fuzzy inference is permitted here.

import { getAllImages, getImagesByCategory } from './manifest';
import { resolveCategoryMembers } from './categoryMembership';

// UI-safe subset of a canonical image record.
export function getMinimalImageFields(image) {
  if (!image) return null;
  return {
    slug: image.slug,
    filename: image.filename,
    title: image.title,
    alt: image.alt,
    keywords: Array.isArray(image.keywords) ? image.keywords : [],
    category: image.category,
  };
}

// Lightweight index for /browse search. Excludes heavy fields so the JSON
// shipped to the client stays small. The `category` field here falls back
// to `folder` because SearchResults passes it directly to webpUrl() for
// R2 URL construction — the folder is the true R2 path for merged
// categories. This is a field-assignment convenience for URL building,
// not category classification.
export function getSearchIndex() {
  return getAllImages().map((img) => ({
    slug: img.slug,
    filename: img.filename,
    title: img.title,
    alt: img.alt,
    category: img.folder || img.category,
    keywords: Array.isArray(img.keywords) ? img.keywords : [],
  }));
}

// Manifest entries for a category slug. Resolves merged categories via
// the explicit CATEGORY_MEMBERSHIP map — never via prefix matching.
export function getCategoryIndex(slug) {
  if (!slug) return [];
  const members = resolveCategoryMembers(slug);
  if (members.length === 1) {
    return getImagesByCategory(members[0]);
  }
  const all = [];
  for (const member of members) {
    const found = getImagesByCategory(member);
    if (found.length) all.push(...found);
  }
  return all;
}
