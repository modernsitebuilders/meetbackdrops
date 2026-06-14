#!/usr/bin/env node
/**
 * build-batch-urls.js — derive the page URLs an add-images batch published and
 * write them (newline-delimited, sorted) to image-pipeline/last-batch-urls.txt.
 *
 * Why: IndexNow is meant to announce *new/changed* URLs, not bulk-resubmit the
 * whole site. Bing Webmaster Tools flags repeated full-site batches ("Avoid
 * IndexNow Batch Mode … excessive server load and potential indexing delays").
 * run-batch.sh calls this so the push that ships a batch can submit exactly its
 * pages via `submit-indexnow.js --urls-file`, instead of a daily full sweep.
 *
 * Pages a batch changes:
 *   - one NEW individual image page per image:  /category/{category}/{slug}
 *   - the (updated) category landing page:      /category/{category}   (deduped)
 *
 * The route uses the parent `category`, NOT `folder` — merged categories like
 * bookshelves still resolve under /category/bookshelves/… (see
 * pages/category/[slug]/[imageSlug].js getStaticPaths).
 *
 * Reads the batch from process_new_images_output.json (the pipeline's output).
 * The file it writes MUST be committed: the GitHub Action submits it on push.
 */

const fs = require('fs');
const path = require('path');

const SITE = 'https://meetbackdrops.com';
const OUT_PATH = path.join(__dirname, 'process_new_images_output.json');
const URLS_PATH = path.join(__dirname, 'last-batch-urls.txt');
const REL = (p) => path.relative(path.join(__dirname, '..'), p);

if (!fs.existsSync(OUT_PATH)) {
  console.error(`  ! no batch output at ${REL(OUT_PATH)} — run the pipeline first.`);
  process.exit(1);
}

const batch = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));

const urls = new Set();
for (const e of batch || []) {
  if (!e || !e.category || !e.slug) continue;
  urls.add(`${SITE}/category/${e.category}/${e.slug}`); // new image page
  urls.add(`${SITE}/category/${e.category}`); // updated category landing page
}

const list = [...urls].sort();
fs.writeFileSync(URLS_PATH, list.length ? list.join('\n') + '\n' : '');

const imagePages = list.filter((u) => u.split('/').length > 5).length;
const categoryPages = list.length - imagePages;
console.log(
  `  wrote ${list.length} URL(s) → ${REL(URLS_PATH)} ` +
    `(${imagePages} new image page(s), ${categoryPages} category page(s))`
);
