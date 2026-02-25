import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HERO_IMAGES } from '../data/heroImages';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { generateHomepageSchema } from '../data/homepageSchema';
import { getReviewsData } from '../lib/reviews';
import Card from '../components/Card';
import TrustBadges from '../components/TrustBadges';
import WhyDifferent from '../components/WhyDifferent';
import SocialProof from '../components/SocialProof';
import HeroCTA from '../components/HeroCTA';
import styles from '../styles/HomePage.module.css';
import FAQSchema from '../components/FAQSchema';
import { getFAQs } from '../data/faqData';
import { TOTAL_IMAGES_FORMATTED, CATEGORIES } from '../lib/categories-config';
import HDBadge from '../components/HDBadge';
import EquipmentGuideCTA from '../components/EquipmentGuideCTA';

// Lazy load the category grid - this prevents all category JS from loading on homepage
const CategoryGrid = dynamic(() => import('../components/CategoryGrid'), {
  loading: () => (
    <div className={styles.categoryGridLoading} style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
      gap: '1.5rem',
      padding: '1rem',
      minHeight: '400px'
    }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          height: '300px',
          background: '#f0f0f0',
          borderRadius: '1rem',
          animation: 'pulse 1.5s infinite'
        }} />
      ))}
    </div>
  ),
  ssr: false // Set to false since categories are below the fold
});

export default function Home({ structuredData }) {
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

  return (
    <Layout
      title="Free Professional Virtual Backgrounds - StreamBackdrops"
      description={`Download ${TOTAL_IMAGES_FORMATTED} free professional virtual backgrounds for Zoom, Teams & Meet. Perfect for video calls and remote work. No signup, no watermarks.`}
      currentPage="home"
      canonical="https://streambackdrops.com"
      structuredData={structuredData}
    >
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <FAQSchema questions={getFAQs('homepage')} />
      </Head>

      {/* Equipment Guide CTA */}
      <EquipmentGuideCTA />

      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Hero Image Collage */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 2rem auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)'
        }}>
          {HERO_IMAGES.map((img, i) => (
            <Image 
              key={i}
              src={img.src}
              alt={img.alt}
              width={333}
              height={200}
              style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
              priority={i === 0} // Only first image has priority
              loading={i === 0 ? 'eager' : 'lazy'} // Lazy load others
              sizes="(max-width: 768px) calc(100vw / 3), 333px"
            />
          ))}
        </div>
        
        <h1 className={styles.heroTitle}>
          Professional Virtual Backgrounds Optimized for Video Calls
        </h1>
        <p className={styles.heroSubtitle}>
          {TOTAL_IMAGES_FORMATTED} backgrounds designed specifically for Zoom, Teams & Google Meet
          <br />
          <strong className={styles.heroHighlight}>
            Perfect lighting • Proper composition • No signup • No watermarks
          </strong>
        </p>
        
        <TrustBadges />
        <HeroCTA />
        <HDBadge />
      </section>
  
      {/* Blog Cards Section */}
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Expert Tips for Video Call Success</h2>
        <p className={styles.sectionSubtitle}>
          Avoid common mistakes and look professional on every call
        </p>

        <div className={styles.blogGrid}>
          <Card 
            href="/blog/best-virtual-background-sites-2026"
            title="Best Free Background Sites 2026"
            description="Complete comparison: StreamBackdrops vs competitors"
            className="blog-card"
          />
          <Card
            href="/blog/background-mistakes"
            title="Perfect Lighting Setup"
            description="Look professional with proper lighting"
            className="blog-card"
          />
          <Card
            href="/blog/background-mistakes"
            title="5-Minute Setup Guide"
            description="Quick steps for perfect video calls"
            className="blog-card"
          />
        </div>
      </section>

      {/* Why We're Different */}
      <WhyDifferent />

      {/* Lazy Loaded Category Cards Grid - Now loads only when scrolled to */}
      <CategoryGrid navigate={navigate} />

      {/* Social Proof */}
      <SocialProof />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Layout>
  );
}

// Fetch review data every time the page loads
export async function getStaticProps() {
  const reviewData = await getReviewsData();
  const structuredData = generateHomepageSchema(reviewData);
  return {
    props: { structuredData },
    revalidate: 3600
  };
}