// lib/platforms/engine.js
//
// Resolves the platform × theme discovery surface. REUSES the collections
// engine for all image selection (lib/collections/engine.js → rankedImages /
// resolveImages / matches) — there is exactly one matching implementation in
// the codebase, and platforms/themes ride on it. This module only adds:
//   - the platform/theme publish gates and path enumeration
//   - featured-image selection for platform landing pages
//   - SEO builders (platformSeo, platformThemeSeo) with meta-budget invariants
//
// Determinism: same manifest + same defs → same output. Scores affect ORDER and
// the cap, never membership (identical contract to the collections engine).

const { rankedImages } = require('../collections/engine');
const { isSeasonal } = require('../collections/facets');
const { getAllImages } = require('../manifest');
const { PLATFORMS } = require('../../data/platforms');
const { CATEGORIES } = require('../categories-config');
// Theme publish gate lives in one place (themeEngine) so the platform matrix and
// the standalone theme collections can never disagree about which themes ship.
const {
  getThemeBySlug,
  getPublishedThemes,
  getPublishedThemeSlugs,
} = require('../collections/themeEngine');

const BASE_URL = 'https://meetbackdrops.com';
const ASSET_BASE_URL = 'https://assets.streambackdrops.com';

// --- lookups ----------------------------------------------------------------

function getPlatforms() {
  return PLATFORMS;
}
function getPlatformBySlug(slug) {
  return PLATFORMS.find((p) => p.slug === slug) || null;
}

// getThemeBySlug / getPublishedThemes / getPublishedThemeSlugs are imported from
// themeEngine (single source of truth) and re-exported below for callers that
// already import them from this module.

// All /{platform}/{theme} params for getStaticPaths. Platforms × published themes.
function getPlatformThemePaths(allImages = getAllImages()) {
  const themes = getPublishedThemeSlugs(allImages);
  const paths = [];
  for (const p of PLATFORMS) {
    for (const theme of themes) {
      paths.push({ platform: p.slug, theme });
    }
  }
  return paths;
}

// --- featured images for a platform landing page ----------------------------
// Platform doesn't filter, so the landing grid is "the best of the whole
// library": highest-scored non-seasonal images, de-duped, capped. Deterministic
// given the static score map.

function rawScore(scoreMap, filename) {
  if (!scoreMap) return 0;
  const base = String(filename).replace(/\.(webp|png|jpe?g)$/i, '');
  const s = scoreMap[filename] ?? scoreMap[`${base}.webp`] ?? scoreMap[`${base}.png`];
  return typeof s === 'object' && s ? (s.score ?? 0) : (s ?? 0);
}

function toGridImage(image) {
  return {
    filename: image.filename,
    title: image.title,
    folder: image.folder || image.category,
    category: image.category,
  };
}

function featuredForPlatform(scoreMap = {}, cap = 24, allImages = getAllImages()) {
  const pool = allImages.filter((i) => i && i.filename && !isSeasonal(i));
  const scored = pool
    .map((image) => ({ image, score: rawScore(scoreMap, image.filename) }))
    .sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  const scores = {};
  for (const { image, score } of scored) {
    if (seen.has(image.filename)) continue;
    seen.add(image.filename);
    out.push(toGridImage(image));
    scores[image.filename] = score;
    if (out.length >= cap) break;
  }
  return { images: out, scores };
}

// Images for a platform × theme page. Membership = theme rule (platform-agnostic);
// order = relevance-dominant composite from the shared engine.
function imagesForPlatformTheme(theme, scoreMap = {}, allImages = getAllImages()) {
  return rankedImages(theme, scoreMap, allImages);
}

// --- copy composition -------------------------------------------------------

// Compose a meta description that lands inside the enforced 110–160 budget for
// ANY platform/theme pair. Built from the theme's short descBit + a platform
// clause, then padded/trimmed deterministically so the build never fails on an
// off-budget string.
function fitDescription(theme, platform) {
  const core = `${theme.label} virtual backgrounds for ${platform.name} — ${theme.descBit}`;
  const pad = ' Free, studio-designed, instant download.';
  let desc = core.length + pad.length <= 160 ? core + pad : core;
  if (desc.length < 110) desc = `${desc} No signup, no watermark.`;
  if (desc.length > 160) desc = `${desc.slice(0, 159).trimEnd()}…`;
  return desc;
}

// --- SEO: platform landing --------------------------------------------------

