const ADJECTIVES = ['Professional', 'Elegant', 'Modern', 'Clean', 'Stylish'];
const STYLES = ['Minimalist', 'Contemporary', 'Sleek', 'Executive', 'Refined'];
const PLATFORMS = 'Zoom, Teams, and Google Meet';
const SEO_KEYWORDS = [
  'zoom',
  'virtual',
  'video',
  'remote',
  'background',
  'work',
  'meet',
  'calls',
  'professional',
];

const CATEGORY_PHRASES = {
  'Office Spaces': ['Office', 'Workspace', 'Home Office', 'Professional Office'],
  'Bookshelves': ['Bookshelf', 'Library Wall', 'Reading Room', 'Book Nook'],
  'Wall Shelves': ['Shelf Wall', 'Decor Shelves', 'Modern Shelving', 'Styled Shelves'],
  'Libraries': ['Library', 'Study Room', 'Classic Library', 'Reading Space'],
  'Home Office': ['Home Office', 'Workspace', 'Remote Workspace', 'Home Studio'],
  'Art Galleries': ['Art Gallery', 'Gallery Space', 'Exhibition Space', 'Curated Gallery'],
  'Coffee Shops': ['Coffee Shop', 'Cafe', 'Coffee House', 'Cozy Cafe'],
  'Conference Rooms': ['Conference Room', 'Meeting Room', 'Boardroom', 'Executive Suite'],
  'Living Rooms': ['Living Room', 'Lounge', 'Sitting Room', 'Cozy Living Space'],
  'Kitchens': ['Kitchen', 'Modern Kitchen', 'Chef Kitchen', 'Culinary Space'],
  'Gardens Patios': ['Garden', 'Patio', 'Outdoor Retreat', 'Garden Patio'],
  'Urban Lofts': ['Urban Loft', 'City Loft', 'Industrial Loft', 'Modern Loft'],
  'Historic Spaces': ['Historic Space', 'Heritage Room', 'Classic Interior', 'Period Setting'],
  'Nature Landscapes': ['Nature Scene', 'Outdoor Landscape', 'Scenic View', 'Natural Backdrop'],
  'Bokeh Backgrounds': ['Bokeh Scene', 'Soft Focus Backdrop', 'Blurred Lights', 'Dreamy Bokeh'],
  'Christmas Backgrounds': ['Christmas Scene', 'Holiday Setting', 'Festive Decor', 'Cozy Christmas'],
  'Easter Backgrounds': ['Easter Scene', 'Spring Setting', 'Pastel Decor', 'Easter Display'],
  'Halloween Backgrounds': ['Halloween Scene', 'Spooky Setting', 'Autumn Decor', 'Moody Halloween'],
  'Valentines Backgrounds': ['Valentine Scene', 'Romantic Setting', 'Love Theme', 'Pink Decor'],
  'Spring Backgrounds': ['Spring Scene', 'Floral Setting', 'Blossom Decor', 'Fresh Spring'],
};

const DESCRIPTORS = [
  'Clean',
  'Minimal',
  'Modern',
  'Professional',
  'Bright',
  'Sleek',
  'Cozy',
  'Elegant',
];

const CONTEXTS = [
  'for Zoom Meetings',
  'for Remote Work',
  'for Video Calls',
  'for Professional Calls',
  'for Zoom, Teams & Google Meet',
  'for Work From Home Setup',
];

const CATEGORY_KEY_MAP = {
  'office-spaces': 'Office Spaces',
  'home-office': 'Home Office',
  'home-offices': 'Home Office',
  'minimalist-offices': 'Office Spaces',
  'executive-offices': 'Office Spaces',
  'bookshelves': 'Bookshelves',
  'bookshelves-bright': 'Bookshelves',
  'bookshelves-dark': 'Bookshelves',
  'wall-shelves': 'Wall Shelves',
  'wall-shelves-bright': 'Wall Shelves',
  'wall-shelves-dark': 'Wall Shelves',
  'libraries': 'Libraries',
  'library-backgrounds': 'Libraries',
  'art-galleries': 'Art Galleries',
  'coffee-shops': 'Coffee Shops',
  'living-rooms': 'Living Rooms',
  'kitchens': 'Kitchens',
  'gardens-patios': 'Gardens Patios',
  'urban-lofts': 'Urban Lofts',
  'historic-spaces': 'Historic Spaces',
  'nature-landscapes': 'Nature Landscapes',
  'bokeh-backgrounds': 'Bokeh Backgrounds',
  'christmas-backgrounds': 'Christmas Backgrounds',
  'easter-backgrounds': 'Easter Backgrounds',
  'halloween-backgrounds': 'Halloween Backgrounds',
  'valentines-backgrounds': 'Valentines Backgrounds',
  'spring-backgrounds': 'Spring Backgrounds',
};

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

