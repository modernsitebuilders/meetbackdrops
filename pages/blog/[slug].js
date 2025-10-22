import { useRouter } from 'next/router';
import { useEffect } from 'react';
import BlogLayout from '../../components/BlogLayout';
import { getFAQs } from '../../data/faqData';
import { categoryInfo } from '../../data/categoryData';

// Import from the correct file names (without -content suffix)
import { backgroundMistakesContent } from '../../data/blog-content/background-mistakes';
import { jobInterviewBackgroundsContent } from '../../data/blog-content/job-interview-backgrounds';
import { professionalVideoCallsContent } from '../../data/blog-content/professional-video-calls';
import { remoteWorkProductivityContent } from '../../data/blog-content/remote-work-productivity';
import { virtualBackgroundGuideContent } from '../../data/blog-content/virtual-background-guide';
import { zoomTeamsGoogleContent } from '../../data/blog-content/zoom-teams-google';
import { lightingTipsContent } from '../../data/blog-content/lighting-tips';

// Map slugs to their respective content and metadata
const blogPosts = {
  'background-mistakes': {
    content: backgroundMistakesContent,
    title: "15 Virtual Background Mistakes That Ruin Your Professional Image - StreamBackdrops",
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
    title: "Best Virtual Backgrounds for Job Interviews 2025 - StreamBackdrops",
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
    image: "/images/office-spaces/office-spaces-05.webp",
    datePublished: "2025-03-01",
    dateModified: "2025-10-09",
    faqKey: 'professional-video-calls'
  },
  'remote-work-productivity': {
    content: remoteWorkProductivityContent,
    title: "Remote Work Productivity: Creating Your Perfect Home Office Environment",
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
    title: "Zoom vs Teams vs Google Meet: Virtual Background Comparison 2025",
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