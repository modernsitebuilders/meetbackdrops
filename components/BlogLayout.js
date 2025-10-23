import Head from 'next/head';
import Link from 'next/link';
import Footer from './Footer';
import { useEffect } from 'react';
import FAQSchema from './FAQSchema';
import BlogPostSchema from './BlogPostSchema';
import BreadcrumbSchema from './BreadcrumbSchema';

// Utility function for consistent image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://streambackdrops.com${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

export default function BlogLayout({ 
  children, 
  title, 
  description, 
  keywords,
  canonical,
  headline,
  image,
  datePublished,
  dateModified,
  faqQuestions = null 
}) {
  // Tracking code that was duplicated in every blog page
  useEffect(() => {
    const trackPageView = async () => {
      if (typeof window !== 'undefined') {
        try {
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

          await fetch('/api/track-page-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              page: canonical.replace('https://streambackdrops.com', ''),
              category: 'blog',
              referrer: referrer
            })
          });
        } catch (error) {
          console.error('Tracking failed:', error);
        }
      }
    };

    trackPageView();
  }, [canonical]);

  const fullImageUrl = getFullImageUrl(image);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonical} />
        
        <BlogPostSchema 
          headline={headline}
          description={description}
          image={fullImageUrl}
          datePublished={datePublished}
          dateModified={dateModified}
          url={canonical}
        />
        
        <BreadcrumbSchema 
          items={[
            { name: 'Home', url: 'https://streambackdrops.com' },
            { name: 'Blog', url: 'https://streambackdrops.com/blog' },
            { name: headline, url: canonical }
          ]}
        />
        
        {faqQuestions && <FAQSchema questions={faqQuestions} />}
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 0'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem'
          }}>
            <Link href="/" style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              textDecoration: 'none'
            }}>
              StreamBackdrops
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {/* Breadcrumbs */}
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '1rem 2rem 0'
          }}>
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: '#6b7280',
              marginBottom: '1rem'
            }}>
              <Link href="/" style={{
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Home
              </Link>
              <span>›</span>
              <Link href="/blog" style={{
                color: '#2563eb',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}>
                Blog
              </Link>
              <span>›</span>
              <span style={{ color: '#111827', fontWeight: '500' }}>
                {headline}
              </span>
            </nav>
          </div>
          
          {children}
        </main>

        <Footer />
      </div>
    </>
  );
}