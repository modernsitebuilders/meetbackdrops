import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import WebcamSilhouette from '../../components/WebcamSilhouette';
import { buildImageDisplayTitle } from '../../lib/imagePageMeta';
import { getLogoSpot, logoReadySlugs, LOGO_PRICE_LABEL, OUTPUT_WIDTH, OUTPUT_HEIGHT } from '../../lib/logoBackground';
import { trackEvent, getAttribution } from '../../lib/trackEvent';

// "Add your logo" editor. Everything is drawn in the browser on a 1920×1080
// overlay canvas that holds ONLY the logo/text layer. The background stays a
// plain <img> under it with a watermark on top, so the preview is never a
// clean composite: at checkout the overlay alone is uploaded and the server
// renders the final file once Stripe confirms payment.

const W = OUTPUT_WIDTH;
const H = OUTPUT_HEIGHT;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const FONTS = {
  serif: "600 {px}px Fraunces, Georgia, serif",
  sans: "600 {px}px 'Helvetica Neue', Arial, sans-serif",
};

const WATERMARK = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="200"><text x="20" y="120" transform="rotate(-24 180 100)" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="rgba(255,255,255,0.38)" stroke="rgba(0,0,0,0.22)" stroke-width="1">PREVIEW · MEETBACKDROPS</text></svg>'
)}")`;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Draws the overlay and returns its bounding box (in output pixels), padded to
// include the shadow, so checkout can upload just that region.
function drawOverlay(ctx, s, logoImg) {
  ctx.clearRect(0, 0, W, H);
  const cx = s.x * W;
  const cy = s.y * H;
  let contentW;
  let contentH;
  let lines = [];

  if (s.mode === 'logo') {
    if (!logoImg) return null;
    contentW = s.size * W;
    contentH = contentW * (logoImg.naturalHeight / logoImg.naturalWidth);
  } else {
    const name = s.name.trim();
    const title = s.title.trim();
    if (!name && !title) return null;
    const namePx = Math.round(s.size * W * 0.17);
    const titlePx = Math.round(namePx * 0.52);
    if (name) lines.push({ text: name, font: FONTS[s.font].replace('{px}', namePx), px: namePx });
    if (title) lines.push({ text: title, font: FONTS[s.font].replace('{px}', titlePx).replace('600', '500'), px: titlePx });
    contentW = Math.max(...lines.map((l) => { ctx.font = l.font; return ctx.measureText(l.text).width; }));
    contentH = lines.reduce((h, l) => h + l.px * 1.25, 0);
  }

  const pad = s.backing === 'none' ? 0 : Math.round(Math.min(contentW, contentH) * 0.22 + 12);
  const boxW = contentW + pad * 2;
  const boxH = contentH + pad * 2;
  const left = cx - boxW / 2;
  const top = cy - boxH / 2;

  ctx.save();
  ctx.globalAlpha = s.opacity;
  if (s.shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.38)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
  }
  if (s.backing !== 'none') {
    ctx.fillStyle = s.backing === 'light' ? 'rgba(255,255,255,0.86)' : 'rgba(17,24,39,0.82)';
    roundRect(ctx, left, top, boxW, boxH, Math.min(18, pad));
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  if (s.mode === 'logo') {
    ctx.drawImage(logoImg, left + pad, top + pad, contentW, contentH);
  } else {
    ctx.fillStyle = s.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    let y = top + pad;
    lines.forEach((l) => {
      ctx.font = l.font;
      ctx.fillText(l.text, cx, y + l.px * 0.1);
      y += l.px * 1.25;
    });
  }
  ctx.restore();

  const margin = s.shadow ? 40 : 4;
  const x0 = Math.max(0, Math.floor(left - margin));
  const y0 = Math.max(0, Math.floor(top - margin));
  const x1 = Math.min(W, Math.ceil(left + boxW + margin));
  const y1 = Math.min(H, Math.ceil(top + boxH + margin));
  if (x1 <= x0 || y1 <= y0) return null;
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}

