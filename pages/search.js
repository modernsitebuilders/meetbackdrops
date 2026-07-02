// pages/search.js
//
// On-site search — a USER discovery tool, not an SEO surface. The page is
// noindex + self-canonical (no ?q in canonical) and robots.txt disallows
// /search, so query URLs never create a crawl/index explosion.
//
// Architecture: the prebuilt static index (public/data/search-index.json) is
// fetched ONCE on mount (client-side). All ranking/filtering is pure and local
// (lib/search/searchClient.js). Results reuse ImageGrid, so every hit links back
// into the discovery graph (image → category page) and the existing download
// flow works unchanged. Nothing here touches image pages or other routes.

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import ImageGrid from '../components/ImageGrid';
import ImagePreviewModal from '../components/ImagePreviewModal';
import ReviewModal from '../components/ReviewModal';
import RateLimitModal from '../components/RateLimitModal';
import BackToTop from '../components/BackToTop';
import cloudinaryUrls from '../cloudinary-urls.json';
import { useImageDownload } from '../lib/useImageDownload';
import { prepareIndex, search, suggest, toGrid } from '../lib/search/searchClient';
import { trackSearchQuery, trackSearchClick, trackSearchFilter } from '../lib/search/trackSearch';

const chip = (active) => ({
  padding: '0.4rem 0.85rem', borderRadius: '999px', cursor: 'pointer',
  border: `1px solid ${active ? '#9a6a3a' : '#e5e7eb'}`,
  background: active ? '#9a6a3a' : '#fafafa',
  color: active ? '#fff' : '#374151',
  fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap',
  fontFamily: 'inherit',
});

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function SearchPage() {
  const router = useRouter();
  const [prepared, setPrepared] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ themes: [], categories: [], personas: [] });
  const [showSuggest, setShowSuggest] = useState(false);
  const inputRef = useRef(null);

  const {
    handleDownload, showReviewModal, setShowReviewModal,
    showRateLimitModal, setShowRateLimitModal, rateLimitError,
    downloadCount, downloadingImage, emailBonusUsed, handleEmailBonus,
  } = useImageDownload(cloudinaryUrls);
  const [previewImage, setPreviewImage] = useState(null);

  // Seed the query from ?q= once the router is ready (shareable/deep-linkable).
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof router.query.q === 'string') setQuery(router.query.q);
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch + prepare the index exactly once.
  useEffect(() => {
    let alive = true;
    fetch('/data/search-index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((raw) => { if (alive) setPrepared(prepareIndex(raw)); })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, []);

  // Keep ?q in the URL in sync without spamming history.
  useEffect(() => {
    if (!router.isReady) return;
    const next = query.trim();
    const cur = typeof router.query.q === 'string' ? router.query.q : '';
    if (next !== cur) {
      router.replace(next ? `/search?q=${encodeURIComponent(next)}` : '/search', undefined, { shallow: true });
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(
    () => (prepared ? search(prepared, query, filters, 120) : []),
    [prepared, query, filters],
  );
  const suggestions = useMemo(
    () => (prepared && showSuggest ? suggest(prepared.vocab, query) : []),
    [prepared, query, showSuggest],
  );
  const grid = useMemo(() => toGrid(results), [results]);

  // Measurement: fire one event per SETTLED query (debounced, deduped). Zero-
  // result queries are tracked distinctly — they drive the content pipeline.
  const lastTrackedQuery = useRef('');
  useEffect(() => {
    if (!prepared) return;
    const q = query.trim();
    if (q.length < 2) return;
    const id = setTimeout(() => {
      if (lastTrackedQuery.current === q) return;
      lastTrackedQuery.current = q;
      trackSearchQuery(q, results.length);
    }, 900);
    return () => clearTimeout(id);
  }, [query, prepared, results.length]);

  const vocab = prepared?.vocab || { themes: [], categories: [], personas: [] };

  // Fire filter events on ADD only (keeps volume low); no side effects inside
  // the state updater.
  const toggleFilter = (group, slug) => {
    if (!filters[group].includes(slug)) trackSearchFilter(group, slug);
    setFilters((f) => ({ ...f, [group]: toggle(f[group], slug) }));
  };

  // Wrap result engagement to capture query → clicked slug + rank position.
  const onResultClick = (image) => {
    const slug = String(image?.filename || '').replace(/\.(webp|png|jpe?g)$/i, '');
    const pos = results.findIndex((r) => r.w === image?.filename);
    trackSearchClick(query, slug, pos >= 0 ? pos + 1 : 0);
    setPreviewImage(image);
  };
  const hasFilters = filters.themes.length || filters.categories.length || filters.personas.length;
  const clearAll = () => { setQuery(''); setFilters({ themes: [], categories: [], personas: [] }); };

  return (
    <Layout
      title="Search Virtual Backgrounds | MeetBackdrops"
      description="Search MeetBackdrops' studio-designed virtual backgrounds by style, room, profession, and keyword for Zoom, Teams, Google Meet, and Webex."
      canonical="https://meetbackdrops.com/search"
      noIndex
    >
      <div style={{ padding: '2.5rem 2rem 4rem', background: '#fff', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', maxWidth: '760px' }}>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: 'clamp(1.9rem, 4vw, 2.75rem)', fontWeight: 600, letterSpacing: '-0.02em',
              color: '#111827', margin: '0 0 1.25rem', lineHeight: 1.1,
            }}>
              Search the library
            </h1>

            {/* Search input + autocomplete */}
            <div style={{ position: 'relative' }}>
              <span aria-hidden="true" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.1rem' }}>⌕</span>
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder="Try “modern office”, “bookshelf”, “teacher”, “dark”…"
                aria-label="Search backgrounds"
                autoComplete="off"
                style={{
                  width: '100%', padding: '0.9rem 1rem 0.9rem 2.6rem',
                  borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff',
                  fontSize: '1.05rem', fontFamily: 'inherit', color: '#111827', outline: 'none',
                }}
              />
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 0.4rem)', left: 0, right: 0, zIndex: 20,
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
                }}>
                  {suggestions.map((s) => (
                    <Link prefetch={false} key={`${s.type}-${s.slug}`} href={s.href} style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem',
                      textDecoration: 'none', color: '#374151', fontSize: '0.92rem',
                    }}>
                      <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9a6a3a', fontWeight: 700, minWidth: '64px' }}>{s.type}</span>
                      {s.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Filters — reuse existing vocabularies (theme / category / profession) */}
          <div style={{ marginBottom: '1.75rem', display: 'grid', gap: '0.9rem' }}>
            <FilterRow label="Style" items={vocab.themes} active={filters.themes}
              onToggle={(slug) => toggleFilter('themes', slug)} />
            <FilterRow label="Room" items={vocab.categories} active={filters.categories}
              onToggle={(slug) => toggleFilter('categories', slug)} />
            <FilterRow label="Profession" items={vocab.personas} active={filters.personas}
              onToggle={(slug) => toggleFilter('personas', slug)} />
          </div>

          {/* Status line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
              {loadError ? 'Search is briefly unavailable — please refresh.'
                : !prepared ? 'Loading the library…'
                : `${results.length}${results.length === 120 ? '+' : ''} background${results.length === 1 ? '' : 's'}${query.trim() ? ` for “${query.trim()}”` : ''}`}
            </p>
            {(query.trim() || hasFilters) && (
              <button onClick={clearAll} style={{ ...chip(false), cursor: 'pointer' }}>Clear all ✕</button>
            )}
          </div>

          {/* Results */}
          {prepared && results.length > 0 && (
            <ImageGrid
              images={grid.images}
              scores={grid.scores}
              metadata={grid.metadata}
              slug="search"
              onImageClick={onResultClick}
              onDownload={(image) => handleDownload(image, image.category || 'search')}
              cloudinaryUrls={cloudinaryUrls}
              downloadingImage={downloadingImage}
            />
          )}

          {/* Empty state — never a dead end: route back into the graph */}
          {prepared && results.length === 0 && (
            <div style={{ padding: '2rem 0 3rem', maxWidth: '760px' }}>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 0.75rem' }}>
                No matches{query.trim() ? ` for “${query.trim()}”` : ''}
              </h2>
              <p style={{ color: '#6b7280', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
                Try a broader term or clear your filters. Or jump into a popular style:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {vocab.themes.slice(0, 8).map((t) => (
                  <Link prefetch={false} key={t.slug} href={`/backgrounds/${t.slug}`} style={{ ...chip(false), textDecoration: 'none' }}>
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <ImagePreviewModal
          image={previewImage}
          slug={previewImage.category || 'search'}
          onClose={() => setPreviewImage(null)}
          onDownload={(image, eventType) => handleDownload(image, image.category || 'search', eventType)}
          cloudinaryUrls={cloudinaryUrls}
        />
      )}
      {showReviewModal && <ReviewModal onClose={() => setShowReviewModal(false)} downloadCount={downloadCount} />}
      {showRateLimitModal && (
        <RateLimitModal onClose={() => setShowRateLimitModal(false)} errorMessage={rateLimitError} onEmailBonus={handleEmailBonus} emailBonusUsed={emailBonusUsed} />
      )}
      <BackToTop hide={!!previewImage} />
    </Layout>
  );
}

function FilterRow({ label, items, active, onToggle }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <span style={{ flexShrink: 0, width: '78px', paddingTop: '0.5rem', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a6a3a', fontWeight: 700 }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {items.map((it) => (
          <button key={it.slug} onClick={() => onToggle(it.slug)} style={chip(active.includes(it.slug))}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
