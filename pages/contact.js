// ===== pages/contact.js =====
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <>
      <Head>
          <title>Contact Us - StreamBackdrops</title>
  <meta name="description" content="Contact StreamBackdrops for questions, feedback, or support. We'd love to hear from you." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://streambackdrops.com/contact" />
        <title>Contact Us - StreamBackdrops</title>
        <meta name="description" content="Get in touch with StreamBackdrops for support, feedback, or questions about our professional virtual backgrounds and setup guides." />
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
            
            <div style={{textAlign: 'center', marginBottom: '3rem'}}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>
                Contact Us
              </h1>
              <h2 style={{
                color: '#6b7280',
                fontSize: '1.1rem'
              }}>
We'd love to hear from you! Get in touch with questions or feedback.              </h2>
            </div>

            <div style={{fontSize: '1.1rem', lineHeight: '1.7', color: '#374151'}}>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                <div style={{
                  background: '#eff6ff',
                  padding: '2rem',
                  borderRadius: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>📧</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#1e40af',
                    marginBottom: '0.5rem'
                  }}>
                    Email Support
                  </h3>
                  <p style={{color: '#1e40af', marginBottom: '1rem'}}>
                    For technical support, feedback, or general inquiries
                  </p>
                  <p style={{
                    color: '#1e40af',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    support@streambackdrops.com
                  </p>
                </div>

                <div style={{
                  background: '#f0fdf4',
                  padding: '2rem',
                  borderRadius: '1rem',
                  textAlign: 'center'
                }}>
                  <div style={{fontSize: '2.5rem', marginBottom: '1rem'}}>💡</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#15803d',
                    marginBottom: '0.5rem'
                  }}>
                    Suggestions
                  </h3>
                  <p style={{color: '#15803d', marginBottom: '1rem'}}>
                    Have an idea for new backgrounds or features?
                  </p>
                  <p style={{
                    color: '#15803d',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    ideas@streambackdrops.com
                  </p>
                </div>
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
                      Check out our <Link href="/blog-virtual-background-guide" style={{color: '#2563eb'}}>complete technical guide</Link> for troubleshooting tips. If you're still having issues, email us with details about your setup and the specific problem you're experiencing.
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
                  <Link href="/blog-virtual-background-guide" style={{
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
                  <Link href="/blog-lighting-tips" style={{
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
                  <Link href="/blog-background-mistakes" style={{
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
      
      <Footer />
    </>
  );
}