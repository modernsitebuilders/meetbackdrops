import Head from 'next/head';
import { HERO_IMAGES } from '../data/heroImages';
import Image from 'next/image';
import Link from 'next/link';
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
      description={`Download ${TOTAL_IMAGES_FORMATTED} free professional virtual backgrounds for Zoom, Teams, and Meet. Perfect for video calls, remote work, and online meetings. No signup required, no watermarks.`}
      currentPage="home"
      canonical="https://streambackdrops.com"
      structuredData={structuredData}
    >
      <Head>
        <FAQSchema questions={getFAQs('homepage')} />
      </Head>
      
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
    priority={img.priority}
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
      </section>
  
      {/* Blog Cards Section */}
      <section className={styles.blogSection}>
        <h2 className={styles.sectionTitle}>Expert Tips for Video Call Success</h2>
        <p className={styles.sectionSubtitle}>
          Avoid common mistakes and look professional on every call
        </p>

        <div className={styles.blogGrid}>
          <Card 
            href="/blog/best-virtual-background-sites-2025"
            title="Best Free Background Sites 2025"
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
          <Card
            href="/blog/christmas-backgrounds"
            title="Christmas Backgrounds 2025"
            description="46 free festive backgrounds for December"
            emoji="🎄"
            className="blog-card"
            customStyles={{
              background: 'linear-gradient(135deg, #ef4444 0%, #22c55e 100%)',
              border: '2px solid #22c55e',
              titleColor: 'white',
              descColor: 'rgba(255,255,255,0.9)'
            }}
          />
        </div>
      </section>

      {/* Why We're Different */}
      <WhyDifferent />

      {/* Category Cards Grid */}
      <div className={`${styles.categoryGrid} category-grid`}>
        <Card href="/category/bookshelves-bright" title="Bookshelves - Bright" description="Bright bookshelf backgrounds perfect for professional video calls" imageSrc="/images/bookshelves-bright/bookshelves-bright-01.webp" imageAlt="Bright bookshelf background for video calls" navigate={navigate} priority={true} count={CATEGORIES['bookshelves-bright'].count} />
        <Card href="/category/bookshelves-dark" title="Bookshelves - Dark" description="Warm bookshelf backgrounds with ambient lighting for professional calls" imageSrc="/images/bookshelves-dark/bookshelves-dark-01.webp" imageAlt="Dark bookshelf background for video meetings" navigate={navigate} count={CATEGORIES['bookshelves-dark'].count} />
        <Card href="/category/wall-shelves-bright" title="Wall Shelves - Bright" description="Clean, minimalist wall shelf backgrounds with bright lighting" imageSrc="/images/wall-shelves-bright/wall-shelves-bright-01.webp" imageAlt="Bright wall shelf background for video calls" navigate={navigate} count={CATEGORIES['wall-shelves-bright'].count} />
        <Card href="/category/wall-shelves-dark" title="Wall Shelves - Dark" description="Sleek wall shelf backgrounds with warm ambient lighting" imageSrc="/images/wall-shelves-dark/wall-shelves-dark-01.webp" imageAlt="Dark wall shelf background for video meetings" navigate={navigate} count={CATEGORIES['wall-shelves-dark'].count} />
        <Card href="/category/office-spaces" title="Office Spaces" description="Modern office settings that convey professionalism and focus" imageSrc="/images/office-spaces/office-spaces-01.webp" imageAlt="Professional office space background for business calls" navigate={navigate} count={CATEGORIES['office-spaces'].count} />
        <Card href="/category/living-rooms" title="Living Rooms" description="Comfortable home settings that feel welcoming and professional" imageSrc="/images/living-rooms/living-room-29.webp" imageAlt="Comfortable living room backgrounds" navigate={navigate} count={CATEGORIES['living-rooms'].count} />
        <Card href="/category/kitchens" title="Kitchen Backgrounds" description="Warm kitchen spaces that create a friendly, approachable atmosphere" imageSrc="/images/kitchens/kitchen-09.webp" imageAlt="Kitchen virtual background" navigate={navigate} count={CATEGORIES['kitchens'].count} />
        <Card href="/category/coffee-shops" title="Coffee Shops" description="Cozy coffee shop backgrounds for casual meetings" imageSrc="/images/coffee-shops/coffee-shop-10.webp" imageAlt="Coffee shop virtual background" navigate={navigate} count={CATEGORIES['coffee-shops'].count} />
        <Card href="/category/art-galleries" title="Art Galleries" description="Sophisticated art gallery spaces with clean walls" imageSrc="/images/art-galleries/art-gallery-1.webp" imageAlt="Art gallery virtual background" navigate={navigate} count={CATEGORIES['art-galleries'].count} />
        <Card href="/category/urban-lofts" title="Urban Lofts" description="Modern industrial loft spaces with exposed brick" imageSrc="/images/urban-lofts/urban-loft-1.webp" imageAlt="Urban loft virtual background" navigate={navigate} count={CATEGORIES['urban-lofts'].count} />
        <Card href="/category/gardens-patios" title="Gardens & Patios" description="Beautiful outdoor garden and patio backgrounds" imageSrc="/images/gardens-patios/garden-patio-1.webp" imageAlt="Garden and patio virtual background" navigate={navigate} count={CATEGORIES['gardens-patios'].count} />
        <Card href="/category/historic-spaces" title="Historic Spaces" description="Elegant historic interiors including ballrooms" imageSrc="/images/historic-spaces/historic-space-6.webp" imageAlt="Historic space virtual background" navigate={navigate} count={CATEGORIES['historic-spaces'].count} />
        <Card href="/category/nature-landscapes" title="Nature & Landscapes" description="Stunning natural landscapes and scenic outdoor views for nature-inspired calls" imageSrc="/images/nature-landscapes/nature-landscape-1.webp" imageAlt="Nature landscape virtual background" navigate={navigate} count={CATEGORIES['nature-landscapes'].count} />        
        <Card href="/category/libraries" title="Libraries" description="Classic library rooms with floor-to-ceiling books" imageSrc="/images/libraries/library-1.webp" imageAlt="Library virtual background" navigate={navigate} count={CATEGORIES['libraries'].count} />
        <Card href="/category/bokeh-backgrounds" title="Bokeh Backgrounds" description="Beautiful bokeh light effects with artistic blur for elegant calls" imageSrc="/images/bokeh-backgrounds/bokeh-56.webp" imageAlt="Bokeh virtual background" navigate={navigate} count={CATEGORIES['bokeh-backgrounds'].count} />
        <Card href="/category/christmas-backgrounds" title="Christmas Backgrounds 🎄" description="Festive Christmas backgrounds with holiday decorations" imageSrc="/images/christmas-backgrounds/christmas-background-01.webp" imageAlt="Christmas virtual background" navigate={navigate} count={CATEGORIES['christmas-backgrounds'].count} />
        <Card href="/category/halloween-backgrounds" title="Halloween Backgrounds 🎃" description="Festive Halloween backgrounds with pumpkins" imageSrc="/images/halloween-backgrounds/halloween-background-11.webp" imageAlt="Halloween virtual background" navigate={navigate} count={CATEGORIES['halloween-backgrounds'].count} />
      </div>

      {/* Social Proof */}
      <SocialProof />
    </Layout>
  );
}

// Fetch review data every time the page loads
export async function getServerSideProps() {
  const reviewData = await getReviewsData();
  const structuredData = generateHomepageSchema(reviewData);

  return {
    props: {
      structuredData
    }
  };
}