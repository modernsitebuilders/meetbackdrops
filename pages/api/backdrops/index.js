// pages/api/backdrops/index.js
import fs from 'fs';
import path from 'path';
import { CATEGORIES, TOTAL_IMAGES, TOTAL_IMAGES_FORMATTED } from '../../../lib/categories-config';

export default async function handler(req, res) {
  try {
    // Read the image metadata
    const metadataPath = path.join(process.cwd(), 'public/data/image-metadata-complete.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Count images per category from actual metadata
    const categoryCounts = {};
    const imagesByCategory = {};
    
    Object.values(metadata).forEach(image => {
      const cat = image.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      
      if (!imagesByCategory[cat]) {
        imagesByCategory[cat] = [];
      }
      // Store first 5 as examples
      if (imagesByCategory[cat].length < 5) {
        imagesByCategory[cat].push({
          id: Object.keys(metadata).find(key => metadata[key] === image),
          filename: image.filename,
          alt: image.alt?.split(' ').slice(0, 8).join(' ') + '...',
          width: image.width,
          height: image.height
        });
      }
    });

    // Build category data with actual counts
    const categories = {};
    Object.keys(CATEGORIES).forEach(slug => {
      const actualCount = categoryCounts[slug] || 0;
      categories[slug] = {
        ...CATEGORIES[slug],
        actualCount,
        formattedCount: actualCount >= 100 ? `${Math.floor(actualCount / 100) * 100}+` : `${actualCount}`,
        sampleImages: imagesByCategory[slug] || []
      };
    });

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      success: true,
      site: 'StreamBackdrops.com',
      lastUpdated: new Date().toISOString().split('T')[0],
      stats: {
        totalImages: TOTAL_IMAGES,
        totalImagesFormatted: TOTAL_IMAGES_FORMATTED,
        totalCategories: Object.keys(CATEGORIES).length,
        categoriesWithContent: Object.keys(categoryCounts).length
      },
      categories,
      popularTags: generatePopularTags(metadata)
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load backdrop catalog' 
    });
  }
}

function generatePopularTags(metadata) {
  const tagCounts = {};
  
  Object.values(metadata).forEach(image => {
    if (image.keywords && Array.isArray(image.keywords)) {
      image.keywords.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
    // Also parse alt text for additional keywords
    if (image.alt) {
      image.alt.split(' ').forEach(word => {
        if (word.length > 4 && !['with', 'that', 'this', 'your', 'background'].includes(word)) {
          tagCounts[word] = (tagCounts[word] || 0) + 1;
        }
      });
    }
  });

  // Get top 30 tags
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag, count]) => ({
      tag,
      count,
      url: `/browse?tag=${encodeURIComponent(tag)}`
    }));
}