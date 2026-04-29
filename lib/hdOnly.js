// ============================================================================
// HD-ONLY SLUG LIST
// ----------------------------------------------------------------------------
// SOURCE OF TRUTH: image-pipeline/final_manifest.json (hdOnly=true entries).
//
// This file is DERIVED from the canonical manifest and MUST stay in sync with
// it. It is intentionally maintained as a static, hand-committed list so that
// the client bundle does NOT import the full manifest (~616 KB) to answer a
// single boolean question per image.
//
// To regenerate this file after changing hdOnly flags in the manifest, run:
//   node scripts/generate-hd-only.js
// The script rewrites this file in-place and validates the slug count.
// ============================================================================
export const HD_ONLY_SLUGS = new Set([

]);

export function isHdOnlySlug(slug) {
  if (!slug) return false;
  return HD_ONLY_SLUGS.has(slug);
}

export function isHdOnlyFilename(filename) {
  if (!filename) return false;
  return HD_ONLY_SLUGS.has(filename.replace(/\.webp$/i, ''));
}

export function isHdOnlyProductId(productId) {
  if (!productId) return false;
  return HD_ONLY_SLUGS.has(productId.replace(/-hd$/, ''));
}

export function getHdOnlySet() {
  return HD_ONLY_SLUGS;
}
