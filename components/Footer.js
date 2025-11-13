import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: '#1f2937',
      color: 'white',
      padding: '3rem 0 2rem',
      marginTop: '3rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        
        {/* Category Links Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <div style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              Background Categories
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <Link href="/category/most-popular" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                Most Popular
              </Link>
              <span style={{ color: '#9ca3af', margin: '0 0.5rem' }}>•</span>
              <Link href="/category/recently-added" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                Recently Added
              </Link>
            </div>
            <div style={{ borderBottom: '1px solid #374151', marginBottom: '1rem' }}></div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.5rem 2rem' 
            }}>
              <Link href="/category/bookshelves-bright" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Bookshelves - Bright
              </Link>
              <Link href="/category/office-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Office Spaces
              </Link>
              <Link href="/category/bookshelves-dark" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Bookshelves - Dark
              </Link>
              <Link href="/category/living-rooms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Living Rooms
              </Link>
              <Link href="/category/wall-shelves-bright" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Wall Shelves - Bright
              </Link>
              <Link href="/category/kitchens" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Kitchens
              </Link>
              <Link href="/category/wall-shelves-dark" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Wall Shelves - Dark
              </Link>
              <Link href="/category/coffee-shops" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Coffee Shops
              </Link>
              <Link href="/category/art-galleries" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Art Galleries
              </Link>
              <Link href="/category/urban-lofts" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Urban Lofts
              </Link>
              <Link href="/category/gardens-patios" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Gardens & Patios
              </Link>
              <Link href="/category/historic-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Historic Spaces
              </Link>
              <Link href="/category/nature-landscapes" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Nature & Landscapes
              </Link>
              <Link href="/category/libraries" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Libraries
              </Link>
              <Link href="/category/bokeh-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Bokeh Backgrounds
              </Link>
              <Link href="/category/christmas-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Christmas 🎄
              </Link>
              <Link href="/category/halloween-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Halloween 🎃
              </Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              Helpful Guides
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/blog/job-interview-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Job Interview Backgrounds
              </Link>
              <Link href="/blog/video-call-etiquette" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Video Call Etiquette
              </Link>
              <Link href="/blog/virtual-background-guide" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Setup Guide
              </Link>
              <Link href="/blog/background-mistakes" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
  Common Mistakes
</Link>
              <Link href="/blog/lighting-tips" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Lighting Tips
              </Link>
              <Link href="/blog" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                All Blog Posts
              </Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              StreamBackdrops
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Home
              </Link>
              <Link href="/search" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Search
              </Link>
              <Link href="/faq" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                FAQ
              </Link>
              <Link href="/about" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                About Us
              </Link>
              <Link href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem' }}>
          {/* Legal Links */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginBottom: '1rem', 
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <Link href="/license" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
              License & Usage
            </Link>
            <span style={{ color: '#9ca3af' }}>•</span>
            <Link href="/privacy" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
              Privacy Policy
            </Link>
            <span style={{ color: '#9ca3af' }}>•</span>
            <Link href="/terms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
              Terms of Service
            </Link>
          </div>
          
          {/* Copyright */}
          <p style={{ color: '#9ca3af', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}>
            © 2025 StreamBackdrops. All rights reserved.
          </p>
          
          {/* Modern Site Builders Credit */}
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', textAlign: 'center', fontSize: '0.85rem' }}>
            A Modern Site Builders Production
          </p>
        </div>
      </div>
    </footer>
  );
}