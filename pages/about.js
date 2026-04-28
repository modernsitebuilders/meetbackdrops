import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

export default function About() {

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="About StreamBackdrops | Virtual Set Design Studio"
      description="StreamBackdrops is a virtual set design studio producing studio-designed, 4K-upscaled backgrounds for Zoom, Teams, and Google Meet."
      canonical="https://streambackdrops.com/about"
    >

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
              background: '#111827',
              color: 'white',
              padding: '3.5rem 2rem',
              marginBottom: '3rem',
              textAlign: 'center',
              borderTop: '1px solid #111827',
              borderBottom: '2px solid #9a6a3a'
            }}>
              <div style={{
                fontSize: '0.75rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#c79a6b',
                fontWeight: 600,
                marginBottom: '1.25rem'
              }}>
                Virtual Set Design Studio
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                lineHeight: 1.1,
                marginBottom: '1rem'
              }}>
                About StreamBackdrops
              </h1>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 400,
                color: '#e5e7eb',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.6
              }}>
                Studio-Designed Backgrounds for Corporate Video Calls
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
                <p style={{color: '#374151', marginBottom: '1rem', fontSize: '1.1rem', lineHeight: 1.75}}>
                  On a video call, your background speaks before you do. StreamBackdrops designs interiors — modern offices, libraries, galleries, and conference rooms — engineered to convey authority on Zoom, Teams, and Google Meet.
                </p>
                <p style={{color: '#374151', fontSize: '1.1rem', lineHeight: 1.75}}>
                  Every environment is composed for camera, upscaled to 4K, and tested across the codecs that broadcast you to your colleagues, clients, and boards. We make samples freely available for individual professionals; teams and enterprises license the curated library through our <Link href="/licensing" style={{color: '#9a6a3a', textDecoration: 'underline', textUnderlineOffset: '3px'}}>Corporate &amp; Team Licensing</Link> program.
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
                      Free Backgrounds
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Over {TOTAL_IMAGES_FORMATTED} professional virtual backgrounds. Home offices, conference rooms, and more. All completely free to download and use.
                    </p>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.75rem'
                    }}>
                      Setup Guides
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Step-by-step guides for Zoom, Teams, and Google Meet. Tips for better lighting. Advice on professional video call etiquette.
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
                  Our Promise
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
                    Always Free
                  </h3>
                  <p style={{color: '#15803d'}}>
                    Our backgrounds will always be free. No signup needed. No watermarks. No hidden fees. Just download and use.
                  </p>
                </div>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '1.5rem',
                  color: '#6b7280',
                  lineHeight: '2'
                }}>
                  <li>High-quality backgrounds for video calls</li>
                  <li>New designs added regularly</li>
                  <li>Setup guides for all major platforms</li>
                  <li>Fast customer support</li>
                  <li>We listen to your feedback</li>
                </ul>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Our Quality Standards
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Every background is tested before we publish it. We make sure each one works perfectly on video calls. Here's what we focus on:
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
                      Works Great
                    </h4>
                    <p style={{color: '#1e40af', fontSize: '0.9rem'}}>
                      The right file size and quality for smooth video calls
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
                      Looks Professional
                    </h4>
                    <p style={{color: '#15803d', fontSize: '0.9rem'}}>
                      Designs that make you look good in any industry
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
                      Works Everywhere
                    </h4>
                    <p style={{color: '#92400e', fontSize: '0.9rem'}}>
                      Tested on Zoom, Teams, Google Meet, and more
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
                  Get in Touch
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We love hearing from you. Got questions? Want to suggest new backgrounds? Have feedback? We're here to help.
                </p>
                <div style={{
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{color: '#374151', marginBottom: '1rem'}}>
                    <strong>Contact us:</strong>
                  </p>
                  <ul style={{
                    listStyle: 'none',
                    color: '#6b7280',
                    lineHeight: '2'
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
     </Layout>
  );
}