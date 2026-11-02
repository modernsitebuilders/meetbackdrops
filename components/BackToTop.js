import { useState, useEffect } from 'react';

// clearMobileBar: the page has a fixed bottom bar on phones (the image page's
// sticky download CTA), so sit above it there instead of covering its right end.
export default function BackToTop({ hide = false, clearMobileBar = false }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && !hide && (
        <button
          onClick={scrollToTop}
          className={clearMobileBar ? 'btt-clear-bar' : undefined}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#111827',
            color: '#fff',
            border: '1px solid #111827',
            borderBottom: '2px solid #9a6a3a',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            fontSize: '1.25rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
            zIndex: 1000,
            transition: 'background 0.2s ease',
            fontFamily: 'inherit'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#000';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#111827';
          }}
        >
          ↑
        </button>
      )}
      {/* 767px and the bar's ~76px height match .mb-sticky-cta on the image page. */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .btt-clear-bar { bottom: calc(76px + 1rem + env(safe-area-inset-bottom)) !important; right: 1rem !important; }
        }
      `}</style>
    </>
  );
}