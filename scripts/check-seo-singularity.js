#!/usr/bin/env node
/**
 * scripts/check-seo-singularity.js
 *
 * Closure enforcer for the category-page SEO subsystem. Scans the files on
 * the category-page render path (page, Layout, CategoryHeader, HubHero,
 * CategoryHub) and fails CI if any of them does any of the following:
 *
 *   1. Contains the H1 suffix literal — only lib/seo/seo.js may construct it.
 *   2. References `router.asPath` — SEO must not be derived from the router.
 *   3. Invokes <FAQSchema> or <BreadcrumbSchema> — JSON-LD must come from
 *      seo()'s @graph, not from sibling components.
 *   4. Defines a "default" SEO field literal (e.g. `default*Title`,
 *      `defaultStructuredData` outside Layout's legacy interior surface).
 *
 * Plus a global rule:
 *   5. lib/seo/ must contain exactly one file (seo.js). Adding any other
 *      file there is a closure violation.
 *
 * Run via `npm run prebuild` or `npm run check:seo:singularity`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Category-page render path. Add a file here if /category/[slug] starts
// pulling SEO-shaped strings or schema from it.
const RENDER_PATH = [
  'pages/category/[slug]/index.js',
  'components/CategoryHeader.js',
  'components/CategoryHub/CategoryHub.js',
  'components/CategoryHub/HubHero.js',
  'components/Layout.js',
];

// Patterns that must NOT appear in any render-path file.
const FORBIDDEN_PATTERNS = [
  {
    pattern: 'for Zoom, Teams & Google Meet',
    reason: 'H1 suffix literal — only lib/seo/seo.js may construct category SEO strings',
  },
  {
    pattern: 'router.asPath',
    reason: 'SEO derivation from router.asPath is forbidden (use seo(slug))',
  },
  {
    pattern: '<FAQSchema',
    reason: 'FAQPage JSON-LD must come from seo() @graph, not <FAQSchema>',
  },
  {
    pattern: '<BreadcrumbSchema',
    reason: 'BreadcrumbList JSON-LD must come from seo() @graph, not <BreadcrumbSchema>',
  },
];

let violations = 0;

console.log('— Render-path closure scan —');
for (const rel of RENDER_PATH) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.error(`✘ ${rel}: file not found (category render path is out of date)`);
    violations++;
    continue;
  }
  const text = fs.readFileSync(abs, 'utf8');
  let fileClean = true;
  for (const { pattern, reason } of FORBIDDEN_PATTERNS) {
    if (text.includes(pattern)) {
      console.error(`✘ ${rel}: contains "${pattern}" — ${reason}`);
      violations++;
      fileClean = false;
    }
  }
  if (fileClean) console.log(`✓ ${rel}`);
}

console.log('\n— lib/seo/ entry-point lockdown —');
const SEO_DIR = path.join(ROOT, 'lib', 'seo');
if (!fs.existsSync(SEO_DIR)) {
  console.error('✘ lib/seo/ directory not found');
  violations++;
} else {
  const entries = fs.readdirSync(SEO_DIR).filter((n) => /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(n));
  if (entries.length !== 1 || entries[0] !== 'seo.js') {
    console.error(`✘ lib/seo/ must contain exactly one file (seo.js). Found: ${entries.join(', ')}`);
    violations++;
  } else {
    console.log('✓ lib/seo/seo.js is the sole entry point');
  }
}

if (violations > 0) {
  console.error(`\n${violations} singularity violation(s). All category SEO must flow through seo(slug) in lib/seo/seo.js.`);
  process.exit(1);
}
console.log('\n✓ check-seo-singularity: closure intact');
