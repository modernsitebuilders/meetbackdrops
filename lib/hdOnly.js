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
  // bookshelves-bright
  'bookshelves-bright-01', 'bookshelves-bright-02', 'bookshelves-bright-10',
  'bookshelves-bright-13', 'bookshelves-bright-19',
  // bookshelves-dark
  'bookshelves-dark-07', 'bookshelves-dark-23', 'bookshelves-dark-25',
  'bookshelves-dark-27', 'bookshelves-dark-37',
  // easter-backgrounds
  'easter-background-03', 'easter-background-04', 'easter-background-21',
  'easter-background-32', 'easter-background-49',
  // home-office
  'home-offices-20', 'home-offices-48', 'home-offices-61',
  'home-offices-69', 'home-offices-74',
  // libraries
  'library-17',
  // living-rooms
  'living-room-08', 'living-room-10', 'living-room-27',
  'living-room-41', 'living-room-46',
  // office-spaces
  'office-spaces-02', 'office-spaces-19', 'office-spaces-28',
  'office-spaces-33', 'office-spaces-35',
  // wall-shelves-bright
  'wall-shelves-bright-01', 'wall-shelves-bright-02', 'wall-shelves-bright-03',
  'wall-shelves-bright-16', 'wall-shelves-bright-49',
  // wall-shelves-dark
  'wall-shelves-dark-04', 'wall-shelves-dark-06', 'wall-shelves-dark-19',
  'wall-shelves-dark-27', 'wall-shelves-dark-34',
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
