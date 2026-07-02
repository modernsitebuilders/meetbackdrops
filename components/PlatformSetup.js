// components/PlatformSetup.js
//
// Renders a platform's setup steps as a visible numbered how-to. The SAME steps
// are emitted as HowTo schema by lib/platforms/engine.js, so Google's
// visible-content ↔ structured-data cross-check matches. Used on both the
// platform landing and every platform × theme page.

export default function PlatformSetup({ platform }) {
  if (!platform?.setupSteps?.length) return null;
  return (
    <section
      id="setup"
      style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid #e6e2dc' }}
    >
      <div style={{
        fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
        color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
      }}>
        Setup — 30 seconds
      </div>
      <h2 style={{
        fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
        fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: '0 0 1.25rem',
      }}>
        {platform.setupHeading}
      </h2>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', maxWidth: '640px', display: 'grid', gap: '0.75rem' }}>
        {platform.setupSteps.map((step, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, width: '1.6rem', height: '1.6rem', borderRadius: '999px',
              background: '#111827', color: '#fff', fontSize: '0.8rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i + 1}
            </span>
            <span style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.55, paddingTop: '0.15rem' }}>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
