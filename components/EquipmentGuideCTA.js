import Link from 'next/link';

export default function EquipmentGuideCTA() {
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '2rem auto',
      padding: '0 2rem'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0.75rem',
        padding: '1.5rem 2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{flex: '1', minWidth: '250px'}}>
          <div style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '600',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            New Guide
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '0.5rem',
            lineHeight: '1.3'
          }}>
            Complete Video Call Equipment Setup
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}>
            Look professional for under $150 — ring light, webcam, green screen & mic
          </p>
        </div>
        <Link 
          href="/blog/video-call-equipment-guide"
          style={{
            background: 'white',
            color: '#667eea',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: '600',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            display: 'inline-block'
          }}
        >
          Read the Guide →
        </Link>
      </div>
    </div>
  );
}