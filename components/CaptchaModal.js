import { useEffect, useRef } from 'react';

export default function CaptchaModal({ onSuccess, onClose, sitekey }) {
  const captchaRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    // Save the element that was focused before the modal opened
    previousFocusRef.current = document.activeElement;
    // Move focus into the modal
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Return focus to the element that triggered the modal
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    const renderCaptcha = () => {
      if (window.turnstile && captchaRef.current) {
        window.turnstile.render(captchaRef.current, {
          sitekey: '0x4AAAAAACVxScIQjmWqWFhb',
          callback: (token) => {
            onSuccess(token);
          },
        });
      } else {
        // Retry after 100ms if script not loaded yet
        setTimeout(renderCaptcha, 100);
      }
    };

    renderCaptcha();
  }, [onSuccess]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="captcha-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h3 id="captcha-title" style={{ marginBottom: '1rem', color: '#111827' }}>Quick Security Check</h3>
        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
          Please verify you're human to continue downloading
        </p>
        <div ref={captchaRef}></div>
        <button
          ref={cancelButtonRef}
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