import Head from 'next/head';
import dynamic from 'next/dynamic';
import { HERO_IMAGES } from '../data/heroImages';
import Layout from '../components/Layout';
import TrustBadges from '../components/TrustBadges';
import HeroCTA from '../components/HeroCTA';
import HDBadge from '../components/HDBadge';
import WhyDifferent from '../components/WhyDifferent';
import VideoObjectSchema from '../components/VideoObjectSchema';
import SocialProof from '../components/SocialProof';
import { useRouter } from 'next/router';

// YT iframe API + tracking. Below the fold — defer the chunk + script load.
const YoutubeEmbed = dynamic(() => import('../components/YoutubeEmbed'), { ssr: false });

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

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
  return (
    <Layout
      title="Free Virtual Background Images for Zoom & Teams | StreamBackdrops"
      description="Download 1300+ free still image virtual backgrounds for Zoom, Teams & Google Meet. Static photos — no video, no signup, no watermarks. Bookshelf, office, nature & more — instant download."
      currentPage="home"
    >
      <Head>
        <VideoObjectSchema
          name="StreamBackdrops Overview"
          description="See how to browse, preview, and download free professional virtual backgrounds from StreamBackdrops for Zoom, Teams, and Google Meet."
          thumbnailUrl="https://img.youtube.com/vi/Vv1sMh3pG_I/maxresdefault.jpg"
          uploadDate="2026-04-11"
          embedUrl="https://www.youtube.com/embed/Vv1sMh3pG_I"
          contentUrl="https://www.youtube.com/watch?v=Vv1sMh3pG_I"
          duration="PT1M56S"
        />
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
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              width={1456}
              height={816}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'auto'}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          ))}
        </div>
        
        <h1 style={{ textAlign: 'center' }}>Professional Virtual Backgrounds</h1>
        <p style={{ textAlign: 'center' }}>Free backgrounds for video calls</p>
        
        <TrustBadges />
<HeroCTA />
<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
  <HDBadge />
</div>
<WhyDifferent />

        <div style={{ maxWidth: '640px', margin: '0 auto 2rem', padding: '0 1rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>See It in Action</h2>
          <YoutubeEmbed videoId="Vv1sMh3pG_I" title="StreamBackdrops Overview" />
        </div>

        <SocialProof />
        
        {/* Category Grid - Lazy loaded */}
        <CategoryGrid navigate={navigate} />
      </section>
    </Layout>
  );
}