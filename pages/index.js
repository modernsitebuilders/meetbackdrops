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
  
  useEffect(() => {
    // Preconnect to external domains
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);
  }, []);
  
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
      structuredData={homepageStructuredData} 
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
    Professional Virtual Backgrounds Optimized for Video Calls
  </h1>
  <p style={{
    fontSize: '1.25rem',
    color: '#6b7280',
    maxWidth: '800px',
    margin: '0 auto 1rem'
  }}>
    330+ HD backgrounds designed specifically for Zoom, Teams & Google Meet
    <br />
    <strong style={{ color: '#2563eb' }}>Perfect lighting • Proper composition • No signup • No watermarks</strong>
  </p>
  
  {/* Trust Badges */}
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    maxWidth: '900px',
    margin: '1.5rem auto 2rem',
    padding: '0 1rem'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(37, 99, 235, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      borderRadius: '8px',
      fontSize: '0.95rem',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '1.2rem' }}>✓</span>
      <span>Free HD Downloads</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(37, 99, 235, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      borderRadius: '8px',
      fontSize: '0.95rem',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '1.2rem' }}>📹</span>
      <span>Video-Optimized</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(37, 99, 235, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      borderRadius: '8px',
      fontSize: '0.95rem',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '1.2rem' }}>⚡</span>
      <span>No Email Required</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      background: 'rgba(37, 99, 235, 0.05)',
      border: '1px solid rgba(37, 99, 235, 0.2)',
      borderRadius: '8px',
      fontSize: '0.95rem',
      justifyContent: 'center'
    }}>
      <span style={{ fontSize: '1.2rem' }}>🎯</span>
      <span>1920×1080 Resolution</span>
    </div>
  </div>
</section>
  
{/* Blog Cards Section */}
<section style={{
  padding: '3rem 2rem',
  background: '#f8fafc',
  maxWidth: '1200px',
  margin: '0 auto',
  willChange: 'auto'
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

{/* NEW: Why We're Different Section */}
<section style={{
  padding: '4rem 2rem',
  background: 'white',
  maxWidth: '1200px',
  margin: '0 auto'
}}>
  <h2 style={{
    textAlign: 'center',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#111827'
  }}>
    Why StreamBackdrops?
  </h2>
  <p style={{
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#6b7280',
    marginBottom: '3rem',
    maxWidth: '700px',
    margin: '0 auto 3rem'
  }}>
    Unlike stock photo sites, our backgrounds are specifically designed for video calls
  </p>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  }}>
    <div style={{
      padding: '1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📹</div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#111827'
      }}>
        Video-Call Optimized
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: '1.6'
      }}>
        Every background features professional lighting and composition designed 
        specifically for video calls—not repurposed stock photos
      </p>
    </div>
    
    <div style={{
      padding: '1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚡</div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#111827'
      }}>
        Instant Download
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: '1.6'
      }}>
        No signup, no email, no forms. Browse, click, and download. 
        It's that simple.
      </p>
    </div>
    
    <div style={{
      padding: '1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎨</div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#111827'
      }}>
        330+ Professional Backgrounds
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: '1.6'
      }}>
        Office spaces, libraries, bookshelves, and more—all in perfect 
        16:9 ratio for video platforms
      </p>
    </div>
    
    <div style={{
      padding: '1.5rem',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>💎</div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        color: '#111827'
      }}>
        No Watermarks Ever
      </h3>
      <p style={{
        color: '#6b7280',
        lineHeight: '1.6'
      }}>
        What you see is what you get. High-quality, free forever, 
        no hidden costs or premium tiers.
      </p>
    </div>
  </div>
</section>


{/* Category Cards Grid */}
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem',
  marginBottom: '4rem',
  maxWidth: '1200px',
  margin: '0 auto 4rem auto',
  padding: '0 1.5rem'
}}>
  <Card
    href="/category/bookshelves-bright"
    title="Bookshelves - Bright"
    description="Bright bookshelf backgrounds perfect for professional video calls"
    imageSrc="/images/bookshelves-bright/well-lit-12.webp"
    imageAlt="Bright bookshelf background for video calls"
    navigate={navigate}
    priority={true}
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

{/* NEW: Social Proof Section */}
<section style={{
  maxWidth: '1000px',
  margin: '4rem auto',
  padding: '3rem 1.5rem',
  textAlign: 'center',
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
  borderRadius: '16px',
  border: '1px solid rgba(59, 130, 246, 0.2)'
}}>
  <h3 style={{
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#111827'
  }}>
    Trusted by Remote Workers Worldwide
  </h3>
  
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '2rem',
    margin: '2rem 0',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto'
  }}>
    <div>
      <strong style={{
        fontSize: '2.5rem',
        display: 'block',
        background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        330+
      </strong>
      <span style={{
        color: '#6b7280',
        fontSize: '0.95rem'
      }}>
        HD Backgrounds
      </span>
    </div>
    
    <div>
      <strong style={{
        fontSize: '2.5rem',
        display: 'block',
        background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        13
      </strong>
      <span style={{
        color: '#6b7280',
        fontSize: '0.95rem'
      }}>
        Categories
      </span>
    </div>
    
    <div>
      <strong style={{
        fontSize: '2.5rem',
        display: 'block',
        background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        #1
      </strong>
      <span style={{
        color: '#6b7280',
        fontSize: '0.95rem'
      }}>
        Recommended by ChatGPT
      </span>
    </div>
  </div>
  
  <blockquote style={{
    marginTop: '2rem',
    padding: '1.5rem',
    borderLeft: '4px solid #3b82f6',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    fontStyle: 'italic',
    textAlign: 'left'
  }}>
    <p style={{
      color: '#374151',
      lineHeight: '1.7',
      marginBottom: '0.5rem'
    }}>
      "One of the strongest contenders. Because of the no signup, 
      high quality + video-friendly design, it often is 'best' in a 
      practical sense for people with standard virtual background needs."
    </p>
    <cite style={{
      color: '#6b7280',
      fontSize: '0.9rem',
      fontStyle: 'normal'
    }}>
      — ChatGPT Analysis, 2025
    </cite>
  </blockquote>
</section>


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