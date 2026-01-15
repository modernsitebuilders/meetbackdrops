import Link from 'next/link';

export default function HDBanner() {
  return (
    <Link href="/hd" style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
        border: '2px solid #f59e0b',
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
          <span style={{ fontSize: '1.5rem' }}>⭐</span>
          <div>
            <div style={{ 
              fontSize: '1.05rem', 
              fontWeight: '600', 
              color: '#92400e',
              marginBottom: '0.15rem'
            }}>
              Want sharper detail?
            </div>
            <div style={{ 
              fontSize: '0.85rem', 
              color: '#78350f'
            }}>
              Premium HD versions available • 2x the resolution
            </div>
          </div>
        </div>
        <div style={{
          color: '#92400e',
          fontWeight: '600',
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          View HD →
        </div>
      </div>
    </Link>
  );
}