import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function LicenseCertificate() {
  const [status, setStatus] = useState('verifying');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setStatus('error');
      setError('Missing license reference.');
      return;
    }
    fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(res => res.json())
      .then(d => {
        if (!d.verified) {
          setStatus('error');
          setError(d.error || 'Could not verify this license.');
          return;
        }
        setData(d);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
        setError('Verification failed.');
      });
  }, []);

  const isImage = data?.licenseType === 'image';
  const scope = isImage
    ? `One image: ${data?.productTitle || data?.productId}`
    : 'Entire MeetBackdrops catalog';
  const term = isImage ? 'Perpetual (for the licensed image)' : `12 months — expires ${fmtDate(data?.expiresAt)}`;
  const title = isImage ? 'Extended License' : 'Commercial Library License';

  return (
    <Layout
      title="License Certificate | MeetBackdrops"
      description="Official MeetBackdrops commercial license certificate — proof of the commercial usage rights granted for the licensed studio environment(s)."
      noIndex={true}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {status === 'verifying' && <p style={{ textAlign: 'center' }}>Verifying license…</p>}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>❌</div>
            <h2>Certificate unavailable</h2>
            <p style={{ color: '#666' }}>{error}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>Contact info@meetbackdrops.com with your order ID.</p>
          </div>
        )}

        {status === 'ready' && data && (
          <>
            {/* Print control — hidden on the printed page */}
            <div className="no-print" style={{ textAlign: 'right', marginBottom: '1rem' }}>
              <button
                onClick={() => window.print()}
                style={{
                  background: '#111827', color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '0.7rem 1.4rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Print / Save as PDF
              </button>
            </div>

            <div style={{
              border: '2px solid #111827', borderRadius: '6px', padding: '2.75rem',
              background: '#fff', color: '#111827',
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E0A82E', fontWeight: 700 }}>
                  MeetBackdrops Studio
                </div>
                <h1 style={{ fontSize: '1.7rem', margin: '0.5rem 0 0.25rem' }}>Certificate of License</h1>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{title}</div>
              </div>

              <p style={{ fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                This certifies that <strong>{data.licensee}</strong>
                {data.email ? <> ({data.email})</> : null} has been granted a commercial license by
                MeetBackdrops under the terms below.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
                <tbody>
                  {[
                    ['Licensee', data.licensee],
                    ['License type', title],
                    ['Scope', scope],
                    ['Term', term],
                    ['Issued', fmtDate(data.purchasedAt)],
                    ['Order ID', data.orderId],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '0.6rem 0', color: '#6b7280', width: '36%', verticalAlign: 'top' }}>{k}</td>
                      <td style={{ padding: '0.6rem 0', fontWeight: 600, wordBreak: 'break-word' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Rights granted</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#374151', marginBottom: '1.25rem' }}>
                A worldwide, non-exclusive, non-transferable right to incorporate the licensed
                environment{isImage ? '' : 's'} into products, applications, online courses, marketing
                materials, client deliverables, and other works that the licensee produces, sells, or
                distributes — in addition to all uses permitted under the free tier.
              </p>

              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Restrictions</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.65, color: '#374151', marginBottom: '1.25rem' }}>
                The licensee may not resell or redistribute the image as a standalone file, sublicense it,
                upload it to a stock or asset marketplace, or use it in a way that competes with
                MeetBackdrops. Adding a company logo into the image is covered separately by Branded
                Backgrounds. This license is non-exclusive: the same environment may be licensed to others.
              </p>

              <p style={{ fontSize: '0.8rem', lineHeight: 1.6, color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                MeetBackdrops warrants that it produced the licensed environment(s) through its own studio
                process and is not aware of any third-party claim against them. Full terms:
                meetbackdrops.com/license. Verify this certificate by its Order ID at info@meetbackdrops.com.
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          header, footer, nav { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}
