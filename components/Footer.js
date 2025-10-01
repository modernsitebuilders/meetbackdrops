import Link from 'next/link';
import CityGuideNav from '@/app/components/CityGuideNav';

export const metadata = {
  title: 'SF Dumpster Rental | Permits & Local Companies',
  description: 'Complete guide to San Francisco dumpster rental. Nation\'s highest permit fees ($3,076/year), strict environmental rules, and trusted Bay Area providers.',
  alternates: {
    canonical: 'https://dumpster-size-calculator.com/dumpster-rental-san-francisco'
  },
  openGraph: {
    title: 'SF Dumpster Rental | Permits & Local Companies',
    description: 'Complete guide to San Francisco dumpster rental with permit requirements and local providers.',
    url: 'https://dumpster-size-calculator.com/dumpster-rental-san-francisco',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  }
};

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
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              Background Categories
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/category/well-lit" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Well-Lit Backgrounds
              </Link>
              <Link href="/category/office-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Office Spaces
              </Link>
              <Link href="/category/living-room" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Living Room
              </Link>
              <Link href="/category/kitchen" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Kitchen Backgrounds
              </Link>
              <Link href="/category/ambient-lighting" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Ambient Lighting
              </Link>
            </div>
          </div>
          
          <div>
  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
    Helpful Guides
  </h3>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <Link href="/blog-video-call-etiquette" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Video Call Etiquette
    </Link>
    <Link href="/blog-virtual-background-guide" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Setup Guide
    </Link>
    <Link href="/blog-background-mistakes" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Common Mistakes
    </Link>
    <Link href="/blog-lighting-tips" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
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
        </div>
      </div>
    </footer>
  );
}