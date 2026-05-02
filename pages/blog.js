import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import BreadcrumbSchema from '../components/BreadcrumbSchema';
import { blogMetadata } from '../data/blogMetadata';

export default function Blog() {
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
      
      const sessionReferrer = sessionStorage.getItem('entry_referrer');
      if (sessionReferrer && (referrer === 'direct' || referrer.includes('meetbackdrops.com'))) {
        referrer = sessionReferrer;
      }

      fetch('/api/track-page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: '/blog',
          category: 'blog-index',
          referrer: referrer
        })
      }).catch(() => {});
    }
  }, []);

  const blogPosts = [
    {
    title: "How to Change Your Zoom Background on a PC (2026 Tutorial)",
    slug: "how-to-change-zoom-background-pc",
    excerpt: "Step-by-step tutorial for changing your Zoom virtual background on a PC — watch the video or follow the written steps. Includes the fix if the option is greyed out.",
    date: "April 2026",
    readTime: "3 min read",
    category: "Platform Guide"
  },
    {
    title: "How to Set Up a Virtual Background on Zoom, Teams & Meet",
    slug: "virtual-background-setup-by-platform",
    excerpt: "Exact step-by-step instructions for setting up a virtual background on Zoom, Microsoft Teams, Google Meet, and Webex — plus the one thing most setup guides miss.",
    date: "March 2026",
    readTime: "9 min read",
    category: "Platform Guide"
  },
    {
    title: "HD Virtual Backgrounds: Why Resolution Actually Matters for Video Calls",
    slug: "hd-virtual-backgrounds",
    excerpt: "Zoom and Teams compress your stream. Learn why 2912×1632 HD backgrounds stay crisp after compression — and when the upgrade is worth it.",
    date: "March 2026",
    readTime: "8 min read",
    category: "HD Backgrounds"
  },
  {
    title: "How to Add Your Logo to a Virtual Background (Free)",
    slug: "logo-virtual-background",
    excerpt: "A step-by-step guide to adding your company logo to a virtual background using free tools like Canva and Adobe Express. Includes tips on which backgrounds work best for logo overlays.",
    date: "March 2026",
    readTime: "7 min read",
    category: "Branding Guide"
  },
    {
    title: "Complete Video Call Setup Guide: Equipment That Actually Makes a Difference",
    slug: "video-call-equipment-guide",
    excerpt: "The complete guide to video call equipment. Learn which camera, lighting, microphone, and green screen to buy for professional-looking video calls under $150.",
    date: "February 2026",
    readTime: "15 min read",
    category: "Equipment Guide"
  },
    {
    title: "Best Virtual Backgrounds for Job Interviews 2026 — Free Download",
    slug: "job-interview-backgrounds",
    excerpt: "Choose the perfect virtual background for your job interview. Expert tips on professional backgrounds, what to avoid, and how to make a great first impression on video calls.",
    date: "January 2026",
    readTime: "12 min read",
    category: "Career Guide"
  },
    {
    title: "Free Bokeh Virtual Backgrounds for Video Calls 2025",
    slug: "bokeh-backgrounds",
    excerpt: "Download 66 free bokeh virtual backgrounds for Zoom, Teams, and Google Meet. Elegant soft-focus light effects and artistic blur backgrounds perfect for professional video calls.",
    date: "November 6, 2025",
    readTime: "10 min read",
    category: "Background Collections"
  },
     {
    title: "Best Free Virtual Background Sites in 2026: Complete Comparison",
    slug: "best-virtual-background-sites-2026",
    excerpt: "Comprehensive comparison of the best free virtual background sites in 2026. Find out why MeetBackdrops beats stock photo sites for professional video calls.",
    date: "February 2026",
    readTime: "15 min read",
    category: "Platform Comparison"
  },
    {
      title: "10 Essential Tips for Professional Video Calls",
      slug: "professional-video-calls",
      excerpt: "Master professional video calls with these 10 essential tips covering lighting, backgrounds, camera positioning, and video call etiquette for remote work success.",
      date: "August 2, 2025",
      readTime: "8 min read",
      category: "Video Call Tips"
    },
    {
    title: "Video Call Etiquette: Essential Do's and Don'ts for Professional Virtual Meetings",
    slug: "video-call-etiquette",
    excerpt: "Master video call etiquette with our complete guide. Learn professional meeting behavior, technical best practices, and communication tips for Zoom, Teams, and Google Meet.",
    date: "October 1, 2025",
    readTime: "14 min read",
    category: "Professional Skills"
  },
    {
      title: "Best Virtual Backgrounds by Industry",
      slug: "backgrounds-by-industry", 
      excerpt: "Choose the perfect virtual background for your industry. Complete guide covering healthcare, finance, education, tech, legal, and consulting professionals.",
      date: "August 6, 2025",
      readTime: "12 min read",
      category: "Industry Guide"
    },
    {
      title: "15 Virtual Background Mistakes That Ruin Your Professional Image",
      slug: "background-mistakes",
      excerpt: "Avoid these common virtual background mistakes that make you look unprofessional. Expert tips to fix technical issues and choose the right backgrounds.",
      date: "August 6, 2025",
      readTime: "10 min read",
      category: "Common Mistakes"
    },
    {
      title: "Perfect Lighting Setup for Virtual Backgrounds",
      slug: "lighting-tips",
      excerpt: "Master video call lighting with our complete guide. Learn how to set up professional lighting for virtual backgrounds, avoid common mistakes, and look great on camera.",
      date: "August 2, 2025", 
      readTime: "10 min read",
      category: "Technical Setup"
    },
    {
      title: "The Complete Technical Guide to Virtual Backgrounds",
      slug: "virtual-background-guide",
      excerpt: "Master virtual background technology with our complete technical guide covering setup, troubleshooting, optimization, and platform-specific instructions for Zoom, Teams, and more.",
      date: "August 2, 2025",
      readTime: "15 min read", 
      category: "Technical Guide"
    },
    {
      title: "Zoom vs Teams vs Google Meet: Virtual Background Setup & Best Practices",
      slug: "zoom-teams-google",
      excerpt: "Complete comparison of virtual backgrounds on Zoom, Microsoft Teams, and Google Meet. Setup guides, troubleshooting tips, and platform-specific best practices.",
      date: "August 6, 2025",
      readTime: "12 min read",
      category: "Platform Comparison"
    },
    {
      title: "Remote Work Productivity: Creating Your Perfect Home Office Environment",
      slug: "remote-work-productivity",
      excerpt: "Boost your remote work productivity with expert tips for creating the perfect home office environment, managing distractions, and maintaining work-life balance.",
      date: "August 2, 2025",
      readTime: "12 min read",
      category: "Remote Work"
    },
    {
      title: 'Free Christmas Virtual Backgrounds for Video Calls 2025',
      slug: 'christmas-backgrounds',
      excerpt: 'Download 46 free Christmas virtual backgrounds for Zoom, Teams, and Google Meet. Festive holiday backgrounds with Christmas trees and decorations for December video calls.',
      date: 'November 1, 2025',
      readTime: '8 min read',
      category: 'Seasonal',
      emoji: '🎄'
    },
    {
      title: 'Best Halloween Virtual Backgrounds for 2025',
      slug: 'halloween-backgrounds',
      excerpt: 'Download 25 free Halloween virtual backgrounds for Zoom, Teams, and Google Meet. Perfect for October video calls with festive fall decor.',
      date: 'October 8, 2025',
      readTime: '4 min read',
      category: 'Seasonal',
      emoji: '🎃'
    },
    {
      title: 'Free Easter Virtual Backgrounds for Zoom, Teams & Google Meet',
      slug: 'easter-backgrounds',
      excerpt: 'Download 55 free Easter virtual backgrounds for Zoom, Teams, and Google Meet. Spring pastel scenes with Easter eggs, bunnies & seasonal decor. No signup required.',
      date: 'March 2026',
      readTime: '5 min read',
      category: 'Seasonal',
      emoji: '🐣'
    },
    {
      title: 'Free Spring Virtual Backgrounds for Zoom, Teams & Google Meet',
      slug: 'spring-backgrounds',
      excerpt: 'Download 96 free spring virtual backgrounds for Zoom, Teams, and Google Meet. Blooming flower gardens, sunlit greenhouses, and fresh spring interiors. No signup required.',
      date: 'April 2026',
      readTime: '5 min read',
      category: 'Seasonal',
      emoji: '🌸'
    }
  ];

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| MeetBackdrops" or any other suffix.
  // Length budgets enforced by scripts/check-seo-meta.js: title ≤ 65, description 110-160.
  return (
    <Layout
      title="The Studio Journal | MeetBackdrops"
      description="Studio guides on executive video presence, codec compression, virtual set design, and corporate video calls. Long-form essays from the MeetBackdrops studio."
      currentPage="blog"
      canonical="https://meetbackdrops.com/blog"
    >
      <Head>
        {/* Blog/Collection Page structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "MeetBackdrops Blog",
            "description": "Expert guides and tips about virtual backgrounds, remote work, and professional video calls",
            "url": "https://meetbackdrops.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "MeetBackdrops",
              "url": "https://meetbackdrops.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://meetbackdrops.com/logo.png"
              }
            },
            "blogPost": Object.entries(blogMetadata).map(([slug, meta]) => ({
              "@type": "BlogPosting",
              "headline": meta.headline,
              "url": `https://meetbackdrops.com/blog/${slug}`,
              "description": meta.description,
              "datePublished": meta.datePublished,
              "dateModified": meta.dateModified,
              "image": {
                "@type": "ImageObject",
                "url": `https://meetbackdrops.com${meta.image}`
              },
              "author": {
                "@type": "Organization",
                "name": "MeetBackdrops",
                "url": "https://meetbackdrops.com"
              },
              "publisher": {
                "@type": "Organization",
                "name": "MeetBackdrops",
                "url": "https://meetbackdrops.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://meetbackdrops.com/logo.png"
                }
              }
            }))
          })}
        </script>

        <BreadcrumbSchema items={[
    { name: "Home", url: "https://meetbackdrops.com" },
    { name: "Blog", url: "https://meetbackdrops.com/blog" }
  ]} />
      </Head>

     <div style={{minHeight: '100vh', background: '#fff'}}>
        {/* Editorial blog header */}
        <div style={{background: '#fff', borderBottom: '1px solid #e6e2dc', padding: '4rem 0 3rem', marginTop: '0'}}>
          <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 2rem'}}>
            {/* Breadcrumb */}
            <nav style={{
              marginBottom: '1.5rem',
              fontSize: '0.72rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}>
              <Link href="/" style={{ color: '#9a6a3a', textDecoration: 'none', fontWeight: 600 }}>
                Home
              </Link>
              <span style={{ color: '#d1d5db' }}>·</span>
              <span style={{ color: '#111827', fontWeight: 600 }}>Journal</span>
            </nav>

            <div style={{
              fontSize: '0.7rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#9a6a3a',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              The Studio Journal
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              fontWeight: 600,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: '#111827',
              marginBottom: '1rem',
              lineHeight: 1.05,
              maxWidth: '780px',
            }}>
              Notes on executive video presence, codec compression, and virtual set design.
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: '#6b7280',
              lineHeight: 1.7,
              maxWidth: '640px',
              margin: 0,
            }}>
              Long-form essays from the studio on the craft of looking authoritative on
              Zoom, Teams, and Meet.
            </p>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <main style={{maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem'}}>
          <div style={{display: 'grid', gap: '2rem'}}>
            {blogPosts.map((post) => (
              <article 
                key={post.slug} 
                style={{
                  background: 'white',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s ease',
                  padding: '2rem'
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
                  <span style={{
                    background: '#dbeafe',
                    color: '#1e40af',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px'
                  }}>
                    {post.category}
                  </span>
                  <span style={{color: '#6b7280', fontSize: '0.875rem'}}>{post.date}</span>
                  <span style={{color: '#6b7280', fontSize: '0.875rem'}}>•</span>
                  <span style={{color: '#6b7280', fontSize: '0.875rem'}}>{post.readTime}</span>
                </div>
                
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.75rem',
                  lineHeight: '1.3'
                }}>
                  {post.title}
                </h3>
                
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  {post.excerpt}
                </p>
                
               <Link
  href={`/blog/${post.slug}`}
  style={{
    color: '#9a6a3a',
    fontWeight: 600,
    fontSize: '0.75rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    textUnderlineOffset: '4px',
    display: 'inline-block'
  }}
>
  Read More →
</Link>
              </article>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}