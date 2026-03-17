import Link from 'next/link';
import Image from 'next/image';

export const easterBackgroundsContent = () => (
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
            background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 40%, #ffd3b6 70%, #ffaaa5 100%)',
            color: '#2d4a35',
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
              🐣 Seasonal Backgrounds
            </div>

            <h1 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 'bold',
              marginBottom: '1rem',
              lineHeight: '1.2',
              color: '#1a3a24'
            }}>
              Free Easter Virtual Backgrounds for Zoom, Teams & Google Meet
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              opacity: '0.9',
              maxWidth: '800px',
              margin: '0 auto',
              color: '#2d4a35'
            }}>
              Brighten your spring video calls with 55 free Easter backgrounds — bunnies, pastel decor, and seasonal charm
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
              Easter is the perfect occasion to add a little springtime warmth to your video calls — and you don't need to redecorate your home office to do it.
            </p>

            <h2 style={{fontSize: '1.75rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
              Easter Backgrounds That Work for Any Call
            </h2>

            <p style={{
              fontSize: '1.1rem',
              lineHeight: '1.8',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>
              We've put together <strong>55 free Easter virtual backgrounds</strong> featuring soft pastel interiors, spring garden scenes, Easter egg details, and tasteful bunny accents. Whether you're on a work call or catching up with family, there's something in here for every occasion.
            </p>

            {/* Preview Image */}
            <div style={{
              marginBottom: '3rem',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Link href="/category/easter-backgrounds">
                <Image
                  src="/images/easter-backgrounds/easter-background-01.webp"
                  alt="Easter virtual background preview"
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
                🐰 Download All 55 Easter Backgrounds Free
              </h3>
              <Link
                href="/category/easter-backgrounds"
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
                Browse Easter Backgrounds →
              </Link>
            </div>

            {/* Why Use Easter Backgrounds */}
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1.5rem'
              }}>
                Why Use Easter Virtual Backgrounds?
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🌸 Add Spring Energy to Work Calls
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Pastel palettes and soft spring scenery naturally lift the mood of a video call. Our Easter backgrounds are bright and welcoming without being distracting — ideal for team meetings, client check-ins, or casual catch-ups during the holiday week.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  👨‍👩‍👧 Great for Family Video Calls
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Catching up with family over Easter weekend? A festive background instantly sets the holiday mood — especially fun for kids. Our collection includes scenes with Easter eggs, spring flowers, and cozy decorated spaces that work perfectly for family calls on Zoom or FaceTime.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🍳 Easter Brunch & Holiday Gatherings
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Virtual Easter brunches and holiday gatherings are a great way to connect when you can't be together in person. Set the scene with a pastel kitchen, spring dining room, or sunny garden background to make it feel like a real celebration.
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
                What's in Our Easter Collection
              </h2>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: '1.8',
                color: '#374151',
                marginBottom: '1.5rem'
              }}>
                Our collection features <strong>55 unique Easter backgrounds</strong> including:
              </p>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                fontSize: '1.05rem',
                lineHeight: '2',
                color: '#374151'
              }}>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🐣</span>
                  <strong>Spring Interiors:</strong> Bright pastel-toned rooms decorated for Easter
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🥚</span>
                  <strong>Easter Egg Scenes:</strong> Colourful egg arrangements and seasonal tablescapes
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🐰</span>
                  <strong>Bunny Accents:</strong> Tasteful Easter bunny details in cozy home settings
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>🌷</span>
                  <strong>Garden & Outdoor Scenes:</strong> Sunny spring gardens and flower-filled patios
                </li>
                <li style={{ marginBottom: '0.75rem', paddingLeft: '2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>☕</span>
                  <strong>Breakfast Nooks & Dining Rooms:</strong> Easter morning table settings and brunch vibes
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
                    <strong>Visit the Easter backgrounds page</strong> — Browse all 55 options
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
                Tips for Using Easter Backgrounds
              </h2>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  💡 Pick the Right Tone for Your Call
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  For work meetings, lean toward the softer pastel interiors and spring dining rooms — they're festive without being over-the-top. For family calls or Easter parties, go for the more colourful egg and bunny scenes.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🌤️ Pair with Good Lighting
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  Spring backgrounds look best when your own lighting is bright and natural. If you can sit facing a window, even better — it creates the same bright, airy feel as the backgrounds themselves.
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.75rem'
                }}>
                  🔄 Mix It Up
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.8',
                  color: '#4b5563'
                }}>
                  With 55 backgrounds to choose from, there's no reason to stick with just one. Try a garden scene for morning calls and a cozy decorated interior for the afternoon.
                </p>
              </div>
            </section>

            {/* Final CTA */}
            <section style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8b0 50%, #ffd3b6 100%)',
              borderRadius: '1rem',
              marginBottom: '3rem'
            }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1a3a24',
                marginBottom: '1rem'
              }}>
                Ready for Spring? 🌷
              </h2>
              <p style={{
                fontSize: '1.1rem',
                color: '#2d4a35',
                opacity: 0.95,
                marginBottom: '2rem'
              }}>
                Download all 55 Easter backgrounds completely free — no signup, no watermarks
              </p>
              <Link
                href="/category/easter-backgrounds"
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
                Get Easter Backgrounds →
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
                <Link href="/category/living-rooms" style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  fontWeight: '500',
                }}>
                  Living Room Backgrounds →
                </Link>
                <Link href="/category/valentines-backgrounds" style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: '#2563eb',
                  fontWeight: '500',
                }}>
                  Valentine's Day Backgrounds →
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
