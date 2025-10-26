import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import { TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';

export default function About() {
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
          page: '/about',
          category: 'info',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  return (
    <Layout
      title="Frequently Asked Questions - StreamBackdrops"
      description="Get answers to common questions about using free virtual backgrounds for Zoom, Teams, and Google Meet."
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
Creating Professional Virtual Backgrounds for Modern Remote Workers              </h2>
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
                  Remote work is here to stay. Your video presence matters now more than ever. StreamBackdrops helps you look professional on every video call.
                </p>
                <p style={{color: '#6b7280'}}>
                  We believe everyone deserves quality virtual backgrounds. You shouldn't have to pay for them. That's why all our backgrounds are free.
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