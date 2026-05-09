#!/usr/bin/env node
// ============================================================================
// generate-hd-products.js
// ----------------------------------------------------------------------------
// Regenerates lib/hdProducts.js from the canonical manifest at
// image-pipeline/final_manifest.json.
//
// Source of truth: every manifest entry with `hd: true` becomes an HD product.
// The generated file is hand-committed so the client bundle does not need to
// import the full manifest (~616 KB). Prevents the silent drift that occurred
// historically when the products[] array and HD_BASE_IDS lived as parallel
// hand-maintained lists in pages/hd.js + lib/hdImages.js.
//
// Usage:
//   node scripts/generate-hd-products.js
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'lib', 'hdProducts.js');

// Display order on the /hd page (matches the historical hand-curated grouping).
const FOLDER_ORDER = [
  'bookshelves-bright', 'bookshelves-dark',
  'wall-shelves-bright', 'wall-shelves-dark',
  'coffee-shops', 'conference-rooms', 'libraries', 'urban-lofts',
  'office-spaces', 'home-office',
  'nature-landscapes', 'living-rooms', 'kitchens', 'gardens-patios',
  'christmas-backgrounds', 'easter-backgrounds', 'spring-backgrounds',
];

// Maps the manifest folder to a human display-name template. The {n} token is
// replaced with the slug's trailing number. New folders fall back to a
// title-cased folder name.
const NAME_TEMPLATES = {
  'bookshelves-bright': 'Bright Bookshelf #{n}',
  'bookshelves-dark':   'Dark Bookshelf #{n}',
  'wall-shelves-bright':'Bright Wall Shelf #{n}',
  'wall-shelves-dark':  'Dark Wall Shelf #{n}',
  'coffee-shops':       'Coffee Shop #{n}',
  'conference-rooms':   'Conference Room #{n}',
  'libraries':          'Library #{n}',
  'urban-lofts':        'Urban Loft #{n}',
  'office-spaces':      'Office Space #{n}',
  'home-office':        'Home Office #{n}',
  'nature-landscapes':  'Nature Landscape #{n}',
  'living-rooms':       'Living Room #{n}',
  'kitchens':           'Kitchen #{n}',
  'gardens-patios':     'Garden & Patio #{n}',
  'christmas-backgrounds': 'Christmas #{n}',
  'easter-backgrounds':    'Easter #{n}',
  'spring-backgrounds':    'Spring #{n}',
};

function fallbackName(folder, n) {
  const titled = folder.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  return `${titled} #${n}`;
}

function trailingNumber(slug) {
  const m = slug.match(/-(\d+)$/);
  return m ? Number(m[1]) : null;
}

function buildEntry(manifestEntry) {
  const slug = manifestEntry.slug;
  const folder = manifestEntry.folder || manifestEntry.category;
  const n = trailingNumber(slug);
  if (n == null) {
    throw new Error(`[generate-hd-products] Cannot derive trailing number from slug "${slug}"`);
  }
  const tmpl = NAME_TEMPLATES[folder];
  const name = tmpl ? tmpl.replace('{n}', String(n)) : fallbackName(folder, n);
  return {
    id: `${slug}-hd`,
    name,
    category: folder,
    slug,
  };
}

function sortFolders(folders) {
  const known = new Set(FOLDER_ORDER);
  const ordered = FOLDER_ORDER.filter((f) => folders.has(f));
  const extras = [...folders].filter((f) => !known.has(f)).sort();
  return [...ordered, ...extras];
}

function buildFileContents(productsByFolder) {
  const folderOrder = sortFolders(new Set(Object.keys(productsByFolder)));

  const lines = [];
  lines.push(`// ============================================================================`);
  lines.push(`// HD PRODUCTS LIST`);
  lines.push(`// ----------------------------------------------------------------------------`);
  lines.push(`// SOURCE OF TRUTH: image-pipeline/final_manifest.json (entries with hd: true).`);
  lines.push(`//`);
  lines.push(`// This file is GENERATED. Do not edit by hand. To add or remove an HD product,`);
  lines.push(`// flip the \`hd\` flag on the manifest entry and re-run:`);
  lines.push(`//   node scripts/generate-hd-products.js`);
  lines.push(`// (also runs as part of \`npm run prebuild\`).`);
  lines.push(`//`);
  lines.push(`// Single source of truth for both the product catalog and the HD_BASE_IDS set`);
  lines.push(`// — eliminates the historical drift where products[] and HD_BASE_IDS could`);
  lines.push(`// silently diverge across commits.`);
  lines.push(`// ============================================================================`);
  lines.push('');
  lines.push('export const HD_PRODUCTS = [');
  for (const folder of folderOrder) {
    const products = productsByFolder[folder];
    lines.push(`  // ${folder}`);
    for (const p of products) {
      lines.push(`  { id: '${p.id}', name: ${JSON.stringify(p.name)}, category: '${p.category}' },`);
    }
  }
  lines.push('];');
  lines.push('');
  lines.push('export const HD_BASE_IDS = new Set(HD_PRODUCTS.map((p) => p.slug || p.id.replace(/-hd$/, \'\')));');
  lines.push('');
  return lines.join('\n');
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[generate-hd-products] Manifest not found at ${MANIFEST_PATH}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  if (!Array.isArray(manifest)) {
    console.error('[generate-hd-products] Manifest is not an array');
    process.exit(1);
  }

  const hdEntries = manifest.filter((e) => e && e.hd === true && e.slug);
  const productsByFolder = {};
  for (const e of hdEntries) {
    const built = buildEntry(e);
    const folder = built.category;
    if (!productsByFolder[folder]) productsByFolder[folder] = [];
    productsByFolder[folder].push(built);
  }
  for (const folder of Object.keys(productsByFolder)) {
    productsByFolder[folder].sort((a, b) => trailingNumber(a.slug) - trailingNumber(b.slug));
  }

  const output = buildFileContents(productsByFolder);

  const prev = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  if (prev === output) {
    console.log(`[generate-hd-products] No changes. ${hdEntries.length} HD products across ${Object.keys(productsByFolder).length} folders.`);
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`[generate-hd-products] Wrote ${OUTPUT_PATH}`);
  console.log(`[generate-hd-products] ${hdEntries.length} HD products across ${Object.keys(productsByFolder).length} folders.`);
}

try {
  main();
} catch (err) {
  console.error('[generate-hd-products] Failed:', err);
  process.exit(1);
}
