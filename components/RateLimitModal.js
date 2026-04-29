import { useState } from 'react';

export default function RateLimitModal({ onClose, errorMessage, onEmailBonus, emailBonusUsed }) {
  const isDaily = errorMessage?.includes('Daily download limit');

  const daysMatch = errorMessage?.match(/(\d+) day/);
  const daysRemaining = daysMatch ? daysMatch[1] : '?';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    await onEmailBonus(email);
    setSubmitting(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '0.25rem',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.75rem' }}>⏱️</div>

        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '0.5rem'
        }}>
          {isDaily ? 'Daily Limit Reached' : 'Monthly Limit Reached'}
        </h2>

        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {isDaily
            ? 'You\'ve hit the 5 free downloads per day. Come back tomorrow — or get 1 more right now.'
            : `You've used your 10 monthly downloads. Your oldest expires in ${daysRemaining} day${daysRemaining !== '1' ? 's' : ''} — or get 1 more right now.`}
        </p>

        {/* Email bonus section */}
        {!emailBonusUsed ? (
          <div style={{
            background: '#f0fdf4',
            border: '2px solid #22c55e',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: '#15803d',
              marginBottom: '0.4rem'
            }}>
              Get 1 Free Bonus Download
            </div>
            <p style={{
              fontSize: '0.82rem',
              color: '#166534',
              margin: '0 0 0.85rem',
              lineHeight: '1.5'
            }}>
              Enter your email and we&apos;ll unlock one extra download right now. No spam, ever.
            </p>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                placeholder="you@example.com"
                style={{
                  padding: '0.6rem 0.85rem',
                  border: emailError ? '1.5px solid #ef4444' : '1.5px solid #d1fae5',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              {emailError && (
                <span style={{ fontSize: '0.78rem', color: '#dc2626' }}>{emailError}</span>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.65rem',
                  background: submitting ? '#86efac' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: submitting ? 'default' : 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {submitting ? 'Downloading...' : 'Unlock 1 Free Download'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            background: '#f3f4f6',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Bonus download already used on this device.
          </div>
        )}

        {/* HD upsell */}
        <div style={{
          background: '#faf5ff',
          border: '2px solid #a855f7',
          borderRadius: '0.75rem',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#7e22ce', marginBottom: '0.2rem' }}>
              ⭐ Unlimited HD Downloads
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6b21a8', lineHeight: '1.4' }}>
              2912×1632 resolution. From $4.99 per image.
            </div>
          </div>
          <a
            href="/hd"
            style={{
              padding: '0.55rem 1.1rem',
              background: '#111827',
              color: 'white',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            View HD Packs
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.65rem',
            background: 'white',
            color: '#6b7280',
            border: '1.5px solid #e5e7eb',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
