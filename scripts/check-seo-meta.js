#!/usr/bin/env node
/**
 * SEO meta length guard.
 *
 * Bing Webmaster Tools flags titles > 65 chars and meta descriptions outside
 * 110-160 chars. This script checks every page that controls those values
 * and fails the build if any are out of range.
 *
 * Covered surfaces:
 *   - Top-level Next.js pages under pages/*.js (regex-extracted Layout title/description props)
 *   - components/Layout.js default title/description (used as fallback)
 *   - All categories in data/categoryData.js, rendered through the category
 *     [slug] page template at pages/category/[slug]/index.js
 *   - All blog posts in data/blogPosts.js
 *   - Raw <title>/<meta name="description"> in pages/privacy.js, pages/404.js, etc.
 *
 * Run: `npm run check:seo` (also runs as part of `prebuild`).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const TITLE_MAX = 65;
const TITLE_MIN = 20;
const DESC_MIN = 110;
const DESC_MAX = 160;

const errors = [];
const warnings = [];

function check(label, title, description, { skipDesc = false, skipTitle = false } = {}) {
  if (!skipTitle) {
    if (title == null || title === '') {
      errors.push(`${label}: missing title`);
    } else {
      const tLen = String(title).length;
      if (tLen > TITLE_MAX) errors.push(`${label}: title ${tLen} chars > ${TITLE_MAX} — "${title}"`);
      else if (tLen < TITLE_MIN) warnings.push(`${label}: title ${tLen} chars < ${TITLE_MIN} — "${title}"`);
    }
  }
  if (!skipDesc) {
    if (description == null || description === '') {
      errors.push(`${label}: missing description`);
    } else {
      const dLen = String(description).length;
      if (dLen > DESC_MAX) errors.push(`${label}: description ${dLen} chars > ${DESC_MAX} — "${description}"`);
      else if (dLen < DESC_MIN) errors.push(`${label}: description ${dLen} chars < ${DESC_MIN} — "${description}"`);
    }
  }
}

// ----- Top-level pages with <Layout title="..." description="..."> -----
// Pages that use raw <Head> instead of Layout are listed in RAW_HEAD_PAGES.
const LAYOUT_PAGES = [
  'pages/index.js',
  'pages/about.js',
  'pages/blog.js',
  'pages/branded-backgrounds.js',
  'pages/commercial-license.js',
  'pages/contact.js',
  'pages/faq.js',
  'pages/free-sample.js',
  'pages/hd.js',
  'pages/hd-download.js',
  'pages/image-lookup.js',
  'pages/most-popular.js',
  'pages/category/recently-added.js',
];

const RAW_HEAD_PAGES = [
  'pages/privacy.js',
  'pages/license.js',
  'pages/terms.js',
];

// Pages that are intentionally noindex — title checked, description not required.
const NOINDEX_RAW_HEAD_PAGES = [
  'pages/404.js',
];

// Pages that intentionally don't expose SEO meta (noindex utility pages, redirects)
const SKIP_PAGES = new Set([
  'pages/410.js',
  'pages/admin',
  'pages/api',
  'pages/_app.js',
  'pages/_document.js',
  'pages/indexnow-test.js',
  'pages/subscription-success.js',
  'pages/hd-download.js', // already in LAYOUT_PAGES; never both
]);

function extractFirstAttr(src, attr) {
  // Match attr="..." or attr={`...`} or attr={"..."} — first occurrence, single-line value.
  // Uses a non-greedy match. Description templates that interpolate ${var} will be reported as-is;
  // the only interpolation we use is TOTAL_IMAGES_FORMATTED which is "1,029" (5 chars).
  const m = src.match(new RegExp(`${attr}=(?:"([^"]+)"|'([^']+)'|\\{\`([^\`]+)\`\\}|\\{"([^"]+)"\\})`));
  if (!m) return null;
  return m[1] || m[2] || m[3] || m[4];
}

function findLayoutBlock(src) {
  // Find the first JSX `<Layout` opening tag with attributes (not `<Layout>` in comments).
  // We look for `<Layout` followed by whitespace+letter — that's how JSX props start.
  // Skip occurrences in single-line and block comments.
  const re = /<Layout\s+[a-zA-Z]/g;
  let match;
  let start = -1;
  while ((match = re.exec(src))) {
    const idx = match.index;
    // Check if this position is inside a // comment by scanning back to last newline.
    const lineStart = src.lastIndexOf('\n', idx) + 1;
    const before = src.slice(lineStart, idx);
    if (before.includes('//')) continue;
    // Check if inside /* ... */ block comment.
    const lastOpen = src.lastIndexOf('/*', idx);
    const lastClose = src.lastIndexOf('*/', idx);
    if (lastOpen > lastClose) continue;
    start = idx;
    break;
  }
  if (start === -1) return null;
  // Find the matching `>` that closes the opening tag (not a `/>` for self-close, not inside a string).
  let depth = 0;
  let inStr = null;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === inStr && src[i - 1] !== '\\') inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0) return src.slice(start, i + 1);
  }
  return null;
}

