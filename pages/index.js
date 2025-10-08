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
    // Skip tracking if admin
    if (localStorage.getItem('streambackdrops_admin') === 'true') {
      return;
    }
    
    let referrer = document.referrer || 'direct';
    
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
  description="Download 330+ free HD virtual backgrounds for Zoom, Teams & Google Meet. Professional quality backgrounds perfect for video calls and remote work."
  currentPage="home"
  canonical="https://streambackdrops.com"
>

 {/* Hero Section with H1 FIRST */}
<section style={{ 
  textAlign: 'center', 
  padding: '0.5rem 2rem 0.5rem', 
  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f9fafb 100%)'
}}>
  <h1 style={{
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '.5rem',
    lineHeight: '1.2'
  }}>
    Free Professional Virtual Backgrounds
  </h1>
  <p style={{
    fontSize: '1.25rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto 2rem'
  }}>
    Download 330+ HD virtual backgrounds for Zoom, Teams & Google Meet. Perfect for professional video calls and remote work.
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
<Link href="/blog-best-virtual-background-sites-2025" style={{ textDecoration: 'none' }}>
  <div className="blog-card">
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
      Best Free Background Sites 2025
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Complete comparison: StreamBackdrops vs competitors
    </p>
  </div>
</Link>

{/* Card 2 - Perfect Lighting Setup */}
<Link href="/blog-background-mistakes" style={{ textDecoration: 'none' }}>
  <div className="blog-card">
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
      Perfect Lighting Setup
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Look professional with proper lighting
    </p>
  </div>
</Link>

{/* Card 3 - 5-Minute Setup Guide */}
<Link href="/blog-background-mistakes" style={{ textDecoration: 'none' }}>
  <div className="blog-card">
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b' }}>
      5-Minute Setup Guide
    </h3>
    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
      Quick steps for perfect video calls
    </p>
  </div>
</Link>

{/* Card 4 - Halloween Backgrounds (SEASONAL) */}
<Link href="/blog-halloween-backgrounds" style={{ textDecoration: 'none' }}>
  <div className="blog-card" style={{
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    border: '2px solid #ff6b35'
  }}>
    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎃</div>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
      Halloween Backgrounds 2025
    </h3>
    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
      25 free spooky backgrounds for October
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

          {/* Bookshelves Bright - with REAL IMAGE */}
<Link href="/category/bookshelves-bright" style={{ textDecoration: 'none' }}>
              <div
               onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/bookshelves-bright');
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
  src="/images/bookshelves-bright/well-lit-12.webp"
  alt="Bright bookshelf background for video calls"
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
  Bookshelves - Bright
</h3>
<p style={{ color: '#6b7280', marginBottom: '1rem' }}>
  Bright bookshelf backgrounds perfect for professional video calls
</p>
              </div>
            </div>
          </Link>

          {/* Bookshelves Dark - with REAL IMAGE */}
          <Link href="/category/bookshelves-dark" style={{ textDecoration: 'none' }}>
              <div 
              onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/bookshelves-dark');
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
  src="/images/bookshelves-dark/ambient-01.webp"
  alt="Dark bookshelf background for video meetings"
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
  Bookshelves - Dark
