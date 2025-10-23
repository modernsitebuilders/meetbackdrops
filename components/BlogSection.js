import Link from 'next/link';

export default function BlogSection() {
  return (
    <section style={{
      background: '#f8fafc',
      padding: '4rem 0',
      margin: '4rem 0',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <h2 style={{fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem'}}>
          Expert Tips & Guides
        </h2>
        <p style={{fontSize: '1.1rem', color: '#6b7280', marginBottom: '2rem'}}>
          Learn professional video call techniques, setup guides, and industry best practices
        </p>
        <Link 
          href="/blog" 
          style={{
            background: '#2563eb',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontSize: '1.1rem',
            fontWeight: '600',
            display: 'inline-block',
            transition: 'background-color 0.2s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1d4ed8';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2563eb';
          }}
        >
          Read Our Blog →
        </Link>
      </div>
    </section>
  );
}