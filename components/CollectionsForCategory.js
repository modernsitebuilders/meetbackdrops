// components/CollectionsForCategory.js
//
// "Popular with these professions" strip rendered on category pages. Links out
// to the persona collections that draw from the current category (computed
// deterministically in lib/collections/engine.js → getCollectionsForCategory).
// This is the inbound half of the collection internal-linking loop: collections
// link into canonical category image pages; category pages link back out to the
// relevant collections.
//
// Renders nothing when no collection draws from the category (e.g. seasonal
// categories), so it is safe to drop into every category page unconditionally.

import Link from 'next/link';

export default function CollectionsForCategory({ collections = [], max = 6 }) {
  if (!collections || collections.length === 0) return null;
  const shown = collections.slice(0, max);

  return (
    <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
      }}>
        Curated for professionals
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 600,
        color: '#111827', margin: '0 0 0.6rem', letterSpacing: '-0.01em',
      }}>
        Popular with these professions
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.6, maxWidth: '640px' }}>
        We curate these backgrounds into profession-specific collections — see them in context for your line of work.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {shown.map((c) => (
          <Link prefetch={false}
            key={c.slug}
            href={`/collections/${c.slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.6rem 1.1rem', borderRadius: '999px',
              border: '1px solid #e5e7eb', background: '#fafafa', color: '#374151',
              fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
            }}
          >
            {c.persona}
            <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