</h3>
<p style={{ color: '#6b7280', marginBottom: '1rem' }}>
  Warm bookshelf backgrounds with ambient lighting for professional calls
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
                 src="/images/office-spaces/office-spaces-01.webp"
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

          {/* Living Rooms- with REAL IMAGE */}
          <Link href="/category/living-rooms" style={{ textDecoration: 'none' }}>
              <div 
               onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/living-rooms');
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
                 src="/images/living-rooms/living-room-29.webp"
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
                  Living Rooms
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                  Comfortable home settings that feel welcoming and professional
                </p>
              </div>
            </div>
          </Link>
          {/* Kitchens Backgrounds */}
          <Link href="/category/kitchens" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/kitchens');
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
                 src="/images/kitchens/kitchen-09.webp"
                  alt="Kitchen virtual background"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="eager"
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
          {/* Coffee Shops */}
          <Link href="/category/coffee-shops" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/coffee-shops');
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
                <Image
                  src="/images/coffee-shops/coffee-shop-10.webp"
                  alt="Coffee shop virtual background"
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
                  Coffee Shops
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Cozy coffee shop backgrounds for casual meetings and creative collaborations
                </p>
              </div>
            </div>
          </Link>

          {/* Art Galleries */}
          <Link href="/category/art-galleries" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/art-galleries');
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
                <Image
                  src="/images/art-galleries/art-gallery-1.webp"
                  alt="Art gallery virtual background"
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
                  Art Galleries
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Sophisticated art gallery spaces with clean walls and artistic flair
                </p>
              </div>
            </div>
          </Link>

          {/* Urban Lofts */}
          <Link href="/category/urban-lofts" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/urban-lofts');
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
                <Image
                  src="/images/urban-lofts/urban-loft-1.webp"
                  alt="Urban loft virtual background"
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
                  Urban Lofts
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Modern industrial loft spaces with exposed brick and contemporary design
                </p>
              </div>
            </div>
          </Link>

          {/* Gardens & Patios */}
          <Link href="/category/gardens-patios" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/gardens-patios');
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
                <Image
                  src="/images/gardens-patios/garden-patio-1.webp"
                  alt="Garden and patio virtual background"
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
                  Gardens & Patios
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Beautiful outdoor garden and patio backgrounds that bring natural beauty
                </p>
              </div>
            </div>
          </Link>

          {/* Historic Spaces */}
          <Link href="/category/historic-spaces" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/historic-spaces');
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
                <Image
                  src="/images/historic-spaces/historic-space-6.webp"
                  alt="Historic space virtual background"
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
                  Historic Spaces
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Elegant historic interiors including ballrooms and Art Deco corridors
                </p>
              </div>
            </div>
          </Link>

          {/* Nature & Landscapes */}
          <Link href="/category/nature-landscapes" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/nature-landscapes');
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
                <Image
                  src="/images/nature-landscapes/nature-landscape-1.webp"
                  alt="Nature landscape virtual background"
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
                  Nature & Landscapes
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Stunning natural landscapes including mountains, deserts, and scenic views
                </p>
              </div>
            </div>
          </Link>

          {/* Libraries */}
          <Link href="/category/libraries" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/libraries');
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
                <Image
                  src="/images/libraries/library-1.webp"
                  alt="Library virtual background"
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
                  Libraries
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Classic library rooms with floor-to-ceiling books for academic settings
                </p>
              </div>
            </div>
          </Link>
          {/* Halloween Backgrounds */}
          <Link href="/category/halloween-backgrounds" style={{ textDecoration: 'none' }}>
            <div 
            onClick={(e) => {
    if (process.env.NODE_ENV === 'development') {
      e.preventDefault();
      e.stopPropagation();
      navigate('/category/halloween-backgrounds');
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
                <Image
                  src="/images/halloween-backgrounds/halloween-background-11.webp"
                  alt="Halloween virtual background"
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
                  Halloween Backgrounds 🎃
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  marginBottom: '1rem' 
                }}>
                  Festive Halloween backgrounds with pumpkins and fall decor for seasonal calls
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

{/* SEO-Rich Content Section */}
<section style={{
  background: 'white',
  padding: '4rem 2rem',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
    
    <h3 style={{
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      textAlign: 'center'
    }}>
      Professional Virtual Backgrounds for Every Video Call
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '2rem'
    }}>
      StreamBackdrops offers the largest collection of free, high-quality virtual backgrounds designed specifically for professional video conferencing. Whether you're joining a Zoom meeting, Microsoft Teams call, or Google Meet session, our curated backgrounds help you maintain a polished, professional appearance from any location.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Why Choose Our Virtual Backgrounds?
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      Unlike generic stock photo sites, every background in our collection is optimized for video calls. We carefully design each image with proper lighting, color balance, and composition to ensure you look your best on camera. Our backgrounds work seamlessly with all major video platforms including Zoom, Microsoft Teams, Google Meet, Skype, and WebEx.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Perfect for Remote Work and Hybrid Teams
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      The modern workplace demands flexibility. Whether you're working from home, a coffee shop, or traveling, our virtual backgrounds ensure you always present a professional image. Choose from well-lit office spaces for client meetings, ambient-lit environments for casual team calls, or comfortable living room settings for 1-on-1 conversations.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Free HD Downloads - No Signup Required
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      All our virtual backgrounds are completely free to download and use. No subscription fees, no watermarks, no hidden costs. Simply browse our categories, click your favorite background, and download instantly in HD quality. We believe professional video call backgrounds should be accessible to everyone.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      How to Use Virtual Backgrounds
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1rem'
    }}>
      Setting up a virtual background is simple across all platforms:
    </p>

    <div style={{
      background: '#f9fafb',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    }}>
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '1rem'
      }}>
        <strong>Zoom:</strong> Click the arrow next to "Stop Video" → Choose "Virtual Background" → Click the + icon to upload your downloaded background.
      </p>
      
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '1rem'
      }}>
        <strong>Microsoft Teams:</strong> In a meeting, click the three dots → "Apply background effects" → "+ Add new" to upload your background.
      </p>
      
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '0'
      }}>
        <strong>Google Meet:</strong> Before joining, click "Change background" → Click the + icon → Select your downloaded image.
      </p>
    </div>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '2.5rem'
    }}>
      Tips for Best Results
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1rem'
    }}>
      For optimal virtual background performance, ensure good lighting facing you, avoid busy patterns in your clothing, and position yourself at a consistent distance from your webcam. Our backgrounds are designed to work with standard webcam setups, but better lighting always improves edge detection and overall video quality.
    </p>

    <div style={{
      background: '#eff6ff',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginTop: '3rem',
      border: '1px solid #bfdbfe',
      textAlign: 'center'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: '1rem'
      }}>
        Ready to Elevate Your Video Calls?
      </h3>
      <p style={{
        fontSize: '1.1rem',
        color: '#1e40af',
        marginBottom: '1.5rem'
      }}>
        Browse our collection of 330+ professional virtual backgrounds and find the perfect backdrop for your next meeting.
      </p>
      <Link href="/category/bookshelves-bright" style={{
  display: 'inline-block',
  background: '#2563eb',
  color: 'white',
  padding: '1rem 2rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1.1rem',
  transition: 'background 0.2s'
}}>
  Browse Backgrounds →
</Link>
    </div>
  </div>
</section>
      </Layout>
);
}