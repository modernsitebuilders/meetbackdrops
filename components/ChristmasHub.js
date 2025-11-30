import Card from './Card';

export default function ChristmasHub() {
  const christmasCategories = [
    {
      slug: 'christmas-modern',
      name: 'Modern Christmas',
      description: 'Contemporary holiday backgrounds with clean lines and stylish decor',
      count: 54,
      imageSrc: '/images/christmas-modern/christmas-modern-01.webp'
    },
    {
      slug: 'christmas-traditional',
      name: 'Traditional Christmas',
      description: 'Classic holiday backgrounds with warm colors and cozy fireplaces',
      count: 35,
      imageSrc: '/images/christmas-traditional/christmas-traditional-01.webp'
    },
    {
      slug: 'christmas-rustic',
      name: 'Rustic Christmas',
      description: 'Farmhouse and cabin holiday backgrounds with natural charm',
      count: 38,
      imageSrc: '/images/christmas-rustic/christmas-rustic-01.webp'
    }
  ];

  return (
    <div style={{
      padding: '2rem',
      background: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1rem'
          }}>
            Christmas Virtual Backgrounds 🎄
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            127 festive Christmas backgrounds across three beautiful styles. 
            Choose your perfect holiday aesthetic for video calls.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {christmasCategories.map((cat, index) => (
            <Card
              key={cat.slug}
              href={`/category/${cat.slug}`}
              title={cat.name}
              description={cat.description}
              imageSrc={cat.imageSrc}
              imageAlt={`${cat.name} background preview`}
              count={cat.count}
              priority={index === 0}
            />
          ))}
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827'
          }}>
            About Our Christmas Backgrounds
          </h2>
          <p style={{
            color: '#6b7280',
            lineHeight: '1.7',
            marginBottom: '1rem'
          }}>
            Our Christmas virtual backgrounds are professionally designed for video calls with proper lighting and composition. 
            Each style offers a unique holiday aesthetic perfect for Zoom, Teams, and Google Meet.
          </p>
          <ul style={{
            color: '#6b7280',
            lineHeight: '1.7',
            paddingLeft: '1.5rem'
          }}>
            <li><strong>Modern Christmas:</strong> Clean, contemporary spaces with stylish holiday accents</li>
            <li><strong>Traditional Christmas:</strong> Warm, classic settings with fireplaces and rich colors</li>
            <li><strong>Rustic Christmas:</strong> Cozy farmhouse and cabin vibes with natural materials</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
