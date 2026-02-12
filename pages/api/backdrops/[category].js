// pages/api/backdrops/[category].js
import fs from 'fs';
import path from 'path';
import { CATEGORIES, getCategoryName, SEO_DESCRIPTIONS, CATEGORY_KEYWORDS } from '../../../lib/categories-config';

export default async function handler(req, res) {
  const { category } = req.query;
  
  // Validate category exists
  if (!CATEGORIES[category]) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  try {
    // Read metadata
    const metadataPath = path.join(process.cwd(), 'public/data/image-metadata-complete.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Get all images in this category
    const images = [];
    Object.entries(metadata).forEach(([id, data]) => {
      if (data.category === category) {
        images.push({
          id,
          filename: data.filename,
          downloadName: data.downloadName,
          title: data.title,
          description: data.description,
          alt: data.alt,
          keywords: data.keywords || [],
          width: data.width,
          height: data.height,
          aspectRatio: (data.width / data.height).toFixed(2),
          url: `/backdrop/${id}`
        });
      }
    });

    // Sort by ID (usually sequential)
    images.sort((a, b) => a.id.localeCompare(b.id));

    // Get SEO metadata from config
    const seo = {
      title: `${CATEGORIES[category].name} | Free Virtual Backgrounds`,
      description: SEO_DESCRIPTIONS[category] || CATEGORIES[category].description,
      keywords: CATEGORY_KEYWORDS[category] || [],
      ogImage: images[0]?.filename ? `https://streambackdrops.com/backdrops/${images[0].filename}` : null
    };

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      success: true,
      category: {
        slug: category,
        name: CATEGORIES[category].name,
        description: CATEGORIES[category].description,
        seo,
        stats: {
          totalImages: images.length,
          formattedCount: images.length >= 100 ? `${Math.floor(images.length / 100) * 100}+` : `${images.length}`,
          uniqueKeywords: [...new Set(images.flatMap(img => img.keywords || []))].length
        },
        images: images.slice(0, 50), // First 50 for performance
        totalImagesAvailable: images.length,
        hasMore: images.length > 50,
        sampleTags: getTopTags(images, 10)
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load category' 
    });
  }
}

function getTopTags(images, limit = 10) {
  const tagCounts = {};
  images.forEach(img => {
    img.keywords?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}