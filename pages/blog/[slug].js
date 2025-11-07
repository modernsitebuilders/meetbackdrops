import { useRouter } from 'next/router';
import { useEffect } from 'react';
import BlogLayout from '../../components/BlogLayout';
import { getFAQs } from '../../data/faqData';
import { categoryInfo } from '../../data/categoryData';
import HowToSchema from '../../components/HowToSchema';
import { howToData } from '../../data/howToData';

// Import from the correct file names (without -content suffix)
import { backgroundMistakesContent } from '../../data/blog-content/background-mistakes';
import { jobInterviewBackgroundsContent } from '../../data/blog-content/job-interview-backgrounds';
import { professionalVideoCallsContent } from '../../data/blog-content/professional-video-calls';
import { remoteWorkProductivityContent } from '../../data/blog-content/remote-work-productivity';
import { virtualBackgroundGuideContent } from '../../data/blog-content/virtual-background-guide';
import { zoomTeamsGoogleContent } from '../../data/blog-content/zoom-teams-google';
import { lightingTipsContent } from '../../data/blog-content/lighting-tips';
import { videoCallEtiquetteContent } from '../../data/blog-content/video-call-etiquette';
import { backgroundsByIndustryContent } from '../../data/blog-content/backgrounds-by-industry';
import { bestVirtualBackgroundSites2025Content } from '../../data/blog-content/best-virtual-background-sites-2025';
import { christmasBackgroundsContent } from '../../data/blog-content/christmas-backgrounds';
import { halloweenBackgroundsContent } from '../../data/blog-content/halloween-backgrounds';
import { bokehBackgroundsContent } from '../../data/blog-content/bokeh-backgrounds';

