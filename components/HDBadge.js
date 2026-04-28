import Link from 'next/link';

export default function HDBadge() {
  return (
    <div
      style={{
        marginTop: '1.5rem',
        display: 'inline-block',
      }}
    >
      <Link
        href="/hd"
        onClick={() => {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'click', {
              event_category: 'HD Badge',
              event_label: 'Homepage Badge Click',
            });
          }
        }}
        style={{
          color: '#111827',
          textDecoration: 'none',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          padding: '0.85rem 1.25rem',
          border: '1px solid #111827',
          borderBottom: '2px solid #9a6a3a',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'transparent',
          transition: 'background 0.2s ease, color 0.2s ease',
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
        <span style={{ color: '#9a6a3a', fontSize: '0.7rem' }}>✦</span>
        HD Editions — 2912×1632, crisp after compression
        <span style={{ fontSize: '0.85rem' }}>→</span>
      </Link>
    </div>
  );
}
