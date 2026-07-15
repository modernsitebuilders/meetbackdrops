import { trackEvent } from '../lib/trackEvent';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const trackAnalytics = (eventType, filename, category, extra) => trackEvent(eventType, filename, category, extra);

const GOLD = '#E0A82E';
const DARK = '#111827';
const COPPER = '#9a6a3a';

export default function CommercialLicense() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const img = params.get('image');
    if (img) setSelectedImage(img);
    trackAnalytics('commercial_license_view', img || null, 'commercial-license');
  }, []);

  async function startCheckout(licenseType, productId) {
    setErr('');
    setBusy(licenseType);
    try {
      const res = await fetch('/api/create-license-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseType, productId }),
      });
      const data = await res.json();
      if (data.url) {
        trackAnalytics('license_checkout_initiated', productId || licenseType, 'commercial-license');
        window.location.href = data.url;
      } else {
        setErr(data.error || 'Could not start checkout. Please try again.');
        setBusy('');
      }
    } catch (e) {
      setErr('Could not start checkout. Please try again.');
      setBusy('');
    }
  }

  return (
    <Layout
      title="Commercial & Extended Image Licenses | MeetBackdrops"
      description="License MeetBackdrops studio backgrounds for commercial use — embed virtual environments in the products, courses, and client work your business sells."
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD, fontWeight: 700, marginBottom: '0.75rem' }}>
            For Business
          </div>
          <h1 style={{ fontSize: '2.4rem', color: DARK, marginBottom: '1rem', lineHeight: 1.15 }}>
            Commercial &amp; Extended Licenses
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Using a background as scenery on your own video calls is free — always. You only need a
            license when the image goes <em>inside</em> something you sell or distribute.
          </p>
        </div>

        {/* The rule: behind vs inside */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '3rem' }}>
          <div style={{ border: '2px solid #16a34a', borderRadius: '12px', padding: '1.5rem', background: '#f0fdf4' }}>
            <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '0.6rem' }}>✅ Free — image is the backdrop</div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#166534', fontSize: '0.92rem', lineHeight: 1.9 }}>
              <li>Your sales calls, demos, and client meetings</li>
              <li>Paid webinars and livestreams you host</li>
              <li>Freelance and consulting calls</li>
              <li>Recorded interviews and podcasts</li>
            </ul>
          </div>
          <div style={{ border: `2px solid ${COPPER}`, borderRadius: '12px', padding: '1.5rem', background: '#fdf6ef' }}>
            <div style={{ fontWeight: 700, color: COPPER, marginBottom: '0.6rem' }}>💳 Licensed — image is inside a product</div>
            <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#7c4a1e', fontSize: '0.92rem', lineHeight: 1.9 }}>
              <li>A selectable background inside an app you sell</li>
              <li>Baked into a video deliverable you bill a client</li>
              <li>Bundled in a paid course&apos;s downloadable assets</li>
              <li>A template, theme, or product you distribute</li>
            </ul>
          </div>
        </div>

        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#991b1b', borderRadius: '8px', padding: '0.85rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.92rem' }}>
            {err}
          </div>
        )}

        {/* Pricing */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>

          {/* Extended License — per image */}
          <div style={{ border: `2px solid ${DARK}`, borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.3rem', color: DARK, marginBottom: '0.35rem' }}>Extended License</h2>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: DARK, marginBottom: '0.1rem' }}>$49<span style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}> / image</span></div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>One-time · includes the HD file</div>
            <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.1rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.9, flexGrow: 1 }}>
              <li>Embed one image in products you sell</li>
              <li>2912×1632 HD file included</li>
              <li>Perpetual, worldwide, non-exclusive</li>
              <li>License certificate for your records</li>
            </ul>
            {selectedImage ? (
              <button
                onClick={() => startCheckout('image', selectedImage)}
                disabled={busy === 'image'}
                style={ctaStyle(GOLD, DARK, busy === 'image')}
              >
                {busy === 'image' ? 'Preparing checkout…' : 'License this image — $49'}
              </button>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, textAlign: 'center', border: '1px dashed #d1d5db', borderRadius: '8px', padding: '0.85rem' }}>
                Open any HD background, then choose{' '}
                <strong>“Commercial license”</strong> in its preview to license that image.
                <div style={{ marginTop: '0.5rem' }}>
                  <Link href="/hd" style={{ color: COPPER, fontWeight: 600 }}>Browse HD backgrounds →</Link>
                </div>
              </div>
            )}
          </div>

          {/* Commercial Library License */}
          <div style={{ border: `2px solid ${GOLD}`, borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-0.8rem', left: '2rem', background: GOLD, color: DARK, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>
              Best value
            </div>
            <h2 style={{ fontSize: '1.3rem', color: DARK, marginBottom: '0.35rem' }}>Commercial Library License</h2>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: DARK, marginBottom: '0.1rem' }}>$299<span style={{ fontSize: '1rem', fontWeight: 600, color: '#6b7280' }}> / year</span></div>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>One-time · 12-month term · entire catalog</div>
            <ul style={{ margin: '0 0 1.5rem', paddingLeft: '1.1rem', color: '#374151', fontSize: '0.92rem', lineHeight: 1.9, flexGrow: 1 }}>
              <li>Commercial rights across every background</li>
              <li>Use any image in any product you sell</li>
              <li>One company, unlimited projects for 12 months</li>
              <li>License certificate + invoice for procurement</li>
            </ul>
            <button
              onClick={() => startCheckout('library')}
              disabled={busy === 'library'}
              style={ctaStyle(DARK, '#fff', busy === 'library')}
            >
              {busy === 'library' ? 'Preparing checkout…' : 'Get the library license — $299'}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: DARK, marginBottom: '1.25rem' }}>Common questions</h2>
          {[
            ['Do I need this to use a background on my work calls?', 'No. On-camera use — including paid webinars, client calls, and recorded interviews — is free under the standard license. You only need this when the image is embedded in a product or deliverable you sell.'],
            ['Is the license exclusive to me?', 'No. Like standard stock licensing, these are non-exclusive — the same environment may be licensed to other businesses too. If you need exclusivity or your logo integrated, that is the Branded Backgrounds offer.'],
            ['Your images are AI-assisted — can you license them?', 'Yes. MeetBackdrops produces each environment through its own studio process and grants you a commercial license to use it. The certificate documents the rights and term for your records and procurement.'],
            ['What do I actually receive?', 'A license certificate (view, print, or save as PDF), an emailed invoice, and — for the per-image Extended License — the 2912×1632 HD file. The Library License covers downloads you pull from the catalog yourself.'],
            ['Need something bigger or custom?', 'For team deployment, your logo integrated into the set, or a fully exclusive environment, see Branded Backgrounds or email info@meetbackdrops.com.'],
          ].map(([q, a]) => (
            <div key={q} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: DARK, marginBottom: '0.3rem' }}>{q}</div>
              <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{a}</p>
            </div>
          ))}
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1.5rem' }}>
            See the full <Link href="/license" style={{ color: COPPER, fontWeight: 600 }}>License &amp; Usage Rights</Link>{' '}
            or the <Link href="/branded-backgrounds" style={{ color: COPPER, fontWeight: 600 }}>Branded Backgrounds</Link> offer.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function ctaStyle(bg, color, disabled) {
  return {
    background: disabled ? '#9ca3af' : bg,
    color,
    border: 'none',
    borderRadius: '8px',
    padding: '0.9rem 1.25rem',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit',
    width: '100%',
  };
}
