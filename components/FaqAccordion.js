// components/FaqAccordion.js
//
// Visible FAQ accordion used by both persona collection pages
// (/collections/{slug}) and category pages (/category/{slug}).
//
// FAQPage JSON-LD schema for these same questions is emitted separately —
// rendering the FAQs visibly here is what makes Google's content/schema
// cross-check pass cleanly. Schema-only FAQs are increasingly downgraded
// because they make claims the page doesn't visibly support.

export default function FaqAccordion({ faqs, eyebrow = 'Frequently Asked', heading = 'Frequently asked questions' }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}>
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 600,
        color: '#111827', margin: '0 0 1.5rem', letterSpacing: '-0.01em',
      }}>
        {heading}
      </h2>
      <div style={{ maxWidth: '760px' }}>
        {faqs.map((f, i) => (
          <details
            key={i}
            style={{
              borderTop: i === 0 ? '1px solid #e6e2dc' : 'none',
              borderBottom: '1px solid #e6e2dc',
              padding: '1rem 0',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '1.02rem',
                fontWeight: 600,
                color: '#111827',
                listStyle: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <span>{f.question}</span>
              <span aria-hidden="true" style={{ color: '#9a6a3a', fontSize: '1.3rem', lineHeight: 1 }}>+</span>
            </summary>
            <p style={{ marginTop: '0.75rem', marginBottom: 0, color: '#4b5563', lineHeight: 1.7, fontSize: '0.97rem' }}>
              {f.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
