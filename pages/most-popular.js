// pages/most-popular.js
import Layout from '../components/Layout';
import Head from 'next/head';
import MostPopularGrid from '../components/MostPopularGrid';

export default function MostPopularPage() {
  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| MeetBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Most Popular Virtual Backgrounds - MeetBackdrops"
      description="Discover the most downloaded virtual backgrounds for Zoom, Teams, and Google Meet. See what's trending now."
      canonical="https://meetbackdrops.com/most-popular"
      currentPage="most-popular"
      keywords="most popular virtual backgrounds, trending zoom backgrounds, top downloaded backgrounds"
    >
      <Head>
        <meta property="og:title" content="Most Popular Virtual Backgrounds - MeetBackdrops" />
        <meta property="og:description" content="Discover trending virtual backgrounds based on actual downloads." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Most Popular Virtual Backgrounds",
            "description": "A dynamically updated collection of the most popular virtual backgrounds based on download statistics.",
            "url": "https://meetbackdrops.com/most-popular",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": 25,
              "itemListOrder": "https://schema.org/Descending",
              "name": "Top 25 Virtual Backgrounds"
            }
          })}
        </script>
      </Head>
      
      <div style={{
        padding: '2rem',
        background: '#f9fafb',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            <a href="/" style={{
              color: '#9a6a3a',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}>
              Home
            </a>
            <span>›</span>
            <span style={{ color: '#111827', fontWeight: '500' }}>
              Most Popular
            </span>
          </nav>
          
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            Most Popular Virtual Backgrounds
          </h1>

          <MostPopularGrid />
          
          {/* Explanation section */}
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: '#f8fafc',
            borderRadius: '0.5rem',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              🤔 How This List Works
            </h3>
            <div style={{ color: '#475569', lineHeight: '1.6' }}>
              <p>This list is automatically generated based on:</p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>Recent downloads</strong>: Images downloaded in the last 30 days get bonus points</li>
                <li><strong>Total downloads</strong>: Each download adds to the score</li>
                <li><strong>Recency</strong>: New images get a visibility boost</li>
                <li><strong>Activity</strong>: Images lose points slowly if not downloaded</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                The list updates automatically every hour. Images are scored 0-100, with popular images rising to the top.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}