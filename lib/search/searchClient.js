// lib/search/searchClient.js
//
// Pure, client-side search over the prebuilt index (public/data/search-index.json).
// No network beyond the one-time index fetch; no dependency. All functions are
// deterministic given the same index + query + filters.
//
// Ranking uses the EXISTING signals already in the graph — title, category,
// themes, personas, tags, popularity — weighted so intent wins over incidental
// tag hits ("office" → office-category/theme images before a stray "office" tag).

// A few high-value synonyms → extra tokens to also match/boost. Kept tiny and
// vocabulary-aligned on purpose (no sprawling thesaurus).
const SYNONYMS = {
  luxury: ['executive', 'luxurious', 'elegant', 'refined'],
  luxurious: ['executive'],
  plain: ['neutral', 'minimalist'],
  warm: ['cozy'],
  simple: ['minimalist', 'neutral'],
  clean: ['minimalist'],
  books: ['bookshelf', 'library'],
  boardroom: ['conference-room', 'executive'],
  wfh: ['home-office'],
};

const STOP = new Set(['the', 'a', 'an', 'for', 'and', 'with', 'my', 'to', 'of', 'in', 'on', 'background', 'backgrounds']);

function tokenize(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t));
}

function expand(tokens) {
  const out = new Set(tokens);
  for (const t of tokens) for (const syn of (SYNONYMS[t] || [])) out.add(syn);
  return [...out];
}

// One-time enrichment after the index is fetched: attach lowercased, pre-split
// haystacks so per-keystroke search is cheap. Mutates a shallow copy, not the
// raw records.
export function prepareIndex(raw) {
  if (!raw || !Array.isArray(raw.images)) return { images: [], vocab: emptyVocab(), maps: emptyMaps() };

  const themeLabel = new Map((raw.vocab?.themes || []).map((t) => [t.slug, t.label]));
  const personaLabel = new Map((raw.vocab?.personas || []).map((p) => [p.slug, p.label]));
  const categoryLabel = new Map((raw.vocab?.categories || []).map((c) => [c.slug, c.label]));
  const useCases = raw.vocab?.useCases || {};

  const images = raw.images.map((r) => {
    const themeText = (r.th || []).map((s) => `${s} ${themeLabel.get(s) || ''}`).join(' ');
    const personaText = (r.pe || []).map((s) => `${s} ${personaLabel.get(s) || ''}`).join(' ');
    const catText = `${r.c} ${categoryLabel.get(r.c) || ''}`;
    const ucText = (r.th || []).flatMap((s) => useCases[s] || []).join(' ');
    return {
      ...r,
      _title: (r.t || '').toLowerCase(),
      _tags: (r.g || []).map((x) => x.toLowerCase()),
      _cat: catText.toLowerCase(),
      _themes: themeText.toLowerCase(),
      _personas: personaText.toLowerCase(),
      _uc: ucText.toLowerCase(),
    };
  });

  return {
    images,
    vocab: raw.vocab || emptyVocab(),
    maps: { themeLabel, personaLabel, categoryLabel },
  };
}

function emptyVocab() { return { themes: [], personas: [], categories: [], useCases: {} }; }
function emptyMaps() { return { themeLabel: new Map(), personaLabel: new Map(), categoryLabel: new Map() }; }

// Relevance of one enriched record to a token set. Returns { score, hits }.
function relevance(rec, phrase, tokens) {
  let score = 0;
  let hits = 0;

  if (phrase && rec._title.includes(phrase)) score += 120;

  const titleWords = new Set(rec._title.split(/\s+/));

  for (const tok of tokens) {
    let matched = false;

    if (titleWords.has(tok)) { score += 25; matched = true; }
    else if (rec._title.includes(tok)) { score += 10; matched = true; }

    if (rec._themes.includes(tok)) { score += 35; matched = true; }
    if (rec._cat.includes(tok)) { score += 28; matched = true; }
    if (rec._personas.includes(tok)) { score += 20; matched = true; }

    if (rec._tags.includes(tok)) { score += 15; matched = true; }
    else if (rec._tags.some((g) => g.includes(tok))) { score += 6; matched = true; }

    if (rec._uc.includes(tok)) { score += 6; matched = true; }

    if (matched) hits += 1;
  }

  // Popularity tiebreaker/booster (capped so it never overrides intent).
  if (score > 0) score += Math.min(rec.sc || 0, 100) * 0.15;

  return { score, hits };
}

