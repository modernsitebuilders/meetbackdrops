import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function BlogLightingTips() {
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
          page: '/blog-lighting-tips',
          category: 'blog',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  return (
    <>
      <Head>
        <title>Virtual Background Lighting Tips - StreamBackdrops</title>
        <meta name="description" content="Master video call lighting. Learn professional lighting setup for virtual backgrounds, avoid common mistakes, and look great on camera." />
        <meta name="keywords" content="video call lighting, virtual background lighting, home office lighting, video conferencing setup, professional lighting" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://streambackdrops.com/blog-lighting-tips" />
        {/* Article structured data */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Perfect Lighting Setup for Virtual Backgrounds: Complete Guide",  
      "image": "https://streambackdrops.com/images/bookshelves-bright/well-lit-05.webp",
      "author": {
        "@type": "Organization",
        "name": "StreamBackdrops"
      },
      "publisher": {
        "@type": "Organization", 
        "name": "StreamBackdrops",
        "url": "https://streambackdrops.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://streambackdrops.com/logo.png"
        }
      },
      "datePublished": "2025-07-15", 
      "dateModified": "2025-07-15",  
      "description": "Master video call lighting. Learn professional lighting setup for virtual backgrounds, avoid common mistakes, and look great on camera.", 
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://streambackdrops.com/blog-lighting-tips" 
      }
    })}
  </script>
  
  {/* Breadcrumb Schema */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://streambackdrops.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://streambackdrops.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Lighting Setup Guide",
          "item": "https://streambackdrops.com/blog-lighting-tips"
        }
      ]
    })}
  </script>
  
  {/* FAQ Schema */}
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the best affordable lighting for video calls?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A basic ring light (10-18 inches) positioned at eye level provides excellent, affordable lighting for video calls. Natural window light is also free and effective if positioned correctly."
          }
        },
        {
          "@type": "Question",
          "name": "Where should I position my lights for video calls?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Position your main light source in front of you at eye level or slightly above. If using two lights, place them at 45-degree angles on either side. Avoid backlighting from windows behind you."
          }
        },
        {
          "@type": "Question",
          "name": "How can I improve video call lighting without buying equipment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Face a window for natural light, use a white poster board as a reflector, turn on all room lights, and adjust your camera settings. These free solutions can dramatically improve your lighting."
          }
        }
      ]
    })}
  </script>
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

      {/* Blog Content Container */}
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
            
            <article>
              <header style={{marginBottom: '2rem'}}>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#2563eb',
                  marginBottom: '0.5rem',
                  lineHeight: '1.2'
                }}>
                  Video Call Lighting Guide
                </h1>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '1rem',
                  lineHeight: '1.2'
                }}>
                  Perfect Lighting Setup for Virtual Backgrounds: A Complete Guide
                </h2>
                <p style={{color: '#6b7280', fontStyle: 'italic'}}>
                  Published: August 2, 2025
                </p>
              </header>

              <div style={{fontSize: '1.1rem', lineHeight: '1.7', color: '#374151'}}>
                <p style={{fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem'}}>
                  The difference between looking professional and looking amateurish on video calls often comes down to one thing: lighting. Even the most expensive virtual background won't help if you're poorly lit. Here's everything you need to know about creating the perfect lighting setup for virtual backgrounds.
                </p>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  Why Lighting Matters More Than Your Camera
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  You might think upgrading your camera is the solution to better video calls, but lighting has a much bigger impact on your appearance. Good lighting can make a basic webcam look professional, while poor lighting will make even a 4K camera look terrible.
                </p>
                <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>When using virtual backgrounds, proper lighting becomes even more critical because:</p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                  <li>Poor lighting creates harsh edges around your silhouette</li>
                  <li>Inconsistent lighting makes background replacement look artificial</li>
                  <li>Shadows can cause parts of your body to disappear into the background</li>
                </ul>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  The Golden Rules of Video Call Lighting
                </h3>
                
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                  1. Face Your Light Source
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  The most important rule: your primary light source should be in front of you, not behind you. Window light, desk lamps, or ring lights should all face toward you.
                </p>
                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                  <strong>Common mistake:</strong> Sitting with a window behind you creates a silhouette effect that makes you nearly invisible.
                </p>

                <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '1.5rem', marginBottom: '0.75rem'}}>
                  2. Use Soft, Diffused Light
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Harsh, direct lighting creates unflattering shadows and highlights. Soft, even lighting is much more flattering and professional-looking.
                </p>
                <p style={{color: '#6b7280', marginBottom: '0.5rem'}}><strong>DIY diffusion tricks:</strong></p>
                <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#6b7280', marginBottom: '1.5rem'}}>
                  <li>Hang a thin white sheet in front of a bright light</li>
                  <li>Bounce light off a white wall or ceiling</li>
                  <li>Use lampshades to soften direct bulbs</li>
                </ul>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  Lighting Setups by Budget
                </h3>

                <div style={{
                  background: '#ecfdf5',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#065f46', marginBottom: '0.75rem'}}>
                    Budget Setup ($0-$25)
                  </h3>
                  <p style={{color: '#059669', marginBottom: '0.5rem'}}><strong>Natural window light</strong> is your best friend:</p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#059669'}}>
                    <li>Sit facing a large window during daytime</li>
                    <li>Use white poster board as a reflector to fill shadows</li>
                    <li>Close blinds slightly to diffuse harsh sunlight</li>
                    <li>Schedule important calls during optimal lighting hours</li>
                  </ul>
                </div>

                <div style={{
                  background: '#eff6ff',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem'}}>
                    Mid-Range Setup ($25-$100)
                  </h3>
                  <p style={{color: '#1e40af', marginBottom: '0.5rem'}}><strong>LED desk lamp + ring light combination:</strong></p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#1e40af'}}>
                    <li>24-inch LED ring light ($40-60)</li>
                    <li>Adjustable desk lamp for fill lighting ($15-25)</li>
                    <li>White foam board for reflection ($5-10)</li>
                  </ul>
                </div>

                <div style={{
                  background: '#faf5ff',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{fontSize: '1.25rem', fontWeight: '600', color: '#581c87', marginBottom: '0.75rem'}}>
                    Professional Setup ($100-$300)
                  </h3>
                  <p style={{color: '#581c87', marginBottom: '0.5rem'}}><strong>Dedicated studio lighting:</strong></p>
                  <ul style={{listStyle: 'disc', paddingLeft: '1.5rem', color: '#581c87'}}>
                    <li>Key light: Softbox LED panel ($60-100)</li>
                    <li>Fill light: Smaller LED panel or ring light ($30-50)</li>
                    <li>Background light: Strip LED or small spotlight ($20-40)</li>
                    <li>Light stands and diffusers ($30-60)</li>
                  </ul>
                </div>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  Common Lighting Problems and Solutions
                </h3>

                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
                  <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                    <p style={{fontWeight: '600', color: '#111827'}}>Problem: Dark shadows under your eyes</p>
                    <p style={{color: '#6b7280'}}><strong>Solution:</strong> Add a fill light below your main light source, or use a white surface to bounce light upward.</p>
                  </div>

                  <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                    <p style={{fontWeight: '600', color: '#111827'}}>Problem: Harsh shadows on one side of your face</p>
                    <p style={{color: '#6b7280'}}><strong>Solution:</strong> Add a second light source on the opposite side, or use a reflector to bounce light into the shadows.</p>
                  </div>

                  <div style={{borderLeft: '4px solid #ef4444', paddingLeft: '1rem'}}>
                    <p style={{fontWeight: '600', color: '#111827'}}>Problem: Virtual background keeps cutting out parts of your body</p>
                    <p style={{color: '#6b7280'}}><strong>Solution:</strong> Ensure even lighting across your entire torso - no dramatic shadows or bright spots.</p>
                  </div>
                </div>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  Quick Lighting Checklist
                </h3>
                <p style={{color: '#6b7280', marginBottom: '0.5rem'}}>Before every important video call:</p>
                <ul style={{listStyle: 'none', color: '#6b7280', marginBottom: '1.5rem'}}>
                  <li>☐ Primary light source is in front of me</li>
                  <li>☐ No harsh shadows on my face</li>
                  <li>☐ Background is evenly lit (if using physical setup)</li>
                  <li>☐ No competing light sources with different color temperatures</li>
                  <li>☐ Virtual background edges look clean and professional</li>
                  <li>☐ I've tested the setup in current lighting conditions</li>
                </ul>

                <h3 style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginTop: '2rem', marginBottom: '1rem'}}>
                  Conclusion
                </h3>
                <p style={{color: '#6b7280', marginBottom: '1rem'}}>
                  Great lighting doesn't require expensive equipment - it requires understanding the principles and working with what you have. Start with natural window light, add affordable LED lights as needed, and always prioritize soft, even illumination over harsh, direct lighting.
                </p>
                <p style={{color: '#6b7280', marginBottom: '1.5rem'}}>
                  The investment in good lighting pays dividends in how others perceive your professionalism during video calls. Whether you're meeting with clients, interviewing for jobs, or presenting to your team, proper lighting ensures you always put your best face forward.
                </p>

                <div style={{
                  background: '#eff6ff',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginTop: '2rem'
                }}>
                  <p style={{color: '#1e40af', fontWeight: '500', marginBottom: '1rem'}}>
                    Pair great lighting with our professional virtual backgrounds for the ultimate video call setup.
                  </p>
                  <Link href="/" style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '500',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'background-color 0.2s'
                  }}>
                    Browse Backgrounds →
                  </Link>
                </div>
              </div>
            </article>
            
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}