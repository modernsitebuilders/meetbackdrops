// Single derivation layer between the canonical manifest (lib/manifest.js)
// and frontend reads (browse search, category pages). This module is the
// only place outside lib/manifest.js permitted to shape manifest entries
// for UI consumption — never import final_manifest.json directly.

import { getAllImages, getImagesByCategory } from './manifest';

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

// Lightweight index for /browse search. Excludes heavy fields (download
// metadata, dimensions, description, etc.) so the JSON shipped to the
// client stays small. `category` falls back to `folder` so merged
// categories (bookshelves-bright, etc.) resolve to the correct R2 path
// when SearchResults builds image URLs. `keywords` is the legacy alias
// for the canonical `tags` field — preserved here because useImageSearch
// reads it directly.
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

// Manifest entries for a category slug. Handles merged categories like
// 'bookshelves' (which aggregates 'bookshelves-bright' + 'bookshelves-dark')
// by falling back to a folder/category prefix match. Order is preserved as
// returned by lib/manifest.js — do not re-rank.
export function getCategoryIndex(slug) {
  if (!slug) return [];
  const direct = getImagesByCategory(slug);
  if (direct.length > 0) return direct;
  const prefix = slug + '-';
  return getAllImages().filter((img) => {
    if (!img) return false;
    if (img.category === slug || img.folder === slug) return true;
    if (typeof img.folder === 'string' && img.folder.startsWith(prefix)) return true;
    if (typeof img.category === 'string' && img.category.startsWith(prefix)) return true;
    return false;
  });
}
