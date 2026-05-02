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
  return `https://meetbackdrops.com${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
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

  const fullImageUrl = getFullImageUrl(image);

  return (
    <>
      <Head>
        {/* NOTE: the `title` and `description` props are the COMPLETE strings shown in search
            results — BlogLayout does NOT append any suffix or template. Each post in
            data/blogPosts.js owns its full title/description. Do not add "| MeetBackdrops"
            or any other template here; it would break the carefully tuned SEO character limits. */}
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
            { name: 'Home', url: 'https://meetbackdrops.com' },
            { name: 'Blog', url: 'https://meetbackdrops.com/blog' },
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
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#111827',
              textDecoration: 'none'
            }}>
              MeetBackdrops
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
                color: '#9a6a3a',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}>
                Home
              </Link>
              <span>›</span>
              <Link href="/blog" style={{
                color: '#9a6a3a',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.04em',
                transition: 'color 0.2s'
              }}>
                Journal
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