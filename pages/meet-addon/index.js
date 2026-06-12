import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';

// GCP project NUMBER (not the project ID) backing the Meet add-on deployment.
// Visible in the deployment resource name: projects/151425915185/deployments/...
// Not a secret — the Meet SDK only uses it to bind the side-panel session.
const CLOUD_PROJECT_NUMBER = '151425915185';
const PAGE = 24;
const SKELETON_COUNT = 12;

export default function MeetAddon() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [status, setStatus] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [downloadedIds, setDownloadedIds] = useState(() => new Set());
  const [lastDownloaded, setLastDownloaded] = useState(null);
  const [runningInMeet, setRunningInMeet] = useState(false);

  // Register the side-panel session so Meet treats this iframe as a valid
  // add-on. Unlike Zoom's SDK there is NO API to set a participant's camera
  // background — the panel is browse + download, and users apply the image
  // through Meet's own "Apply visual effects". createAddonSession throws when
  // the page is opened outside Meet, which is our "preview mode" signal.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { meet } = await import('@googleworkspace/meet-addons/meet.addons');
        const session = await meet.addon.createAddonSession({
          cloudProjectNumber: CLOUD_PROJECT_NUMBER,
        });
        await session.createSidePanelClient();
        if (cancelled) return;
        setRunningInMeet(true);
        console.log('[mb] Meet add-on session established');
      } catch (e) {
        console.warn('[mb] Meet SDK init skipped (preview mode):', e?.message || e);
        if (cancelled) return;
        setRunningInMeet(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Shared catalog endpoint (originally built for the Zoom app; the payload is
  // generic — items + categories + same-origin PNG proxy). Reused here to avoid
  // duplicating the manifest read. Coupled to /api/zoom/* by name only.
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

  // Deep-link: /meet-addon?category=<slug> opens the panel pre-filtered so we
  // can point a marketing link straight at a collection.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
    fetchBackgrounds(cat || null);
  }, []);

  const handleCategoryClick = useCallback((slug) => {
    const next = slug === activeCategory ? null : slug;
    setActiveCategory(next);
    fetchBackgrounds(next);
  }, [activeCategory, fetchBackgrounds]);

  // Download the full-res PNG. Same approach the site uses everywhere: fetch the
  // bytes through the same-origin proxy (avoids R2 CORS), then trigger a real
  // file download via a blob URL + <a download>. If Meet's iframe sandbox blocks
  // in-place downloads, the "View on site" link on each card is the escape hatch.
  const downloadBackground = useCallback(async (item) => {
    setDownloading(item.id);
    setError(null);
    try {
      const res = await fetch(`/api/zoom/img/${item.id}.png`);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `MeetBackdrops-${item.id}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(blobUrl); }, 1000);

      setDownloadedIds((prev) => new Set(prev).add(item.id));
      setLastDownloaded({ title: item.title, filename: `MeetBackdrops-${item.id}.png` });

      // Usage signal, fire-and-forget. Mirrors the Zoom app's zoom_apply ping.
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'meet_download',
          filename: `MeetBackdrops-${item.id}.png`,
          category: item.category,
        }),
      }).catch(() => {});
    } catch (e) {
      console.error('[mb] meet download FAIL', { id: item.id, error: e });
      setError(`Download failed: ${e?.message || e}. Try "View on site" instead.`);
    } finally {
      setDownloading(null);
    }
  }, []);

  return (
    <>
      <Head>
        <title>MeetBackdrops for Google Meet</title>
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
            {runningInMeet ? 'Connected to Meet' : 'Preview mode'}
          </div>
        </header>

        {lastDownloaded ? (
          <div style={styles.applyCallout}>
            <strong style={styles.applyTitle}>
              ✓ Downloaded “{lastDownloaded.title}” — now apply it in Meet:
            </strong>
            <ol style={styles.applySteps}>
              <li>Bottom bar → <b>⋮ More options</b></li>
              <li>Click <b>Apply visual effects</b></li>
              <li>Under <b>Backgrounds</b>, click the <b>＋ Add</b> tile (it’s the first one)</li>
              <li>Pick <span style={styles.fileName}>{lastDownloaded.filename}</span> from your downloads</li>
            </ol>
            <span style={styles.applyTrouble}>
              No <b>＋</b> to add your own image? Turn on Chrome hardware acceleration
              (Settings → System → restart Chrome). If it’s still missing, your
              Workspace admin has likely disabled custom backgrounds.
            </span>
          </div>
        ) : (
          <div style={styles.howto}>
            <strong style={styles.howtoTitle}>How to apply in Meet</strong>
            <span style={styles.howtoSteps}>
              Download a backdrop, then open <b>⋮ More options → Apply visual
              effects</b>, click <b>＋ (Add a background)</b> and pick the file.
            </span>
          </div>
        )}

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
                const isDownloaded = downloadedIds.has(item.id);
                const isDownloading = downloading === item.id;
                return (
                  <div
                    key={item.id}
                    style={{ ...styles.card, ...(isDownloaded ? styles.cardDownloaded : {}) }}
                  >
                    <div style={styles.thumbWrap}>
                      <img src={item.thumbUrl} alt={item.title} style={styles.thumb} loading="lazy" />
                      {item.isHd && (
                        <a
                          href="/hd"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={styles.hdBadge}
                        >
                          HD Edition →
                        </a>
                      )}
                    </div>
                    <span style={styles.cardTitle}>{item.title}</span>
                    <div style={styles.cardActions}>
                      <button
                        type="button"
                        style={{ ...styles.dlBtn, ...(isDownloaded ? styles.dlBtnDone : {}) }}
                        onClick={() => downloadBackground(item)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? 'Saving…' : isDownloaded ? '✓ Downloaded' : 'Download'}
                      </button>
                      <a
                        href={`/category/${item.category}/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.viewLink}
                      >
                        View ↗
                      </a>
                    </div>
                  </div>
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
  howto: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 12px',
    marginBottom: 14,
    fontSize: 12,
    lineHeight: 1.5,
    color: '#374151',
  },
  howtoTitle: { display: 'block', color: '#111827', marginBottom: 2 },
  howtoSteps: {},
  applyCallout: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderLeft: '4px solid #16a34a',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 14,
    fontSize: 12.5,
    lineHeight: 1.5,
    color: '#14532d',
  },
  applyTitle: { display: 'block', color: '#166534', marginBottom: 6, fontSize: 13 },
  applySteps: { margin: '0 0 6px', paddingLeft: 18, display: 'grid', gap: 2 },
  fileName: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    wordBreak: 'break-all',
    background: '#dcfce7',
    padding: '0 4px',
    borderRadius: 3,
  },
  applyTrouble: { display: 'block', marginTop: 4, fontSize: 11, color: '#15803d' },
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
    transition: 'border-color 0.15s',
  },
  cardDownloaded: {
    border: '2px solid #16a34a',
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
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
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 10px 10px',
  },
  dlBtn: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 10px',
    borderRadius: 6,
    border: 'none',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
  },
  dlBtnDone: {
    background: '#16a34a',
  },
  viewLink: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9a6a3a',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
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
