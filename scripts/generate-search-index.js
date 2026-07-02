#!/usr/bin/env node
// scripts/generate-search-index.js
//
// Builds the static client search index → public/data/search-index.json.
//
// This is the ONLY new data artifact for Phase 4 search. It is a projection of
// existing systems (manifest → facets → themes/personas → scores), not a new
// content system: every record carries the graph edges an image already has, so
// a result links straight back into /category, /backgrounds, /collections, and
// the platform matrix.
//
// Runs in the prebuild chain, so it regenerates on every deploy and can never
// drift from the manifest. Future Midjourney images (category + tags) flow in
// automatically — no manual search entry.
//
// Design goals: small (short keys, cleaned titles, no descriptions), and
// self-contained (ships its own vocab so the client imports no data modules).

const fs = require('fs');
const path = require('path');

const { getAllImages } = require('../lib/manifest');
const { matches } = require('../lib/collections/engine');
const { getPublishedThemes } = require('../lib/collections/themeEngine');
const { getPublishedCollections } = require('../lib/collections/engine');
const { THEME_USE_CASES } = require('../data/collections/themes');
const { CATEGORIES } = require('../lib/categories-config');

// Titles carry a marketing suffix ("… — Studio-Designed Background for … | MeetBackdrops").
// Strip it for a clean, human search label; keep the meaningful lead.
function cleanTitle(title) {
  if (!title) return '';
  let t = String(title);
  const dash = t.indexOf(' — ');
  if (dash > 0) t = t.slice(0, dash);
  const pipe = t.indexOf(' | ');
  if (pipe > 0) t = t.slice(0, pipe);
  return t.trim();
}

function loadScores() {
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'image-scores-static.json');
    return JSON.parse(fs.readFileSync(p, 'utf8')).scores || {};
  } catch (e) {
    console.warn('search-index: scores unavailable, defaulting to 0:', e.message);
    return {};
  }
}

function scoreFor(scoreMap, webp) {
  const base = String(webp).replace(/\.(webp|png|jpe?g)$/i, '');
  const v = scoreMap[webp] ?? scoreMap[`${base}.webp`] ?? scoreMap[`${base}.png`];
  return typeof v === 'object' && v ? (v.score ?? 0) : (v ?? 0);
}

function build() {
  const images = getAllImages();
  const scoreMap = loadScores();
  const publishedThemes = getPublishedThemes();
  const publishedPersonas = getPublishedCollections();

  const records = images.map((img) => {
    const themes = publishedThemes.filter((t) => matches(img, t)).map((t) => t.slug);
    const personas = publishedPersonas.filter((p) => matches(img, p)).map((p) => p.slug);
    return {
      s: img.slug,
      c: img.category,
      f: img.folder || img.category,
      w: img.image_webp,
      t: cleanTitle(img.title),
      g: Array.isArray(img.tags) ? img.tags : [],
      th: themes,
      pe: personas,
      sc: Math.round(scoreFor(scoreMap, img.image_webp)),
      hd: img.hdOnly === true ? 1 : 0,
    };
  });

  // Ship compact vocab so the client renders filter chips / maps slugs → labels
  // without importing any data module (keeps the client bundle tiny).
  const vocab = {
    themes: publishedThemes.map((t) => ({ slug: t.slug, label: t.label })),
    personas: publishedPersonas.map((p) => ({ slug: p.slug, label: p.persona })),
    categories: Object.entries(CATEGORIES).map(([slug, c]) => ({ slug, label: c.name })),
    useCases: THEME_USE_CASES,
  };

  const out = { generatedAt: new Date().toISOString(), count: records.length, vocab, images: records };

  const outDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(out));

  const bytes = fs.statSync(outPath).size;
  const themed = records.filter((r) => r.th.length > 0).length;
  console.log(`✓ search index: ${records.length} images, ${vocab.themes.length} themes, ${vocab.personas.length} personas`);
  console.log(`  ${themed} themed (${Math.round(themed / records.length * 100)}%), ${(bytes / 1024).toFixed(0)} KB → public/data/search-index.json`);
}

build();
