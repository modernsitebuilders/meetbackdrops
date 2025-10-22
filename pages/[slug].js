import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Import all your individual blog components
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

// Map slugs to components
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

  // Show loading state
  if (!slug) {
    return <div>Loading...</div>;
  }

  // Get the component for this slug
  const BlogComponent = blogComponents[slug];

  // Show 404 if slug not found
  if (!BlogComponent) {
    useEffect(() => {
      router.push('/404');
    }, [router]);
    return <div>Post not found...</div>;
  }

  // Render the specific blog component
  return <BlogComponent />;
}

export async function getStaticPaths() {
  const slugs = Object.keys(blogComponents);
  
  const paths = slugs.map(slug => ({
    params: { slug }
  }));

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps() {
  return {
    props: {}
  };
}