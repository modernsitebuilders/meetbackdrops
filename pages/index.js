// Complete pages/index.js - RESTORED to original good design
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useEffect } from 'react';
export default function Home() {
  const router = useRouter();
  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    } else {
      // In production, let the normal Link behavior work
      return;
    }
  };
  // ADD THIS: Track homepage visits
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Enhanced referrer tracking for homepage
      let referrer = document.referrer || 'direct';
      
      // Store original referrer for session
      if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
        sessionStorage.setItem('entry_referrer', document.referrer);
      }
      
      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/',
          category: 'homepage',
          referrer: referrer
        })
      }).catch(err => console.log('Homepage tracking failed:', err));
    }
  }, []);

  return (
  <Layout
    title="Free Professional Virtual Backgrounds - StreamBackdrops"
    description="Download 167+ free professional virtual backgrounds for Zoom, Teams & Google Meet..."
    currentPage="home"
  >

        {/* Hero Section - OPTIMIZED VIDEO */}
<section style={{
  position: 'relative',
  height: '80vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}}>
  <video 
    autoPlay 
    muted 
    playsInline 
    preload="metadata"
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '55%',
      height: 'auto',
      aspectRatio: '16/9',
      transform: 'translate(-50%, -50%)',
      objectFit: 'cover',
      zIndex: 1
    }}
  >
    <source src="https://stream-backdrops-videos.s3.amazonaws.com/u9972584128_Subtle_floating_light_particles_drifting_through__b01c2a5c-5dc6-410a-bbdb-704fa53bf572_0.mp4" type="video/mp4" />
  </video>
</section>

        {/* Text Section - SEPARATE */}
        <section style={{
          padding: '2rem 2rem',
          textAlign: 'center',
          background: 'white',
          marginTop: '-10vh'
        }}>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: '#111827'
          }}>
            Professional Virtual Backgrounds
          </h2>
          
          <p style={{ 
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6',
            color: '#6b7280'
          }}>
            Free high-quality backgrounds • No signup • No watermarks • Instant download
          </p>
        </section>
        <section style={{
  padding: '3rem 2rem',
  background: '#f8fafc',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  <h2 style={{
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#1e293b'
  }}>
    Expert Tips for Video Call Success
  </h2>
  
  <p style={{
    textAlign: 'center',
    color: '#64748b',
    marginBottom: '3rem'
  }}>
    Avoid common mistakes and look professional on every call
  </p>

  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gridAutoRows: '1fr',
    gap: '1.5rem'
  }}>
{/* Card 1 - Best Virtual Background Sites 2025 */}
<Link href="/blog-best-virtual-background-sites-2025" style={{ 
  textDecoration: 'none'
}}>
<div style={{
  background: 'white',
  padding: '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  height: '100%'
}}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      Best Free Background Sites 2025
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Complete comparison: StreamBackdrops vs competitors
    </p>
  </div>
</Link>

{/* Card 2 - Perfect Lighting Setup */}
<Link href="/blog-background-mistakes" style={{ 
  textDecoration: 'none'
}}>
<div style={{
  background: 'white',
  padding: '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  height: '100%'
}}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      Perfect Lighting Setup
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Look professional with proper lighting
    </p>
  </div>
</Link>

{/* Card 3 - 5-Minute Setup Guide */}
<Link href="/blog-background-mistakes" style={{ 
  textDecoration: 'none'
}}>
<div style={{
  background: 'white',
  padding: '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  height: '100%'
}}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      5-Minute Setup Guide
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Quick steps for perfect video calls
    </p>
  </div>
</Link>

{/* Card 4 - Choose the Right Style */}
<Link href="/blog-background-mistakes" style={{ 
  textDecoration: 'none'
}}>
<div style={{
  background: 'white',
  padding: '1rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  cursor: 'pointer',
  height: '100%'
}}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      Choose the Right Style
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Match your background to your industry
    </p>
  </div>