for (const rel of LAYOUT_PAGES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { warnings.push(`${rel}: file not found`); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  const block = findLayoutBlock(src);
  if (!block) {
    warnings.push(`${rel}: no <Layout> block found`);
    continue;
  }
  let title = extractFirstAttr(block, 'title');
  let desc = extractFirstAttr(block, 'description');
  // Substitute the only known interpolation used in Layout descriptions:
  if (desc && desc.includes('${TOTAL_IMAGES_FORMATTED}')) {
    desc = desc.replace('${TOTAL_IMAGES_FORMATTED}', '1,029');
  }
  check(rel, title, desc);
}

for (const rel of RAW_HEAD_PAGES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { warnings.push(`${rel}: file not found`); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  const titleMatch = src.match(/<title>([^<]+)<\/title>/);
  const descMatch = src.match(/<meta\s+name="description"\s+content="([^"]+)"/);
  check(rel, titleMatch && titleMatch[1], descMatch && descMatch[1]);
}

for (const rel of NOINDEX_RAW_HEAD_PAGES) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) { warnings.push(`${rel}: file not found`); continue; }
  const src = fs.readFileSync(abs, 'utf8');
  const titleMatch = src.match(/<title>([^<]+)<\/title>/);
  check(rel, titleMatch && titleMatch[1], null, { skipDesc: true });
}

// ----- Layout.js defaults (fallback if a page omits the prop) -----
{
  const abs = path.join(ROOT, 'components/Layout.js');
  const src = fs.readFileSync(abs, 'utf8');
  const titleMatch = src.match(/title\s*=\s*'([^']+)'/);
  const descMatch = src.match(/description\s*=\s*`([^`]+)`/);
  check('components/Layout.js (default props)', titleMatch && titleMatch[1], descMatch && descMatch[1]);
}

// ----- Category pages: replicate the [slug] template logic -----
{
  const dataSrc = fs.readFileSync(path.join(ROOT, 'data/categoryData.js'), 'utf8');
  // Match each top-level entry under categoryInfo: 'slug': { name: '...', ... seoDescription?: '...', ... images: ... }
  // The name and seoDescription captures must handle escaped quotes (e.g. Valentine\'s Day).
  const blockRe = /'([a-z0-9-]+)':\s*\{[\s\S]*?name:\s*(['"`])((?:\\.|(?!\2).)*)\2[\s\S]*?(?:seoDescription:\s*(['"`])((?:\\.|(?!\4)[\s\S])*?)\4[\s\S]*?)?images:/g;
  let m;
  let count = 0;
  while ((m = blockRe.exec(dataSrc))) {
    count++;
    const slug = m[1];
    const name = m[3].replace(/\\'/g, "'").replace(/\\"/g, '"');
    const seoDesc = m[5] ? m[5].replace(/\\'/g, "'").replace(/\\"/g, '"') : null;
    // Mirror pages/category/[slug]/index.js logic — must stay in sync
    const lower = name.toLowerCase();
    const longTitle = lower.endsWith('backgrounds')
      ? `${name} for Zoom, Teams & Meet | MeetBackdrops`
      : `${name} Virtual Backgrounds | MeetBackdrops`;
    const title = longTitle.length <= 65 ? longTitle : `${name} | MeetBackdrops`;
    const desc = seoDesc
      || `Studio-designed ${lower} virtual backgrounds for Zoom, Teams, and Google Meet. Composed for camera, not pulled from stock. Free samples available.`;
    check(`category /${slug}`, title, desc);
  }
  if (count === 0) errors.push('categoryData.js: parser found 0 categories — regex likely broke');
}

// ----- Blog posts -----
{
  const blogSrc = fs.readFileSync(path.join(ROOT, 'data/blogPosts.js'), 'utf8');
  // Find each post by looking for `slug: '...'` followed within ~2KB by `title:` and `description:` at the same indent level.
  const slugRe = /^\s*slug:\s*'([a-z0-9-]+)',?\s*$/gm;
  let m;
  while ((m = slugRe.exec(blogSrc))) {
    const slug = m[1];
    const after = blogSrc.slice(m.index, m.index + 4000);
    const tMatch = after.match(/^\s*title:\s*(['"])((?:\\.|(?!\1).)*)\1,?\s*$/m);
    const dMatch = after.match(/^\s*description:\s*(['"])((?:\\.|(?!\1).)*)\1,?\s*$/m);
    if (!tMatch || !dMatch) continue;
    const title = tMatch[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
    const desc = dMatch[2].replace(/\\'/g, "'").replace(/\\"/g, '"');
    check(`blog /${slug}`, title, desc);
  }
}

// ----- Report -----
if (warnings.length) {
  console.warn(`\n⚠️  ${warnings.length} SEO warning(s):`);
  for (const w of warnings) console.warn('   ' + w);
}
if (errors.length) {
  console.error(`\n❌ ${errors.length} SEO meta error(s):\n`);
  for (const e of errors) console.error('   ' + e);
  console.error(`\nLimits: title ${TITLE_MIN}-${TITLE_MAX} chars, description ${DESC_MIN}-${DESC_MAX} chars.`);
  console.error('See CLAUDE.md → "SEO meta budgets" for the rule and how to fix.\n');
  process.exit(1);
}
console.log(`✓ SEO meta check passed (${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);
