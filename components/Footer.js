import Link from 'next/link';
import { wolfresumeUrl } from '../lib/wolfresumeUrl';

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
              <Link prefetch={false} href="/most-popular" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                Most Popular
              </Link>
              <span style={{ color: '#9ca3af', margin: '0 0.5rem' }}>•</span>
              <Link prefetch={false} href="/category/recently-added" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
                Recently Added
              </Link>
            </div>
            <div style={{ borderBottom: '1px solid #374151', marginBottom: '1rem' }}></div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '0.5rem 2rem' 
            }}>
              <Link prefetch={false} href="/category/bookshelves" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Bookshelves
              </Link>
              <Link prefetch={false} href="/category/office-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Office Spaces
              </Link>
              <Link prefetch={false} href="/category/home-office" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Home Offices
              </Link>
              <Link prefetch={false} href="/category/neutral-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Neutral & Plain Walls
              </Link>
              <Link prefetch={false} href="/category/wall-shelves" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Wall Shelves
              </Link>
              <Link prefetch={false} href="/category/living-rooms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Living Rooms
              </Link>
              <Link prefetch={false} href="/category/kitchens" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Kitchens
              </Link>
              <Link prefetch={false} href="/category/office-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Office Spaces
              </Link>
              <Link prefetch={false} href="/category/coffee-shops" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Coffee Shops
              </Link>
              <Link prefetch={false} href="/category/art-galleries" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Art Galleries
              </Link>
              <Link prefetch={false} href="/category/urban-lofts" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Urban Lofts
              </Link>
              <Link prefetch={false} href="/category/gardens-patios" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Gardens & Patios
              </Link>
              <Link prefetch={false} href="/category/historic-spaces" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Historic Spaces
              </Link>
              <Link prefetch={false} href="/category/nature-landscapes" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Nature & Landscapes
              </Link>
              <Link prefetch={false} href="/category/libraries" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Libraries
              </Link>
              <Link prefetch={false} href="/category/bokeh-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Bokeh Backgrounds
              </Link>
              <Link prefetch={false} href="/category/christmas-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Christmas 🎄
              </Link>
              <Link prefetch={false} href="/category/halloween-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Halloween 🎃
              </Link>
              <Link prefetch={false} href="/category/valentines-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
  Valentine's Day 💕
</Link>
              <Link prefetch={false} href="/category/easter-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Easter 🐣
              </Link>
              <Link prefetch={false} href="/category/spring-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Spring 🌸
              </Link>
              <Link prefetch={false} href="/category/summer-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Summer ☀️
              </Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              By Profession
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link prefetch={false} href="/collections" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                All Collections →
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-lawyers" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Lawyers & Legal
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-therapists" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Therapists
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-realtors" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Realtors
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-consultants" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Consultants
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-financial-advisors" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Financial Advisors
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-healthcare" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Healthcare
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-teachers" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Teachers
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-tech-professionals" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Tech Professionals
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-recruiters" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Recruiters
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-sales" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Sales
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-coaches" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Coaches
              </Link>
              <Link prefetch={false} href="/collections/zoom-backgrounds-for-accountants" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                For Accountants
              </Link>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              Helpful Guides
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link prefetch={false} href="/blog/job-interview-backgrounds" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Job Interview Backgrounds
              </Link>
              <Link prefetch={false} href="/blog/best-virtual-background-sites-2026" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Best Background Sites 2026
              </Link>
              <Link prefetch={false} href="/blog/virtual-background-guide" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Setup Guide
              </Link>
              <Link prefetch={false} href="/blog/background-mistakes" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
  Common Mistakes
</Link>
              <Link prefetch={false} href="/blog/lighting-tips" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Lighting Tips
              </Link>
              <Link prefetch={false} href="/blog" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                All Blog Posts
              </Link>
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#f3f4f6' }}>
              Company
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link prefetch={false} href="/" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Home
              </Link>
              <Link prefetch={false} href="/free-sample" style={{ color: '#fbbf24', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
                Free HD Sample
              </Link>
              <Link prefetch={false} href="/branded-backgrounds" style={{ color: '#c79a6b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                Branded Backgrounds
              </Link>
              <Link prefetch={false} href="/hd" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                HD Editions
              </Link>
<Link prefetch={false} href="/faq" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                FAQ
              </Link>
              <Link prefetch={false} href="/about" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                About Us
              </Link>
              <Link prefetch={false} href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
                Contact
              </Link>
              <a href={wolfresumeUrl('footer_global')} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Also: WolfResume.com — AI Resumes
              </a>
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
    <Link prefetch={false} href="/license" style={{ color: '#fbbf24', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
      License & Usage
    </Link>
    <span style={{ color: '#e5e7eb' }}>•</span>
    <Link prefetch={false} href="/commercial-license" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Commercial License
    </Link>
    <span style={{ color: '#e5e7eb' }}>•</span>
    <Link prefetch={false} href="/privacy" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Privacy Policy
    </Link>
    <span style={{ color: '#e5e7eb' }}>•</span>
    <Link prefetch={false} href="/terms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
      Terms of Service
    </Link>
  </div>
  
  {/* Copyright */}
  <p style={{ color: '#e5e7eb', margin: 0, textAlign: 'center', fontSize: '0.9rem' }}>
    © 2026 MeetBackdrops. All rights reserved.
  </p>
  
  {/* Modern Site Builders Credit */}
  <p style={{ color: '#e5e7eb', margin: '0.5rem 0 0 0', textAlign: 'center', fontSize: '0.85rem' }}>
    <a href="https://modernsitebuilders.com" target="_blank" rel="noopener" style={{ color: '#e5e7eb', textDecoration: 'underline' }}>
      A Modern Site Builders Production
    </a>
  </p>

  {/* Trust Badges Section */}
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
  {/* OpenHunts Badge */}
  <a href="https://openhunts.com" target="_blank" rel="noopener noreferrer" title="OpenHunts Club">
    <img 
      alt="OpenHunts Club Member" 
      height="105" 
      src="https://cdn.openhunts.com/badges/club.webp" 
      style={{ width: '195px', height: 'auto' }} 
      width="486" 
    />
  </a>
  
  {/* SaaSHub Badge */}
  <a 
    href="https://www.saashub.com/meetbackdrops?utm_source=badge&utm_campaign=badge&utm_content=meetbackdrops&badge_variant=color&badge_kind=approved"
    target="_blank" 
    rel="noopener noreferrer"
  >
    <img
      src="https://cdn-b.saashub.com/img/badges/approved-color.png?v=1"
      alt="MeetBackdrops badge"
      width={300}
      height={100}
      loading="lazy"
      decoding="async"
      style={{ maxWidth: '150px', height: 'auto' }}
    />
  </a>
</div>

</div>
      </div>
    </footer>
  );
}