</Link>
</div>
</section>

        {/* 3-Column Grid with REAL IMAGES like Image 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '4rem',
          maxWidth: '1200px',
          margin: '0 auto 4rem auto',
          padding: '0 2rem'
        }}>
          
          {/* Well Lit - with REAL IMAGE */}
           <Link href="/category/well-lit" style={{ textDecoration: 'none' }}>
              <div 
               onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/well-lit');
    }
  }}
                style={{
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}>
              {/* Real Background Image */}
              <div style={{
                position: 'relative',
                height: '200px',
                overflow: 'hidden'
              }}>
                <Image
                 src="/images/well-lit/well-lit-minimalist-office-1.webp"
                  alt="Well-lit professional office background for video calls"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority={true}
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Well Lit
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Bright, professional backgrounds perfect for video calls and meetings
                </p>
              </div>
            </div>
          </Link>

          {/* Ambient Lighting - with REAL IMAGE */}
          <Link href="/category/ambient-lighting" style={{ textDecoration: 'none' }}>
              <div 
              onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/ambient-lighting');
    }
  }}
                style={{
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}>
              {/* Real Background Image */}
              <div style={{
                position: 'relative',
                height: '200px',
                overflow: 'hidden'
              }}>
                <Image
                 src="/images/ambient-lighting/ambient-industrial-shelves-1.webp"
                 alt="Ambient lighting office background for video meetings"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Ambient Lighting
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Soft lighting backgrounds for a warm, professional appearance
                </p>
              </div>
            </div>
          </Link>

          {/* Office Spaces - with REAL IMAGE */}
          <Link href="/category/office-spaces" style={{ textDecoration: 'none' }}>
              <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/office-spaces');
    }
  }}            
                style={{
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}>
              {/* Real Background Image */}
              <div style={{
                position: 'relative',
                height: '200px',
                overflow: 'hidden'
              }}>
                <Image
                 src="/images/office-spaces/office-spaces-minimalist-executive-1.webp"
                  alt="Professional office space background for business calls"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Office Spaces
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Modern office settings that convey professionalism and focus
                </p>
              </div>
            </div>
          </Link>

          {/* Living Room - with REAL IMAGE */}
          <Link href="/category/living-room" style={{ textDecoration: 'none' }}>
              <div 
               onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/living-room');
    }
  }} 
                style={{
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}>
              {/* Real Background Image */}
              <div style={{
                position: 'relative',
                height: '200px',
                overflow: 'hidden'
              }}>
                <Image
                 src="/images/living-room/living-room-29.webp"
                  alt="Comfortable living room backgrounds for casual meetings and personal video calls"
                  fill
                  style={{ objectFit: 'cover' }}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Living Room
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Comfortable home settings that feel welcoming and professional
                </p>
              </div>
            </div>
          </Link>
          {/* Kitchen Backgrounds */}
          <Link href="/category/kitchen" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/kitchen');
    }
  }} 
              style={{
              background: 'white',
              borderRadius: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                height: '200px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <img
                  src="/images/kitchen/kitchen9.webp"
                  alt="Kitchen virtual background"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="eager"
                />
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#111827'
}}>
                  Kitchen Backgrounds
                </h3>
                <p style={{ 
  color: '#6b7280', 
  marginBottom: '1rem' 
}}>
                  Warm kitchen spaces that create a friendly, approachable atmosphere
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Setup Guide Section - like in Image 2 */}
        <section style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          margin: '0 2rem',
          borderRadius: '1rem',
          marginBottom: '4rem'
        }}>
          <h3 style={{
            fontSize: '1.75rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827'
          }}>
            Need help setting up virtual backgrounds?
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '1.1rem',
            marginBottom: '2rem'
          }}>
            Check out our comprehensive setup guides for perfect results every time.
          </p>
          <Link 
            href="/blog-virtual-background-guide"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '2rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'inline-block'
            }}
          >
            View Complete Setup Guide
          </Link>
        </section>
      </Layout>
);
}