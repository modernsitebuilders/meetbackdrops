// lib/seo/seo.js
//
// The single, pure, deterministic source of category SEO.
//
//     const s = seo('bookshelves');
//     // → frozen { title, h1, canonical, description, keywords, ogImage, schema }
//
// Closure rule: nothing on the category-page render path may construct,
// transform, or infer any SEO field. The only legal mutation point is this
// function. The function's output is deep-frozen before return, and a private
// `assertInvariant` runs immediately before the freeze so any future drift
// (in this file) throws synchronously at call time.
//
// Build-time enforcement: see scripts/check-seo-singularity.js and the
// ESLint pattern in .eslintrc.json.

import { categoryInfo } from '../../data/categoryData.js';
import { getFAQs } from '../../data/faqData.js';

const BASE_URL = 'https://meetbackdrops.com';
const ASSET_BASE_URL = 'https://assets.streambackdrops.com';
const H1_SUFFIX = 'for Zoom, Teams & Google Meet';

const FEATURED_IMAGES = {
  'halloween-backgrounds':   { folder: 'halloween-backgrounds',   filename: 'halloween-background-20.webp' },
  'valentines-backgrounds':  { folder: 'valentines-backgrounds',  filename: 'valentines-background-01.webp' },
  'christmas-backgrounds':   { folder: 'christmas-backgrounds',   filename: 'christmas-background-1.webp' },
  'easter-backgrounds':      { folder: 'easter-backgrounds',      filename: 'easter-background-01.webp' },
  'bookshelves':             { folder: 'bookshelves-bright',      filename: 'bookshelves-bright-01.webp' },
  'wall-shelves':            { folder: 'wall-shelves-bright',     filename: 'wall-shelves-bright-01.webp' },
  'office-spaces':           { folder: 'office-spaces',           filename: 'office-spaces-01.webp' },
  'home-office':             { folder: 'home-office',             filename: 'home-offices-05.webp' },
  'living-rooms':            { folder: 'living-rooms',            filename: 'living-room-01.webp' },
  'kitchens':                { folder: 'kitchens',                filename: 'kitchen-01.webp' },
  'coffee-shops':            { folder: 'coffee-shops',            filename: 'coffee-shop-01.webp' },
  'conference-rooms':        { folder: 'conference-rooms',        filename: 'conference-room-01.webp' },
  'art-galleries':           { folder: 'art-galleries',           filename: 'art-gallery-23.webp' },
  'urban-lofts':             { folder: 'urban-lofts',             filename: 'urban-loft-01.webp' },
  'gardens-patios':          { folder: 'gardens-patios',          filename: 'garden-patio-01.webp' },
  'historic-spaces':         { folder: 'historic-spaces',         filename: 'historic-space-01.webp' },
  'nature-landscapes':       { folder: 'nature-landscapes',       filename: 'nature-landscape-01.webp' },
  'libraries':               { folder: 'libraries',               filename: 'library-01.webp' },
  'bokeh-backgrounds':       { folder: 'bokeh-backgrounds',       filename: 'bokeh-01.webp' },
  'spring-backgrounds':      { folder: 'spring-backgrounds',      filename: 'spring-background-01.webp' },
  'summer-backgrounds':      { folder: 'summer-backgrounds',      filename: 'summer-background-01.webp' },
};

function deepFreeze(o) {
  if (o === null || typeof o !== 'object' || Object.isFrozen(o)) return o;
  for (const k of Object.keys(o)) deepFreeze(o[k]);
  return Object.freeze(o);
}

