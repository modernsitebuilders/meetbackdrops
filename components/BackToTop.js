import { useState, useEffect } from 'react';

export default function BackToTop({ hide = false }) {
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
    </>
  );
}