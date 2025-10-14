import { useEffect } from 'react';

export default function ReviewModal({ isOpen, onClose, imageName }) {
  // Close modal when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '0.25rem',
            lineHeight: 1
          }}
        >
          ×
        </button>

        {/* Success Icon */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem'
        }}>
          ✓
        </div>

        {/* Thank you message */}
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          Thank You!
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '1.5rem',
          fontSize: '1rem'
        }}>
          Your background has been downloaded successfully. We hope it looks great on your video calls!
        </p>

        {/* Review request */}
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{
            textAlign: 'center',
            color: '#111827',
            fontWeight: '600',
            marginBottom: '1rem',
            fontSize: '1.1rem'
          }}>
            Love StreamBackdrops?
          </p>
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '1.25rem',
            fontSize: '0.95rem'
          }}>
            Help others discover our free backgrounds by leaving a quick review!
          </p>

          {/* Star rating buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  // Track the review click
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'review_request', {
                      'event_category': 'engagement',
                      'event_label': 'review_modal',
                      'value': star
                    });
                  }
                  
                  // Open Google review form (you'll need to add your actual Google Business review link)
window.open('https://www.trustpilot.com/review/streambackdrops.com', '_blank');                  onClose();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'transform 0.2s',
                  color: '#fbbf24'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ⭐
              </button>
            ))}
          </div>

          <p style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#9ca3af'
          }}>
            Click any star to leave a review
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          Continue Browsing
        </button>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}