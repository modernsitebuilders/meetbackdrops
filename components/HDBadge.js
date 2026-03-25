import Link from 'next/link';

export default function HDBadge() {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      border: '2px solid #f59e0b',
      borderRadius: '8px',
      display: 'inline-block',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Link href="/hd" style={{
        color: '#92400e',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
      onClick={() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'HD Badge',
        event_label: 'Homepage Badge Click'
      });
    }
  }}
>
        <span style={{ fontSize: '1.2rem' }}>⭐</span>
        Premium HD Backgrounds — 2912×1632 · Crisp after Zoom compression
        <span style={{ fontSize: '0.9rem' }}>→</span>
      </Link>
    </div>
  );
}