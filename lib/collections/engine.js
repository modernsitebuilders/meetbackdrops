// lib/collections/engine.js
//
// Resolves persona collection definitions (data/collections/personas.js)
// against the canonical manifest, using canonical facets (./facets.js).
// Pure and deterministic: a definition + the manifest always yield the same
// ordered image set. Scores only affect ORDER and the maxShown cap, never
// membership.
//
// Publish gate: getPublishedCollections() drops any collection that resolves
// to fewer than its minCount images. Thin collections never reach a route or
// the hub — see the anti-thin-content note in personas.js.

const { getAllImages } = require('../manifest');
const { deriveFacets, isSeasonal } = require('./facets');
const { PERSONAS } = require('../../data/collections/personas');

const BASE_URL = 'https://meetbackdrops.com';
const ASSET_BASE_URL = 'https://assets.streambackdrops.com';

function intersects(set, list) {
  if (!list) return false;
  for (const v of list) if (set.has(v)) return true;
  return false;
}

function subset(list, set) {
  if (!list) return true;
  for (const v of list) if (!set.has(v)) return false;
  return true;
}

// Does a single manifest image satisfy a collection definition?
function matches(image, def) {
  if (isSeasonal(image)) return false;

  const facets = deriveFacets(image);

  const ex = def.exclude || {};
  if (ex.categoriesAny && ex.categoriesAny.includes(image.category)) return false;
  if (intersects(facets, ex.facetsAny)) return false;

  const rule = def.rule || {};
  if (rule.categoriesAny && !rule.categoriesAny.includes(image.category)) return false;
  if (rule.facetsAny && !intersects(facets, rule.facetsAny)) return false;
  if (rule.facetsAll && !subset(rule.facetsAll, facets)) return false;

  return true;
}

// UI-safe image shape consumed by ImageGrid. Each carries its own `folder`
// (for R2 URL construction) and `category` (so the grid links to the canonical
// image page under the real category, not the collection slug).
function toGridImage(image) {
  return {
    filename: image.filename,
    title: image.title,
    folder: image.folder || image.category,
    category: image.category,
  };
}

// All images matching a definition (full manifest shape, manifest order).
// Used by the publish gate, which only needs the count.
function resolveImages(def, allImages = getAllImages()) {
  const out = [];
  const seen = new Set();
  for (const image of allImages) {
    if (!image || !image.filename || seen.has(image.filename)) continue;
    if (matches(image, def)) {
      seen.add(image.filename);
      out.push(toGridImage(image));
    }
  }
  return out;
}

function rawScore(popularityMap, filename) {
  const base = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const s = popularityMap[filename] ?? popularityMap[`${base}.webp`] ?? popularityMap[`${base}.png`];
  return typeof s === 'object' && s ? (s.score ?? 0) : (s ?? 0);
}

// Relevance of an image to a SPECIFIC persona: how many of that persona's
// defining facets the image carries, plus a small bonus when its category is a
// primary category for the persona. This is what makes two collections drawing
// from overlapping pools surface DIFFERENT images — each leads with the images
// most characteristic of its own profession, not just the globally popular
// ones. Without it, every collection collapses to the same top-N by score
// (the doorway-page trap).
function relevance(image, def) {
  const facets = deriveFacets(image);
  let r = 0;
  for (const f of (def.rule?.facetsAny || [])) if (facets.has(f)) r += 1;
  if (def.rule?.categoriesAny?.includes(image.category)) r += 0.5;
  return r;
}

// Resolve → rank by composite (relevance dominant, popularity as tiebreaker)
// → cap at maxShown. Returns grid images AND a composite `scores` map; ImageGrid
// sorts by that map, so passing the composite makes the displayed order match
// the selected order (relevance-first). Composite = relevance*1000 + popularity
// (0–100), so relevance always outranks popularity but popularity breaks ties.
function rankedImages(def, popularityMap = {}, allImages = getAllImages()) {
  const matched = [];
  const seen = new Set();
  for (const image of allImages) {
    if (!image || !image.filename || seen.has(image.filename)) continue;
    if (!matches(image, def)) continue;
    seen.add(image.filename);
    const composite = relevance(image, def) * 1000 + rawScore(popularityMap, image.filename);
    matched.push({ image, composite });
  }
  matched.sort((a, b) => b.composite - a.composite);

  const capped = matched.slice(0, def.maxShown || 60);
  const images = capped.map((m) => toGridImage(m.image));
  const scores = {};
  capped.forEach((m) => { scores[m.image.filename] = m.composite; });
  return { images, scores };
}

function getCollectionBySlug(slug) {
  return PERSONAS.find((p) => p.slug === slug) || null;
}

