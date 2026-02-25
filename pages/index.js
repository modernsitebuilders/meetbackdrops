import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HERO_IMAGES } from '../data/heroImages';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useEffect, useState } from 'react';
import { generateHomepageSchema } from '../data/homepageSchema';
import { getReviewsData } from '../lib/reviews';
// REMOVED: import Card from '../components/Card';
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

// Properly lazy load the category grid with no SSR
const CategoryGrid = dynamic(
  () => import('../components/CategoryGrid'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        padding: '1rem'
      }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            height: '300px',
            background: '#f0f0f0',
            borderRadius: '1rem'
          }} />
        ))}
      </div>
    )
  }
);

export default function Home({ structuredData }) {
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(false);
  
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
    
    // Only load categories after the page is fully loaded
    const timer = setTimeout(() => {
      setShowCategories(true);
    }, 3000); // Wait 3 seconds after page load
    
    return () => clearTimeout(timer);
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
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
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
  
      {/* Blog Cards Section - These don't have images, so they're fine */}
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Expert Tips for Video Call Success</h2>
        <p className={styles.sectionSubtitle}>
          Avoid common mistakes and look professional on every call
        </p>

        <div className={styles.blogGrid}>
          {/* These Card components don't have imageSrc, so they won't load images */}
          <div className="blog-card"> 
            <Link href="/blog/best-virtual-background-sites-2026">
              <h3>Best Free Background Sites 2026</h3>
              <p>Complete comparison: StreamBackdrops vs competitors</p>
            </Link>
          </div>
          <div className="blog-card">
            <Link href="/blog/background-mistakes">
              <h3>Perfect Lighting Setup</h3>
              <p>Look professional with proper lighting</p>
            </Link>
          </div>
          <div className="blog-card">
            <Link href="/blog/background-mistakes">
              <h3>5-Minute Setup Guide</h3>
              <p>Quick steps for perfect video calls</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <WhyDifferent />

      {/* Category Cards Grid - Only loads after 3 seconds */}
      {showCategories && <CategoryGrid navigate={navigate} />}

      {/* Social Proof */}
      <SocialProof />
    </Layout>
  );
}

export async function getStaticProps() {
  const reviewData = await getReviewsData();
  const structuredData = generateHomepageSchema(reviewData);
  return {
    props: { structuredData },
    revalidate: 3600
  };
}