function getCategory(item) {
  if (!item || !item.category) return '';
  return CATEGORY_KEY_MAP[item.category] || displayCategory(item.category);
}

function cleanBase(file) {
  if (!file) return '';
  return String(file)
    .replace('.webp', '')
    .replace(/-\d+$/, '')
    .replace(/-/g, ' ')
    .trim();
}

function collapseSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function titleCasePhrase(phrase) {
  return phrase
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

const GENERIC_STOPWORDS = new Set([
  'background',
  'backgrounds',
  'backdrop',
  'backdrops',
  'bright',
  'dark',
  'the',
  'a',
  'an',
  'and',
  'with',
]);

function wordVariants(word) {
  const lc = word.toLowerCase();
  const variants = new Set([lc]);
  if (lc.endsWith('s')) variants.add(lc.slice(0, -1));
  else variants.add(lc + 's');
  if (lc.endsWith('es')) variants.add(lc.slice(0, -2));
  return variants;
}

function buildStopSet(phrases) {
  const stop = new Set(GENERIC_STOPWORDS);
  for (const phrase of phrases) {
    if (!phrase) continue;
    for (const w of String(phrase).toLowerCase().split(/\s+/)) {
      if (!w) continue;
      for (const v of wordVariants(w)) stop.add(v);
    }
  }
  return stop;
}

function extractBasePhrase(base, stopSet) {
  const words = base
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w && !stopSet.has(w.toLowerCase()));
  return titleCasePhrase(words.slice(0, 2).join(' '));
}

function wordOverlap(a, b) {
  if (!a || !b) return false;
  const aw = new Set(String(a).toLowerCase().split(/\s+/).filter(Boolean));
  for (const w of String(b).toLowerCase().split(/\s+/)) {
    if (!w) continue;
    for (const v of wordVariants(w)) {
      if (aw.has(v)) return true;
    }
  }
  return false;
}

function pickNonOverlappingDescriptor(seed, noun) {
  for (let i = 0; i < DESCRIPTORS.length; i++) {
    const d = DESCRIPTORS[(seed + i) % DESCRIPTORS.length];
    if (!wordOverlap(d, noun)) return d;
  }
  return DESCRIPTORS[seed % DESCRIPTORS.length];
}

