import Link from 'next/link';
import Image from 'next/image';

export const springBackgroundsContent = (categoryInfo) => {
  const count = categoryInfo?.['spring-backgrounds']?.images?.length || 96;
  return (
  <article style={{
    background: '#f8fafc',
    minHeight: '100vh'
  }}>

    {/* PADDING WRAPPER */}
    <div style={{
      paddingLeft: '2rem',
      paddingRight: '2rem'
    }}>

      {/* MAX-WIDTH CONTAINER */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '2rem',
        paddingBottom: '2rem'
      }}>

        {/* WHITE CARD WRAPPER */}
        <div style={{
          background: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>

          {/* HERO/HEADER SECTION */}
          <header style={{
            background: 'linear-gradient(135deg, #d4f7d4 0%, #a8e6cf 40%, #fce4ec 70%, #fff9c4 100%)',
            color: '#1a3a24',
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              opacity: '0.85'
            }}>
              🌸 Seasonal Backgrounds
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2',
              color: '#1a3a24'
            }}>
              Free Spring Virtual Backgrounds for Zoom, Teams & Google Meet
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: '0.9',
              maxWidth: '800px',
              margin: '0 auto',
              color: '#2d4a35'
            }}>
              Refresh your video calls with {count} free spring backgrounds — blooming flowers, sunlit gardens, and airy seasonal scenes
            </p>
          </header>

          {/* ARTICLE CONTENT SECTION */}
          <div style={{
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.75'
          }}>

            <p style={{fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem'}}>
              Spring is the easiest time of year to freshen up your video call setup — and you don't need to rearrange your home to do it. A great background does the work for you.
            </p>

            <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
              Spring Backgrounds That Work for Any Call
            </h2>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              We've put together <strong>{count} free spring virtual backgrounds</strong> featuring blooming flower gardens, sunlit greenhouses, bright outdoor patios, and fresh spring interiors. Whether you're on a work call, a catch-up with friends, or a team standup, there's something in here for every occasion.
            </p>

            {/* Preview Image */}
            <div style={{
              marginBottom: '3rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Link href="/category/spring-backgrounds">
                <Image
                  src="https://res.cloudinary.com/dnhju6mhg/image/upload/webp/spring-backgrounds/spring-background-01.webp"
                  alt="Spring virtual background preview"
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
              background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 100%)',
              borderRadius: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1a3a24',
                marginBottom: '1rem'
              }}>
                🌷 Download All {count} Spring Backgrounds Free
              </h3>
              <Link
                href="/category/spring-backgrounds"
                style={{
                  display: 'inline-block',
                  background: 'white',
                  color: '#2d7a4a',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Browse Spring Backgrounds →
              </Link>
            </div>

            {/* Why Use Spring Backgrounds */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>
                Why Use Spring Virtual Backgrounds?
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🌼 Bring the Season into Your Calls
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Spring scenes naturally lift the energy of a video call. Soft greens, warm florals, and open outdoor light create a calm, fresh atmosphere — ideal for team meetings, client check-ins, or casual catch-ups when the weather finally turns.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🏡 Hide the Home Office Clutter
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Not everyone has a picture-perfect backdrop. A spring garden or sunlit greenhouse puts something genuinely beautiful behind you — far better than a blank wall or a pile of laundry.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  💼 Professional Without Being Boring
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Spring backgrounds strike the right balance: they're pleasant and polished without feeling sterile. A bright conservatory or a tidy garden patio reads as professional while still showing some personality — perfect for Zoom, Teams, and Google Meet.
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
                What's in Our Spring Collection
              </h2>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#374151',
                marginBottom: '1.5rem'
              }}>
                Our collection features <strong>{count} unique spring backgrounds</strong> including:
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                fontSize: '1.05rem',
                lineHeight: '2',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🌸</span>
                  <strong>Garden Scenes:</strong> Blooming flower beds, cottage gardens, and outdoor patios in full spring colour
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🪟</span>
                  <strong>Sunrooms & Conservatories:</strong> Light-filled indoor spaces with spring greenery and natural light
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🌿</span>
                  <strong>Greenhouses & Plant Spaces:</strong> Lush botanical settings with flowering plants and fresh foliage
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🌳</span>
                  <strong>Outdoor Spring Landscapes:</strong> Open meadows, park benches, and blossom-filled trees
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🏠</span>
                  <strong>Spring Interiors:</strong> Bright, airy rooms with fresh floral arrangements and seasonal decor
                </li>
              </ul>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#374151',
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f0fdf4',
                borderLeft: '4px solid #22c55e',
                borderRadius: '0.5rem'
              }}>
                <strong>All backgrounds are high quality</strong> and work with Zoom, Microsoft Teams, Google Meet, and any video platform that supports custom backgrounds.
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
                    <strong>Visit the spring backgrounds page</strong> — Browse all {count} options
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>Click any background</strong> — Opens full preview
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>Click "Download Free"</strong> — Instant download, no signup required
                  </li>
                  <li style={{ marginBottom: '1rem' }}>
                    <strong>Upload to your video platform</strong> — Works with Zoom, Teams, Meet, and more
                  </li>
                </ol>
              </div>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#374151'
              }}>
                Need help setting up virtual backgrounds? Check out our <Link href="/blog/virtual-background-guide" style={{ color: '#2563eb', fontWeight: '600' }}>complete setup guide</Link> for step-by-step instructions for every major platform.
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
                Tips for Using Spring Backgrounds
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  💡 Match the Vibe to Your Call
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  For client meetings or formal calls, lean toward the conservatories and bright spring interiors — they're tidy and polished. For internal team calls or casual catch-ups, the garden and outdoor scenes work great and add a lighter, more relaxed feel.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🌤️ Good Lighting Makes a Big Difference
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Spring backgrounds look best when your own lighting is bright and natural. Facing a window — or using a simple ring light — keeps you looking sharp against the lighter, airy tones in the backgrounds.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🔄 Plenty to Choose From
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  With {count} backgrounds in the collection, there's no reason to stick with one. Try a garden scene for morning calls and a sunroom interior for afternoon meetings — or keep a few saved and rotate throughout the week.
                </p>
              </div>
            </section>

            {/* Final CTA */}
            <section style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, #a8e6cf 0%, #d4f7d4 50%, #fff9c4 100%)',
              borderRadius: '1rem',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1a3a24',
                marginBottom: '1rem'
              }}>
                Ready to Freshen Up Your Calls? 🌸
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#2d4a35',
                opacity: 0.95,
                marginBottom: '2rem'
              }}>
                Download all {count} spring backgrounds completely free — no signup, no watermarks
              </p>
              <Link
                href="/category/spring-backgrounds"
                style={{
                  display: 'inline-block',
                  background: 'white',
                  color: '#2d7a4a',
                  padding: '1rem 2.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                Get Spring Backgrounds →
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
                <Link href="/category/gardens-patios" style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  fontWeight: '500',
                }}>
                  Garden & Patio Backgrounds →
                </Link>
                <Link href="/category/easter-backgrounds" style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  fontWeight: '500',
                }}>
                  Easter Backgrounds →
                </Link>
                <Link href="/category/nature-landscapes" style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  fontWeight: '500',
                }}>
                  Nature & Landscape Backgrounds →
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
        </div>
      </div>
    </div>
  </article>
  );
};