// Private. Runs against the output object just before freeze. Any drift in
// the field-construction logic above throws here synchronously, so callers
// see the failure at the seo() boundary, not at render time.
function assertInvariant(o) {
  for (const k of ['title', 'h1', 'canonical', 'description', 'keywords', 'ogImage']) {
    if (typeof o[k] !== 'string' || o[k].length === 0) {
      throw new Error(`seo: invariant violated — "${k}" missing or not a string`);
    }
  }
  if (o.title.length > 65) throw new Error(`seo: invariant violated — title length ${o.title.length} > 65`);
  if (o.description.length > 160) throw new Error(`seo: invariant violated — description length ${o.description.length} > 160`);

  if (!o.schema || typeof o.schema !== 'object') {
    throw new Error('seo: invariant violated — schema missing or not an object');
  }
  if (!Array.isArray(o.schema['@graph'])) {
    throw new Error('seo: invariant violated — schema["@graph"] must be an array');
  }

  const graph = o.schema['@graph'];
  const collection = graph.find((g) => g['@type'] === 'CollectionPage');
  if (!collection) throw new Error('seo: invariant violated — @graph missing CollectionPage');
  if (collection.url !== o.canonical) {
    throw new Error(`seo: invariant violated — CollectionPage.url ("${collection.url}") !== canonical ("${o.canonical}")`);
  }
  if (collection.name !== o.h1) {
    throw new Error(`seo: invariant violated — CollectionPage.name ("${collection.name}") !== h1 ("${o.h1}")`);
  }
  if (!collection.mainEntity || collection.mainEntity['@type'] !== 'ItemList') {
    throw new Error('seo: invariant violated — CollectionPage.mainEntity must be ItemList');
  }

  const breadcrumb = graph.find((g) => g['@type'] === 'BreadcrumbList');
  if (!breadcrumb) throw new Error('seo: invariant violated — @graph missing BreadcrumbList');
  const lastCrumb = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];
  if (lastCrumb?.item !== o.canonical) {
    throw new Error('seo: invariant violated — BreadcrumbList tail must equal canonical');
  }

  // Single representation: no duplicate @type within @graph.
  const types = graph.map((g) => g['@type']);
  if (new Set(types).size !== types.length) {
    throw new Error('seo: invariant violated — duplicate @type entries in @graph');
  }
}

/**
 * @param {string} slug
 * @returns {Readonly<{
 *   title: string,
 *   h1: string,
 *   canonical: string,
 *   description: string,
 *   keywords: string,
 *   ogImage: string,
 *   schema: object,
 * }>}
 */
export function seo(slug) {
  if (typeof slug !== 'string' || slug.length === 0) {
    throw new Error(`seo: invalid slug "${String(slug)}"`);
  }
  const category = categoryInfo[slug];
  if (!category) {
    throw new Error(`seo: unknown category slug "${slug}"`);
  }

  const name = String(category.name);
  const lower = name.toLowerCase();
  const canonical = `${BASE_URL}/category/${slug}`;
  const h1 = `${name} ${H1_SUFFIX}`;

  const longTitle = lower.endsWith('backgrounds')
    ? `${name} for Zoom, Teams & Meet | MeetBackdrops`
    : `${name} Virtual Backgrounds | MeetBackdrops`;
  const title = longTitle.length <= 65 ? longTitle : `${name} | MeetBackdrops`;

  const description =
    (typeof category.seoDescription === 'string' && category.seoDescription.trim())
      ? category.seoDescription
      : `Studio-designed ${lower} virtual backgrounds for Zoom, Teams, and Google Meet. Composed for camera, not pulled from stock. Free samples available.`;

  const keywords = `${lower} virtual backgrounds`;

  const featured = FEATURED_IMAGES[slug];
  const ogImage = featured
    ? `${ASSET_BASE_URL}/webp/${featured.folder}/${featured.filename}`
    : `${BASE_URL}/meetbackdrops-og.png`;

  const items = category.images.slice(0, 15).map((img, index) => ({
    '@type': 'ImageObject',
    position: index + 1,
    contentUrl: `${ASSET_BASE_URL}/webp/${img.folder || slug}/${img.filename}`,
    name: img.title || `${name} virtual background ${index + 1}`,
    description: `Free ${lower} virtual background`,
    thumbnail: `${ASSET_BASE_URL}/webp/${img.folder || slug}/${img.filename}`,
    encodingFormat: 'image/webp',
    width: 1920,
    height: 1080,
    license: `${BASE_URL}/license`,
    acquireLicensePage: `${BASE_URL}/license`,
    creditText: 'MeetBackdrops',
    copyrightNotice: '© MeetBackdrops. Free for personal use only.',
    creator: { '@type': 'Organization', name: 'MeetBackdrops', url: BASE_URL },
  }));

  const collectionPage = {
    '@type': 'CollectionPage',
    url: canonical,
    name: h1,
    description: `Studio-designed ${lower} virtual backgrounds for Zoom, Microsoft Teams, and Google Meet.`,
    isPartOf: { '@type': 'WebSite', name: 'MeetBackdrops', url: BASE_URL },
    mainEntity: { '@type': 'ItemList', itemListElement: items },
  };

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name, item: canonical },
    ],
  };

  const graph = [collectionPage, breadcrumbList];

  const faqs = getFAQs(slug);
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

  const schema = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };

  const output = { title, h1, canonical, description, keywords, ogImage, schema };
  assertInvariant(output);
  return deepFreeze(output);
}
