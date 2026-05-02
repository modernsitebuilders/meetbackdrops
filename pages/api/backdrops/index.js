// pages/api/backdrops/index.js
import { CATEGORIES, TOTAL_IMAGES, TOTAL_IMAGES_FORMATTED } from '../../../lib/categories-config';
import { getAll } from '../../../lib/manifest';

export default async function handler(req, res) {
  try {
    const images = getAll();

    const categoryCounts = {};
    const imagesByCategory = {};

    images.forEach((image) => {
      const cat = image.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      if (!imagesByCategory[cat]) {
        imagesByCategory[cat] = [];
      }
      if (imagesByCategory[cat].length < 5) {
        imagesByCategory[cat].push({
          id: image.slug || image.id,
          filename: image.filename,
          alt: image.alt?.split(' ').slice(0, 8).join(' ') + '...',
          width: image.width,
          height: image.height
        });
      }
    });

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
      site: 'MeetBackdrops.com',
      lastUpdated: new Date().toISOString().split('T')[0],
      stats: {
        totalImages: TOTAL_IMAGES,
        totalImagesFormatted: TOTAL_IMAGES_FORMATTED,
        totalCategories: Object.keys(CATEGORIES).length,
        categoriesWithContent: Object.keys(categoryCounts).length
      },
      categories,
      popularTags: generatePopularTags(images)
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load backdrop catalog'
    });
  }
}

function generatePopularTags(images) {
  const tagCounts = {};

  images.forEach(image => {
    if (image.keywords && Array.isArray(image.keywords)) {
      image.keywords.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
    if (image.alt) {
      image.alt.split(' ').forEach(word => {
        if (word.length > 4 && !['with', 'that', 'this', 'your', 'background'].includes(word)) {
          tagCounts[word] = (tagCounts[word] || 0) + 1;
        }
      });
    }
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([tag, count]) => ({
      tag,
      count,
      url: `/browse?tag=${encodeURIComponent(tag)}`
    }));
}
