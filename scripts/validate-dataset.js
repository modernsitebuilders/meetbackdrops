#!/usr/bin/env node
// Build-time dataset integrity validator.
//
// SCHEMA-ONLY:
//   - Reads dataset files only.
//   - Never mutates dataset, manifest, or analytics config.
//   - Never infers, repairs, or remaps any field.
//   - Does not enforce hierarchy, grouping, or derived routing.
//     Categories are atomic routing keys assigned at ingestion.
//     Legacy derived variants (e.g. "bookshelves-bright") are
//     report-only — warned, never errored — until ingestion emits
//     a fully flat dataset.
//
// Mode governance (single source of truth):
//   process.env.VALIDATION_MODE ∈ { LEGACY | STRICT-LITE | STRICT-FULL }
//   Default: LEGACY. No other config, flag, or override is honored.
//
//   LEGACY       — never fails build. All violations are WARNINGs. Also
//                  emits structured telemetry for migration tracking.
//   STRICT-LITE  — fails on structural corruption (missing fields,
//                  duplicate IDs, unknown categories, dataset↔manifest
//                  mismatches). Non-UUID ids stay WARNING — legacy id
//                  format is permitted. Legacy category variants stay
//                  WARNING.
//   STRICT-FULL  — every schema violation is ERROR, including
//                  non-UUID ids. Legacy category variants remain
//                  WARNING (report-only until ingestion is flat).

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const CATEGORY_DATA_PATH = path.join(ROOT, 'data', 'categoryData.js');
const CATEGORIES_CONFIG_PATH = path.join(ROOT, 'lib', 'categories-config.js');
const ANALYTICS_NORMALIZE_PATH = path.join(ROOT, 'lib', 'analyticsNormalize.js');

