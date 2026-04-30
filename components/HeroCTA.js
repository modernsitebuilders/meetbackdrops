// components/HeroCTA.js
import Link from 'next/link';

export default function HeroCTA() {
  const scrollToCategories = () => {
    const categoryGrid = document.querySelector('.category-grid');
    if (categoryGrid) {
      categoryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const baseBtn = {
    padding: '1rem 1.75rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    fontFamily: 'inherit',
    minHeight: '52px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        marginTop: '2rem',
        flexWrap: 'wrap',
      }}
    >
      <button
        onClick={scrollToCategories}
        style={{
          ...baseBtn,
          background: '#111827',
          color: '#fff',
          border: '1px solid #111827',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#000';
          e.currentTarget.style.borderColor = '#000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#111827';
          e.currentTarget.style.borderColor = '#111827';
        }}
      >
        Explore the Collection
      </button>

      <Link
        href="/branded-backgrounds"
        style={{
          ...baseBtn,
          background: 'transparent',
          color: '#111827',
          border: '1px solid #111827',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#111827';
          e.currentTarget.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#111827';
        }}
      >
        Brand Your Backdrops
      </Link>
    </div>
  );
}
