const ADJECTIVES = ['Professional', 'Elegant', 'Modern', 'Clean', 'Stylish'];
const STYLES = ['Minimalist', 'Contemporary', 'Sleek', 'Executive', 'Refined'];
const PLATFORMS = 'Zoom, Teams, and Google Meet';
const SEO_KEYWORDS = ['Zoom background', 'virtual background', 'video calls'];

const SEO_TEMPLATES = [
  (ctx) => `${ctx.adjective} ${ctx.category} Zoom Background for Professional Calls`,
  (ctx) => `Clean ${ctx.category} Virtual Background for Video Meetings`,
  (ctx) => `${ctx.style} Workspace ${ctx.category} Zoom Background`,
];

const CTR_TEMPLATES = [
  (ctx) => `Upgrade your Zoom setup with this ${ctx.category} background`,
  () => `Make your video calls instantly more professional`,
  () => `A clean workspace look for better virtual meetings`,
];

const CATEGORY_DISPLAY = {
  'art-galleries': 'Art Gallery',
  'bookshelves': 'Bookshelf',
  'bookshelves-bright': 'Bright Bookshelf',
  'bookshelves-dark': 'Dark Bookshelf',
  'wall-shelves': 'Wall Shelf',
  'wall-shelves-bright': 'Bright Wall Shelf',
  'wall-shelves-dark': 'Dark Wall Shelf',
  'office-spaces': 'Office',
  'home-offices': 'Home Office',
  'minimalist-offices': 'Minimalist Office',
  'executive-offices': 'Executive Office',
  'living-rooms': 'Living Room',
  'kitchens': 'Kitchen',
  'easter-backgrounds': 'Easter',
  'spring-backgrounds': 'Spring',
  'christmas-backgrounds': 'Christmas',
  'halloween-backgrounds': 'Halloween',
  'thanksgiving-backgrounds': 'Thanksgiving',
  'beach-backgrounds': 'Beach',
  'mountain-backgrounds': 'Mountain',
  'nature-backgrounds': 'Nature',
  'cafe-backgrounds': 'Cafe',
  'library-backgrounds': 'Library',
};

function titleCase(slug) {
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function displayCategory(category) {
  return CATEGORY_DISPLAY[category] || titleCase(category);
}

function hasKeyword(title) {
  const lc = title.toLowerCase();
  return SEO_KEYWORDS.some((k) => lc.includes(k.toLowerCase()));
}

function clampText(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trim();
}

function buildImageUrl(item) {
  return `https://assets.streambackdrops.com/webp/${item.folder}/${item.image_webp}`;
}

function buildLink(item) {
  return `https://streambackdrops.com/category/${item.category}`;
}

function buildDescription(item) {
  const category = displayCategory(item.category);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const picked = tags.slice(0, 4).filter(Boolean);
  const safeTags = picked.length >= 2 ? picked : [...picked, 'virtual background', 'remote work'].slice(0, 4);
  const keywords = safeTags.join(', ');
  let desc = `Professional ${category.toLowerCase()} virtual background for ${PLATFORMS}. Ideal for remote work and video meetings. Keywords: ${keywords}`;
  if (desc.length < 120) {
    desc += `. Download free or upgrade to HD for crisp, studio-quality calls.`;
  }
  if (desc.length > 200) desc = clampText(desc, 200);
  return desc;
}

function buildAlt(item, seoTitle) {
  if (item.alt && typeof item.alt === 'string' && item.alt.trim()) {
    return item.alt.trim();
  }
  const category = displayCategory(item.category);
  return clampText(`${seoTitle} — ${category} virtual background image`, 160);
}

function generateTitle(templates, ctx, idx) {
  const tmpl = templates[idx % templates.length];
  return tmpl(ctx);
}

function generateCandidates(item, idx) {
  const category = displayCategory(item.category);
  const adjective = ADJECTIVES[idx % ADJECTIVES.length];
  const style = STYLES[idx % STYLES.length];
  const ctx = { category, adjective, style };
  const seoIdx = idx % SEO_TEMPLATES.length;
  const ctrIdx = idx % CTR_TEMPLATES.length;
  return {
    seoIdx,
    ctrIdx,
    ctx,
    seoTitle: SEO_TEMPLATES[seoIdx](ctx),
    ctrTitle: CTR_TEMPLATES[ctrIdx](ctx),
  };
}

function ensureUniqueTitle(title, seen, item, idx, kind) {
  if (!seen.has(title)) {
    seen.add(title);
    return title;
  }
  for (let i = 1; i < ADJECTIVES.length; i++) {
    const adj = ADJECTIVES[(idx + i) % ADJECTIVES.length];
    const sty = STYLES[(idx + i) % STYLES.length];
    const ctx = { category: displayCategory(item.category), adjective: adj, style: sty };
    const templates = kind === 'seo' ? SEO_TEMPLATES : CTR_TEMPLATES;
    const candidate = templates[idx % templates.length](ctx);
    if (!seen.has(candidate)) {
      seen.add(candidate);
      return candidate;
    }
  }
  const match = (item.slug || '').match(/(\d+)/);
  const suffix = match ? ` #${match[1]}` : ` — ${item.slug}`;
  let final = clampText(title + suffix, 95);
  let n = 2;
  while (seen.has(final)) {
    final = clampText(`${title} v${n}`, 95);
    n++;
  }
  seen.add(final);
  return final;
}

function generatePin(item, idx, seenSeo, seenCtr) {
  const { seoTitle, ctrTitle } = generateCandidates(item, idx);
  const finalSeo = ensureUniqueTitle(seoTitle, seenSeo, item, idx, 'seo');
  const finalCtr = ensureUniqueTitle(ctrTitle, seenCtr, item, idx, 'ctr');
  if (!hasKeyword(finalSeo)) {
    throw new Error(`SEO title missing keyword for ${item.slug}: ${finalSeo}`);
  }
  return {
    slug: item.slug,
    category: item.category,
    tags: Array.isArray(item.tags) ? item.tags : [],
    seoTitle: finalSeo,
    ctrTitle: finalCtr,
    description: buildDescription(item),
    alt: buildAlt(item, finalSeo),
    imageUrl: buildImageUrl(item),
    link: buildLink(item),
  };
}

function generateAll(items) {
  const seenSeo = new Set();
  const seenCtr = new Set();
  return items.map((item, idx) => generatePin(item, idx, seenSeo, seenCtr));
}

module.exports = { generateAll, displayCategory };
