import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import BreadcrumbSchema from '../components/BreadcrumbSchema';

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
      if (sessionReferrer && (referrer === 'direct' || referrer.includes('streambackdrops.com'))) {
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
    title: "Best Virtual Backgrounds for Job Interviews 2025: Complete Guide",
    slug: "job-interview-backgrounds",
    excerpt: "Choose the perfect virtual background for your job interview. Expert tips on professional backgrounds, what to avoid, and how to make a great first impression on video calls.",
    date: "January 2025",
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
    title: "Best Free Virtual Background Sites in 2025: Complete Comparison",
    slug: "best-virtual-background-sites-2025",
    excerpt: "Comprehensive comparison of the best free virtual background sites in 2025. Find out why StreamBackdrops beats stock photo sites for professional video calls.",
    date: "January 2025",
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
    }
  ];

  return (
    <Layout
      title="Virtual Background Blog - StreamBackdrops"
      description="Expert guides, tips, and insights about virtual backgrounds, remote work, video calls, and professional online presence."
      currentPage="blog"
      canonical="https://streambackdrops.com/blog"
    >
      <Head>
        {/* Blog/Collection Page structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "StreamBackdrops Blog",
            "description": "Expert guides and tips about virtual backgrounds, remote work, and professional video calls",
            "url": "https://streambackdrops.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "StreamBackdrops",
              "url": "https://streambackdrops.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://streambackdrops.com/logo.png"
              }
            },
            "blogPost": [
              {
                "@type": "BlogPosting",
                "headline": "Free Bokeh Virtual Backgrounds for Video Calls 2025",
                "url": "https://streambackdrops.com/blog/bokeh-backgrounds"
              },
              {
                "@type": "BlogPosting",
                "headline": "Best Free Virtual Background Sites in 2025: Complete Comparison",
                "url": "https://streambackdrops.com/blog/best-virtual-background-sites-2025"
              },
              {
                "@type": "BlogPosting",
                "headline": "10 Essential Tips for Professional Video Calls",
                "url": "https://streambackdrops.com/blog/professional-video-calls"
              },
              {
                "@type": "BlogPosting",
                "headline": "Video Call Etiquette: Essential Do's and Don'ts for Professional Virtual Meetings",
                "url": "https://streambackdrops.com/blog/video-call-etiquette"
              },
              {
                "@type": "BlogPosting",
                "headline": "Best Virtual Backgrounds by Industry: Complete Professional Guide",
                "url": "https://streambackdrops.com/blog/backgrounds-by-industry"
              },
              {
                "@type": "BlogPosting",
                "headline": "15 Virtual Background Mistakes That Ruin Your Professional Image",
                "url": "https://streambackdrops.com/blog/background-mistakes"
              },
              {
                "@type": "BlogPosting",
                "headline": "Perfect Lighting Setup for Virtual Backgrounds: Complete Guide",
                "url": "https://streambackdrops.com/blog/lighting-tips"
              },
              {
                "@type": "BlogPosting",
                "headline": "Complete Guide to Virtual Backgrounds for Video Calls 2025",
                "url": "https://streambackdrops.com/blog/virtual-background-guide"
              },
              {
                "@type": "BlogPosting",
                "headline": "Zoom vs Teams vs Google Meet: Virtual Background Setup & Best Practices",
                "url": "https://streambackdrops.com/blog/zoom-teams-google"
              },
              {
                "@type": "BlogPosting",
                "headline": "Remote Work Productivity: Creating Your Perfect Home Office Environment",
                "url": "https://streambackdrops.com/blog/remote-work-productivity"
              },
              {
                "@type": "BlogPosting",
                "headline": "Best Halloween Virtual Backgrounds for Video Calls 2025",
                "url": "https://streambackdrops.com/blog/halloween-backgrounds"
              }
            ]
          })}
        </script>

        <BreadcrumbSchema items={[
    { name: "Home", url: "https://streambackdrops.com" },
    { name: "Blog", url: "https://streambackdrops.com/blog" }
  ]} />
      </Head>

     <div style={{minHeight: '100vh', background: '#f9fafb'}}>
        {/* Simple Blog Header */}
        <div style={{background: 'white', borderBottom: '1px solid #e5e7eb', padding: '2rem 0', marginTop: '1rem'}}>
          <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 2rem'}}>
            {/* Breadcrumbs */}
            <nav style={{marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280'}}>
              <Link 
                href="/" 
                style={{
                  color: '#2563eb', 
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Home
              </Link>
              <span style={{margin: '0 0.5rem'}}>›</span>
              <span>Blog</span>
            </nav>
            <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem'}}>
              StreamBackdrops Blog
            </h1>
            <p style={{fontSize: '1.125rem', color: '#6b7280'}}>
              Expert tips, guides, and insights for professional video calls & work
            </p>
          </div>
        </div>

        {/* Christmas Category Banner */}
        <div style={{maxWidth: '1200px', margin: '2rem auto 0', padding: '0 2rem'}}>
          <Link 
            href="/category/christmas-backgrounds"
            style={{
              display: 'block',
              background: 'linear-gradient(135deg, #ef4444 0%, #22c55e 100%)',
              color: 'white',
              padding: '1.5rem 2rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
          >
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>
              🎄 Free Christmas Virtual Backgrounds
            </div>
            <div style={{fontSize: '1rem', opacity: '0.95'}}>
              Browse 125 + festive backgrounds for your holiday video calls →
            </div>
          </Link>
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
    color: '#2563eb', 
    fontWeight: '500', 
    fontSize: '0.9rem',
    textDecoration: 'none',
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