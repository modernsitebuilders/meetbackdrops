// Complete pages/index.js - RESTORED to original good design
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { homepageStructuredData } from '../data/homepageSchema';
import Card from '../components/Card';

export default function Home() {
  const router = useRouter();
  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    } else {
      // In production, let the normal Link behavior work
      return;
    }
  };
  // ADD THIS: Track homepage visits
 useEffect(() => {
  if (typeof window !== 'undefined') {
    // Skip tracking if admin
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
      description="Download 330+ free HD virtual backgrounds for Zoom, Teams & Google Meet. Professional quality backgrounds perfect for video calls and remote work."
      currentPage="home"
      canonical="https://streambackdrops.com"
      structuredData={homepageStructuredData} // ← Add this line
    >

 {/* Hero Section with H1 FIRST */}
<section style={{ 
  textAlign: 'center', 
  padding: '0.5rem 2rem 0.5rem', 
  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f9fafb 100%)'
}}>
  <h1 style={{
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '.5rem',
    lineHeight: '1.2'
  }}>
    Free Professional Virtual Backgrounds
  </h1>
  <p style={{
    fontSize: '1.25rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto 2rem'
  }}>
    Download 330+ HD virtual backgrounds for Zoom, Teams & Google Meet. Perfect for professional video calls and remote work.
  </p>
</section>
  
{/* Blog Cards Section */}
<section style={{
  padding: '3rem 2rem',
  background: '#f8fafc',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  <h2 style={{
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#1e293b'
  }}>
    Expert Tips for Video Call Success
  </h2>
  
  <p style={{
    textAlign: 'center',
    color: '#64748b',
    marginBottom: '3rem'
  }}>
    Avoid common mistakes and look professional on every call
  </p>

  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gridAutoRows: '1fr',
    gap: '1.5rem'
  }}>
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

{/* Category Cards Grid */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginBottom: '4rem',
  maxWidth: '1200px',
  margin: '0 auto 4rem auto',
  padding: '0 2rem'
}}>
  <Card
    href="/category/bookshelves-bright"
    title="Bookshelves - Bright"
    description="Bright bookshelf backgrounds perfect for professional video calls"
    imageSrc="/images/bookshelves-bright/well-lit-12.webp"
    imageAlt="Bright bookshelf background for video calls"
    navigate={navigate}
  />
  
  <Card
    href="/category/bookshelves-dark"
    title="Bookshelves - Dark"
    description="Warm bookshelf backgrounds with ambient lighting for professional calls"
    imageSrc="/images/bookshelves-dark/ambient-01.webp"
    imageAlt="Dark bookshelf background for video meetings"
    navigate={navigate}
  />
  
 <Card
    href="/category/office-spaces"
    title="Office Spaces"
    description="Modern office settings that convey professionalism and focus"
    imageSrc="/images/office-spaces/office-spaces-01.webp"
    imageAlt="Professional office space background for business calls"
    navigate={navigate}
  />
  
  <Card
    href="/category/living-rooms"
    title="Living Rooms"
    description="Comfortable home settings that feel welcoming and professional"
    imageSrc="/images/living-rooms/living-room-29.webp"
    imageAlt="Comfortable living room backgrounds for casual meetings and personal video calls"
    navigate={navigate}
  />
  
  <Card
    href="/category/kitchens"
    title="Kitchen Backgrounds"
    description="Warm kitchen spaces that create a friendly, approachable atmosphere"
    imageSrc="/images/kitchens/kitchen-09.webp"
    imageAlt="Kitchen virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/coffee-shops"
    title="Coffee Shops"
    description="Cozy coffee shop backgrounds for casual meetings and creative collaborations"
    imageSrc="/images/coffee-shops/coffee-shop-10.webp"
    imageAlt="Coffee shop virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/art-galleries"
    title="Art Galleries"
    description="Sophisticated art gallery spaces with clean walls and artistic flair"
    imageSrc="/images/art-galleries/art-gallery-1.webp"
    imageAlt="Art gallery virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/urban-lofts"
    title="Urban Lofts"
    description="Modern industrial loft spaces with exposed brick and contemporary design"
    imageSrc="/images/urban-lofts/urban-loft-1.webp"
    imageAlt="Urban loft virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/gardens-patios"
    title="Gardens & Patios"
    description="Beautiful outdoor garden and patio backgrounds that bring natural beauty"
    imageSrc="/images/gardens-patios/garden-patio-1.webp"
    imageAlt="Garden and patio virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/historic-spaces"
    title="Historic Spaces"
    description="Elegant historic interiors including ballrooms and Art Deco corridors"
    imageSrc="/images/historic-spaces/historic-space-6.webp"
    imageAlt="Historic space virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/nature-landscapes"
    title="Nature & Landscapes"
    description="Stunning natural landscapes including mountains, deserts, and scenic views"
    imageSrc="/images/nature-landscapes/nature-landscape-1.webp"
    imageAlt="Nature landscape virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/libraries"
    title="Libraries"
    description="Classic library rooms with floor-to-ceiling books for academic settings"
    imageSrc="/images/libraries/library-1.webp"
    imageAlt="Library virtual background"
    navigate={navigate}
  />
  
  <Card
    href="/category/halloween-backgrounds"
    title="Halloween Backgrounds 🎃"
    description="Festive Halloween backgrounds with pumpkins and fall decor for seasonal calls"
    imageSrc="/images/halloween-backgrounds/halloween-background-11.webp"
    imageAlt="Halloween virtual background"
    navigate={navigate}
  />
   </div>


{/* SEO-Rich Content Section */}
<section style={{
  background: 'white',
  padding: '4rem 2rem',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  <div style={{ maxWidth: '900px', margin: '0 auto' }}>
    
    <h3 style={{
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      textAlign: 'center'
    }}>
      Professional Virtual Backgrounds for Every Video Call
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '2rem'
    }}>
      StreamBackdrops offers the largest collection of free, high-quality virtual backgrounds designed specifically for professional video conferencing. Whether you're joining a Zoom meeting, Microsoft Teams call, or Google Meet session, our curated backgrounds help you maintain a polished, professional appearance from any location.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Why Choose Our Virtual Backgrounds?
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      Unlike generic stock photo sites, every background in our collection is optimized for video calls. We carefully design each image with proper lighting, color balance, and composition to ensure you look your best on camera. Our backgrounds work seamlessly with all major video platforms including Zoom, Microsoft Teams, Google Meet, Skype, and WebEx.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Perfect for Remote Work and Hybrid Teams
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      The modern workplace demands flexibility. Whether you're working from home, a coffee shop, or traveling, our virtual backgrounds ensure you always present a professional image. Choose from well-lit office spaces for client meetings, ambient-lit environments for casual team calls, or comfortable living room settings for 1-on-1 conversations.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      Free HD Downloads - No Signup Required
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1.5rem'
    }}>
      All our virtual backgrounds are completely free to download and use. No subscription fees, no watermarks, no hidden costs. Simply browse our categories, click your favorite background, and download instantly in HD quality. We believe professional video call backgrounds should be accessible to everyone.
    </p>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '3rem'
    }}>
      How to Use Virtual Backgrounds
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1rem'
    }}>
      Setting up a virtual background is simple across all platforms:
    </p>

    <div style={{
      background: '#f9fafb',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginBottom: '2rem',
      border: '1px solid #e5e7eb'
    }}>
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '1rem'
      }}>
        <strong>Zoom:</strong> Click the arrow next to "Stop Video" → Choose "Virtual Background" → Click the + icon to upload your downloaded background.
      </p>
      
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '1rem'
      }}>
        <strong>Microsoft Teams:</strong> In a meeting, click the three dots → "Apply background effects" → "+ Add new" to upload your background.
      </p>
      
      <p style={{
        fontSize: '1.05rem',
        lineHeight: '1.8',
        color: '#374151',
        marginBottom: '0'
      }}>
        <strong>Google Meet:</strong> Before joining, click "Change background" → Click the + icon → Select your downloaded image.
      </p>
    </div>

    <h3 style={{
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1rem',
      marginTop: '2.5rem'
    }}>
      Tips for Best Results
    </h3>
    
    <p style={{
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#374151',
      marginBottom: '1rem'
    }}>
      For optimal virtual background performance, ensure good lighting facing you, avoid busy patterns in your clothing, and position yourself at a consistent distance from your webcam. Our backgrounds are designed to work with standard webcam setups, but better lighting always improves edge detection and overall video quality.
    </p>

    <div style={{
      background: '#eff6ff',
      padding: '2rem',
      borderRadius: '0.5rem',
      marginTop: '3rem',
      border: '1px solid #bfdbfe',
      textAlign: 'center'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: '1rem'
      }}>
        Ready to Elevate Your Video Calls?
      </h3>
      <p style={{
        fontSize: '1.1rem',
        color: '#1e40af',
        marginBottom: '1.5rem'
      }}>
        Browse our collection of 330+ professional virtual backgrounds and find the perfect backdrop for your next meeting.
      </p>
      <Link href="/category/bookshelves-bright" style={{
  display: 'inline-block',
  background: '#2563eb',
  color: 'white',
  padding: '1rem 2rem',
  borderRadius: '0.5rem',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1.1rem',
  transition: 'background 0.2s'
}}>
  Browse Backgrounds →
</Link>
    </div>
  </div>
</section>
      </Layout>
);
}