// components/HeroCTA.js
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

export default function HeroCTA() {
  const scrollToCategories = () => {
    const categoryGrid = document.querySelector('.category-grid');
    if (categoryGrid) {
      categoryGrid.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1.5rem',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={scrollToCategories}
        style={{
          padding: '1rem 2rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 12px rgba(37, 99, 235, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.3)';
        }}
      >
        Browse {TOTAL_IMAGES_FORMATTED} Free Backgrounds ↓
      </button>
    </div>
  );
}