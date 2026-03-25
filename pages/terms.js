// pages/terms.js
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://streambackdrops.com/terms" />
        <title>Terms of Service - StreamBackdrops</title>
        <meta name="description" content="Terms of Service for StreamBackdrops - Professional virtual backgrounds for video calls. Learn about usage rights, restrictions, and service terms." />
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
            {/* StreamBackdrops Brand */}
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              textDecoration: 'none'
            }}>
              🎥 StreamBackdrops
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

      {/* Terms Content */}
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
            <div style={{ marginBottom: '3rem' }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Terms of Service
              </h1>
              <p style={{
                color: '#6b7280',
                fontSize: '1.1rem'
              }}>
                Last updated: March 24, 2026
              </p>
            </div>

            {/* Content */}
            <div style={{ lineHeight: '1.8', color: '#374151' }}>
              
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ marginBottom: '1.5rem' }}>
                By accessing and using StreamBackdrops ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                2. Description of Service
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                StreamBackdrops provides high-quality virtual background images for use in video conferencing, online meetings, and related communications. The majority of our backgrounds are available as free downloads for personal use. A selection of premium HD backgrounds are available exclusively as paid downloads and are marked with a 💎 HD Only badge.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                3. Use License - Personal Use Only
              </h3>
              
              {/* Personal Use Section */}
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #22c55e',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#15803d',
                  marginBottom: '1rem'
                }}>
                  ✅ Allowed Personal Uses
                </h3>
                <p style={{ color: '#065f46', marginBottom: '1rem' }}>
                  Free virtual backgrounds provided by StreamBackdrops are licensed for personal use only, including:
                </p>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '2rem',
                  color: '#047857',
                  marginBottom: '0'
                }}>
                  <li>Personal video calls and online meetings</li>
                  <li>Remote work and home office setups</li>
                  <li>Educational use in online classes and learning</li>
                  <li>Personal streaming and content creation</li>
                  <li>Freelance work and client presentations</li>
                  <li>Video conferencing with colleagues</li>
                </ul>
              </div>

              {/* HD Premium Images Section */}
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                4. HD Premium Images
              </h3>

              <div style={{
                background: '#eff6ff',
                border: '2px solid #2563eb',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#1e40af',
                  marginBottom: '1rem'
                }}>
                  💎 HD Only Images
                </h3>
                <p style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                  Certain images on StreamBackdrops are designated as HD Only and are not available as free downloads. These images are exclusively accessible through a paid HD image pack.
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Pricing</h3>
                <p style={{ color: '#1e3a8a', marginBottom: '0.5rem' }}>HD images are available in the following packs (prices in USD):</p>
                <ul style={{ listStyle: 'disc', paddingLeft: '2rem', color: '#1e40af', marginBottom: '1rem' }}>
                  <li>1 image — $4.99</li>
                  <li>2 images — $6.99</li>
                  <li>3 images — $8.99</li>
                  <li>5 images — $12.99</li>
                  <li>10 images — $22.99</li>
                  <li>20 images — $39.99</li>
                </ul>
                <p style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                  Prices are subject to change. The price displayed at the time of purchase is the price you will be charged.
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>License for Purchased HD Images</h3>
                <p style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                  Purchased HD backgrounds are licensed for the same personal uses described in Section 3. Commercial use of purchased HD images requires a separate commercial license. Purchased images may not be redistributed, resold, or shared with others.
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Delivery</h3>
                <p style={{ color: '#1e3a8a', marginBottom: '1rem' }}>
                  Upon successful payment, HD images are made available for immediate download as high-resolution PNG files. It is your responsibility to download and save your purchased images. StreamBackdrops is not responsible for lost downloads due to browser issues or expired download links.
                </p>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Wishlist</h3>
                <p style={{ color: '#1e3a8a', marginBottom: '0' }}>
                  The wishlist feature allows you to save HD images to your browser for convenience. Saving an image to your wishlist does not constitute a purchase, reservation, or guarantee of continued availability or pricing. Wishlist contents are stored locally in your browser and will be lost if you clear your browser data.
                </p>
              </div>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                5. Restrictions - Commercial Use Prohibited
              </h3>
              
              {/* Commercial Restrictions */}
              <div style={{
                background: '#fef2f2',
                border: '2px solid #ef4444',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#991b1b',
                  marginBottom: '1rem'
                }}>
                  ❌ Prohibited Commercial Uses
                </h3>
                <p style={{ color: '#991b1b', marginBottom: '1rem' }}>
                  You are specifically restricted from all commercial uses, including:
                </p>
                <ul style={{
                  listStyle: 'disc',
                  paddingLeft: '2rem',
                  color: '#dc2626',
                  marginBottom: '0'
                }}>
                  <li>Redistributing or reselling our virtual backgrounds</li>
                  <li>Including backgrounds in products or services you sell</li>
                  <li>Using backgrounds in commercial marketing materials</li>
                  <li>Uploading to stock photo websites or marketplaces</li>
                  <li>Using in website templates or themes for sale</li>
                  <li>Including in apps or software for distribution</li>
                  <li>Creating derivative works for commercial purposes</li>
                  <li>Using for corporate training materials sold to third parties</li>
                </ul>
              </div>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                6. Intellectual Property Rights
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                All virtual backgrounds, website content, and related materials are the original intellectual property of StreamBackdrops and are protected by applicable copyright and trademark law. We retain all rights, title, and interest in our virtual backgrounds.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                7. Commercial Licensing Available
              </h3>
              
              {/* Commercial Licensing */}
              <div style={{
                background: '#fefbeb',
                border: '2px solid #f59e0b',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: '#92400e',
                  marginBottom: '1rem'
                }}>
                  💼 Need Commercial Rights?
                </h3>
                <p style={{ color: '#92400e', marginBottom: '1rem' }}>
                  If you need to use our backgrounds for commercial purposes, commercial licensing is available. Please contact us to discuss your specific needs and licensing options.
                </p>
                <div style={{ textAlign: 'center' }}>
                  <Link href="/contact" style={{
                    background: '#f59e0b',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '1.5rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    Contact for Commercial Licensing
                  </Link>
                </div>
              </div>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                8. User Conduct
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                You agree not to use our backgrounds in any way that is unlawful, harmful, or could damage our reputation. You also agree not to claim ownership or authorship of our virtual backgrounds.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                9. Disclaimer
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                The information and backgrounds on this website are provided on an "as is" basis. To the fullest extent permitted by law, StreamBackdrops excludes all representations, warranties, and conditions relating to our website and backgrounds.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                10. Limitation of Liability
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                In no event shall StreamBackdrops, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of our virtual backgrounds, whether such liability is under contract, tort, or otherwise.
              </p>
<h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                11. Refund Policy
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                All sales are final. Due to the digital nature of our products — including HD image packs — we do not offer refunds, exchanges, or credits once a purchase is completed and download access has been granted. By completing a purchase, you acknowledge and agree to this no-refund policy. If you experience a technical issue preventing download, please contact us within 7 days of purchase and we will work to resolve it.
              </p>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                12. Privacy Policy
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                13. Termination
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                14. Changes to Terms
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                15. Governing Law
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                These Terms shall be interpreted and governed by the laws of the State of Pennsylvania, United States, without regard to its conflict of law provisions.
              </p>

              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: '#111827',
                marginTop: '2rem',
                marginBottom: '1rem'
              }}>
                16. Contact Information
              </h3>
              <p style={{ marginBottom: '2rem' }}>
                If you have any questions about these Terms of Service, please contact us through our website contact form or at the address provided on our Contact page.
              </p>

              {/* CTA Section */}
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
                  Questions About Our Terms?
                </h3>
                <p style={{
                  color: '#1e40af',
                  marginBottom: '1.5rem'
                }}>
                  If you have any questions about these terms or need clarification about usage rights, please don't hesitate to reach out.
                </p>
                <Link href="/contact" style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '1.5rem',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  Contact Us
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