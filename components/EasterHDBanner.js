import Link from 'next/link';

export default function EasterHDBanner() {
  return (
    <Link
      href="/hd?category=easter-backgrounds"
      style={{ textDecoration: 'none' }}
      onClick={() => {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'click', {
            event_category: 'Easter HD Banner',
            event_label: 'Easter HD Banner Click'
          });
        }
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #a8e6cf 0%, #b8f0d8 25%, #ffe0f0 60%, #ffd3b6 100%)',
          border: '2px solid #7dba9a',
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🐣</span>
          <div>
            <div style={{
              fontSize: '1.05rem',
              fontWeight: '600',
              color: '#1a3a24',
              marginBottom: '0.15rem'
            }}>
              Easter HD Backgrounds Available
            </div>
            <div style={{
              fontSize: '0.85rem',
              color: '#2d4a35'
            }}>
              Premium 2x resolution Easter backgrounds • Crystal clear for video calls
            </div>
          </div>
        </div>
        <div style={{
          color: '#1a3a24',
          fontWeight: '600',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          whiteSpace: 'nowrap'
        }}>
          View HD Easter →
        </div>
      </div>
    </Link>
  );
}
