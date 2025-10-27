// ===== pages/privacy.js =====
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function Privacy() {
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
          page: '/privacy',
          category: 'legal',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  return (
    <>
      <Head>
         <title>Privacy Policy - StreamBackdrops</title>
  <meta name="description" content="StreamBackdrops Privacy Policy - Learn how we protect your privacy and handle your data." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://streambackdrops.com/privacy" />
        <title>Privacy Policy - StreamBackdrops</title>
        <meta name="description" content="StreamBackdrops Privacy Policy - Learn how we protect your privacy and handle your data." />
        <meta name="robots" content="index, follow" />
      </Head>

      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <Link href="/" style={{
            color: '#2563eb',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            ← Back to StreamBackdrops
          </Link>
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
          padding: '3rem 0'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Privacy Policy
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem'
              }}>
                Last updated: October 27, 2025
              </p>
            </div>

            <div style={{fontSize: '1rem', lineHeight: '1.7', color: '#374151'}}>
              
              <section style={{marginBottom: '2rem'}}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Introduction
                </h2>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  StreamBackdrops ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit our website streambackdrops.com (the "Service").
                </p>
                <p style={{color: '#6b7280'}}>
                  By using our Service, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Information We Collect
                </h3>
                
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Information You Provide
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We may collect information you provide directly to us, such as when you contact us through email or contact forms:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li>Name and email address when contacting support</li>
                  <li>Messages and feedback you send to us</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Automatically Collected Information
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  When you visit our website, we may automatically collect certain information:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li>Browser type and version</li>
                  <li>Pages you visit and time spent on our site</li>
                  <li>Referring website information</li>
                  <li>Device information (mobile, desktop, etc.)</li>
                </ul>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  How We Use Your Information
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We use the information we collect to:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li>Provide and maintain our Service</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Improve our website and user experience</li>
                  <li>Analyze usage patterns and site performance</li>
                  <li>Comply with legal obligations</li>
                  <li>Protect against fraud and abuse</li>
                </ul>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Information Sharing
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website (hosting, analytics, etc.)</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
                </ul>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Cookies and Tracking
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We use cookies and similar tracking technologies to enhance your experience on our website:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p style={{color: '#6b7280'}}>
                  You can control cookies through your browser settings, though this may affect site functionality.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Data Security
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  We implement appropriate security measures to protect your personal information:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li>SSL encryption for data transmission</li>
                  <li>Secure hosting infrastructure</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information</li>
                </ul>
                <p style={{color: '#6b7280'}}>
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Your Rights
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1rem'}}>
                  <li><strong>Access:</strong> Request information about the personal data we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
                <p style={{color: '#6b7280'}}>
                  To exercise these rights, please contact us at the information provided below.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Children's Privacy
                </h3>
                <p style={{color: '#6b7280'}}>
                  Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Changes to This Policy
                </h3>
                <p style={{color: '#6b7280'}}>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              <section style={{marginBottom: '2rem'}}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem'
                }}>
                  Contact Us
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <ul style={{listStyle: 'none', color: '#374151'}}>
                    <li>📧 Email: dave@modernsitebuilders.com</li>
                    <li>📝 Contact Form: <Link href="/contact" style={{color: '#2563eb'}}>streambackdrops.com/contact</Link></li>
                  </ul>
                </div>
              </section>
            </div>
            
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}