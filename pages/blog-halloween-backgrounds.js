// pages/blog-halloween-backgrounds.js
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import Footer from '../components/Footer';

export default function HalloweenBackgrounds() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let referrer = document.referrer || 'direct';
      
      if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
        sessionStorage.setItem('entry_referrer', document.referrer);
      }
      
      const sessionReferrer = sessionStorage.getItem('entry_referrer');
      if (sessionReferrer && (referrer === 'direct' || referrer.includes('streambackdrops.com'))) {
        referrer = sessionReferrer;
      }

      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/blog-halloween-backgrounds',
          category: 'blog',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  return (
    <>
      <Head>
        <title>Best Halloween Virtual Backgrounds for Video Calls 2025 | StreamBackdrops</title>
        <meta name="description" content="Download 25 free Halloween virtual backgrounds for Zoom, Teams, and Google Meet. Spooky seasonal backgrounds with pumpkins, fall decor, and autumn atmosphere for October video calls." />
        <meta name="keywords" content="halloween virtual backgrounds, halloween zoom backgrounds, halloween video call backgrounds, spooky backgrounds, fall backgrounds, october backgrounds, seasonal backgrounds" />
        <link rel="canonical" href="https://streambackdrops.com/blog-halloween-backgrounds" />
        <meta property="og:title" content="Best Halloween Virtual Backgrounds for Video Calls 2025" />
        <meta property="og:description" content="Download 25 free Halloween virtual backgrounds perfect for your October video calls. Festive, professional, and completely free." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://streambackdrops.com/blog-halloween-backgrounds" />
      </Head>

      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              textDecoration: 'none'
            }}>
              🎥 StreamBackdrops
            </Link>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/" style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: '#f3f4f6',
                transition: 'all 0.2s'
              }}>
                🏠 Home
              </Link>
              
              <Link href="/blog" style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: '#f3f4f6',
                transition: 'all 0.2s'
              }}>
                📚 All Guides
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section with Halloween Theme */}
      <div style={{
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #1e3a8a 100%)',
        padding: '3rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎃</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1rem',
            lineHeight: '1.2'
          }}>
            Best Halloween Virtual Backgrounds for 2025
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Make your October video calls festive with our free collection of 25 professional Halloween backgrounds
          </p>
        </div>
      </div>

      {/* Main Content */}
      <article style={{
        background: '#f8fafc',
        minHeight: '100vh',
        padding: '3rem 2rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          padding: 'clamp(2rem, 5vw, 4rem)',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>

          {/* Introduction */}
          <section style={{ marginBottom: '3rem' }}>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              Halloween is the perfect time to add some festive flair to your video calls. Whether you're working remotely, teaching online classes, or hosting virtual Halloween parties, the right background can set the mood without being too distracting.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              We've curated <strong>25 free Halloween virtual backgrounds</strong> that strike the perfect balance between festive and professional. From cozy fall porches to decorated seasonal spaces, these backgrounds work great for any October video call.
            </p>
          </section>

          {/* Preview Image */}
          <div style={{
            marginBottom: '3rem',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <Link href="/category/halloween-backgrounds">
              <Image
                src="/images/halloween-backgrounds/halloween-background-20.webp"
                alt="Halloween virtual background preview"
                width={800}
                height={450}
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </Link>
          </div>

          {/* CTA Button */}
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
            borderRadius: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              🎃 Download All 25 Backgrounds Free
            </h3>
            <Link
              href="/category/halloween-backgrounds"
              style={{
                display: 'inline-block',
                background: 'white',
                color: '#ff6b35',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease'
              }}
            >
              Browse Halloween Backgrounds →
            </Link>
          </div>

          {/* Why Use Halloween Backgrounds */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              Why Use Halloween Virtual Backgrounds?
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                🎯 Perfect for Remote Workers
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                Working from home in October? Halloween backgrounds add seasonal charm to your daily meetings without being too over-the-top. They're professional enough for client calls while still showing your festive spirit.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                👨‍🏫 Great for Teachers & Students
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                Online classes get more engaging with themed backgrounds. Our Halloween backgrounds are kid-friendly and create a fun learning atmosphere without being scary or distracting.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                🎉 Virtual Halloween Parties
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                Hosting a virtual Halloween party? Coordinated backgrounds make group video calls feel more cohesive and festive. Everyone can choose their favorite from our collection.
              </p>
            </div>
          </section>

          {/* What's Included */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              What's in Our Halloween Collection
            </h2>
            
            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              Our collection features <strong>25 unique Halloween backgrounds</strong> including:
            </p>

            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '1.05rem',
              lineHeight: '2',
              color: '#374151'
            }}>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>🎃</span>
                <strong>Fall Porches:</strong> Cozy screened porches decorated with pumpkins and autumn decor
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>🍂</span>
                <strong>Seasonal Patios:</strong> Outdoor living spaces with festive Halloween touches
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>🕯️</span>
                <strong>Warm Atmospheres:</strong> Ambient lighting and cozy fall vibes
              </li>
              <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>🏡</span>
                <strong>Indoor Spaces:</strong> Living areas with tasteful Halloween decorations
              </li>
            </ul>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#374151',
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '0.5rem'
            }}>
              <strong>All backgrounds are HD quality</strong> and work perfectly with Zoom, Microsoft Teams, Google Meet, and any video platform that supports custom backgrounds.
            </p>
          </section>

          {/* How to Use */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              How to Download & Use
            </h2>

            <div style={{
              background: '#f3f4f6',
              padding: '2rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem'
            }}>
              <ol style={{
                fontSize: '1.05rem',
                lineHeight: '2',
                color: '#374151',
                paddingLeft: '1.5rem'
              }}>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Visit our Halloween backgrounds page</strong> - Browse all 25 options
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Click any background</strong> - Opens full preview
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Click "Download Free"</strong> - Instant download, no signup required
                </li>
                <li style={{ marginBottom: '1rem' }}>
                  <strong>Upload to your video platform</strong> - Works with Zoom, Teams, Meet, etc.
                </li>
              </ol>
            </div>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#374151'
            }}>
              Need help setting up virtual backgrounds? Check out our <Link href="/blog-virtual-background-guide" style={{ color: '#2563eb', fontWeight: '600' }}>complete setup guide</Link> for step-by-step instructions for every major platform.
            </p>
          </section>

          {/* Tips Section */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1.5rem'
            }}>
              Tips for Using Halloween Backgrounds
            </h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                💡 Consider Your Audience
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                For client meetings, choose subtle backgrounds with fall decor. For team calls or casual meetings, feel free to go more festive. Our collection includes options for every setting.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                🎨 Match Your Lighting
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                Halloween backgrounds with warm, ambient lighting work best in most home office setups. Avoid backgrounds that are too dark if your own lighting isn't great.
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                ⏰ Switch It Up
              </h3>
              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#4b5563'
              }}>
                With 25 backgrounds to choose from, don't be afraid to change your background throughout October. It keeps your video calls feeling fresh and festive all month long.
              </p>
            </div>
          </section>

          {/* Final CTA */}
          <section style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, #ff6b35 0%, #8b4513 100%)',
            borderRadius: '1rem',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '1rem'
            }}>
              Ready for Spooky Season? 🎃
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'white',
              opacity: 0.95,
              marginBottom: '2rem'
            }}>
              Download all 25 Halloween backgrounds completely free - no signup, no watermarks
            </p>
            <Link
              href="/category/halloween-backgrounds"
              style={{
                display: 'inline-block',
                background: 'white',
                 color: '#8b4513',
                padding: '1rem 2.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease'
              }}
            >
              Get Halloween Backgrounds →
            </Link>
          </section>

          {/* Related Links */}
          <section style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              More Free Virtual Backgrounds
            </h3>
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
            }}>
              <Link href="/category/living-rooms" style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}>
                Living Room Backgrounds →
              </Link>
              <Link href="/category/office-spaces" style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}>
                Office Space Backgrounds →
              </Link>
              <Link href="/category/bookshelves-bright" style={{
                padding: '1rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: '#2563eb',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}>
                Bookshelf Backgrounds →
              </Link>
            </div>
          </section>

          {/* Back to Blog */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/blog" style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.05rem'
            }}>
              ← Back to All Guides
            </Link>
          </div>

        </div>
      </article>

      <Footer />
    </>
  );
}