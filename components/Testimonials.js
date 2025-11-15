// components/Testimonials.js
export default function Testimonials() {
  return (
    <section style={{
      padding: '4rem 2rem',
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))',
      borderTop: '1px solid rgba(59, 130, 246, 0.1)',
      borderBottom: '1px solid rgba(59, 130, 246, 0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          What People Say
        </h2>
        <p style={{
  color: '#6b7280',
  marginBottom: '2rem'
}}>
  Real feedback from real users
</p>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: '#fbbf24',
            fontSize: '1.5rem'
          }}>
            ★★★★★
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#374151',
            fontStyle: 'italic',
            marginBottom: '1rem',
            lineHeight: '1.6'
          }}>
            "This is the best tool I have seen after urgently needing it"
          </p>
          <p style={{
            color: '#6b7280',
            fontWeight: '600'
          }}>
            — Evans O.
          </p>
        </div>
      </div>
    </section>
  );
}