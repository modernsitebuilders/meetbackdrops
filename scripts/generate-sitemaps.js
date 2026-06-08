#!/usr/bin/env node
/**
 * Regenerate the three image-driven sitemaps from final_manifest.json:
 *   - public/sitemap.xml             (sitemap index)
 *   - public/sitemap-images.xml      (one <url> per category with all images nested)
 *   - public/sitemap-image-pages.xml (one <url> per individual image page)
 *
 * Does NOT touch public/sitemap-pages.xml — that file holds hand-curated
 * priorities and lastmods for top-level pages, blog posts, category landing
 * pages, and utility pages. When a new category or blog post is added, edit
 * sitemap-pages.xml directly. Adding new images to existing categories is
 * fully covered by this script.
 *
 * Run as part of `npm run prebuild` (or directly: `npm run generate:sitemaps`).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'image-pipeline', 'final_manifest.json');
const PUBLIC_DIR = path.join(ROOT, 'public');

const SITE_ORIGIN = 'https://meetbackdrops.com';
const ASSET_ORIGIN = 'https://assets.streambackdrops.com';
const TODAY = new Date().toISOString().slice(0, 10);

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Strip the " | MeetBackdrops" / " | MeetBackdrops Studio" suffix from a
// manifest title so the sitemap <image:title> isn't littered with the brand.
function stripBrandSuffix(title) {
  return String(title || '').replace(/\s*\|\s*MeetBackdrops(?:\s+Studio)?\s*$/, '');
}

function readManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);
  if (!Array.isArray(manifest)) throw new Error('final_manifest.json is not an array');
  return manifest;
}

function naturalSort(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function groupByCategory(manifest) {
  const groups = new Map();
  for (const e of manifest) {
    if (!e.category || !e.slug || !e.folder || !e.image_webp) continue;
    if (!groups.has(e.category)) groups.set(e.category, []);
    groups.get(e.category).push(e);
  }
  for (const arr of groups.values()) arr.sort((a, b) => naturalSort(a.slug, b.slug));
  return groups;
}

// ─── sitemap.xml (index) ─────────────────────────────────────────────────────
function buildIndex() {
  const children = ['sitemap-pages.xml', 'sitemap-images.xml', 'sitemap-image-pages.xml', 'sitemap-collections.xml'];
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const child of children) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${SITE_ORIGIN}/${child}</loc>`);
    lines.push(`    <lastmod>${TODAY}</lastmod>`);
    lines.push('  </sitemap>');
  }
  lines.push('</sitemapindex>');
  lines.push('');
  return lines.join('\n');
}

// ─── sitemap-images.xml ──────────────────────────────────────────────────────
// One <url> per category page with every image nested as <image:image>.
function buildImagesSitemap(grouped) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
  for (const [category, entries] of grouped) {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_ORIGIN}/category/${category}</loc>`);
    for (const e of entries) {
      const title = stripBrandSuffix(e.title) || e.slug;
      const caption = e.description || '';
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${ASSET_ORIGIN}/webp/${e.folder}/${e.image_webp}</image:loc>`);
      lines.push(`      <image:title>${escapeXml(title)}</image:title>`);
      if (caption) lines.push(`      <image:caption>${escapeXml(caption)}</image:caption>`);
      lines.push('    </image:image>');
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

// ─── sitemap-image-pages.xml ─────────────────────────────────────────────────
// One <url> per /category/{slug}/{image-slug} page with that page's hero image.
function buildImagePagesSitemap(grouped) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');
  for (const [category, entries] of grouped) {
    for (const e of entries) {
      const title = stripBrandSuffix(e.title) || e.slug;
      const caption = e.description || '';
      lines.push('  <url>');
      lines.push(`    <loc>${SITE_ORIGIN}/category/${category}/${e.slug}</loc>`);
      lines.push('    <image:image>');
      lines.push(`      <image:loc>${ASSET_ORIGIN}/webp/${e.folder}/${e.image_webp}</image:loc>`);
      lines.push(`      <image:title>${escapeXml(title)}</image:title>`);
      if (caption) lines.push(`      <image:caption>${escapeXml(caption)}</image:caption>`);
      lines.push('    </image:image>');
      lines.push('    <changefreq>monthly</changefreq>');
      lines.push('    <priority>0.6</priority>');
      lines.push('  </url>');
    }
  }
  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

// ─── sitemap-collections.xml ─────────────────────────────────────────────────
// The persona/industry collection hub and each PUBLISHED collection page.
// Driven by the same minCount publish gate as the routes (lib/collections/
// engine.js), so a thin collection never appears here either.
function buildCollectionsSitemap() {
  const { getPublishedCollections } = require('../lib/collections/engine');
  const published = getPublishedCollections();

  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  lines.push('  <url>');
  lines.push(`    <loc>${SITE_ORIGIN}/collections</loc>`);
  lines.push(`    <lastmod>${TODAY}</lastmod>`);
  lines.push('    <changefreq>weekly</changefreq>');
  lines.push('    <priority>0.8</priority>');
  lines.push('  </url>');

  for (const def of published) {
    lines.push('  <url>');
    lines.push(`    <loc>${SITE_ORIGIN}/collections/${def.slug}</loc>`);
    lines.push(`    <lastmod>${TODAY}</lastmod>`);
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('    <priority>0.7</priority>');
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

function writeIfChanged(filePath, content) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
  if (existing === content) return false;
  fs.writeFileSync(filePath, content);
  return true;
}

function main() {
  const manifest = readManifest();
  const grouped = groupByCategory(manifest);
  const totalImages = [...grouped.values()].reduce((n, arr) => n + arr.length, 0);

  const outputs = [
    ['sitemap.xml', buildIndex()],
    ['sitemap-images.xml', buildImagesSitemap(grouped)],
    ['sitemap-image-pages.xml', buildImagePagesSitemap(grouped)],
    ['sitemap-collections.xml', buildCollectionsSitemap()],
  ];

  let changed = 0;
  for (const [name, body] of outputs) {
    const out = path.join(PUBLIC_DIR, name);
    if (writeIfChanged(out, body)) {
      console.log(`✓ wrote ${name}`);
      changed++;
    } else {
      console.log(`= unchanged ${name}`);
    }
  }
  console.log(
    `\nGenerated from ${manifest.length} manifest entries → ${grouped.size} categories, ${totalImages} images.`,
  );
  if (changed === 0) console.log('No changes.');
}

main();
