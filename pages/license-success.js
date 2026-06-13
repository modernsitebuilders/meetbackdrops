import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getSessionData, getVisitorType } from '../lib/sessionTracking';

export default function LicenseSuccess() {
  const [status, setStatus] = useState('verifying');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('Missing purchase information. Please contact support.');
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
          setError(d.error || 'Could not verify purchase');
          return;
        }
        setData({ ...d, sessionId });
        setStatus('success');

        // Idempotent analytics (keyed by session id, mirrors hd-download.js).
        try {
          const trackedKey = `license_purchase_tracked_${sessionId}`;
          const already =
            typeof window !== 'undefined' &&
            window.localStorage &&
            window.localStorage.getItem(trackedKey) === '1';
          if (!already) {
            const session = getSessionData();
            fetch('/api/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'license_purchase',
                filename: d.productId || d.licenseType,
                category: 'license',
                originalSource: session?.originalReferrer || (typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct'),
                sessionId: session?.id || '',
                visitorId: session?.visitorId || '',
                pageViewsInSession: session?.pageViews || 0,
                downloadsInSession: session?.downloads || 0,
                visitorType: getVisitorType(),
                landingPage: session?.landingPage || '',
              }),
            }).catch(() => {});

            if (typeof window !== 'undefined' && window.gtag && d.amount_total != null) {
              window.gtag('event', 'purchase', {
                transaction_id: sessionId,
                value: d.amount_total / 100,
                currency: (d.currency || 'usd').toUpperCase(),
                items: [{
                  item_id: d.productId || d.licenseType,
                  item_name: d.licenseType === 'library' ? 'Commercial Library License' : `Extended License — ${d.productTitle}`,
                  quantity: 1,
                }],
              });
            }
            if (typeof window !== 'undefined' && window.localStorage) {
              window.localStorage.setItem(trackedKey, '1');
            }
          }
        } catch (_) {}
      })
      .catch(() => {
        setStatus('error');
        setError('Verification failed. Please contact support.');
      });
  }, []);

  const isImage = data?.licenseType === 'image';

  return (
    <Layout
      title="Your Commercial License | MeetBackdrops"
      description="Access your purchased MeetBackdrops commercial license, certificate, and HD file. Use studio environments in the products and deliverables you sell."
      noIndex={true}
    >
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {status === 'verifying' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Verifying your license…</h2>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '1rem' }}>Verification Failed</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              Contact info@meetbackdrops.com with your order details
            </p>
          </div>
        )}

        {status === 'success' && data && (
          <div style={{ maxWidth: '720px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h1 style={{ marginBottom: '0.5rem' }}>License Confirmed</h1>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                {isImage
                  ? `Extended License issued for "${data.productTitle}".`
                  : 'Commercial Library License issued — valid across the entire catalog for 12 months.'}
              </p>
              <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Issued to <strong>{data.licensee}</strong>. A receipt has been emailed to you.
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {/* The certificate — the actual proof of the right purchased. */}
              <div style={{
                border: '2px solid #E0A82E', borderRadius: '12px', padding: '1.5rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
              }}>
                <div>
                  <h3 style={{ marginBottom: '0.25rem' }}>License certificate</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>
                    Your proof of license — view, print, or save as PDF for your records.
                  </p>
                </div>
                <Link
                  href={`/license-certificate?session_id=${encodeURIComponent(data.sessionId)}`}
                  style={{
                    background: '#E0A82E', color: '#111827', padding: '0.75rem 1.5rem',
                    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap',
                  }}
                >
                  View certificate
                </Link>
              </div>

              {/* HD file download — only for the per-image extended license. */}
              {isImage && data.productId && (
                <div style={{
                  border: '2px solid #111827', borderRadius: '12px', padding: '1.5rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{data.productTitle}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>2912×1632 HD file — included with your license</p>
                  </div>
                  <a
                    href={`/api/hd-s3-download?session_id=${encodeURIComponent(data.sessionId)}&productId=${encodeURIComponent(data.productId)}`}
                    download
                    style={{
                      background: '#111827', color: 'white', padding: '0.75rem 1.5rem',
                      borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', whiteSpace: 'nowrap',
                    }}
                  >
                    Download HD
                  </a>
                </div>
              )}

              {!isImage && (
                <div style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>Downloading catalog images</h3>
                  <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    Your library license covers commercial use of any background in the catalog. Download the
                    free-tier file from any image page, or the HD edition from <Link href="/hd">/hd</Link>. Keep
                    your certificate on file as proof of the commercial rights for whichever images you use.
                  </p>
                </div>
              )}
            </div>

            <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
              Need help or a custom agreement? Email info@meetbackdrops.com
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
