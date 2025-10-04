import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Head>
  <title>About Us - StreamBackdrops</title>
  <meta name="description" content="Learn about StreamBackdrops - your source for professional HD virtual backgrounds for video calls. Discover our mission and commitment to quality." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://streambackdrops.com/about" />
        <title>About StreamBackdrops - Professional Virtual Backgrounds</title>
        <meta name="description" content="Learn about StreamBackdrops - your source for professional virtual backgrounds designed specifically for video calls, remote work, and online meetings." />
        <meta name="robots" content="index, follow" />
      </Head>

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
              
              <div style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                ✨ 100% FREE
              </div>
            </div>
          </nav>
        </div>
      </header>

      <div style={{ 
        background: '#f8fafc', 
        minHeight: '100vh',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '2rem 0'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            
            <div style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white',
              padding: '2rem',
              borderRadius: '1rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                About StreamBackdrops
              </h1>
              <h2 style={{
                fontSize: '1.2rem',
                opacity: 0.9
              }}>
                Creating professional virtual backgrounds for the modern remote workforce
              </h2>
            </div>

            <div style={{fontSize: '1.1rem', lineHeight: '1.7', color: '#374151'}}>
              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Our Mission
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  In today's remote-first world, your virtual presence matters more than ever. StreamBackdrops was created to help professionals, freelancers, and remote workers present their best selves during video calls, regardless of their physical environment.
                </p>
                <p style={{color: '#6b7280'}}>
                  We believe that everyone deserves access to high-quality, professional virtual backgrounds that enhance their online presence without breaking the budget.
                </p>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  What We Offer
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.75rem'
                    }}>
                      Free Collection
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Professional virtual backgrounds across multiple categories - from home offices to conference rooms - all completely free to download and use.
                    </p>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.75rem'
                    }}>
                      Expert Guidance
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Comprehensive guides and tutorials covering everything from technical setup to professional video call etiquette and lighting optimization.
                    </p>
                  </div>
                </div>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Our Commitment
                </h3>
                <div style={{
                  background: '#f0fdf4',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#15803d',
                    marginBottom: '1rem'
                  }}>
                    Always Free for Personal Use
                  </h3>
                  <p style={{color: '#15803d'}}>
                    We're committed to keeping our core collection free for personal and professional video calls. No signup required, no watermarks, and no hidden fees.
                  </p>
                </div>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '1.5rem',
                  color: '#6b7280'
                }}>
                  <li>High-quality backgrounds optimized for video conferencing</li>
                  <li>Regular updates with new designs and categories</li>
                  <li>Comprehensive setup guides for all major platforms</li>
                  <li>Responsive customer support for technical questions</li>
                  <li>Continuous improvement based on user feedback</li>
                </ul>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Quality Standards
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Every background in our collection is carefully designed and tested to ensure optimal performance across different video conferencing platforms. We focus on:
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    background: '#eff6ff',
                    padding: '1rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{
                      fontWeight: '600',
                      color: '#1e40af',
                      marginBottom: '0.5rem'
                    }}>
                      Technical Excellence
                    </h4>
                    <p style={{color: '#1e40af', fontSize: '0.9rem'}}>
                      Proper resolution, compression, and edge detection optimization
                    </p>
                  </div>
                  <div style={{
                    background: '#f0fdf4',
                    padding: '1rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{
                      fontWeight: '600',
                      color: '#15803d',
                      marginBottom: '0.5rem'
                    }}>
                      Professional Design
                    </h4>
                    <p style={{color: '#15803d', fontSize: '0.9rem'}}>
                      Industry-appropriate aesthetics that enhance credibility
                    </p>
                  </div>
                  <div style={{
                    background: '#fef3c7',
                    padding: '1rem',
                    borderRadius: '0.5rem'
                  }}>
                    <h4 style={{
                      fontWeight: '600',
                      color: '#92400e',
                      marginBottom: '0.5rem'
                    }}>
                      Platform Compatibility
                    </h4>
                    <p style={{color: '#92400e', fontSize: '0.9rem'}}>
                      Tested across Zoom, Teams, Google Meet, and other platforms
                    </p>
                  </div>
                </div>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Contact Us
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We value your feedback and are always looking to improve our service. Whether you have technical questions, suggestions for new backgrounds, or general feedback, we'd love to hear from you.
                </p>
                <div style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{color: '#374151', marginBottom: '1rem'}}>
                    <strong>Get in touch:</strong>
                  </p>
                  <ul style={{
                    listStyle: 'none',
                    color: '#6b7280'
                  }}>
                    <li>📧 Email: support@streambackdrops.com</li>
                    <li>💬 <Link href="/contact" style={{color: '#2563eb', textDecoration: 'none'}}>Contact Form</Link></li>
                    <li>📚 <Link href="/blog" style={{color: '#2563eb', textDecoration: 'none'}}>Setup Guides & Tips</Link></li>
                  </ul>
                </div>
              </section>

              <div style={{
                textAlign: 'center',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <Link href="/" style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '2rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  display: 'inline-block',
                  transition: 'all 0.3s ease'
                }}>
                  Browse Our Free Backgrounds →
                </Link>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}