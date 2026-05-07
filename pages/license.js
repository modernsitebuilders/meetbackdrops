// pages/license.js
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { isAdmin } from '../lib/adminAuth';

export default function License() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Skip tracking if admin
      if (isAdmin()) {
        return;
      }

      let referrer = document.referrer || 'direct';

      if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
        sessionStorage.setItem('entry_referrer', document.referrer);
      }

      const sessionReferrer = sessionStorage.getItem('entry_referrer');
      if (sessionReferrer && (referrer === 'direct' || referrer.includes('meetbackdrops.com'))) {
        referrer = sessionReferrer;
      }

      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/license',
          category: 'license-page',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="canonical" href="https://meetbackdrops.com/license" />
        <title>License & Usage Rights - MeetBackdrops</title>
        <meta name="description" content="MeetBackdrops License - Learn about usage rights for our free virtual backgrounds. Personal use allowed, commercial licensing available." />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Clean Blog Header */}
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
            {/* MeetBackdrops Brand */}
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#9a6a3a',
              textDecoration: 'none'
            }}>
              🎥 MeetBackdrops
            </Link>
            
            {/* Navigation Links */}
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
                📚 Setup Guides
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

      {/* License Content */}
      <div style={{ 
        background: '#f8fafc', 
        minHeight: '100vh',
        paddingLeft: '2rem',
        paddingRight: '2rem'
      }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          padding: '2rem 0'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '3rem',
            marginBottom: '2rem'
          }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                License & Usage Rights
              </h1>
              <h2 style={{
                color: '#6b7280',
                fontSize: '1.1rem'
              }}>
                Clear guidelines for using MeetBackdrops virtual backgrounds
              </h2>
            </div>

            {/* Personal Use Section */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#065f46',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ✅ Personal Use - FREE
                </h3>
                <p style={{
                  color: '#065f46',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  You are free to use our virtual backgrounds for:
                </p>
                <ul style={{
                  color: '#047857',
                  lineHeight: '2',
                  fontSize: '1rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>🎥 <strong>Video calls</strong> (Zoom, Teams, Google Meet, etc.)</li>
                  <li style={{ marginBottom: '0.75rem' }}>🏠 <strong>Remote work</strong> and online meetings</li>
                  <li style={{ marginBottom: '0.75rem' }}>🎓 <strong>Online learning</strong> and virtual classrooms</li>
                  <li style={{ marginBottom: '0.75rem' }}>📡 <strong>Webinars, livestreams, and broadcast productions</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>👥 <strong>Video conferences</strong> with colleagues or clients</li>
                  <li style={{ marginBottom: '0.75rem' }}>🎤 <strong>Podcasts and recorded interviews</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>💼 <strong>Freelance work</strong> and client presentations</li>
                </ul>
                <p style={{
                  color: '#065f46',
                  fontSize: '0.9rem',
                  marginTop: '1rem',
                  fontStyle: 'italic'
                }}>
                  No attribution required • No signup needed • Use as many as you want
                </p>
              </div>
            </section>

            {/* Commercial Use Restrictions */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                background: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ❌ Commercial Use - NOT ALLOWED
                </h3>
                <p style={{
                  color: '#991b1b',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  The following uses are strictly prohibited without a commercial license:
                </p>
                <ul style={{
                  color: '#dc2626',
                  lineHeight: '2',
                  fontSize: '1rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Reselling</strong> or redistributing the backgrounds</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Including in products</strong> or services you sell</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Stock photo websites</strong> or marketplaces</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Print materials</strong> for commercial purposes</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Website templates</strong> or themes for sale</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Apps or software</strong> that include our backgrounds</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Corporate training materials</strong> sold to third parties</li>
                </ul>
              </div>
            </section>

            {/* Commercial Licensing Section */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                background: '#fefbeb',
                border: '2px solid #f59e0b',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#92400e',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💼 Need Commercial Rights?
                </h3>
                <p style={{
                  color: '#92400e',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem'
                }}>
                  If you need to use our backgrounds for commercial purposes, we offer commercial licensing options.
                </p>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fbbf24'
                }}>
                  <h3 style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '1rem'
                  }}>
                    Commercial License Includes:
                  </h3>
                  <ul style={{
                    color: '#78350f',
                    lineHeight: '1.8',
                    fontSize: '1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    <li style={{ marginBottom: '0.5rem' }}>✓ Use in commercial products and services</li>
                    <li style={{ marginBottom: '0.5rem' }}>✓ Reseller and distribution rights</li>
                    <li style={{ marginBottom: '0.5rem' }}>✓ Corporate training and educational materials</li>
                    <li style={{ marginBottom: '0.5rem' }}>✓ Client work and agency projects</li>
                    <li style={{ marginBottom: '0.5rem' }}>✓ Priority support and custom requests</li>
                  </ul>
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '1.5rem'
                }}>
                  <Link href="/contact" style={{
                    background: '#f59e0b',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '2rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    📧 Contact for Commercial Licensing
                  </Link>
                </div>
              </div>
            </section>

           {/* Download Limits Section */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                background: '#eff6ff',
                border: '2px solid #3b82f6',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  ⬇️ Download Limits
                </h3>
                <p style={{
                  color: '#1e40af',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  To ensure fair access for everyone, we have the following limits:
                </p>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #93c5fd',
                  marginBottom: '1rem'
                }}>
                  <ul style={{
                    color: '#1e3a8a',
                    lineHeight: '2',
                    fontSize: '1rem',
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    <li style={{ marginBottom: '0.75rem' }}>📅 <strong>Daily Limit:</strong> 5 downloads per day</li>
<li style={{ marginBottom: '0.75rem' }}>📊 <strong>Monthly Limit:</strong> 10 downloads per 30-day rolling period</li>
<li style={{ marginBottom: '0.75rem' }}>⏳ <strong>Download Expiration:</strong> Downloads expire after 30 days, then you can download more</li>
                  </ul>
                </div>
                <p style={{
                  color: '#1e40af',
                  fontSize: '0.95rem',
                  fontStyle: 'italic'
                }}>
                  These limits help us keep the service free and available to everyone. Downloads work on a rolling 30-day window - after 30 days, your oldest downloads expire and you can download more. If you need unlimited downloads for business use, please contact us about commercial licensing options.
                </p>
              </div>
            </section>

            {/* Important Notes */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                📋 Important Notes
              </h3>
              <div style={{
                background: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb'
              }}>
                <ul style={{
                  color: '#374151',
                  lineHeight: '1.8',
                  fontSize: '1rem',
                  listStyle: 'disc',
                  paddingLeft: '1.5rem'
                }}>
                  <li><strong>Copyright:</strong> All backgrounds are original creations and remain the intellectual property of MeetBackdrops.</li>
                  <li><strong>No Warranty:</strong> Backgrounds are provided "as is" without warranty of any kind.</li>
                  <li><strong>Modifications:</strong> You may edit or modify backgrounds for personal use only.</li>
                  <li><strong>Questions:</strong> If you're unsure whether your use case qualifies as personal or commercial, please contact us.</li>
                </ul>
              </div>
            </section>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              paddingTop: '2rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.9rem'
              }}>
                Last updated: August 7, 2025 • Questions? <Link href="/contact" style={{color: '#9a6a3a'}}>Contact us</Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}