// Map slugs to their respective content and metadata
const blogPosts = {
  'background-mistakes': {
    content: backgroundMistakesContent,
    title: "15 Virtual Background Mistakes to Avoid - StreamBackdrops",
    description: "Avoid critical virtual background mistakes that undermine your professional image. Learn what not to do and how to fix common issues.",
    keywords: "virtual background mistakes, professional image, video call tips, zoom backgrounds, teams backgrounds",
    canonical: "https://streambackdrops.com/blog/background-mistakes",
    headline: "15 Virtual Background Mistakes That Ruin Your Professional Image",
    image: "/images/office-spaces/office-spaces-01.webp",
    datePublished: "2025-01-15",
    dateModified: "2025-10-09",
    faqKey: 'background-mistakes'
  },
  'job-interview-backgrounds': {
    content: () => jobInterviewBackgroundsContent(categoryInfo),
    title: "Job Interview Virtual Backgrounds 2025 - StreamBackdrops",
    description: "Choose the perfect virtual background for your job interview. Expert tips on professional backgrounds, what to avoid, and how to make a great first impression.",
    keywords: "job interview backgrounds, interview tips, professional backgrounds, virtual interview, career advice",
    canonical: "https://streambackdrops.com/blog/job-interview-backgrounds",
    headline: "Best Virtual Backgrounds for Job Interviews 2025",
    image: "/images/office-spaces/office-spaces-05.webp",
    datePublished: "2025-01-21",
    dateModified: "2025-01-21",
    faqKey: 'job-interview-backgrounds'
  },
  'professional-video-calls': {
    content: professionalVideoCallsContent,
    title: "10 Tips for Professional Video Calls - StreamBackdrops",
    description: "Master professional video calls with 10 essential tips covering lighting, backgrounds, camera positioning, and etiquette for remote work success.",
    keywords: "video calls, professional meetings, remote work, video conferencing, zoom tips, teams meetings",
    canonical: "https://streambackdrops.com/blog/professional-video-calls",
    headline: "How to Look Professional on Video Calls: Complete Guide",
    image: "/images/office-spaces/office-spaces-36.webp",
    datePublished: "2025-03-01",
    dateModified: "2025-10-09",
    faqKey: 'professional-video-calls'
  },
  'remote-work-productivity': {
    content: remoteWorkProductivityContent,
    title: "Remote Work Productivity Guide - StreamBackdrops",
    description: "Boost remote work productivity with expert tips for creating the perfect home office environment, managing distractions, and maintaining work-life balance.",
    keywords: "remote work, productivity tips, home office, work from home, remote work setup",
    canonical: "https://streambackdrops.com/blog/remote-work-productivity",
    headline: "Remote Work Productivity: Creating Your Perfect Home Office Environment",
    image: "/images/living-rooms/living-room-15.webp",
    datePublished: "2025-08-02",
    dateModified: "2025-10-09",
    faqKey: 'remote-work-productivity'
  },
  'virtual-background-guide': {
    content: virtualBackgroundGuideContent,
    title: "Virtual Background Setup Guide - StreamBackdrops",
    description: "Master virtual backgrounds for Zoom, Teams & Google Meet. Setup guide, best practices, troubleshooting & 20+ free HD backgrounds. Updated for 2025.",
    keywords: "virtual background guide, Zoom setup, Teams backgrounds, video call tips, professional backgrounds, tutorial 2025",
    canonical: "https://streambackdrops.com/blog/virtual-background-guide",
    headline: "Complete Virtual Background Guide: Setup, Tips & Best Practices",
    image: "/images/bookshelves-dark/ambient-01.webp",
    datePublished: "2025-07-05",
    dateModified: "2025-10-09",
    faqKey: 'virtual-background-guide'
  },
  'zoom-teams-google': {
    content: zoomTeamsGoogleContent,
    title: "Zoom vs Teams vs Meet Backgrounds 2025 - StreamBackdrops",
    description: "Compare virtual backgrounds across Zoom, Microsoft Teams, and Google Meet. Which platform offers the best quality and features?",
    keywords: "zoom vs teams, google meet, virtual background comparison, platform comparison, video conferencing",
    canonical: "https://streambackdrops.com/blog/zoom-teams-google",
    headline: "Zoom vs Teams vs Google Meet: Virtual Background Comparison 2025",
    image: "/images/coffee-shops/coffee-shop-10.webp",
    datePublished: "2025-08-01",
    dateModified: "2025-10-09",
    faqKey: 'zoom-teams-google'
  },
  'lighting-tips': {
    content: lightingTipsContent,
    title: "Virtual Background Lighting Tips - StreamBackdrops",
    description: "Master video call lighting. Learn professional lighting setup for virtual backgrounds, avoid common mistakes, and look great on camera.",
    keywords: "video call lighting, virtual background lighting, home office lighting, video conferencing setup, professional lighting",
    canonical: "https://streambackdrops.com/blog/lighting-tips",
    headline: "Perfect Video Call Lighting: Complete Setup Guide 2025",
    image: "/images/office-spaces/office-spaces-10.webp",
    datePublished: "2025-06-10",
    dateModified: "2025-10-09",
    faqKey: 'lighting-tips'
  },
  // Add the missing blogs
  'backgrounds-by-industry': {
    content: backgroundsByIndustryContent,
    title: "Best Virtual Backgrounds by Industry - StreamBackdrops",
    description: "Choose the perfect virtual background for your industry. Professional background recommendations for finance, tech, healthcare, education and more.",
    keywords: "virtual backgrounds by industry, professional backgrounds, industry-specific backgrounds, corporate backgrounds",
    canonical: "https://streambackdrops.com/blog/backgrounds-by-industry",
    headline: "Best Virtual Backgrounds by Industry",
    image: "/images/office-spaces/office-spaces-03.webp",
    datePublished: "2025-04-15",
    dateModified: "2025-10-09",
    faqKey: 'backgrounds-by-industry'
  },
  'best-virtual-background-sites-2025': {
    content: bestVirtualBackgroundSites2025Content,
    title: "Best Virtual Background Sites 2025 - StreamBackdrops",
    description: "Discover the best websites for free virtual backgrounds in 2025. Compare features, quality, and download options across top platforms.",
    keywords: "virtual background sites, free backgrounds, zoom backgrounds, teams backgrounds, background websites",
    canonical: "https://streambackdrops.com/blog/best-virtual-background-sites-2025",
    headline: "Best Virtual Background Sites 2025",
    image: "/images/office-spaces/office-spaces-07.webp",
    datePublished: "2025-02-10",
    dateModified: "2025-10-09",
    faqKey: 'best-virtual-background-sites-2025'
  },
  'christmas-backgrounds': {
    content: christmasBackgroundsContent,
    title: "Free Christmas Virtual Backgrounds for Video Calls 2025 - StreamBackdrops",
    description: "Download free Christmas virtual backgrounds for Zoom, Teams, and Google Meet. Festive holiday backgrounds with Christmas trees and decorations for December video calls.",
    keywords: "christmas backgrounds, holiday backgrounds, christmas zoom backgrounds, festive backgrounds, seasonal backgrounds",
    canonical: "https://streambackdrops.com/blog/christmas-backgrounds",
    headline: "Free Christmas Virtual Backgrounds for Video Calls 2025",
    image: "/images/christmas-backgrounds/christmas-background-01.webp",
    datePublished: "2025-11-01",
    dateModified: "2025-11-01",
    faqKey: 'christmas-backgrounds'
  },
  'halloween-backgrounds': {
    content: halloweenBackgroundsContent,
    title: "Halloween Virtual Backgrounds - StreamBackdrops",
    description: "Spook up your video calls with Halloween virtual backgrounds. Fun, professional Halloween themes for Zoom, Teams and Google Meet.",
    keywords: "halloween backgrounds, spooky backgrounds, holiday backgrounds, themed backgrounds, halloween zoom backgrounds",
    canonical: "https://streambackdrops.com/blog/halloween-backgrounds",
    headline: "Halloween Virtual Backgrounds",
    image: "/images/holiday/halloween-01.webp",
    datePublished: "2025-10-01",
    dateModified: "2025-10-09",
    faqKey: 'halloween-backgrounds'
  },
  'bokeh-backgrounds': {
    content: bokehBackgroundsContent,
    title: "Free Bokeh Virtual Backgrounds for Video Calls 2025 - StreamBackdrops",
    description: "Download 66 free bokeh virtual backgrounds for Zoom, Teams, and Google Meet. Elegant soft-focus light effects and artistic blur backgrounds for professional video calls.",
    keywords: "bokeh backgrounds, bokeh lights, soft focus backgrounds, artistic blur, light effects, elegant backgrounds, professional bokeh",
    canonical: "https://streambackdrops.com/blog/bokeh-backgrounds",
    headline: "Free Bokeh Virtual Backgrounds for Video Calls 2025",
    image: "/images/bokeh-backgrounds/bokeh-1.webp",
    datePublished: "2025-11-06",
    dateModified: "2025-11-06",
    faqKey: 'bokeh-backgrounds'
  },
  // Add this to your blogPosts object
'video-call-etiquette': {
  content: videoCallEtiquetteContent,
  title: "15 Virtual Background Mistakes to Avoid - StreamBackdrops",
  description: "Master video call etiquette with professional guidelines for virtual meetings. Learn proper behavior, communication tips, and platform-specific best practices.",
  keywords: "video call etiquette, meeting etiquette, virtual meeting tips, professional communication, remote work etiquette",
  canonical: "https://streambackdrops.com/blog/video-call-etiquette",
  headline: "Video Call Etiquette: Professional Guide for Virtual Meetings",
  image: "/images/office-spaces/office-spaces-02.webp",
  datePublished: "2025-09-15",
  dateModified: "2025-10-09",
  faqKey: 'video-call-etiquette'
}
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) return <div>Loading...</div>;

  const blogPost = blogPosts[slug];

  if (!blogPost) {
    useEffect(() => { router.push('/404'); }, [router]);
    return <div>Post not found...</div>;
  }

  const ContentComponent = blogPost.content;
  const faqQuestions = getFAQs(blogPost.faqKey);

  return (
    <BlogLayout
  title={blogPost.title}
  description={blogPost.description}
  keywords={blogPost.keywords}
  canonical={blogPost.canonical}
  headline={blogPost.headline}
  image={blogPost.image}
  datePublished={blogPost.datePublished}
  dateModified={blogPost.dateModified}
  faqQuestions={faqQuestions}
>
  {/* Add HowTo schema for tutorial posts */}
  {howToData[slug] && (
    <HowToSchema 
      name={howToData[slug].name}
      description={howToData[slug].description}
      image={blogPost.image}
      totalTime={howToData[slug].totalTime}
      steps={howToData[slug].steps}
    />
  )}
  <ContentComponent />
</BlogLayout>
  );
}

export async function getStaticPaths() {
  const slugs = Object.keys(blogPosts);
  const paths = slugs.map(slug => ({ params: { slug } }));

  return { paths, fallback: false };
}

export async function getStaticProps() {
  return { props: {} };
}