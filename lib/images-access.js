// ============================================================================
// IMAGES ACCESS LAYER — single, unbypassable source of truth for
// free vs. exclusive (premium) classification.
// ----------------------------------------------------------------------------
// Canonical shape returned to callers:
//   { ...img, access: "free" | "exclusive" }
//
// Rules (ENFORCED):
//   1. Access is derived exactly ONCE at the ingestion boundary below.
//      HD_ONLY_SLUGS (derived from image-pipeline/final_manifest.json's
//      hdOnly flag) is the only signal consulted.
//   2. Raw per-category arrays are NOT exported. Callers receive only
//      filtered accessors.
//   3. Invariant guards ensure a regression throws loudly rather than
//      silently leaking premium images into free sections.
// ============================================================================

import { categoryInfo } from '../data/categoryData';
import { HD_ONLY_SLUGS } from './hdOnly';

function classify(img) {
  if (img && img.access === 'exclusive') return 'exclusive';
  const base =
    (img && img.filename && img.filename.replace(/\.webp$/i, '')) ||
    (img && img.slug) ||
    '';
  return HD_ONLY_SLUGS.has(base) ? 'exclusive' : 'free';
}

const normalizedByCategory = Object.create(null);
for (const slug of Object.keys(categoryInfo || {})) {
  const list = (categoryInfo[slug] && categoryInfo[slug].images) || [];
  normalizedByCategory[slug] = list.map((img) => ({
    ...img,
    access: classify(img),
  }));
}

if (process.env.NODE_ENV !== 'production') {
  Object.values(normalizedByCategory).forEach((arr) => {
    arr.forEach((img) => Object.freeze(img));
    Object.freeze(arr);
  });
  Object.freeze(normalizedByCategory);
}

function guard(list, expected, slug) {
  if (list.some((img) => img.access !== expected)) {
    const other = expected === 'free' ? 'exclusive' : 'free';
    throw new Error(
      `Invariant violation: ${other} image leaked into ${expected} set for "${slug}"`
    );
  }
  return list;
}

export function getFreeImages(slug) {
  const list = normalizedByCategory[slug] || [];
  return guard(list.filter((img) => img.access === 'free'), 'free', slug);
}

export function getPremiumImages(slug) {
  const list = normalizedByCategory[slug] || [];
  return guard(
    list.filter((img) => img.access === 'exclusive'),
    'exclusive',
    slug
  );
}
