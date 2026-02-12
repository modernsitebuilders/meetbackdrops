// pages/api/blog/[slug].js
import { getBlogPost } from '../../../data/blogPosts';

export default async function handler(req, res) {
  const { slug } = req.query;
  
  try {
    const post = getBlogPost(slug);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    // Only return live posts via API
    if (!post.live) {
      return res.status(404).json({
        success: false,
        error: 'Blog post not found'
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
      success: true,
      post: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: post.date,
        publishDate: post.publishDate,
        readTime: post.readTime,
        featured: post.featured,
        image: post.image,
        description: post.description,
        keywords: post.keywords,
        canonical: post.canonical,
        headline: post.headline,
        faqKey: post.faqKey,
        url: `https://streambackdrops.com/blog/${post.slug}`
      }
    });
  } catch (error) {
    console.error('Blog Post API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load blog post' 
    });
  }
}