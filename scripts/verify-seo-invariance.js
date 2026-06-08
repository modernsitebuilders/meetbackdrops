#!/usr/bin/env node
/**
 * scripts/verify-seo-invariance.js
 *
 * Runs `seo(slug)` for every category, asserts:
 *   - cross-field invariance (schema.url === canonical, schema.name === h1)
 *   - the returned object and its schema are frozen
 *   - the function throws on invalid input (unknown / empty / null / missing)
 *   - two calls for the same slug produce identical content (determinism)
 *
 * Prints the resolved SEO for /category/bookshelves as a proof artifact.
 */

(async function main() {
  const path = require('path');
  const { pathToFileURL } = require('url');

  const url = pathToFileURL(path.resolve(__dirname, '../lib/seo/seo.js')).href;
  const { seo } = await import(url);

  const SLUGS = [
    'bookshelves', 'wall-shelves', 'office-spaces', 'home-office',
    'living-rooms', 'kitchens', 'coffee-shops', 'art-galleries',
    'urban-lofts', 'gardens-patios', 'historic-spaces', 'nature-landscapes',
    'libraries', 'christmas-backgrounds',
    'halloween-backgrounds', 'valentines-backgrounds', 'easter-backgrounds',
    'spring-backgrounds', 'summer-backgrounds', 'bokeh-backgrounds',
  ];

  let failed = 0;

  for (const slug of SLUGS) {
    try {
      const s = seo(slug);

      if (!Object.isFrozen(s)) throw new Error('return value not frozen');
      if (!Object.isFrozen(s.schema)) throw new Error('schema not frozen');

      if (s.canonical !== `https://meetbackdrops.com/category/${slug}`) {
        throw new Error(`canonical mismatch: ${s.canonical}`);
      }
      if (!s.h1.endsWith(' for Zoom, Teams & Google Meet')) {
        throw new Error(`h1 suffix mismatch: "${s.h1}"`);
      }
      if (!Array.isArray(s.schema['@graph'])) throw new Error('schema["@graph"] not an array');
      const collection = s.schema['@graph'].find((g) => g['@type'] === 'CollectionPage');
      if (!collection) throw new Error('@graph missing CollectionPage');
      if (collection.mainEntity?.['@type'] !== 'ItemList') throw new Error('mainEntity not ItemList');
      if (collection.url !== s.canonical) throw new Error('collection.url !== canonical');
      if (collection.name !== s.h1) throw new Error('collection.name !== h1');
      const breadcrumb = s.schema['@graph'].find((g) => g['@type'] === 'BreadcrumbList');
      if (!breadcrumb) throw new Error('@graph missing BreadcrumbList');

      // Determinism: a second call must return content-equal output.
      const t = seo(slug);
      if (JSON.stringify(t) !== JSON.stringify(s)) {
        throw new Error('determinism violation: two calls returned different output');
      }

      console.log(`✓ ${slug.padEnd(25)} title=${s.title.length}c desc=${s.description.length}c`);
    } catch (e) {
      console.error(`✘ ${slug}: ${e.message}`);
      failed++;
    }
  }

  console.log('\n— Negative paths —');
  const negatives = [
    { input: 'not-a-slug', label: 'unknown slug' },
    { input: '', label: 'empty slug' },
    { input: null, label: 'null slug' },
    { input: undefined, label: 'undefined slug' },
  ];
  for (const { input, label } of negatives) {
    try {
      seo(input);
      console.error(`✘ ${label}: expected throw, got success`);
      failed++;
    } catch (_e) {
      console.log(`✓ ${label}: threw as required`);
    }
  }

  // Mutation attempts. Strict mode (which ESM is) makes assignment to a
  // frozen property throw; non-strict it silently no-ops. Either way the
  // value must not change.
  try {
    const s = seo('bookshelves');
    let mutationThrew = false;
    try { s.title = 'tampered'; } catch (_e) { mutationThrew = true; }
    if (s.title === 'tampered') {
      console.error('✘ freeze: top-level mutation slipped through');
      failed++;
    } else {
      console.log(`✓ freeze: top-level mutation ${mutationThrew ? 'threw' : 'was a silent no-op'}`);
    }
    let schemaMutationThrew = false;
    try { s.schema['@graph'][0].name = 'tampered'; } catch (_e) { schemaMutationThrew = true; }
    if (s.schema['@graph'][0].name === 'tampered') {
      console.error('✘ freeze: nested schema mutation slipped through');
      failed++;
    } else {
      console.log(`✓ freeze: nested schema mutation ${schemaMutationThrew ? 'threw' : 'was a silent no-op'}`);
    }
  } catch (e) {
    console.error('✘ freeze test setup failed:', e.message);
    failed++;
  }

  console.log('\n— /category/bookshelves resolved SEO —');
  const proof = seo('bookshelves');
  const proofCollection = proof.schema['@graph'].find((g) => g['@type'] === 'CollectionPage');
  console.log(JSON.stringify({
    title: proof.title,
    h1: proof.h1,
    canonical: proof.canonical,
    description: proof.description,
    keywords: proof.keywords,
    ogImage: proof.ogImage,
    schema_graph_types: proof.schema['@graph'].map((g) => g['@type']),
    collection_name: proofCollection.name,
    collection_url: proofCollection.url,
    collection_items: proofCollection.mainEntity.itemListElement.length,
    frozen: Object.isFrozen(proof),
    schema_frozen: Object.isFrozen(proof.schema),
    graph_frozen: Object.isFrozen(proof.schema['@graph']),
  }, null, 2));

  if (failed > 0) {
    console.error(`\n${failed} invariance violation(s)`);
    process.exit(1);
  }
  console.log('\n✓ verify-seo-invariance: all checks passed');
})();
