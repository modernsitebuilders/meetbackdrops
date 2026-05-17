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
        <meta name="description" content="MeetBackdrops license terms — free for individual professional use on Zoom, Teams, and Meet. HD Editions and Subscription add resolution, not extra rights." />
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
              
              <Link href="/branded-backgrounds" style={{
                color: '#374151',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                background: '#f3f4f6',
                transition: 'all 0.2s'
              }}>
                💼 Branded
              </Link>
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
                  ✅ Free for Individual Professional Use
                </h3>
                <p style={{
                  color: '#065f46',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  Any individual professional can use MeetBackdrops backgrounds for free, including on work calls for the company they work for. Permitted uses include:
                </p>
                <ul style={{
                  color: '#047857',
                  lineHeight: '2',
                  fontSize: '1rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>🎥 <strong>Video calls</strong> on Zoom, Microsoft Teams, Google Meet, Webex, and similar platforms</li>
                  <li style={{ marginBottom: '0.75rem' }}>🏠 <strong>Remote work</strong> and internal team meetings</li>
                  <li style={{ marginBottom: '0.75rem' }}>🎓 <strong>Online learning</strong> and virtual classrooms</li>
                  <li style={{ marginBottom: '0.75rem' }}>📡 <strong>Webinars, livestreams, and broadcast productions</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>👥 <strong>Client calls and sales conversations</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>🎤 <strong>Podcasts and recorded interviews</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>💼 <strong>Freelance work</strong> and client presentations</li>
                  <li style={{ marginBottom: '0.75rem' }}>🧑‍💼 <strong>Job interviews</strong></li>
                </ul>
                <p style={{
                  color: '#065f46',
                  fontSize: '0.9rem',
                  marginTop: '1rem',
                  fontStyle: 'italic'
                }}>
                  No attribution required • No signup needed • Subject to the free-tier download limits below
                </p>
              </div>
            </section>

            {/* HD Editions & Subscription */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                background: '#fef9c3',
                border: '2px solid #ca8a04',
                borderRadius: '1rem',
                padding: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#713f12',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  💎 HD Editions & Subscription
                </h3>
                <p style={{
                  color: '#713f12',
                  fontSize: '1.1rem',
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}>
                  Same license, higher resolution.
                </p>
                <p style={{
                  color: '#713f12',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  marginBottom: '1rem'
                }}>
                  HD Editions (one-time purchase) and an active HD Subscription deliver the same image at <strong>2912×1632</strong> instead of the free-tier resolution. Permitted uses are identical to the Free section above — Zoom, Teams, Meet, Webex, webinars, podcasts, job interviews, individual professional video calls. Buying or subscribing does <strong>not</strong> grant additional team-deployment, redistribution, or branding rights.
                </p>
                <p style={{
                  color: '#713f12',
                  fontSize: '0.95rem',
                  fontStyle: 'italic',
                  margin: 0
                }}>
                  HD Editions and Subscription downloads are not counted against the free-tier daily/monthly limits below.
                </p>
              </div>
            </section>

            {/* Not Permitted */}
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
                  ❌ Not Permitted (Free, HD, or Subscription)
                </h3>
                <p style={{
                  color: '#991b1b',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  Regardless of which tier you're on, the following uses are prohibited:
                </p>
                <ul style={{
                  color: '#dc2626',
                  lineHeight: '2',
                  fontSize: '1rem',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Reselling or redistributing</strong> the backgrounds, in any resolution</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Including in products or services you sell</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Uploading to stock-photo sites or asset marketplaces</strong></li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Print materials</strong> sold or distributed commercially</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Website templates, apps, or themes</strong> for sale</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Training materials</strong> sold or licensed to third parties</li>
                  <li style={{ marginBottom: '0.75rem' }}>🚫 <strong>Adding your company logo or wordmark</strong> directly into the image (Branded Backgrounds is the product for that — see below)</li>
                </ul>
              </div>
            </section>

            {/* Branded Backgrounds — for team deployment with brand integration */}
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
                  💼 Branded Backgrounds — For Teams With a Logo
                </h3>
                <p style={{
                  color: '#92400e',
                  fontSize: '1.1rem',
                  marginBottom: '1rem',
                  lineHeight: 1.6
                }}>
                  If your team needs your company logo or wordmark integrated into a studio environment for company-wide use on video calls, that's a separate product: <strong>Branded Backgrounds</strong>.
                </p>
                <div style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #fbbf24'
                }}>
                  <p style={{
                    color: '#78350f',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    margin: 0
                  }}>
                    The studio designs HD environments with your brand integrated — logo plaques, wall art, signage, framed prints — produced as per-customer composites for company-wide deployment on Zoom, Teams, and Meet. Base library images stay in the catalog; the logo placement is exclusive to the buyer.
                  </p>
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '1.5rem'
                }}>
                  <Link href="/branded-backgrounds" style={{
                    background: '#111827',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}>
                    See Branded Backgrounds →
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
                  ⬇️ Free-Tier Download Limits
                </h3>
                <p style={{
                  color: '#1e40af',
                  fontSize: '1.1rem',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  To keep the free tier sustainable for everyone, free downloads are capped:
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
                    <li style={{ marginBottom: '0.75rem' }}>📅 <strong>Daily Limit:</strong> 5 free downloads per day</li>
                    <li style={{ marginBottom: '0.75rem' }}>📊 <strong>Monthly Limit:</strong> 10 free downloads per rolling 30-day period</li>
                    <li style={{ marginBottom: '0.75rem' }}>⏳ <strong>Rolling Quota:</strong> As your oldest downloads pass the 30-day mark, your quota refreshes automatically</li>
                  </ul>
                </div>
                <p style={{
                  color: '#1e40af',
                  fontSize: '0.95rem',
                  fontStyle: 'italic'
                }}>
                  These limits apply to free downloads only. <strong>HD Editions</strong> (one-time purchase) and an <strong>active HD Subscription</strong> are not subject to the free-tier daily or monthly limits.
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
                  <li><strong>Modifications:</strong> You may crop or color-adjust a background for your own video-call use. You may not redistribute the modified file, sell it, or add your company logo to it (Branded Backgrounds covers the logo-integration case).</li>
                  <li><strong>Subscription:</strong> The HD Subscription is billed monthly, renews automatically, and can be cancelled anytime. License rights granted by past downloads survive cancellation; ability to access new downloads ends with the subscription.</li>
                  <li><strong>Questions:</strong> If you're unsure whether a specific use is permitted, contact us before using.</li>
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
                Last updated: May 16, 2026 • Questions? <Link href="/contact" style={{color: '#9a6a3a'}}>Contact us</Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}