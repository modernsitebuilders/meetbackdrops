import Head from 'next/head';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { HERO_IMAGES } from '../data/heroImages';
import Layout from '../components/Layout';
import TrustBadges from '../components/TrustBadges';
import HeroCTA from '../components/HeroCTA';
import HDBadge from '../components/HDBadge';
import WhyDifferent from '../components/WhyDifferent';
import VideoObjectSchema from '../components/VideoObjectSchema';
import SocialProof from '../components/SocialProof';
import Link from 'next/link';
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
  // search results. Layout does not append "| MeetBackdrops" or any other suffix.
  // Length budgets enforced by scripts/check-seo-meta.js: title ≤ 65, description 110-160.
  return (
    <Layout
      title="Studio-Designed Zoom & Teams Backgrounds | MeetBackdrops"
      description="Studio-designed, 4K-upscaled backgrounds for Zoom, Teams, and Google Meet. Composed for camera, not pulled from stock. Free samples available."
      canonical="https://meetbackdrops.com"
      currentPage="home"
    >
      <Head>
        <VideoObjectSchema
          name="MeetBackdrops Overview"
          description="See how to browse, preview, and download free professional virtual backgrounds from MeetBackdrops for Zoom, Teams, and Google Meet."
          thumbnailUrl="https://img.youtube.com/vi/CFx0FH6Y-cc/maxresdefault.jpg"
          uploadDate="2026-05-29T00:00:00+00:00"
          embedUrl="https://www.youtube.com/embed/CFx0FH6Y-cc"
          contentUrl="https://www.youtube.com/watch?v=CFx0FH6Y-cc"
          duration="PT1M35S"
        />
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </Head>

      <section style={{ padding: '4rem 2rem 2rem' }}>
        {/* Eyebrow */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#9a6a3a',
          fontWeight: 600,
          marginBottom: '1.25rem'
        }}>
          Virtual Set Design Studio
        </div>

        {/* Hero Image Collage */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.25rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {HERO_IMAGES.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 30vw, (max-width: 1024px) 32vw, 360px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

        <h1
          style={{
            textAlign: 'center',
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            lineHeight: 1.05,
            margin: '3rem auto 1.25rem',
            maxWidth: '900px',
            color: '#111827'
          }}
        >
          Professional Zoom backgrounds,<br />designed as sets.
        </h1>

        <p
          style={{
            textAlign: 'center',
            fontSize: '1.15rem',
            color: '#4b5563',
            lineHeight: 1.65,
            maxWidth: '720px',
            margin: '0 auto 0.5rem'
          }}
        >
          Studio-designed, 4K-upscaled backgrounds for Zoom, Teams, and Google Meet —
          composed for camera, not pulled from stock.
        </p>

        <TrustBadges />
        <HeroCTA />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '1.5rem' }}>
          <HDBadge />
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#4b5563',
          marginTop: '1.25rem',
          letterSpacing: '0.01em'
        }}>
          Free samples — no signup. HD editions from $4.99.
        </p>

        <WhyDifferent />

        <div style={{ maxWidth: '720px', margin: '4rem auto 2rem', padding: '0 1rem' }}>
          <h2 style={{
            textAlign: 'center',
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            color: '#111827',
            marginBottom: '1.5rem'
          }}>
            See It in Action
          </h2>
          <YoutubeEmbed videoId="CFx0FH6Y-cc" title="MeetBackdrops Overview" />
        </div>

        <SocialProof />

        {/* Curated by profession — links into /collections persona hub */}
        <section style={{ maxWidth: '1100px', margin: '4rem auto 1rem', padding: '0 1rem', textAlign: 'center' }}>
          <div style={{
            fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#9a6a3a', fontWeight: 600, marginBottom: '0.9rem',
          }}>
            Curated by Profession
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontWeight: 600, letterSpacing: '-0.02em',
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            color: '#111827', margin: '0 0 0.75rem',
          }}>
            Or browse by what you do
          </h2>
          <p style={{ color: '#4b5563', maxWidth: '640px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Hand-picked sets for how they read on camera in your line of work — designed for Zoom, Teams, and Google Meet.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {[
              { slug: 'zoom-backgrounds-for-lawyers', persona: 'Lawyers' },
              { slug: 'zoom-backgrounds-for-therapists', persona: 'Therapists' },
              { slug: 'zoom-backgrounds-for-realtors', persona: 'Realtors' },
              { slug: 'zoom-backgrounds-for-consultants', persona: 'Consultants' },
              { slug: 'zoom-backgrounds-for-financial-advisors', persona: 'Financial Advisors' },
              { slug: 'zoom-backgrounds-for-healthcare', persona: 'Healthcare' },
              { slug: 'zoom-backgrounds-for-teachers', persona: 'Teachers' },
              { slug: 'zoom-backgrounds-for-tech-professionals', persona: 'Tech & Startup' },
              { slug: 'zoom-backgrounds-for-recruiters', persona: 'Recruiters' },
              { slug: 'zoom-backgrounds-for-sales', persona: 'Sales' },
              { slug: 'zoom-backgrounds-for-coaches', persona: 'Coaches' },
              { slug: 'zoom-backgrounds-for-accountants', persona: 'Accountants' },
            ].map((c) => (
              <Link prefetch={false}
                key={c.slug}
                href={`/collections/${c.slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.55rem 1.05rem', borderRadius: '999px',
                  border: '1px solid #e5e7eb', background: '#fafafa', color: '#374151',
                  fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none',
                }}
              >
                {c.persona}
                <span style={{ color: '#9a6a3a' }} aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
          <Link prefetch={false}
            href="/collections"
            style={{
              display: 'inline-block', color: '#9a6a3a', fontWeight: 600,
              textDecoration: 'underline', textUnderlineOffset: '3px',
              fontSize: '0.9rem', letterSpacing: '0.04em',
            }}
          >
            See all profession collections →
          </Link>
        </section>

        {/* Category Grid - Lazy loaded */}
        <CategoryGrid navigate={navigate} />
      </section>
    </Layout>
  );
}