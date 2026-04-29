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
        <h2 style={{
          fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
          fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          The Studio Journal
        </h2>
        <p style={{fontSize: '1.05rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.65}}>
          Notes on executive video presence, codec compression, and virtual set design.
        </p>
        <Link
          href="/blog"
          style={{
            background: '#111827',
            color: '#fff',
            padding: '0.95rem 1.75rem',
            borderRadius: '0',
            border: '1px solid #111827',
            borderBottom: '2px solid #9a6a3a',
            textDecoration: 'none',
            fontSize: '0.78rem',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            display: 'inline-block',
            transition: 'background-color 0.2s ease',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#000';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#111827';
          }}
        >
          Read the Journal →
        </Link>
      </div>
    </section>
  );
}