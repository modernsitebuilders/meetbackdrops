import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { homepageStructuredData } from '../data/homepageSchema';
import Card from '../components/Card';
import TrustBadges from '../components/TrustBadges';
import WhyDifferent from '../components/WhyDifferent';
import SocialProof from '../components/SocialProof';
import styles from '../styles/HomePage.module.css';
import FAQSchema from '../components/FAQSchema';
import { getFAQs } from '../data/faqData';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
  }, []);
  
  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('streambackdrops_admin') === 'true') {
        return;
      }
      
      let referrer = document.referrer || 'direct';
      
      if (!sessionStorage.getItem('entry_referrer') && document.referrer) {
        sessionStorage.setItem('entry_referrer', document.referrer);
      }
      
      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/',
          category: 'homepage',
          referrer: referrer
        })
      }).catch(err => console.log('Homepage tracking failed:', err));
    }
  }, []);

  return (
    <Layout
      title="Free Professional Virtual Backgrounds - StreamBackdrops"
      description="Download 330+ free professional HD virtual backgrounds for Zoom, Microsoft Teams, and Google Meet. Perfect for video calls, remote work, and online meetings. No signup required, no watermarks - instant download of high-quality backgrounds including offices, bookshelves, living rooms, and more."
      currentPage="home"
      canonical="https://streambackdrops.com"
      structuredData={homepageStructuredData} 
    >
      <Head>
        <FAQSchema questions={getFAQs('homepage')} />
      </Head>
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Professional Virtual Backgrounds Optimized for Video Calls
        </h1>
        <p className={styles.heroSubtitle}>
          330+ HD backgrounds designed specifically for Zoom, Teams & Google Meet
          <br />
          <strong className={styles.heroHighlight}>
            Perfect lighting • Proper composition • No signup • No watermarks
          </strong>
        </p>
        
        <TrustBadges />
      </section>
  
      {/* Blog Cards Section */}
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Expert Tips for Video Call Success</h2>
        <p className={styles.sectionSubtitle}>
          Avoid common mistakes and look professional on every call
        </p>

        <div className={styles.blogGrid}>
          <Card 
            href="/blog-best-virtual-background-sites-2025"
            title="Best Free Background Sites 2025"
            description="Complete comparison: StreamBackdrops vs competitors"
            className="blog-card"
          />
          <Card
            href="/blog-background-mistakes"
            title="Perfect Lighting Setup"
            description="Look professional with proper lighting"
            className="blog-card"
          />
          <Card
            href="/blog-background-mistakes"
            title="5-Minute Setup Guide"
            description="Quick steps for perfect video calls"
            className="blog-card"
          />
          <Card
            href="/blog-halloween-backgrounds"
            title="Halloween Backgrounds 2025"
            description="25 free spooky backgrounds for October"
            emoji="🎃"
            className="blog-card"
            customStyles={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              border: '2px solid #ff6b35',
              titleColor: 'white',
              descColor: 'rgba(255,255,255,0.9)'
            }}
          />
        </div>
      </section>

      {/* Why We're Different */}
      <WhyDifferent />

      {/* Category Cards Grid */}
      <div className={styles.categoryGrid}>
        <Card href="/category/bookshelves-bright" title="Bookshelves - Bright" description="Bright bookshelf backgrounds perfect for professional video calls" imageSrc="/images/bookshelves-bright/well-lit-12.webp" imageAlt="Bright bookshelf background for video calls" navigate={navigate} priority={true} />
        <Card href="/category/bookshelves-dark" title="Bookshelves - Dark" description="Warm bookshelf backgrounds with ambient lighting for professional calls" imageSrc="/images/bookshelves-dark/ambient-01.webp" imageAlt="Dark bookshelf background for video meetings" navigate={navigate} />
        <Card href="/category/office-spaces" title="Office Spaces" description="Modern office settings that convey professionalism and focus" imageSrc="/images/office-spaces/office-spaces-01.webp" imageAlt="Professional office space background for business calls" navigate={navigate} />
        <Card href="/category/living-rooms" title="Living Rooms" description="Comfortable home settings that feel welcoming and professional" imageSrc="/images/living-rooms/living-room-29.webp" imageAlt="Comfortable living room backgrounds" navigate={navigate} />
        <Card href="/category/kitchens" title="Kitchen Backgrounds" description="Warm kitchen spaces that create a friendly, approachable atmosphere" imageSrc="/images/kitchens/kitchen-09.webp" imageAlt="Kitchen virtual background" navigate={navigate} />
        <Card href="/category/coffee-shops" title="Coffee Shops" description="Cozy coffee shop backgrounds for casual meetings" imageSrc="/images/coffee-shops/coffee-shop-10.webp" imageAlt="Coffee shop virtual background" navigate={navigate} />
        <Card href="/category/art-galleries" title="Art Galleries" description="Sophisticated art gallery spaces with clean walls" imageSrc="/images/art-galleries/art-gallery-1.webp" imageAlt="Art gallery virtual background" navigate={navigate} />
        <Card href="/category/urban-lofts" title="Urban Lofts" description="Modern industrial loft spaces with exposed brick" imageSrc="/images/urban-lofts/urban-loft-1.webp" imageAlt="Urban loft virtual background" navigate={navigate} />
        <Card href="/category/gardens-patios" title="Gardens & Patios" description="Beautiful outdoor garden and patio backgrounds" imageSrc="/images/gardens-patios/garden-patio-1.webp" imageAlt="Garden and patio virtual background" navigate={navigate} />
        <Card href="/category/historic-spaces" title="Historic Spaces" description="Elegant historic interiors including ballrooms" imageSrc="/images/historic-spaces/historic-space-6.webp" imageAlt="Historic space virtual background" navigate={navigate} />
        <Card href="/category/nature-landscapes" title="Nature & Landscapes" description="Stunning natural landscapes" imageSrc="/images/nature-landscapes/nature-landscape-1.webp" imageAlt="Nature landscape virtual background" navigate={navigate} />
        <Card href="/category/libraries" title="Libraries" description="Classic library rooms with floor-to-ceiling books" imageSrc="/images/libraries/library-1.webp" imageAlt="Library virtual background" navigate={navigate} />
        <Card href="/category/halloween-backgrounds" title="Halloween Backgrounds 🎃" description="Festive Halloween backgrounds with pumpkins" imageSrc="/images/halloween-backgrounds/halloween-background-11.webp" imageAlt="Halloween virtual background" navigate={navigate} />
      </div>

      {/* Social Proof */}
      <SocialProof />

      {/* SEO Content (keep your existing SEO section here) */}
      <section className={styles.seoSection}>
        {/* Your existing SEO content */}
      </section>
    </Layout>
  );
}