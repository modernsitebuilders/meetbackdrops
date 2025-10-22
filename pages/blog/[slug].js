import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Import from the same directory (blog folder)
import BackgroundMistakes from './background-mistakes';
import JobInterviewBackgrounds from './job-interview-backgrounds';
import HalloweenBackgrounds from './halloween-backgrounds';
import BestVirtualBackgroundSites from './best-virtual-background-sites-2025';
import ProfessionalVideoCalls from './professional-video-calls';
import BackgroundsByIndustry from './backgrounds-by-industry';
import LightingTips from './lighting-tips';
import VirtualBackgroundGuide from './virtual-background-guide';
import ZoomTeamsGoogle from './zoom-teams-google';
import RemoteWorkProductivity from './remote-work-productivity';

const blogComponents = {
  'background-mistakes': BackgroundMistakes,
  'job-interview-backgrounds': JobInterviewBackgrounds,
  'halloween-backgrounds': HalloweenBackgrounds,
  'best-virtual-background-sites-2025': BestVirtualBackgroundSites,
  'professional-video-calls': ProfessionalVideoCalls,
  'backgrounds-by-industry': BackgroundsByIndustry,
  'lighting-tips': LightingTips,
  'virtual-background-guide': VirtualBackgroundGuide,
  'zoom-teams-google': ZoomTeamsGoogle,
  'remote-work-productivity': RemoteWorkProductivity,
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) return <div>Loading...</div>;

  const BlogComponent = blogComponents[slug];

  if (!BlogComponent) {
    useEffect(() => { router.push('/404'); }, [router]);
    return <div>Post not found...</div>;
  }

  return <BlogComponent />;
}

export async function getStaticPaths() {
  const slugs = Object.keys(blogComponents);
  const paths = slugs.map(slug => ({ params: { slug } }));

  return { paths, fallback: false };
}

export async function getStaticProps() {
  return { props: {} };
}