function Control({ label, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <div style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600, marginBottom: '0.4rem' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', border: '1px solid #d1d5db' }}>
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '0.5rem 0.4rem', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
            background: value === v ? '#111827' : '#fff', color: value === v ? '#fff' : '#111827',
          }}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function AddLogo({ slug, displayTitle, webpUrl, defaultSpot, categoryHref }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const dragging = useRef(false);
  const boxRef = useRef(null);
  const [logoImg, setLogoImg] = useState(null);
  const [logoName, setLogoName] = useState('');
  const [fileError, setFileError] = useState('');
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [mirrored, setMirrored] = useState(false);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [fontsReady, setFontsReady] = useState(false);
  const [s, setS] = useState({
    mode: 'logo',
    name: '',
    title: '',
    font: 'serif',
    textColor: '#ffffff',
    size: 0.16,
    opacity: 1,
    shadow: true,
    backing: 'none',
    x: defaultSpot.x,
    y: defaultSpot.y,
  });
  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    trackEvent('logo_editor_view', slug, 'add-logo');
    if (document.fonts?.load) {
      document.fonts.load('600 40px Fraunces').finally(() => setFontsReady(true));
    } else {
      setFontsReady(true);
    }
  }, [slug]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    boxRef.current = drawOverlay(ctx, s, logoImg);
  }, [s, logoImg, fontsReady]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)) {
      setFileError('Use a PNG, SVG, JPG or WebP file.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setFileError('That file is over 5 MB. Try a smaller export of your logo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setLogoImg(img);
        setLogoName(file.name);
        trackEvent('logo_uploaded', slug, file.type);
      };
      img.onerror = () => setFileError('Could not read that image.');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const moveTo = useCallback((clientX, clientY) => {
    const r = frameRef.current.getBoundingClientRect();
    let x = (clientX - r.left) / r.width;
    const y = (clientY - r.top) / r.height;
    if (mirrored) x = 1 - x;
    set({ x: Math.min(0.97, Math.max(0.03, x)), y: Math.min(0.97, Math.max(0.03, y)) });
  }, [mirrored]);

  const hasContent = s.mode === 'logo' ? Boolean(logoImg) : Boolean(s.name.trim() || s.title.trim());

  const handleBuy = async () => {
    const box = boxRef.current;
    if (!box || !hasContent) return;
    setBuyError('');
    setBuying(true);
    trackEvent('logo_checkout_initiated', slug, s.mode);
    try {
      const crop = document.createElement('canvas');
      crop.width = box.w;
      crop.height = box.h;
      crop.getContext('2d').drawImage(canvasRef.current, box.x0, box.y0, box.w, box.h, 0, 0, box.w, box.h);
      const res = await fetch('/api/create-logo-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          overlay: crop.toDataURL('image/png'),
          left: box.x0,
          top: box.y0,
          settings: { ...s, logoName },
          analytics: getAttribution(),
        }),
      });
      const data = await res.json();
      if (!data.url) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      setBuyError(err.message || 'Checkout failed. Please try again.');
      setBuying(false);
    }
  };

  const presets = [
    ['Upper left', 0.2, 0.22],
    ['Upper right', 0.8, 0.22],
    ['Left wall', 0.16, 0.48],
    ['Right wall', 0.84, 0.48],
  ];

  return (
    <Layout
      title="Add Your Logo to This Background | MeetBackdrops"
      description="Place your company logo or your name and title on a studio-designed virtual background, preview it on camera, and download a 1920×1080 file for Zoom, Teams and Meet."
      noIndex
    >
      <div style={{ background: '#F5F5F5', padding: '1.5rem 16px 3rem' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            <Link href={categoryHref} style={{ color: '#6b7280' }}>← Back to background</Link>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', color: '#111827', margin: '0 0 0.3rem' }}>
            Add your logo
          </h1>
          <p style={{ color: '#4b5563', margin: '0 0 1.25rem', maxWidth: 720 }}>
            {displayTitle}. Drag to place it, check it against the caller outline, then download a clean 1920×1080 file for Zoom, Teams and Meet.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start' }}>
            {/* Preview */}
            <div style={{ flex: '1 1 640px', minWidth: 0 }}>
              <div
                ref={frameRef}
                onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); moveTo(e.clientX, e.clientY); }}
                onPointerMove={(e) => { if (dragging.current) moveTo(e.clientX, e.clientY); }}
                onPointerUp={() => { dragging.current = false; }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', cursor: 'move', touchAction: 'none', userSelect: 'none', background: '#111827' }}
              >
                <div style={{ position: 'absolute', inset: 0, transform: mirrored ? 'scaleX(-1)' : 'none' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={webpUrl} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <canvas ref={canvasRef} width={W} height={H} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: WATERMARK, backgroundSize: '360px 200px', pointerEvents: 'none' }} />
                {showSilhouette && <WebcamSilhouette />}
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.6rem', fontSize: '0.88rem', color: '#374151' }}>
                <label><input type="checkbox" checked={showSilhouette} onChange={(e) => setShowSilhouette(e.target.checked)} /> Show where you sit</label>
                <label><input type="checkbox" checked={mirrored} onChange={(e) => setMirrored(e.target.checked)} /> Preview my self-view (mirrored)</label>
              </div>
              {mirrored && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.4rem 0 0' }}>
                  Zoom and Teams mirror your own preview, so text looks reversed to you. Everyone else on the call sees it the right way round.
                </p>
              )}
            </div>

            {/* Controls */}
            <div style={{ flex: '0 1 340px', width: '100%', background: '#fff', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
              <Control label="Add">
                <Segmented value={s.mode} onChange={(mode) => set({ mode })} options={[['logo', 'Logo'], ['text', 'Name & title']]} />
              </Control>

              {s.mode === 'logo' ? (
                <Control label="Your logo">
                  <input type="file" accept="image/png,image/svg+xml,image/jpeg,image/webp" onChange={handleFile} style={{ fontSize: '0.85rem', maxWidth: '100%' }} />
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.35rem' }}>
                    A transparent PNG or SVG looks best. Your file stays in your browser until you check out.
                  </div>
                  {fileError && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.35rem' }}>{fileError}</div>}
                </Control>
              ) : (
                <>
                  <Control label="Name">
                    <input value={s.name} maxLength={40} onChange={(e) => set({ name: e.target.value })} placeholder="Jordan Lee" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </Control>
                  <Control label="Title or company">
                    <input value={s.title} maxLength={60} onChange={(e) => set({ title: e.target.value })} placeholder="Partner, Lee & Associates" style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </Control>
                  <Control label="Style">
                    <Segmented value={s.font} onChange={(font) => set({ font })} options={[['serif', 'Serif'], ['sans', 'Sans']]} />
                    <div style={{ height: 8 }} />
                    <Segmented value={s.textColor} onChange={(textColor) => set({ textColor })} options={[['#ffffff', 'White'], ['#111827', 'Dark']]} />
                  </Control>
                </>
              )}

              <Control label="Position">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                  {presets.map(([label, x, y]) => (
                    <button key={label} type="button" onClick={() => set({ x, y })} style={{ padding: '0.45rem', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '0.82rem' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => set(defaultSpot)} style={{ marginTop: '0.35rem', width: '100%', padding: '0.45rem', border: '1px solid #E0A82E', background: '#faf7ef', cursor: 'pointer', fontSize: '0.82rem' }}>
                  Studio-recommended spot
                </button>
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.35rem' }}>Or drag on the preview.</div>
              </Control>

              <Control label={`Size · ${Math.round(s.size * 100)}%`}>
                <input type="range" min="0.06" max="0.36" step="0.005" value={s.size} onChange={(e) => set({ size: +e.target.value })} style={{ width: '100%' }} />
              </Control>
              <Control label={`Opacity · ${Math.round(s.opacity * 100)}%`}>
                <input type="range" min="0.3" max="1" step="0.05" value={s.opacity} onChange={(e) => set({ opacity: +e.target.value })} style={{ width: '100%' }} />
              </Control>
              <Control label="Finish">
                <Segmented value={s.backing} onChange={(backing) => set({ backing })} options={[['none', 'On the wall'], ['light', 'Light plate'], ['dark', 'Dark plate']]} />
                <label style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: '#374151' }}>
                  <input type="checkbox" checked={s.shadow} onChange={(e) => set({ shadow: e.target.checked })} /> Soft shadow
                </label>
              </Control>

              <button
                type="button"
                onClick={handleBuy}
                disabled={!hasContent || buying}
                style={{
                  width: '100%', padding: '0.95rem', border: 'none', cursor: hasContent && !buying ? 'pointer' : 'default',
                  background: hasContent ? '#111827' : '#9ca3af', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  borderBottom: hasContent ? '3px solid #E0A82E' : 'none',
                }}
              >
                {buying ? 'Preparing checkout…' : hasContent ? `Get the clean file — ${LOGO_PRICE_LABEL}` : (s.mode === 'logo' ? 'Upload a logo to continue' : 'Add a name to continue')}
              </button>
              {buyError && <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '0.5rem' }}>{buyError}</div>}
              <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.6rem', lineHeight: 1.5 }}>
                1920×1080 PNG without the watermark, ready to upload to Zoom, Teams or Meet. Instant download after payment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  return { paths: logoReadySlugs().map((slug) => ({ params: { slug } })), fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const spot = getLogoSpot(params.slug);
  if (!spot) return { notFound: true, revalidate: 300 };
  const manifest = require('../../image-pipeline/final_manifest.json');
  const image = manifest.find((e) => e.slug === params.slug);
  if (!image) return { notFound: true, revalidate: 300 };
  return {
    props: {
      slug: image.slug,
      displayTitle: buildImageDisplayTitle(image.title),
      webpUrl: `https://assets.streambackdrops.com/webp/${image.folder || image.category}/${image.image_webp}`,
      defaultSpot: spot,
      categoryHref: `/category/${image.category}/${image.slug}`,
    },
  };
}
