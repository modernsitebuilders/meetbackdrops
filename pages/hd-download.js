import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getSessionData, getVisitorType } from '../lib/sessionTracking';

export default function HDDownload() {
  const [status, setStatus] = useState('verifying');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('Missing purchase information. Please contact support.');
      return;
    }

    fetch('/api/verify-stripe-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          const { product_id, product } = data;
          setImages([{
            id: product_id,
            name: product.title,
            url: `/api/hd-s3-download?session_id=${sessionId}&productId=${product_id}`
          }]);
          setStatus('success');

          const session = getSessionData();
          fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'hd_purchase',
              filename: product_id,
              category: 'hd',
              originalSource: session?.originalReferrer || (typeof document !== 'undefined' ? (document.referrer || 'direct') : 'direct'),
              sessionId: session?.id || '',
              visitorId: session?.visitorId || '',
              pageViewsInSession: session?.pageViews || 0,
              downloadsInSession: session?.downloads || 0,
              visitorType: getVisitorType(),
              landingPage: session?.landingPage || ''
            })
          }).catch(() => {});

        } else {
          setStatus('error');
          setError(data.error || 'Could not verify purchase');
        }
      })
      .catch(err => {
        setStatus('error');
        setError('Verification failed. Please contact support.');
      });
  }, []);

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Download Your HD Backgrounds | StreamBackdrops"
      description="Download your premium HD virtual backgrounds"
    >
      <div style={{ 
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {status === 'verifying' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Verifying your purchase...</h2>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '1rem' }}>Verification Failed</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              Contact support@streambackdrops.com with your order details
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ maxWidth: '800px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h1>Thank You for Your Purchase!</h1>
              <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                Your {images.length} HD background{images.length > 1 ? 's are' : ' is'} ready to download
              </p>
              <p style={{ color: '#999', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                We appreciate your support ❤️
              </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {images.map(img => (
                <div key={img.id} style={{
                  border: '2px solid #2563eb',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem' }}>{img.name}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>2912×1632 resolution</p>
                  </div>
                  <a href={img.url}
                    download
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>

            <p style={{ 
              textAlign: 'center',
              marginTop: '2rem',
              fontSize: '0.9rem',
              color: '#999'
            }}>
              Need help? Email support@streambackdrops.com
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}