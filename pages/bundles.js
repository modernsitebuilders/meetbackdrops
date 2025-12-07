import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Layout from '../components/Layout';

export default function Bundles() {
  useEffect(() => {
    let scrollTracked = false;

    const handleScroll = () => {
      if (scrollTracked) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      // Track when user scrolls to see preview images (50% down page)
      if (scrollPercent > 50) {
        scrollTracked = true;
        
        fetch('/api/track-bundle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'bundle_scroll',
            bundle: 'christmas',
            price: 12,
            sessionId: localStorage.getItem('sessionId') || 'unknown',
            visitorId: localStorage.getItem('visitorId') || 'unknown'
          })
        }).catch(err => console.error('Tracking failed:', err));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const trackBuyClick = () => {
    fetch('/api/track-bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'bundle_click',
        bundle: 'christmas',
        price: 12,
        sessionId: localStorage.getItem('sessionId') || 'unknown',
        visitorId: localStorage.getItem('visitorId') || 'unknown'
      })
    }).catch(err => console.error('Tracking failed:', err));
  };

  return (
    <Layout
      title="Premium Background Bundles - StreamBackdrops"
      description="Download curated collections of professional virtual backgrounds. Skip the 5/day limit with instant access to complete sets."
      canonical="https://streambackdrops.com/bundles"
    >
      <div style={{ 
        background: '#f8fafc', 
        minHeight: '100vh',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '2rem 0'
        }}>
          
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            padding: '3rem',
            borderRadius: '1rem',
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Background Bundles
            </h1>
            <p style={{
              fontSize: '1.25rem',
              opacity: 0.9,
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              Skip the wait. Get instant access to curated collections of our best backgrounds.
            </p>
          </div>

          {/* Christmas Bundle - Single Unified Section */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem'
          }}>
            
            {/* Bundle Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '400px 1fr',
              gap: '2rem',
              alignItems: 'center',
              paddingBottom: '2rem',
              borderBottom: '1px solid #e5e7eb',
              marginBottom: '2rem'
            }}>
              
              <div style={{
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                height: '300px'
              }}>
                <img 
                  src="/images/christmas-backgrounds/christmas-background-35.webp"
                  alt="Christmas Backgrounds Bundle"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              <div>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Christmas Backgrounds Collection
                </h2>
                
                <p style={{
                  fontSize: '1.1rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  lineHeight: '1.6'
                }}>
                  25 high-quality Christmas backgrounds perfect for Zoom, Teams, and Google Meet. Instant download.
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#059669', marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#374151' }}>25 professional Christmas backgrounds</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#059669', marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#374151' }}>High-resolution PNG files</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#059669', marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#374151' }}>Instant download - use immediately</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    color: '#111827'
                  }}>
                    $12
                  </div>
                  <a 
                    href="https://modernbuilderdave.gumroad.com/l/christmas-bundle"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackBuyClick}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '1rem 2rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontWeight: '600',
                      fontSize: '1.1rem'
                    }}
                  >
                    Buy Now →
                  </a>
                </div>
              </div>
            </div>

            {/* Image Preview Gallery */}
            <div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>
                All 25 Backgrounds Included:
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  '01', '02', '04', '06', '09', '10', '11', '12', '14', '26',
                  '34', '35', '41', '42', '44', '46', '72', '81', '103', '112',
                  '113', '116', '126', '142', '146'
                ].map((num) => (
                  <div
                    key={num}
                    style={{
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      border: '2px solid #e5e7eb',
                      aspectRatio: '16/9'
                    }}
                  >
                    <img
                      src={`/images/christmas-backgrounds/christmas-background-${num}.webp`}
                      alt={`Christmas Background ${num}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Free Option Reminder */}
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginTop: '2rem',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              Not ready to buy? All backgrounds are still available for free (5 downloads per day).
            </p>
            <Link href="/category/christmas-backgrounds" style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '600'
            }}>
              Browse Free Christmas Backgrounds →
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  );
}