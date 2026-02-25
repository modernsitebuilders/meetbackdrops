import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HERO_IMAGES } from '../data/heroImages';
import Image from 'next/image';
import Layout from '../components/Layout';
import TrustBadges from '../components/TrustBadges';
import HeroCTA from '../components/HeroCTA';
import HDBadge from '../components/HDBadge';
import WhyDifferent from '../components/WhyDifferent';
import SocialProof from '../components/SocialProof';
import { useRouter } from 'next/router';

// Lazy load the category grid - only loads when scrolled into view
const CategoryGrid = dynamic(
  () => import('../components/CategoryGrid'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        padding: '2rem 1rem',
        minHeight: '400px'
      }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            height: '250px',
            background: 'linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)',
            borderRadius: '1rem',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }} />
        ))}
      </div>
    )
  }
);

export default function Home() {
  const router = useRouter();
  
  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    }
  };

  return (
    <Layout title="StreamBackdrops" description="Free virtual backgrounds">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Head>

      <section style={{ padding: '2rem' }}>
        {/* Hero Image Collage */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {HERO_IMAGES.map((img, i) => (
            <Image 
              key={i}
              src={img.src}
              alt={img.alt}
              width={333}
              height={200}
              priority={i === 0}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          ))}
        </div>
        
        <h1 style={{ textAlign: 'center' }}>Professional Virtual Backgrounds</h1>
        <p style={{ textAlign: 'center' }}>Free backgrounds for video calls</p>
        
        <TrustBadges />
        <HeroCTA />
        <HDBadge />
        <WhyDifferent />
        <SocialProof />
        
        {/* Category Grid - Lazy loaded */}
        <CategoryGrid navigate={navigate} />
      </section>
    </Layout>
  );
}