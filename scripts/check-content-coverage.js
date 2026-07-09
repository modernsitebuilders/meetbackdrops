#!/usr/bin/env node
/**
 * Content coverage guard.
 *
 * Complements scripts/validate-dataset.js, which is deliberately SCHEMA-ONLY
 * (it validates the manifest's own fields and the manifest↔categoryData
 * filename parity, but explicitly refuses registration/routing concerns).
 * This script covers the two gaps that keep biting us in practice — both are
 * documented in CLAUDE.md → "Common pitfalls":
 *
 *   1. Empty tags (pitfall #8). Tags drive persona/industry collection facets
 *      (lib/collections/facets.js). An image that ships with `tags: []`
 *      silently drops out of every collection. The add-images routine writes
 *      tags in its vision step; manual/stub additions forget them.
 *
 *   2. Category registration drift (pitfall #9). A category slug must be
 *      registered identically across every surface, or it half-exists — the
 *      page renders but analytics rollups (or the R2 folder map) silently
 *      drop it. We assert the UI category set is consistent across:
 *        - data/categoryData.js        → categoryInfo   (page template + grid)
 *        - data/categoryData.js        → folderMap      (R2 path routing)
 *        - lib/categories-config.js    → CATEGORIES     (counts + SEO config)
 *        - lib/analyticsNormalize.js   → CANONICAL_CATEGORIES (rollup keys)
 *
 * Unlike validate-dataset (which defaults to non-blocking LEGACY mode), this
 * guard always fails the build on violation — the two conditions above are
 * unambiguous breakage, not migration surface area.
 *
 * Run: `npm run check:coverage` (also runs as part of `prebuild`).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const CATEGORY_DATA_PATH = path.join(ROOT, 'data', 'categoryData.js');
const CATEGORIES_CONFIG_PATH = path.join(ROOT, 'lib', 'categories-config.js');
const ANALYTICS_NORMALIZE_PATH = path.join(ROOT, 'lib', 'analyticsNormalize.js');

// Merged categories: analytics normalizes the R2 folder-level variants
// (bookshelves-bright/dark, wall-shelves-bright/dark) as first-class rollup
// keys, so CANONICAL_CATEGORIES is intentionally a superset of the UI slug
// set by exactly these. They are NOT UI categories and must not be expected
// in categoryInfo / folderMap / config. Kept in sync with LEGACY_CATEGORY_
// VARIANTS in validate-dataset.js.
const KNOWN_ANALYTICS_ONLY_SLUGS = new Set([
  'bookshelves-bright',
  'bookshelves-dark',
  'wall-shelves-bright',
  'wall-shelves-dark',
]);

const errors = [];

// ---- Load inputs ----------------------------------------------------------

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// Extract the body of a top-level `export const <name> = { ... }` object by
// balancing braces, then return it for key extraction. Returns '' if absent.
function extractExportObjectBody(src, name) {
  const start = src.indexOf(`export const ${name}`);
  if (start === -1) return '';
  const braceStart = src.indexOf('{', start);
  if (braceStart === -1) return '';
  let depth = 0;
  for (let i = braceStart; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(braceStart + 1, i);
    }
  }
  return '';
}

// Keys of an object literal whose values are themselves objects: `'slug': {`
function objectValueKeys(body) {
  return [...body.matchAll(/'([a-z0-9-]+)'\s*:\s*\{/g)].map((m) => m[1]);
}

// Keys of an object literal whose values are strings: `'slug': '...'`
function stringValueKeys(body) {
  return [...body.matchAll(/'([a-z0-9-]+)'\s*:\s*'/g)].map((m) => m[1]);
}

// CATEGORIES keys in lib/categories-config.js use double-quoted keys: `"slug": {`
function parseConfigKeys(src) {
  const body = extractExportObjectBody(src, 'CATEGORIES');
  return [...body.matchAll(/"([a-z0-9-]+)"\s*:\s*\{/g)].map((m) => m[1]);
}

let manifest = [];
try {
  manifest = readJson(MANIFEST_PATH);
  if (!Array.isArray(manifest)) {
    errors.push(`manifest is not an array: ${MANIFEST_PATH}`);
    manifest = [];
  }
} catch (e) {
  errors.push(`failed to read manifest: ${e.message}`);
}

let categoryDataSrc = '';
let configSrc = '';
try {
  categoryDataSrc = fs.readFileSync(CATEGORY_DATA_PATH, 'utf8');
  configSrc = fs.readFileSync(CATEGORIES_CONFIG_PATH, 'utf8');
} catch (e) {
  errors.push(`failed to read a data file: ${e.message}`);
}
const { CANONICAL_CATEGORIES } = require(ANALYTICS_NORMALIZE_PATH);

// ---- A. Empty tags (pitfall #8) -------------------------------------------

{
  const missing = manifest.filter((e) => !Array.isArray(e.tags) || e.tags.length === 0);
  if (missing.length) {
    const sample = missing.slice(0, 15).map((e) => `      - ${e.slug || e.id || '(no slug)'}`);
    errors.push(
      `${missing.length} manifest entr${missing.length === 1 ? 'y has' : 'ies have'} empty tags ` +
        `(drops out of collection facets — see CLAUDE.md pitfall #8):\n${sample.join('\n')}` +
        (missing.length > 15 ? `\n      ... and ${missing.length - 15} more` : '')
    );
  }
}

// ---- B. Category registration parity (pitfall #9) -------------------------

if (categoryDataSrc && configSrc) {
  const infoKeys = objectValueKeys(extractExportObjectBody(categoryDataSrc, 'categoryInfo'));
  const folderKeys = stringValueKeys(extractExportObjectBody(categoryDataSrc, 'folderMap'));
  const configKeys = parseConfigKeys(configSrc);

  const infoSet = new Set(infoKeys);
  const folderSet = new Set(folderKeys);
  const configSet = new Set(configKeys);

  // Sanity: each parser must find something, or a regex broke (silent-pass guard).
  if (infoSet.size === 0) errors.push('categoryInfo parser found 0 categories — regex likely broke');
  if (folderSet.size === 0) errors.push('folderMap parser found 0 categories — regex likely broke');
  if (configSet.size === 0) errors.push('categories-config CATEGORIES parser found 0 categories — regex likely broke');

  const diff = (a, b) => [...a].filter((x) => !b.has(x));

  // categoryInfo is the reference UI category set; folderMap and config must match it exactly.
  for (const [aName, aSet, bName, bSet] of [
    ['categoryInfo', infoSet, 'folderMap', folderSet],
    ['folderMap', folderSet, 'categoryInfo', infoSet],
    ['categoryInfo', infoSet, 'categories-config CATEGORIES', configSet],
    ['categories-config CATEGORIES', configSet, 'categoryInfo', infoSet],
  ]) {
    const only = diff(aSet, bSet);
    if (only.length) {
      errors.push(
        `category slug(s) in ${aName} but missing from ${bName}: ${only.join(', ')}`
      );
    }
  }

  // Every UI category must be an analytics rollup key, or its page views
  // normalize to null and drop out of category rollups (pitfall #9).
  const missingFromAnalytics = infoKeys.filter((slug) => !CANONICAL_CATEGORIES.has(slug));
  if (missingFromAnalytics.length) {
    errors.push(
      `category slug(s) missing from CANONICAL_CATEGORIES in lib/analyticsNormalize.js ` +
        `(page views will normalize to null — see CLAUDE.md pitfall #9): ${missingFromAnalytics.join(', ')}`
    );
  }

  // Reverse: CANONICAL_CATEGORIES may only exceed the UI set by the known
  // analytics-only folder variants. Anything else is drift.
  const unexpectedAnalytics = [...CANONICAL_CATEGORIES].filter(
    (slug) => !infoSet.has(slug) && !KNOWN_ANALYTICS_ONLY_SLUGS.has(slug)
  );
  if (unexpectedAnalytics.length) {
    errors.push(
      `CANONICAL_CATEGORIES contains slug(s) that are neither a UI category nor a known ` +
        `analytics-only variant: ${unexpectedAnalytics.join(', ')}`
    );
  }
}

// ---- Report ---------------------------------------------------------------

if (errors.length) {
  console.error(`\n❌ ${errors.length} content coverage error(s):\n`);
  for (const e of errors) console.error('   ' + e);
  console.error('\nSee CLAUDE.md → "Common pitfalls" (#8 tags, #9 category registration).\n');
  process.exit(1);
}
console.log(`✓ Content coverage check passed (${manifest.length} images, all categories registered).`);
