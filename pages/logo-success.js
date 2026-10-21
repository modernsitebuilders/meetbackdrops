import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { trackEvent } from '../lib/trackEvent';

export default function LogoSuccess() {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('session_id');
    setSessionId(id);
    if (id) trackEvent('logo_success_view', null, 'logo');
  }, []);

  const steps = [
    ['Zoom', 'Settings → Background & effects → + → Add image.'],
    ['Microsoft Teams', 'Before joining: Effects and avatars → More video effects → Add new. In a meeting: … → Video effects.'],
    ['Google Meet', 'Apply visual effects → Backgrounds → + Add.'],
  ];

  return (
    <Layout title="Your Logo Background Is Ready | MeetBackdrops" noIndex>
      <div style={{ background: '#F5F5F5', padding: '3rem 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: '#fff', border: '1px solid #e5e7eb', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#111827', fontSize: '1.8rem', margin: '0 0 0.5rem' }}>
            Your background is ready
          </h1>
          <p style={{ color: '#4b5563', margin: '0 0 1.5rem' }}>
            A 1920×1080 PNG with your logo, without the preview watermark. You can come back to this page to download it again.
          </p>
          {sessionId ? (
            <a
              href={`/api/logo-download?session_id=${encodeURIComponent(sessionId)}`}
              onClick={() => trackEvent('logo_download_click', null, 'logo')}
              style={{
                display: 'block', textAlign: 'center', padding: '1rem', background: '#111827', color: '#fff',
                fontWeight: 700, textDecoration: 'none', borderBottom: '3px solid #E0A82E',
              }}
            >
              Download your background
            </a>
          ) : (
            <p style={{ color: '#b91c1c' }}>
              Missing purchase information. Email info@meetbackdrops.com with your receipt and we&apos;ll send the file.
            </p>
          )}
          <h2 style={{ fontSize: '1.05rem', color: '#111827', margin: '2rem 0 0.75rem' }}>Set it on your next call</h2>
          <ul style={{ paddingLeft: '1.1rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
            {steps.map(([app, how]) => (
              <li key={app} style={{ marginBottom: '0.5rem' }}><strong>{app}:</strong> {how}</li>
            ))}
          </ul>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', marginTop: '1.5rem' }}>
            Your own preview may show the logo reversed; that&apos;s mirroring. Everyone else sees it the right way round.{' '}
            <Link href="/" style={{ color: '#9a6a3a' }}>Back to MeetBackdrops</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
