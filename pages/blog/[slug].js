import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Head from 'next/head';
import BlogLayout from '../../components/BlogLayout';
import { getFAQs } from '../../data/faqData';
import { categoryInfo } from '../../data/categoryData';
import HowToSchema from '../../components/HowToSchema';
import { howToData } from '../../data/howToData';
import VideoObjectSchema from '../../components/VideoObjectSchema';
import BreadcrumbSchema from '../../components/BreadcrumbSchema';
import { blogPosts } from '../../data/blogPosts';
import EasterHDBanner from '../../components/EasterHDBanner';

// Single source of truth — all post metadata & content lives in data/blogPosts.js
const postsBySlug = Object.fromEntries(blogPosts.map(p => [p.slug, p]));

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  if (!slug) return <div>Loading...</div>;

  const blogPost = postsBySlug[slug];

  if (!blogPost) {
    useEffect(() => { router.push('/404'); }, [router]);
    return <div>Post not found...</div>;
  }

  const faqQuestions = getFAQs(blogPost.faqKey);

  // content can be a plain React component, or a function that accepts categoryInfo
  const ContentComponent = typeof blogPost.content === 'function' && blogPost.content.length > 0
    ? () => blogPost.content(categoryInfo)  // parameterised (e.g. job-interview-backgrounds)
    : blogPost.content;                     // plain component

  // NOTE: blogPost.title and blogPost.description (from data/blogPosts.js) are the COMPLETE
  // values seen in search results. BlogLayout does not append any suffix.
  // Length budgets enforced by scripts/check-seo-meta.js: title ≤ 65, description 110-160.
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
      <Head>
        <BreadcrumbSchema items={[
          { name: 'Home', url: 'https://meetbackdrops.com' },
          { name: 'Blog', url: 'https://meetbackdrops.com/blog' },
          { name: blogPost.headline, url: `https://meetbackdrops.com/blog/${slug}` }
        ]} />
      </Head>

      {/* HowTo schema for tutorial posts */}
      {howToData[slug] && (
        <HowToSchema
          name={howToData[slug].name}
          description={howToData[slug].description}
          image={blogPost.image}
          totalTime={howToData[slug].totalTime}
          steps={howToData[slug].steps}
        />
      )}

      {/* VideoObject schema for posts that embed a video */}
      {blogPost.videoSchema && (
        <VideoObjectSchema
          name={blogPost.videoSchema.name}
          description={blogPost.videoSchema.description}
          thumbnailUrl={blogPost.videoSchema.thumbnailUrl}
          uploadDate={blogPost.videoSchema.uploadDate}
          contentUrl={blogPost.videoSchema.contentUrl}
          embedUrl={blogPost.videoSchema.embedUrl}
          duration={blogPost.videoSchema.duration}
        />
      )}

      {slug === 'easter-backgrounds' && <EasterHDBanner />}
      <ContentComponent />
    </BlogLayout>
  );
}

export async function getStaticPaths() {
  const paths = blogPosts
    .filter(post => post.live)
    .map(post => ({ params: { slug: post.slug } }));

  return { paths, fallback: false };
}

export async function getStaticProps() {
  return { props: {} };
}