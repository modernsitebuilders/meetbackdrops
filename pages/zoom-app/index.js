import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';

const SDK_CAPABILITIES = ['setVirtualBackground'];
const PAGE = 24;
const SKELETON_COUNT = 12;

export default function ZoomApp() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const [appliedId, setAppliedId] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [runningInZoom, setRunningInZoom] = useState(false);
  const [granted, setGranted] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@zoom/appssdk');
        const zoomSdk = mod.default || mod;
        const configResult = await zoomSdk.config({
          version: '0.16.0',
          capabilities: SDK_CAPABILITIES,
        });
        console.log('[mb] zoomSdk.config result', configResult);
        if (cancelled) return;
        setSdk(zoomSdk);
        setGranted(configResult?.runningContext ? configResult : { runningContext: 'unknown', ...configResult });
        setRunningInZoom(true);
      } catch (e) {
        console.error('[mb] zoomSdk.config failed', e);
        if (cancelled) return;
        setRunningInZoom(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchBackgrounds = useCallback(async (category) => {
    setStatus('loading');
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: PAGE });
      if (category) qs.set('category', category);
      const res = await fetch(`/api/zoom/backgrounds?${qs}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
      setHasMore(data.items.length < data.total);
      if (data.categories?.length && categories.length === 0) {
        setCategories(data.categories);
      }
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, [categories.length]);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ limit: PAGE, offset: items.length });
      if (activeCategory) qs.set('category', activeCategory);
      const res = await fetch(`/api/zoom/backgrounds?${qs}`);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      const next = [...items, ...data.items];
      setItems(next);
      setHasMore(next.length < data.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [items, activeCategory]);

  // Deep-link support: /zoom-app?category=<slug> opens the picker pre-filtered,
  // and &applied=<slug> marks a background as the active one. Lets us share a
  // direct link to a category or a specific background. Falls back to the full
  // round-robin view when no params are present.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    const applied = params.get('applied');
    if (applied) setAppliedId(applied);
    if (cat) setActiveCategory(cat);
    fetchBackgrounds(cat || null);
  }, []);

  const handleCategoryClick = useCallback((slug) => {
    const next = slug === activeCategory ? null : slug;
    setActiveCategory(next);
    fetchBackgrounds(next);
  }, [activeCategory, fetchBackgrounds]);

  const applyBackground = useCallback(
    async (item) => {
      if (!sdk) {
        setError('Open this from inside Zoom to apply a background.');
        return;
      }
      setApplying(item.id);
      setError(null);
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timed out after 20s — SDK never resolved')), 20000)
        );
        const call = sdk.setVirtualBackground({ fileUrl: item.fileUrl });
        await Promise.race([call, timeout]);
        setAppliedId(item.id);
        setApplying(null);

        // Track a successful apply as a usage signal — the in-Zoom equivalent
        // of a download. Counts toward popularity (zoom_apply is in
        // DOWNLOAD_EVENTS). item.id is the manifest slug, so the logged
        // filename resolves in scoring. Fire-and-forget: never block the UI.
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'zoom_apply',
            filename: `MeetBackdrops-${item.id}.png`,
            category: item.category,
          }),
        }).catch(() => {});
      } catch (e) {
        console.error('[mb] setVirtualBackground FAIL', { fileUrl: item.fileUrl, error: e });
        const detail = e?.message || e?.reason || JSON.stringify(e);
        setError(`Apply failed: ${detail}`);
        setApplying(null);
      }
    },
    [sdk]
  );

  return (
    <>
      <Head>
        <title>MeetBackdrops for Zoom</title>
        <meta name="robots" content="noindex" />
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </Head>
      <main style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            MeetBackdrops <span style={styles.gold}>Studio</span>
          </div>
          <div style={styles.statusPill}>
            {runningInZoom
              ? `Connected${granted?.capabilities ? ` · ${(granted.capabilities || []).length} caps` : ''}`
              : 'Preview mode'}
          </div>
        </header>

        {categories.length > 0 && (
          <div style={styles.filterBar}>
            <button
              type="button"
              style={{ ...styles.pill, ...(activeCategory === null ? styles.pillActive : {}) }}
              onClick={() => handleCategoryClick(null)}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                style={{ ...styles.pill, ...(activeCategory === cat.slug ? styles.pillActive : {}) }}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        {status === 'loading' && (
          <div style={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} style={styles.skeleton}>
                <div style={styles.skeletonThumb} />
                <div style={styles.skeletonLine} />
                <div style={{ ...styles.skeletonLine, width: '50%', marginBottom: 10 }} />
              </div>
            ))}
          </div>
        )}

        {status === 'ready' && (
          <>
            <div style={styles.grid}>
              {items.map((item) => {
                const isApplied = appliedId === item.id;
                const isApplying = applying === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    style={{
                      ...styles.card,
                      ...(isApplied ? styles.cardApplied : {}),
                    }}
                    onClick={() => applyBackground(item)}
                    disabled={isApplying}
                  >
                    <div style={styles.thumbWrap}>
                      <img src={item.thumbUrl} alt={item.title} style={styles.thumb} loading="lazy" />
                      {isApplied && (
                        <div style={styles.appliedOverlay}>
                          <span style={styles.checkmark}>✓</span>
                          <span style={styles.appliedLabel}>Applied</span>
                        </div>
                      )}
                      {item.isHd && !isApplied && (
                        <a
                          href="/hd"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.hdBadge}
                          onClick={(e) => e.stopPropagation()}
                        >
                          HD Edition →
                        </a>
                      )}
                    </div>
                    <span style={styles.cardTitle}>{item.title}</span>
                    <span style={{ ...styles.cta, ...(isApplied ? styles.ctaApplied : {}) }}>
                      {isApplying ? 'Applying…' : isApplied ? 'Active background' : 'Apply to Zoom'}
                    </span>
                  </button>
                );
              })}
            </div>
            {hasMore && (
              <div style={styles.loadMoreRow}>
                <button
                  type="button"
                  style={styles.loadMoreBtn}
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Loading…' : `Load more (${items.length} of ${total})`}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F5F5F5',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    color: '#111827',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brand: { fontSize: 18, fontWeight: 700, letterSpacing: -0.2 },
  gold: { color: '#E0A82E' },
  statusPill: {
    fontSize: 12,
    padding: '4px 10px',
    borderRadius: 999,
    background: '#fff',
    border: '1px solid #e5e7eb',
    color: '#6b7280',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  pill: {
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 999,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  },
  pillActive: {
    background: '#111827',
    borderColor: '#111827',
    color: '#fff',
  },
  muted: { color: '#6b7280', fontSize: 14 },
  error: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 12,
    fontSize: 13,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  },
  skeleton: {
    background: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
  },
  skeletonThumb: {
    width: '100%',
    aspectRatio: '16/9',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  },
  skeletonLine: {
    height: 10,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    margin: '8px 10px 4px',
    width: '75%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    overflow: 'hidden',
    cursor: 'pointer',
    padding: 0,
    textAlign: 'left',
    transition: 'border-color 0.15s',
  },
  cardApplied: {
    border: '2px solid #16a34a',
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
  appliedOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(22, 163, 74, 0.55)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  checkmark: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 700,
    lineHeight: 1,
  },
  appliedLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  hdBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 7px',
    borderRadius: 4,
    background: '#E0A82E',
    color: '#111827',
    textDecoration: 'none',
    lineHeight: 1.4,
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 10px 2px',
    color: '#111827',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cta: {
    fontSize: 11,
    padding: '4px 10px 10px',
    color: '#E0A82E',
    fontWeight: 600,
  },
  ctaApplied: {
    color: '#16a34a',
  },
  loadMoreRow: {
    marginTop: 16,
    display: 'flex',
    justifyContent: 'center',
  },
  loadMoreBtn: {
    fontSize: 13,
    fontWeight: 600,
    padding: '10px 24px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    cursor: 'pointer',
  },
};
