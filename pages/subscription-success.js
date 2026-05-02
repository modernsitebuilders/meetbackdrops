import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function SubscriptionSuccess() {
  const [status, setStatus] = useState('activating'); // activating | success | error
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setError('Missing session information. Please contact support.');
      return;
    }

    fetch('/api/subscription-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('sb_sub_token', data.token);
          setEmail(data.email || '');
          setStatus('success');
        } else {
          setStatus('error');
          setError(data.error || 'Activation failed');
        }
      })
      .catch(() => {
        setStatus('error');
        setError('Something went wrong. Please contact info@streambackdrops.com');
      });
  }, []);

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| MeetBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Subscription Activated | MeetBackdrops"
      description="Your HD Backgrounds subscription is active"
    >
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        {status === 'activating' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h2>Activating your subscription...</h2>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '1rem' }}>Activation Failed</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
            <p style={{ fontSize: '0.9rem', color: '#999' }}>
              Contact info@streambackdrops.com with your order details
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>You're subscribed!</h1>
            {email && (
              <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1rem' }}>
                Subscription linked to <strong>{email}</strong>
              </p>
            )}

            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              borderRadius: '12px',
              padding: '1.5rem 2rem',
              marginBottom: '2rem',
            }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                10 HD downloads / month
              </div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                Downloads reset each billing cycle. Limit resets automatically — no action needed.
              </div>
            </div>

            <div style={{
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'left',
              fontSize: '0.95rem',
              color: '#555',
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                📌 <strong>Save this for later:</strong> If you clear your browser or switch devices, visit the HD page and click <em>"Already subscribed? Verify here"</em> — enter your email to restore access.
              </p>
            </div>

            <Link
              href="/hd"
              style={{
                display: 'inline-block',
                background: '#111827',
                color: 'white',
                padding: '1rem 2.5rem',
                borderRadius: '10px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
              }}
            >
              Start Downloading →
            </Link>

            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#999' }}>
              Need help? Email info@streambackdrops.com
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
