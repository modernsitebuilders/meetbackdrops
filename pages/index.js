import Head from 'next/head';
import { HERO_IMAGES } from '../data/heroImages';
import Image from 'next/image';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout title="StreamBackdrops" description="Free virtual backgrounds">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>

      {/* ONLY hero section - NOTHING else */}
      <section style={{ padding: '2rem' }}>
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
      </section>
    </Layout>
  );
}