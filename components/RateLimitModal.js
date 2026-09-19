import { useState, useEffect } from 'react';
import { trackEvent } from '../lib/trackEvent';

export default function RateLimitModal({ onClose: closeModal, errorMessage, onEmailBonus, emailBonusUsed }) {
  const isDaily = errorMessage?.includes('Daily download limit');
  const limitKind = isDaily ? 'daily' : 'monthly';
  const onClose = () => {
    trackEvent('rate_limit_close', null, limitKind);
    closeModal();
  };

  const daysMatch = errorMessage?.match(/(\d+) day/);
  const daysRemaining = daysMatch ? daysMatch[1] : '?';

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Repeat-visitor signal, read on mount. A person who has hit the wall before
  // (or already spent their one free bonus) has exhausted the free path — that's
  // the moment to lead with the paid offer instead of another giveaway. We read
  // the counter, then increment it so THIS mount counts as a hit for next time.
  const [priorHits, setPriorHits] = useState(0);
  useEffect(() => {
    let hitNumber = 1;
    try {
      const prev = parseInt(localStorage.getItem('sb_ratelimit_hits') || '0', 10) || 0;
      setPriorHits(prev);
      localStorage.setItem('sb_ratelimit_hits', String(prev + 1));
      hitNumber = prev + 1;
    } catch { /* localStorage unavailable — treat as first hit */ }
    // The wall is where free demand runs out — record every hit and which offer
    // led, so the upgrade path can be measured. filename = variant shown (same
    // rule as emphasizeHd below), category = which cap.
    trackEvent('rate_limit_hit', hitNumber > 1 || emailBonusUsed ? 'hd_first' : 'email_first', limitKind);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const canOfferBonus = !emailBonusUsed && typeof onEmailBonus === 'function';
  // Lead with HD once the free path is exhausted: bonus already used, or this is
  // a repeat wall-hit.
  const emphasizeHd = emailBonusUsed || priorHits >= 1;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    trackEvent('rate_limit_bonus_submit', null, limitKind);
    await onEmailBonus(email);
    setSubmitting(false);
  };

  // ─── Reusable blocks ────────────────────────────────────────────────────────

  const HdOffer = ({ hero }) => (
    <div style={{
      background: hero ? '#111827' : '#faf7ef',
      border: hero ? 'none' : '1.5px solid #E0A82E',
      borderRadius: '0.75rem',
      padding: hero ? '1.4rem 1.35rem' : '1.1rem 1.25rem',
      marginBottom: '1.1rem',
    }}>
      <div style={{
        fontSize: hero ? '1.05rem' : '0.92rem',
        fontWeight: 700,
        color: hero ? '#ffffff' : '#7a5626',
        marginBottom: '0.35rem',
        letterSpacing: '-0.01em',
      }}>
        {hero ? 'Skip the limit — own your favorites' : 'Want it in full resolution?'}
      </div>
      <p style={{
        fontSize: hero ? '0.85rem' : '0.8rem',
        color: hero ? '#d1d5db' : '#6b5a3f',
        margin: '0 0 1rem',
        lineHeight: 1.5,
      }}>
        {hero
          ? 'Full-resolution HD Editions download instantly, with no daily cap — our highest-quality masters, with 4× the pixels for recordings, editing and cropping. HD from $4.99, or $9/mo for 10 downloads every month.'
          : 'HD Editions are the full-resolution masters — 4× the pixels for recordings, video editing, cropping and desktop wallpaper. From $4.99, instant download.'}
      </p>
      <a
        href="/hd"
        onClick={() => trackEvent('rate_limit_hd_click', hero ? 'hero' : 'secondary', limitKind)}
        style={{
          display: 'inline-block',
          padding: hero ? '0.7rem 1.4rem' : '0.55rem 1.1rem',
          background: hero ? '#E0A82E' : '#111827',
          color: hero ? '#111827' : '#ffffff',
          borderRadius: '0.5rem',
          fontSize: hero ? '0.95rem' : '0.875rem',
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {hero ? 'View HD options →' : 'View HD'}
      </a>
    </div>
  );

  const BonusOffer = ({ compact }) => (
    <div style={{
      background: compact ? '#f9fafb' : '#f0fdf4',
      border: compact ? '1.5px solid #e5e7eb' : '2px solid #22c55e',
      borderRadius: '0.75rem',
      padding: compact ? '1rem 1.15rem' : '1.25rem',
      marginBottom: '1.1rem',
    }}>
      <div style={{
        fontSize: compact ? '0.85rem' : '0.95rem',
        fontWeight: 700,
        color: compact ? '#374151' : '#15803d',
        marginBottom: '0.4rem',
      }}>
        {compact ? 'Or grab one more free' : 'Get 1 Free Bonus Download'}
      </div>
      <p style={{
        fontSize: '0.82rem',
        color: compact ? '#6b7280' : '#166534',
        margin: '0 0 0.85rem',
        lineHeight: 1.5,
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
            border: emailError ? '1.5px solid #ef4444' : `1.5px solid ${compact ? '#e5e7eb' : '#d1fae5'}`,
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
            background: submitting ? '#86efac' : (compact ? '#374151' : '#16a34a'),
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: submitting ? 'default' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {submitting ? 'Downloading...' : 'Unlock 1 Free Download'}
        </button>
      </form>
    </div>
  );

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
        padding: '1rem',
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
          position: 'relative',
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
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '0.75rem' }}>
          {emphasizeHd ? '⭐' : '⏱️'}
        </div>

        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          {isDaily ? 'Daily Limit Reached' : 'Monthly Limit Reached'}
        </h2>

        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}>
          {emphasizeHd
            ? "You're clearly getting good use out of these — here's how to keep downloading without the wait."
            : (isDaily
              ? "You've hit the 5 free downloads per day. Come back tomorrow — or keep going below."
              : `You've used your 10 monthly downloads. Your oldest expires in ${daysRemaining} day${daysRemaining !== '1' ? 's' : ''} — or keep going below.`)}
        </p>

        {/* Repeat / free-path exhausted → HD is the hero; bonus (if any) demoted.
            First encounter → capture the lead, HD as the secondary option. */}
        {emphasizeHd ? (
          <>
            <HdOffer hero />
            {canOfferBonus && <BonusOffer compact />}
          </>
        ) : (
          <>
            {canOfferBonus && <BonusOffer />}
            <HdOffer />
          </>
        )}

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
