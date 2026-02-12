// pages/api/blog/index.js
import { 
  blogPosts, 
  getLiveBlogPosts, 
  BLOG_CATEGORIES,
  getCategoryCounts 
} from '../../../data/blogPosts';

export default async function handler(req, res) {
  try {
    const livePosts = getLiveBlogPosts();
    const categoryCounts = getCategoryCounts();

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).json({
      success: true,
      site: 'StreamBackdrops.com',
      lastUpdated: new Date().toISOString().split('T')[0],
      stats: {
        totalPosts: blogPosts.length,
        livePosts: livePosts.length,
        categories: BLOG_CATEGORIES.length - 1,
        featuredPosts: blogPosts.filter(p => p.featured && p.live).length
      },
      categories: BLOG_CATEGORIES.filter(c => c !== 'All Posts').map(cat => ({
        name: cat,
        count: categoryCounts[cat] || 0,
        slug: cat.toLowerCase().replace(/\s+/g, '-')
      })),
      posts: livePosts.map(post => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        category: post.category,
        date: post.date,
        publishDate: post.publishDate,
        readTime: post.readTime,
        featured: post.featured,
        image: post.image,
        url: `https://streambackdrops.com/blog/${post.slug}`
      }))
    });
  } catch (error) {
    console.error('Blog API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load blog catalog' 
    });
  }
}