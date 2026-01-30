import { useEffect, useRef } from 'react';

export default function CaptchaModal({ onSuccess, onClose, sitekey }) {
  const captchaRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.body.appendChild(script);
    

    script.onload = () => {
      if (window.turnstile && captchaRef.current) {
        window.turnstile.render(captchaRef.current, {
          sitekey: sitekey,
          callback: (token) => {
            onSuccess(token);
          },
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onSuccess]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#111827' }}>Quick Security Check</h3>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          Please verify you're human to continue downloading
        </p>
        <div ref={captchaRef}></div>
        <button
          onClick={onClose}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}