#!/usr/bin/env node
// ============================================================================
// generate-hd-only.js
// ----------------------------------------------------------------------------
// Regenerates lib/hdOnly.js from the canonical manifest at
// image-pipeline/final_manifest.json.
//
// The generated file is a hand-committed static list so the client bundle
// does not have to import the full manifest just to answer "is this slug
// HD-only?". Runtime behavior is identical to the hand-written version; only
// the contents of HD_ONLY_SLUGS change.
//
// Usage:
//   node scripts/generate-hd-only.js
//
// Exit codes:
//   0  rewrote lib/hdOnly.js successfully (or no changes needed)
//   1  unexpected error (I/O, parse, etc.)
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'lib', 'hdOnly.js');

function groupByFolder(entries) {
  const groups = {};
  for (const entry of entries) {
    const key = entry.folder || entry.category || 'uncategorized';
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry.slug);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort();
  }
  return groups;
}

function formatSlugGroup(slugs) {
  // Emit 3 slugs per line for readability; matches the existing file layout.
  const lines = [];
  for (let i = 0; i < slugs.length; i += 3) {
    const chunk = slugs.slice(i, i + 3).map((s) => `'${s}'`).join(', ');
    lines.push(`  ${chunk},`);
  }
  return lines.join('\n');
}

function buildFileContents(groups) {
  const header = `// ============================================================================
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
`;

  const setBody = Object.keys(groups)
    .sort()
    .map((folder) => `  // ${folder}\n${formatSlugGroup(groups[folder])}`)
    .join('\n');

  return `${header}export const HD_ONLY_SLUGS = new Set([
${setBody}
]);

export function isHdOnlySlug(slug) {
  if (!slug) return false;
  return HD_ONLY_SLUGS.has(slug);
}

export function isHdOnlyFilename(filename) {
  if (!filename) return false;
  return HD_ONLY_SLUGS.has(filename.replace(/\\.webp$/i, ''));
}

export function isHdOnlyProductId(productId) {
  if (!productId) return false;
  return HD_ONLY_SLUGS.has(productId.replace(/-hd$/, ''));
}

export function getHdOnlySet() {
  return HD_ONLY_SLUGS;
}
`;
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[generate-hd-only] Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) {
    console.error('[generate-hd-only] Manifest is not an array');
    process.exit(1);
  }

  const hdOnlyEntries = manifest.filter((entry) => entry && entry.hdOnly === true && entry.slug);
  const groups = groupByFolder(hdOnlyEntries);
  const output = buildFileContents(groups);

  const prev = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (prev === output) {
    console.log(`[generate-hd-only] No changes. ${hdOnlyEntries.length} hdOnly slugs across ${Object.keys(groups).length} folders.`);
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`[generate-hd-only] Wrote ${OUTPUT_PATH}`);
  console.log(`[generate-hd-only] ${hdOnlyEntries.length} hdOnly slugs across ${Object.keys(groups).length} folders.`);
}

try {
  main();
} catch (err) {
  console.error('[generate-hd-only] Failed:', err);
  process.exit(1);
}
