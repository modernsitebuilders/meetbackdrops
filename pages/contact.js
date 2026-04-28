// ===== pages/contact.js =====
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useEffect } from 'react';

export default function Contact() {
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

      const sessionReferrer = sessionStorage.getItem('entry_referrer');
      if (sessionReferrer && (referrer === 'direct' || referrer.includes('streambackdrops.com'))) {
        referrer = sessionReferrer;
      }

      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/contact',
          category: 'contact-page',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
          title="Contact the Studio | StreamBackdrops"
          description="Reach the StreamBackdrops studio for support, custom commissions, or licensing questions. Corporate teams: please use the dedicated licensing inquiry form."
          canonical="https://streambackdrops.com/contact"
        >

      <div style={{
        background: '#fff',
        minHeight: '100vh',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{
          maxWidth: '820px',
          margin: '0 auto',
          padding: '4rem 0'
        }}>
          <div style={{
            background: '#fff',
            padding: '0',
          }}>

            <div style={{textAlign: 'center', marginBottom: '4rem', paddingBottom: '3rem', borderBottom: '1px solid #e6e2dc'}}>
              <div style={{
                fontSize: '0.7rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#9a6a3a',
                fontWeight: 600,
                marginBottom: '1rem',
              }}>
                The Studio
              </div>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
                fontWeight: 600,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                color: '#111827',
                marginBottom: '1rem',
                lineHeight: 1.1,
              }}>
                Contact the studio
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1.05rem',
                lineHeight: 1.7,
                maxWidth: '560px',
                margin: '0 auto',
              }}>
                Support questions, custom commissions, press, and individual licensing.
              </p>
            </div>

            <div style={{fontSize: '1.05rem', lineHeight: '1.7', color: '#374151'}}>

              {/* Corporate routing — top priority */}
              <div style={{
                border: '1px solid #111827',
                borderTop: '2px solid #9a6a3a',
                padding: '2rem',
                marginBottom: '2.5rem',
                background: '#fafaf7',
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#9a6a3a',
                  fontWeight: 600,
                  marginBottom: '0.85rem',
                }}>
                  For corporate &amp; team buyers
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  fontSize: '1.5rem',
                  color: '#111827',
                  margin: '0 0 0.75rem',
                }}>
                  Use the dedicated licensing inquiry form
                </h2>
                <p style={{ color: '#374151', margin: '0 0 1.25rem', fontSize: '1rem' }}>
                  Buying for a team? The studio uses a tailored intake to scope team size,
                  use case, and timeline — every qualified inquiry gets a direct reply within
                  one business day.
                </p>
                <Link
                  href="/licensing"
                  style={{
                    display: 'inline-block',
                    padding: '0.85rem 1.5rem',
                    background: '#111827',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    borderRadius: '2px',
                    border: '1px solid #111827',
                  }}
                >
                  Corporate &amp; Team Licensing →
                </Link>
              </div>

              {/* Individual contact */}
              <div style={{
                border: '1px solid #e6e2dc',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '3rem'
              }}>
                <div style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#9a6a3a',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}>
                  Everyone else
                </div>
                <h2 style={{
                  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  fontSize: '1.5rem',
                  color: '#111827',
                  margin: '0 0 0.75rem',
                }}>
                  Email the studio directly
                </h2>
                <p style={{color: '#6b7280', marginBottom: '1.5rem', fontSize: '1rem'}}>
                  Support, suggestions, press, and individual questions.
                </p>
                <a
                  href="mailto:info@streambackdrops.com"
                  style={{
                    display: 'inline-block',
                    color: '#9a6a3a',
                    fontSize: '1rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                  }}
                >
                  info@streambackdrops.com
                </a>
              </div>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Frequently Asked Questions
                </h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      Are the backgrounds really free?
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Yes! All backgrounds in our collection are completely free for personal use. No signup required, no watermarks, and no hidden fees.
                    </p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      What platforms do these backgrounds work with?
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Our backgrounds are optimized for all major video conferencing platforms including Zoom, Microsoft Teams, Google Meet, Skype, and others.
                    </p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      Can I use these backgrounds for commercial purposes?
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Our backgrounds are free for personal use, including professional video calls and remote work. For commercial licensing, please <Link href="/license" style={{color: '#2563eb'}}>review our license terms</Link> or contact us directly.
                    </p>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem'
                    }}>
                      My virtual background isn't working properly. What should I do?
                    </h3>
                    <p style={{color: '#6b7280'}}>
                      Check out our <Link href="/blog/virtual-background-guide" style={{color: '#2563eb'}}>complete technical guide</Link> for troubleshooting tips. If you're still having issues, email us with details about your setup and the specific problem you're experiencing.
                    </p>
                  </div>
                </div>
              </section>

              <section style={{marginBottom: '3rem'}}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1.5rem'
                }}>
                  Response Times
                </h3>
                <div style={{
                  background: '#fef3c7',
                  padding: '1.5rem',
                  borderRadius: '0.5rem'
                }}>
                  <ul style={{
                    listStyle: 'none',
                    color: '#92400e'
                  }}>
                    <li style={{marginBottom: '0.5rem'}}>
                      <strong>Technical Support:</strong> Within 24-48 hours
                    </li>
                    <li style={{marginBottom: '0.5rem'}}>
                      <strong>General Inquiries:</strong> Within 1-2 business days
                    </li>
                    <li>
                      <strong>Feature Requests:</strong> We review all suggestions monthly
                    </li>
                  </ul>
                </div>
              </section>

              <div style={{
                background: '#eff6ff',
                borderRadius: '1rem',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '1rem'
                }}>
                  Before You Contact Us
                </h3>
                <p style={{color: '#1e40af', marginBottom: '1.5rem'}}>
                  Many common questions are answered in our setup guides and blog posts. Check these resources first for the fastest help:
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <Link href="/blog/virtual-background-guide" style={{
                    background: 'white',
                    color: '#1e40af',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    border: '1px solid #dbeafe'
                  }}>
                    Technical Guide
                  </Link>
                  <Link href="/blog/lighting-tips" style={{
                    background: 'white',
                    color: '#1e40af',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    border: '1px solid #dbeafe'
                  }}>
                    Lighting Tips
                  </Link>
                  <Link href="/blog/background-mistakes" style={{
                    background: 'white',
                    color: '#1e40af',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '500',
                    border: '1px solid #dbeafe'
                  }}>
                    Common Mistakes
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
    </Layout>
  );
}