// lib/collections/themeEngine.js
//
// The canonical server-side surface for STANDALONE theme collections
// (/backgrounds/{theme}). Reuses the one matching engine (./engine →
// rankedImages / resolveImages / matches) exactly like personas and platforms —
// there is a single implementation of membership in this codebase.
//
// Adds only what theme collections need beyond raw matching:
//   - the theme publish gate (shared definition, imported by the platform engine)
//   - theme collection SEO (CollectionPage + Breadcrumb + ItemList + FAQPage)
//   - the discovery-graph edges: source categories, related personas, hub cards
//
// Deterministic: manifest + defs → same output. Scores affect order + cap only.

const { rankedImages, resolveImages, matches, getPublishedCollections } = require('./engine');
const { getAllImages } = require('../manifest');
const { THEMES } = require('../../data/collections/themes');
const { PERSONAS } = require('../../data/collections/personas');
const { CATEGORIES } = require('../categories-config');
const { getThemesForCategory } = require('./categoryThemes');

const BASE_URL = 'https://meetbackdrops.com';
const ASSET_BASE_URL = 'https://assets.streambackdrops.com';

// --- lookups + publish gate (single source of truth for "which themes ship") --

function getThemeBySlug(slug) {
  return THEMES.find((t) => t.slug === slug) || null;
}

function getPublishedThemes(allImages = getAllImages()) {
  return THEMES.filter((t) => resolveImages(t, allImages).length >= (t.minCount || 12));
}

function getPublishedThemeSlugs(allImages = getAllImages()) {
  return getPublishedThemes(allImages).map((t) => t.slug);
}

// Images for a theme collection page (relevance-dominant composite order).
function resolveThemeImages(theme, scoreMap = {}, allImages = getAllImages()) {
  return rankedImages(theme, scoreMap, allImages);
}

// --- discovery-graph edges --------------------------------------------------

// Source categories powering a theme, mapped to display names (config-gated so a
// typo drops silently instead of crashing the build).
function themeSourceCategories(theme) {
  return (theme.rule?.categoriesAny || [])
    .map((slug) => (CATEGORIES[slug] ? { slug, name: CATEGORIES[slug].name } : null))
    .filter(Boolean);
}

// Which PUBLISHED persona collections overlap this theme — i.e. professionals
// who tend to use this style. Overlap = shared source categories; ranked by how
// many categories they share, capped. Connects the style axis to the profession
// axis so the two collection systems reinforce each other.
function relatedPersonasForTheme(theme, limit = 6, allImages = getAllImages()) {
  const themeCats = new Set(theme.rule?.categoriesAny || []);
  if (themeCats.size === 0) return [];
  const publishedSlugs = new Set(getPublishedCollections().map((p) => p.slug));

  const scored = [];
  for (const p of PERSONAS) {
    if (!publishedSlugs.has(p.slug)) continue;
    const pCats = p.rule?.categoriesAny || [];
    let overlap = 0;
    for (const c of pCats) if (themeCats.has(c)) overlap += 1;
    if (overlap > 0) scored.push({ slug: p.slug, persona: p.persona, overlap });
  }
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map(({ slug, persona }) => ({ slug, persona }));
}

// Cards for the /backgrounds hub: every published theme with a representative
// (top-scored) image for the thumbnail. Deterministic given the score map.
function themeHubCards(scoreMap = {}, allImages = getAllImages()) {
  return getPublishedThemes(allImages).map((t) => {
    const { images } = rankedImages(t, scoreMap, allImages);
    const hero = images[0] || null;
    return {
      slug: t.slug,
      label: t.label,
      blurb: t.blurb,
      count: resolveImages(t, allImages).length,
      hero: hero ? { folder: hero.folder, filename: hero.filename } : null,
    };
  });
}

// --- SEO --------------------------------------------------------------------

function fitDescription(theme) {
  const core = `${theme.label} virtual backgrounds for video calls — ${theme.descBit}`;
  const pad = ' Free, studio-designed, instant download.';
  let desc = core.length + pad.length <= 160 ? core + pad : core;
  if (desc.length < 110) desc = `${desc} No signup, no watermark.`;
  if (desc.length > 160) desc = `${desc.slice(0, 159).trimEnd()}…`;
  return desc;
}

function themeCollectionSeo(theme, images, faqs = []) {
  const canonical = `${BASE_URL}/backgrounds/${theme.slug}`;

  const longTitle = `${theme.label} Virtual Backgrounds | MeetBackdrops`;
  const title = longTitle.length <= 65 ? longTitle : `${theme.label} Backgrounds | MeetBackdrops`;

  const h1 = `${theme.label} Virtual Backgrounds`;
  const description = fitDescription(theme);

  const first = images[0];
  const ogImage = first
    ? `${ASSET_BASE_URL}/webp/${first.folder}/${first.filename}`
    : `${BASE_URL}/meetbackdrops-og.png`;

  const itemList = images.slice(0, 15).map((img, index) => ({
    '@type': 'ImageObject',
    position: index + 1,
    contentUrl: `${ASSET_BASE_URL}/webp/${img.folder}/${img.filename}`,
    name: img.title || `${theme.label} virtual background ${index + 1}`,
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
      name: h1,
      description,
      isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
      mainEntity: { '@type': 'ItemList', itemListElement: itemList },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Backgrounds by Style', item: `${BASE_URL}/backgrounds` },
        { '@type': 'ListItem', position: 3, name: theme.label, item: canonical },
      ],
    },
  ];

  if (Array.isArray(faqs) && faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    });
  }

  const seo = {
    title,
    h1,
    description,
    canonical,
    keywords: `${theme.modifier} virtual backgrounds, ${theme.modifier} zoom background, ${theme.modifier} backgrounds for video calls, professional ${theme.modifier} backgrounds`,
    ogImage,
    schema: { '@context': 'https://schema.org', '@graph': graph },
  };
  if (seo.title.length > 65) throw new Error(`themeCollectionSeo: title length ${seo.title.length} > 65 ("${seo.title}")`);
  if (seo.description.length < 110 || seo.description.length > 160) {
    throw new Error(`themeCollectionSeo: description length ${seo.description.length} outside 110–160 ("${seo.description}")`);
  }
  return seo;
}

module.exports = {
  BASE_URL,
  ASSET_BASE_URL,
  getThemeBySlug,
  getPublishedThemes,
  getPublishedThemeSlugs,
  resolveThemeImages,
  themeSourceCategories,
  relatedPersonasForTheme,
  themeHubCards,
  themeCollectionSeo,
  getThemesForCategory,
};