// Apply theme/category/persona filters. Within a group = OR; across groups = AND.
// (Platform is universal — every image works on every platform — so it is not an
// image filter; the UI surfaces platform links instead.)
function passesFilters(rec, filters) {
  const { themes = [], categories = [], personas = [] } = filters || {};
  if (themes.length && !themes.some((t) => (rec.th || []).includes(t))) return false;
  if (categories.length && !categories.includes(rec.c)) return false;
  if (personas.length && !personas.some((p) => (rec.pe || []).includes(p))) return false;
  return true;
}

/**
 * Main entry. Returns ranked records (raw shape + _score), capped.
 * - With a query: AND across tokens (every token must hit something); if that
 *   yields nothing, relax to OR so the user still gets ranked suggestions.
 * - Without a query: filters-only browse, ordered by popularity.
 */
export function search(prepared, query, filters = {}, limit = 120) {
  const images = prepared?.images || [];
  const tokens = expand(tokenize(query));
  const phrase = String(query || '').toLowerCase().trim();

  const candidates = images.filter((rec) => passesFilters(rec, filters));

  if (tokens.length === 0) {
    return candidates
      .slice()
      .sort((a, b) => (b.sc || 0) - (a.sc || 0) || a.t.localeCompare(b.t))
      .slice(0, limit);
  }

  const scored = [];
  for (const rec of candidates) {
    const { score, hits } = relevance(rec, phrase, tokens);
    if (hits > 0) scored.push({ rec, score, hits });
  }

  const full = scored.filter((x) => x.hits === tokens.length);
  const pool = full.length > 0 ? full : scored; // AND, else relaxed OR

  pool.sort((a, b) => b.score - a.score || (b.rec.sc || 0) - (a.rec.sc || 0) || a.rec.t.localeCompare(b.rec.t));
  return pool.slice(0, limit).map((x) => ({ ...x.rec, _score: Math.round(x.score) }));
}

// Autocomplete: match vocabulary terms (theme / category / persona) against the
// current input, each linking into the existing discovery graph. Encourages
// exploration and connects search back to hub pages.
export function suggest(vocab, query, limit = 6) {
  const q = String(query || '').toLowerCase().trim();
  if (q.length < 2) return [];
  const out = [];
  const push = (type, slug, label, href) => out.push({ type, slug, label, href });

  for (const t of (vocab.themes || [])) {
    if (t.label.toLowerCase().includes(q) || t.slug.includes(q)) push('theme', t.slug, t.label, `/backgrounds/${t.slug}`);
  }
  for (const c of (vocab.categories || [])) {
    if (c.label.toLowerCase().includes(q) || c.slug.includes(q)) push('category', c.slug, c.label, `/category/${c.slug}`);
  }
  for (const p of (vocab.personas || [])) {
    if (p.label.toLowerCase().includes(q) || p.slug.includes(q)) push('persona', p.slug, p.label, `/collections/${p.slug}`);
  }
  return out.slice(0, limit);
}

// Grid shape for ImageGrid: it sorts by the `scores` map, so we hand it the
// relevance order via that map (highest first). Keeps result order == rank.
export function toGrid(results) {
  const images = results.map((r) => ({ filename: r.w, title: r.t, folder: r.f, category: r.c }));
  const scores = {};
  const n = results.length;
  results.forEach((r, i) => { scores[r.w] = n - i; }); // descending rank as score
  const metadata = {};
  results.forEach((r) => { metadata[r.w] = { alt: r.t, title: r.t }; });
  return { images, scores, metadata };
}