function platformSeo(platform, featuredImages) {
  const canonical = `${BASE_URL}/${platform.slug}`;
  const first = featuredImages[0];
  const ogImage = first
    ? `${ASSET_BASE_URL}/webp/${first.folder}/${first.filename}`
    : `${BASE_URL}/meetbackdrops-og.png`;

  const itemList = featuredImages.slice(0, 15).map((img, index) => ({
    '@type': 'ImageObject',
    position: index + 1,
    contentUrl: `${ASSET_BASE_URL}/webp/${img.folder}/${img.filename}`,
    name: img.title || `${platform.name} virtual background ${index + 1}`,
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
      name: platform.h1,
      description: platform.description,
      isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
      mainEntity: { '@type': 'ItemList', itemListElement: itemList },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: platform.h1, item: canonical },
      ],
    },
    howToSchema(platform, canonical),
  ];

  if (Array.isArray(platform.faqs) && platform.faqs.length) {
    graph.push(faqSchema(platform.faqs));
  }

  return {
    title: platform.title,
    description: platform.description,
    canonical,
    keywords: `${platform.name.toLowerCase()} backgrounds, ${platform.name.toLowerCase()} virtual background, virtual backgrounds for ${platform.name.toLowerCase()}, professional video call backgrounds`,
    ogImage,
    schema: { '@context': 'https://schema.org', '@graph': graph },
  };
}

// --- SEO: platform × theme --------------------------------------------------

function platformThemeSeo(platform, theme, images) {
  const canonical = `${BASE_URL}/${platform.slug}/${theme.slug}`;

  // Title within the 65-char budget. Prefer the descriptive long form; fall back
  // to a compact form for long platform names so the invariant never trips.
  const longTitle = `${platform.queryWord} ${theme.label} Backgrounds | MeetBackdrops`;
  const title = longTitle.length <= 65
    ? longTitle
    : `${platform.queryWord} ${theme.label} Backgrounds`;

  const h1 = `${theme.label} Virtual Backgrounds for ${platform.name}`;
  const description = fitDescription(theme, platform);
  const first = images[0];
  const ogImage = first
    ? `${ASSET_BASE_URL}/webp/${first.folder}/${first.filename}`
    : `${BASE_URL}/meetbackdrops-og.png`;

  const itemList = images.slice(0, 15).map((img, index) => ({
    '@type': 'ImageObject',
    position: index + 1,
    contentUrl: `${ASSET_BASE_URL}/webp/${img.folder}/${img.filename}`,
    name: img.title || `${theme.label} ${platform.name} background ${index + 1}`,
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
        { '@type': 'ListItem', position: 2, name: platform.h1, item: `${BASE_URL}/${platform.slug}` },
        { '@type': 'ListItem', position: 3, name: theme.label, item: canonical },
      ],
    },
    howToSchema(platform, canonical),
  ];

  if (Array.isArray(platform.faqs) && platform.faqs.length) {
    graph.push(faqSchema(platform.faqs));
  }

  const seo = {
    title,
    h1,
    description,
    canonical,
    keywords: `${platform.name.toLowerCase()} ${theme.modifier} background, ${theme.modifier} virtual background for ${platform.name.toLowerCase()}, professional ${theme.modifier} backgrounds`,
    ogImage,
    schema: { '@context': 'https://schema.org', '@graph': graph },
  };
  assertMetaBudget(seo);
  return seo;
}

// --- shared schema fragments ------------------------------------------------

function howToSchema(platform, canonical) {
  return {
    '@type': 'HowTo',
    name: platform.setupHeading,
    description: `Add a custom virtual background on ${platform.name} using a MeetBackdrops PNG.`,
    step: platform.setupSteps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
      url: `${canonical}#setup`,
    })),
  };
}

function faqSchema(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

// Build-time invariant. Composed platform×theme copy is generated, so guard the
// budgets here the way lib/seo/seo.js guards category copy.
function assertMetaBudget(seo) {
  if (seo.title.length > 65) {
    throw new Error(`platformThemeSeo: title "${seo.title}" length ${seo.title.length} > 65`);
  }
  if (seo.description.length < 110 || seo.description.length > 160) {
    throw new Error(`platformThemeSeo: description length ${seo.description.length} outside 110–160 ("${seo.description}")`);
  }
}

// --- internal-linking helpers -----------------------------------------------

// Featured categories for a platform landing, mapped to display names (config-
// gated so a typo drops silently instead of crashing the build).
function platformCategories(platform) {
  return (platform.featuredCategories || [])
    .map((slug) => (CATEGORIES[slug] ? { slug, name: CATEGORIES[slug].name } : null))
    .filter(Boolean);
}

// Theme cards for a platform landing / cross-links, restricted to published
// themes. Each becomes a /{platform}/{theme} link.
function themeCards(allImages = getAllImages()) {
  return getPublishedThemes(allImages).map((t) => ({
    slug: t.slug,
    label: t.label,
    blurb: t.blurb,
  }));
}

// The four platform slugs a theme page cross-links to (same theme, other
// platforms) — the horizontal edges of the discovery graph.
function otherPlatforms(currentSlug) {
  return PLATFORMS.filter((p) => p.slug !== currentSlug).map((p) => ({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
  }));
}

module.exports = {
  BASE_URL,
  ASSET_BASE_URL,
  getPlatforms,
  getPlatformBySlug,
  getThemeBySlug,
  getPublishedThemes,
  getPublishedThemeSlugs,
  getPlatformThemePaths,
  featuredForPlatform,
  imagesForPlatformTheme,
  platformSeo,
  platformThemeSeo,
  platformCategories,
  themeCards,
  otherPlatforms,
};