// Known derived variants that pre-date the flat-routing-key rule. They
// are NOT part of the canonical registry, but we recognize them so the
// validator can report them as legacy drift instead of erroring — the
// dataset must stay valid until ingestion is rewritten to emit flat
// category values. Any new variants must NOT be added here.
const LEGACY_CATEGORY_VARIANTS = new Set([
  'bookshelves-bright',
  'bookshelves-dark',
  'wall-shelves-bright',
  'wall-shelves-dark',
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_MODES = new Set(['LEGACY', 'STRICT-LITE', 'STRICT-FULL']);
const RAW_MODE = (process.env.VALIDATION_MODE || 'LEGACY').trim();
if (!ALLOWED_MODES.has(RAW_MODE)) {
  process.stderr.write(
    `\u274c ERROR: invalid VALIDATION_MODE=${JSON.stringify(RAW_MODE)}. ` +
      `Allowed: LEGACY | STRICT-LITE | STRICT-FULL.\n`
  );
  process.exit(2);
}
const MODE = RAW_MODE;

const findings = [];

// Severity resolver keyed by rule id. Each entry maps mode → severity.
// "error" fails build (in modes that honor it); "warn" never fails.
// LEGACY always downgrades everything to warn.
const RULE_SEVERITY = {
  // A. ID integrity
  ID_MISSING:     { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  ID_NOT_STRING:  { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  ID_NOT_UUID:    { LEGACY: 'warn', 'STRICT-LITE': 'warn',  'STRICT-FULL': 'error' },
  ID_DUPLICATE:   { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },

  // B. Category integrity.
  //   CAT_MISSING / CAT_NOT_STRING are "critical corruption" — STRICT-LITE
  //   and STRICT-FULL error.
  //   CAT_UNKNOWN is migration surface area — STRICT-LITE warns, only
  //   STRICT-FULL errors. This matches the 3-tier enforcement model:
  //   STRICT-LITE surfaces drift without blocking on schema-final rules.
  //   CAT_LEGACY_VARIANT is report-only in LEGACY and STRICT-LITE
  //   (migration visibility). In STRICT-FULL it errors — the final
  //   target state forbids derived variants entirely.
  CAT_MISSING:         { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  CAT_NOT_STRING:      { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  CAT_UNKNOWN:         { LEGACY: 'warn', 'STRICT-LITE': 'warn',  'STRICT-FULL': 'error' },
  CAT_LEGACY_VARIANT:  { LEGACY: 'warn', 'STRICT-LITE': 'warn',  'STRICT-FULL': 'error' },

  // D. Dataset ↔ UI manifest consistency
  FILENAME_CONFLICTING_ID:         { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  UI_DUPLICATE_FILENAME:           { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  UI_MISSING_IN_DATASET:           { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
  DATASET_MISSING_IN_UI:           { LEGACY: 'warn', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },

  // E. Analytics safety — read-only drift signals, never block.
  ANALYTICS_REGISTRY_DRIFT:        { LEGACY: 'warn', 'STRICT-LITE': 'warn',  'STRICT-FULL': 'warn' },

  // Infra
  LOAD_FAILED:                     { LEGACY: 'error', 'STRICT-LITE': 'error', 'STRICT-FULL': 'error' },
};

function emit(rule, msg, detail) {
  const severity = RULE_SEVERITY[rule] && RULE_SEVERITY[rule][MODE];
  if (!severity) {
    throw new Error(`Missing severity mapping for rule ${rule} in mode ${MODE}`);
  }
  findings.push({ rule, severity, msg, detail: detail || null });
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---- Load inputs ----------------------------------------------------------

let manifest = [];
try {
  manifest = readJson(MANIFEST_PATH);
  if (!Array.isArray(manifest)) {
    emit('LOAD_FAILED', 'Manifest is not an array', { path: MANIFEST_PATH });
    manifest = [];
  }
} catch (e) {
  emit('LOAD_FAILED', 'Failed to read manifest', { path: MANIFEST_PATH, reason: e.message });
  manifest = [];
}

const { CANONICAL_CATEGORIES } = require(ANALYTICS_NORMALIZE_PATH);

function parseCategoriesConfig() {
  const src = fs.readFileSync(CATEGORIES_CONFIG_PATH, 'utf8');
  const start = src.indexOf('export const CATEGORIES');
  if (start === -1) return new Set();
  const braceStart = src.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let i = braceStart; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  if (end === -1) return new Set();
  const body = src.slice(braceStart + 1, end);
  const slugs = new Set();
  const re = /"([^"\\]+)"\s*:\s*\{/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    slugs.add(m[1]);
  }
  return slugs;
}

function parseCategoryData() {
  const src = fs.readFileSync(CATEGORY_DATA_PATH, 'utf8');
  const filenames = [];
  const re = /filename:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    filenames.push(m[1]);
  }
  return filenames;
}

// REGISTRY is the flat canonical set of routing keys, sourced solely
// from lib/categories-config.js. No membership expansion, no derived
// variants. Legacy variants are tracked separately and reported as
// warnings — never added to the registry.
const REGISTRY = parseCategoriesConfig();

// ---- A. ID integrity ------------------------------------------------------

let uuidCompliant = 0;
const idCounts = new Map();

for (const img of manifest) {
  const id = img && img.id;
  if (id == null || id === '') {
    emit('ID_MISSING', 'Missing or null image.id', {
      slug: img && img.slug,
      filename: img && img.image_webp,
    });
    continue;
  }
  if (typeof id !== 'string') {
    emit('ID_NOT_STRING', 'image.id is not a string', {
      id,
      slug: img.slug,
      filename: img.image_webp,
    });
    continue;
  }
  if (!UUID_REGEX.test(id)) {
    emit('ID_NOT_UUID', 'Non-UUID image.id', {
      id,
      slug: img.slug,
      filename: img.image_webp,
    });
  } else {
    uuidCompliant++;
  }
  idCounts.set(id, (idCounts.get(id) || 0) + 1);
}
for (const [id, count] of idCounts.entries()) {
  if (count > 1) {
    const files = manifest
      .filter((i) => i.id === id)
      .map((i) => i.image_webp)
      .join(', ');
    emit('ID_DUPLICATE', 'Duplicate image ID detected', { id, count, files });
  }
}

// ---- B. Category integrity ------------------------------------------------

let categoryCompliant = 0;
for (const img of manifest) {
  const cat = img && img.category;
  if (cat == null || cat === '') {
    emit('CAT_MISSING', 'Missing or null image.category', {
      id: img && img.id,
      filename: img && img.image_webp,
    });
    continue;
  }
  if (typeof cat !== 'string') {
    emit('CAT_NOT_STRING', 'image.category is not a string', {
      id: img.id,
      filename: img.image_webp,
      value: cat,
    });
    continue;
  }
  if (!REGISTRY.has(cat)) {
    if (LEGACY_CATEGORY_VARIANTS.has(cat)) {
      emit('CAT_LEGACY_VARIANT', 'Legacy category variant encountered', {
        id: img.id,
        filename: img.image_webp,
        value: cat,
      });
    } else {
      emit('CAT_UNKNOWN', 'Unknown / unregistered category', {
        id: img.id,
        filename: img.image_webp,
        category: cat,
      });
    }
  } else {
    categoryCompliant++;
  }
}

// ---- C. (removed) ---------------------------------------------------------
// CATEGORY_MEMBERSHIP enforcement has been deliberately deleted. The
// validator is a schema-only layer; routing / grouping is not its
// concern. See lib/categoryMembership.js for the runtime routing map
// (it remains in use by lib/imageIndex.js and is out of scope here).

// ---- D. Dataset ↔ UI manifest consistency ---------------------------------

let datasetUiMismatch = 0;
{
  const filenameToId = new Map();
  for (const img of manifest) {
    const fn = img && img.image_webp;
    if (!fn) continue;
    if (filenameToId.has(fn) && filenameToId.get(fn) !== img.id) {
      emit('FILENAME_CONFLICTING_ID', 'Duplicate filename mapping to different image.id', {
        filename: fn,
        ids: [filenameToId.get(fn), img.id],
      });
    }
    filenameToId.set(fn, img.id);
  }

  let uiFilenames;
  try {
    uiFilenames = parseCategoryData();
  } catch (e) {
    emit('LOAD_FAILED', 'Failed to read categoryData.js', {
      path: CATEGORY_DATA_PATH,
      reason: e.message,
    });
    uiFilenames = [];
  }

  const uiSet = new Set(uiFilenames);
  const manifestFilenames = new Set(filenameToId.keys());

  {
    const seen = new Map();
    for (const fn of uiFilenames) {
      seen.set(fn, (seen.get(fn) || 0) + 1);
    }
    for (const [fn, count] of seen.entries()) {
      if (count > 1) {
        emit('UI_DUPLICATE_FILENAME', 'Duplicate filename in categoryData.js', { filename: fn, count });
      }
    }
  }

  for (const fn of uiSet) {
    if (!manifestFilenames.has(fn)) {
      datasetUiMismatch++;
      emit('UI_MISSING_IN_DATASET', 'UI manifest entry missing from dataset manifest', { filename: fn });
    }
  }
  for (const fn of manifestFilenames) {
    if (!uiSet.has(fn)) {
      datasetUiMismatch++;
      emit('DATASET_MISSING_IN_UI', 'Dataset manifest entry missing from UI manifest', {
        filename: fn,
        id: filenameToId.get(fn),
      });
    }
  }
}

// ---- E. Analytics safety (WARNINGS only) ----------------------------------

{
  for (const slug of CANONICAL_CATEGORIES) {
    if (LEGACY_CATEGORY_VARIANTS.has(slug)) continue;
    if (!REGISTRY.has(slug)) {
      emit('ANALYTICS_REGISTRY_DRIFT', 'analytics CANONICAL_CATEGORIES contains unregistered slug', {
        value: slug,
      });
    }
  }
  for (const slug of REGISTRY) {
    if (!CANONICAL_CATEGORIES.has(slug)) {
      emit('ANALYTICS_REGISTRY_DRIFT', 'Registry slug missing from analytics CANONICAL_CATEGORIES', {
        value: slug,
      });
    }
  }
}

// ---- Report ---------------------------------------------------------------

function formatDetail(detail) {
  if (!detail) return '';
  return Object.entries(detail)
    .map(([k, v]) => `  ${k}: ${Array.isArray(v) ? JSON.stringify(v) : v}`)
    .join('\n');
}

const errorFindings = findings.filter((f) => f.severity === 'error');
const warnFindings = findings.filter((f) => f.severity === 'warn');

// Cap per-rule output to keep logs readable when a rule fires 900+ times.
const PER_RULE_CAP = 20;
function printCapped(list, prefix) {
  const byRule = new Map();
  for (const f of list) {
    if (!byRule.has(f.rule)) byRule.set(f.rule, []);
    byRule.get(f.rule).push(f);
  }
  for (const [rule, group] of byRule.entries()) {
    for (const f of group.slice(0, PER_RULE_CAP)) {
      process.stderr.write(`${prefix} [${rule}] ${f.msg}\n${formatDetail(f.detail)}\n\n`);
    }
    if (group.length > PER_RULE_CAP) {
      process.stderr.write(
        `${prefix} [${rule}] ... and ${group.length - PER_RULE_CAP} more (truncated)\n\n`
      );
    }
  }
}

printCapped(errorFindings, '\u274c ERROR:');
printCapped(warnFindings, '\u26a0\ufe0f  WARNING:');

// Telemetry (LEGACY-only, logging-only, non-fatal).
if (MODE === 'LEGACY') {
  const total = manifest.length || 1;
  const legacyVariantCount = findings.filter((f) => f.rule === 'CAT_LEGACY_VARIANT').length;
  const telemetry = {
    mode: MODE,
    manifest_total: manifest.length,
    uuid_compliance_pct: +((uuidCompliant / total) * 100).toFixed(2),
    category_registry_compliance_pct: +((categoryCompliant / total) * 100).toFixed(2),
    legacy_variant_count: legacyVariantCount,
    dataset_ui_mismatch_count: datasetUiMismatch,
  };
  process.stdout.write(`\n\ud83d\udcca TELEMETRY: ${JSON.stringify(telemetry)}\n`);
}

const summary = `\nMode: ${MODE}  |  ${errorFindings.length} error(s), ${warnFindings.length} warning(s).\n`;
process.stdout.write(summary);

if (errorFindings.length > 0) {
  process.stderr.write(`Build blocked (${MODE}) — dataset integrity violations detected.\n`);
  process.exit(1);
}
process.stdout.write(`Dataset integrity OK (${MODE}).\n`);
process.exit(0);
