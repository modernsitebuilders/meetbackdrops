import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';

const SDK_CAPABILITIES = ['setVirtualBackground'];

export default function ZoomApp() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [applying, setApplying] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [runningInZoom, setRunningInZoom] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@zoom/appssdk');
        const zoomSdk = mod.default || mod;
        await zoomSdk.config({
          version: '0.16.0',
          capabilities: SDK_CAPABILITIES,
        });
        if (cancelled) return;
        setSdk(zoomSdk);
        setRunningInZoom(true);
      } catch (e) {
        if (cancelled) return;
        setRunningInZoom(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/zoom/backgrounds?limit=24');
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setItems(data.items);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setError(e.message);
        setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyBackground = useCallback(
    async (item) => {
      if (!sdk) {
        setError('Open this from inside Zoom to apply a background.');
        return;
      }
      setApplying(item.id);
      try {
        await sdk.setVirtualBackground({ fileUrl: item.fileUrl });
        setApplying(null);
      } catch (e) {
        setError(e.message || 'Failed to set virtual background');
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
      </Head>
      <main style={styles.page}>
        <header style={styles.header}>
          <div style={styles.brand}>
            MeetBackdrops <span style={styles.gold}>Studio</span>
          </div>
          <div style={styles.statusPill}>
            {runningInZoom ? 'Connected to Zoom' : 'Preview mode'}
          </div>
        </header>

        {error && <div style={styles.error}>{error}</div>}

        {status === 'loading' && <div style={styles.muted}>Loading backgrounds…</div>}

        {status === 'ready' && (
          <div style={styles.grid}>
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                style={styles.card}
                onClick={() => applyBackground(item)}
                disabled={applying === item.id}
              >
                <img src={item.thumbUrl} alt={item.title} style={styles.thumb} loading="lazy" />
                <span style={styles.cardTitle}>{item.title}</span>
                <span style={styles.cta}>
                  {applying === item.id ? 'Applying…' : 'Apply to Zoom'}
                </span>
              </button>
            ))}
          </div>
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
    marginBottom: 16,
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
  },
  thumb: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
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
};