// Definitions that clear their minCount gate. Membership count is independent
// of scores, so this needs no score data.
function getPublishedCollections() {
  const all = getAllImages();
  return PERSONAS.filter((def) => resolveImages(def, all).length >= (def.minCount || 1));
}

function getPublishedSlugs() {
  return getPublishedCollections().map((p) => p.slug);
}

// Inverse of resolveImages: given a category, which PUBLISHED collections draw
// from it, and how heavily? A collection is relevant to a category when that
// category is one of its source categories (rule.categoriesAny) AND at least
// one of the category's images actually matches the collection's rule.
// Ordered by contribution (how many of the category's images the collection
// pulls), so the most relevant professions surface first. Returns lightweight,
// serializable objects safe to pass as page props. Powers the "popular with
// these professions" strip on /category/{slug}.
function getCollectionsForCategory(categorySlug, allImages = getAllImages()) {
  if (!categorySlug) return [];
  const publishedSlugs = new Set(getPublishedSlugs());
  const catImages = allImages.filter((i) => i && i.category === categorySlug);
  if (catImages.length === 0) return [];

  const out = [];
  for (const def of PERSONAS) {
    if (!publishedSlugs.has(def.slug)) continue;
    if (!def.rule?.categoriesAny?.includes(categorySlug)) continue;
    let contribution = 0;
    for (const img of catImages) if (matches(img, def)) contribution += 1;
    if (contribution === 0) continue;
    out.push({ slug: def.slug, persona: def.persona, h1: def.h1, contribution });
  }
  out.sort((a, b) => b.contribution - a.contribution);
  return out.map(({ slug, persona, h1 }) => ({ slug, persona, h1 }));
}

// --- SEO --------------------------------------------------------------------
// Mirrors lib/seo/seo.js: CollectionPage + BreadcrumbList + ItemList over a
// /collections/{slug} canonical, optionally followed by FAQPage when persona
// FAQs are supplied. These are NEW indexable URLs that aggregate cross-
// category curated sets with unique copy — not duplicates of category pages
// (which own the individual images).
//
// `faqs` is an optional array of `{ question, answer }` pairs. When non-empty,
// a FAQPage block is appended to @graph. Loaded by the page (where ES imports
// work) and passed in, rather than required here, so this engine stays
// CommonJS-clean.
function collectionSeo(def, items, faqs = []) {
  const canonical = `${BASE_URL}/collections/${def.slug}`;
  const ogImage = items[0]
    ? `${ASSET_BASE_URL}/webp/${items[0].folder}/${items[0].filename}`
    : `${BASE_URL}/meetbackdrops-og.png`;

  const itemList = items.slice(0, 15).map((img, index) => ({
    '@type': 'ImageObject',
    position: index + 1,
    contentUrl: `${ASSET_BASE_URL}/webp/${img.folder}/${img.filename}`,
    name: img.title || `${def.persona} virtual background ${index + 1}`,
    thumbnail: `${ASSET_BASE_URL}/webp/${img.folder}/${img.filename}`,
    encodingFormat: 'image/webp',
    width: 1920,
    height: 1080,
    license: `${BASE_URL}/license`,
    acquireLicensePage: `${BASE_URL}/license`,
    creditText: 'MeetBackdrops',
    creator: { '@type': 'Organization', name: 'MeetBackdrops', url: BASE_URL },
  }));

  const graph = [
    {
      '@type': 'CollectionPage',
      url: canonical,
      name: def.h1,
      description: def.description,
      isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
      // Audience signals to Google that this page is curated for a specific
      // occupation, helping it match profession-intent queries.
      audience: {
        '@type': 'PeopleAudience',
        audienceType: def.persona,
      },
      mainEntity: { '@type': 'ItemList', itemListElement: itemList },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Collections', item: `${BASE_URL}/collections` },
        { '@type': 'ListItem', position: 3, name: def.persona, item: canonical },
      ],
    },
  ];

  if (Array.isArray(faqs) && faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  const schema = { '@context': 'https://schema.org', '@graph': graph };

  const personaLower = def.persona.toLowerCase();
  return {
    title: def.title,
    description: def.description,
    canonical,
    keywords: `${personaLower} virtual backgrounds, zoom backgrounds for ${personaLower}, teams backgrounds, google meet backgrounds, professional video call backgrounds`,
    ogImage,
    schema,
  };
}

module.exports = {
  matches,
  resolveImages,
  rankedImages,
  relevance,
  getCollectionBySlug,
  getPublishedCollections,
  getPublishedSlugs,
  getCollectionsForCategory,
  collectionSeo,
  BASE_URL,
  ASSET_BASE_URL,
};