function hash32(str) {
  let h = 2166136261;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function seedFor(item, index, salt) {
  const key = `${salt}::${(item && item.slug) || ''}|${index}`;
  return hash32(key);
}

function makeTitle(item, index) {
  const category = getCategory(item);
  const base = cleanBase(item && item.image_webp);
  const catOptions = CATEGORY_PHRASES[category] || [category];

  const sPattern = seedFor(item, index, 'p');
  const sDescriptor = seedFor(item, index, 'd');
  const sContext = seedFor(item, index, 'c');
  const sNoun = seedFor(item, index, 'n');

  const context = CONTEXTS[sContext % CONTEXTS.length];
  const noun = catOptions[sNoun % catOptions.length];
  const descriptor = pickNonOverlappingDescriptor(sDescriptor, noun);

  const stopSet = buildStopSet([category, noun, ...catOptions]);
  const basePhrase = extractBasePhrase(base, stopSet);
  const safeBase = basePhrase && !wordOverlap(basePhrase, noun) ? basePhrase : '';

  const patterns = [
    `${descriptor} ${noun} Background ${context}`,
    safeBase
      ? `${descriptor} ${safeBase} ${noun} ${context}`
      : `${descriptor} ${noun} ${context}`,
    `${noun} Background ${context}`,
    `${descriptor} ${noun} Setup ${context}`,
    `${descriptor} ${noun} for Video Calls`,
    safeBase
      ? `${safeBase} ${noun} Background for Work`
      : `${descriptor} ${noun} Background for Work`,
  ];

  return collapseSpaces(patterns[sPattern % patterns.length]);
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
  return `https://meetbackdrops.com/category/${item.category}`;
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

function generateCandidates(item, idx) {
  const category = displayCategory(item.category);
  const adjective = ADJECTIVES[idx % ADJECTIVES.length];
  const style = STYLES[idx % STYLES.length];
  const ctx = { category, adjective, style };
  const ctrIdx = idx % CTR_TEMPLATES.length;
  return {
    ctrIdx,
    ctx,
    seoTitle: makeTitle(item, idx),
    ctrTitle: CTR_TEMPLATES[ctrIdx](ctx),
  };
}

function ensureUniqueSeoTitle(title, seen, item, idx) {
  if (!seen.has(title)) {
    seen.add(title);
    return title;
  }
  for (let i = 1; i < 200; i++) {
    const candidate = makeTitle(item, idx + i * 7);
    if (!seen.has(candidate)) {
      seen.add(candidate);
      return candidate;
    }
  }
  seen.add(title);
  return title;
}

function ensureUniqueCtrTitle(title, seen, item, idx) {
  if (!seen.has(title)) {
    seen.add(title);
    return title;
  }
  for (let i = 1; i < ADJECTIVES.length; i++) {
    const adj = ADJECTIVES[(idx + i) % ADJECTIVES.length];
    const sty = STYLES[(idx + i) % STYLES.length];
    const ctx = { category: displayCategory(item.category), adjective: adj, style: sty };
    const candidate = CTR_TEMPLATES[idx % CTR_TEMPLATES.length](ctx);
    if (!seen.has(candidate)) {
      seen.add(candidate);
      return candidate;
    }
  }
  let final = title;
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
  const finalSeo = ensureUniqueSeoTitle(seoTitle, seenSeo, item, idx);
  const finalCtr = ensureUniqueCtrTitle(ctrTitle, seenCtr, item, idx);
  if (!hasKeyword(finalSeo)) {
    throw new Error(`SEO title missing keyword for ${item.slug}: ${finalSeo}`);
  }
  return {
    slug: item.slug,
    category: item.category,
    folder: item.folder,
    image_webp: item.image_webp,
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

const OPENERS = [
  'A clean',
  'A balanced',
  'A subtle',
  'A well-composed',
  'A refined',
];

const DETAILS = [
  'The composition keeps the frame uncluttered while adding depth.',
  'Balanced lighting helps maintain a polished on-screen presence.',
  'The layout adds depth without distracting from the subject.',
  'Clean lines and spacing create a focused visual environment.',
  'The scene feels natural and easy to integrate into calls.',
];

const USE_CASES = [
  'Works well for video calls and remote meetings.',
  'Fits naturally into Zoom calls and virtual setups.',
  'Useful for interviews and professional conversations.',
  'Helps maintain a consistent and distraction-free presence.',
  'Supports a clean and reliable on-camera appearance.',
];

const CTA = [
  'Easy to use as part of a consistent setup.',
  'A simple way to improve your on-screen environment.',
  'Works across most setups without adjustment.',
  'A reliable choice for everyday use.',
  'Helps create a more intentional presentation.',
];

const CATEGORY_OFFSETS = {
  'office-spaces': 1,
  'coffee-shops': 2,
  'wall-shelves-bright': 3,
  'wall-shelves-dark': 3,
  'nature-landscapes': 4,
};

function getCategoryOffset(category) {
  return CATEGORY_OFFSETS[category] || 0;
}

function pickTag(tags, index) {
  if (!Array.isArray(tags) || tags.length === 0) return 'clean';
  return tags[index % tags.length];
}

function generateDescription(item) {
  const index = typeof item.index === 'number' ? item.index : 0;
  const offset = getCategoryOffset(item.category);
  const opener = OPENERS[(index + offset) % 5];
  const tag = pickTag(item.tags, index);
  const detail = DETAILS[index % 5];
  const use = USE_CASES[(index >> 2) % 5];
  const cta = CTA[index % 5];
  return `${opener} ${tag} setting that feels natural on camera. ${detail} ${use} ${cta}`;
}

function generateDescriptions(items) {
  return items.map((item) => generateDescription(item));
}

module.exports = {
  generateAll,
  displayCategory,
  makeTitle,
  cleanBase,
  generateDescription,
  generateDescriptions,
};
