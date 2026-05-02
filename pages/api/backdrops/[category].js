// pages/api/backdrops/[category].js
import { CATEGORIES, SEO_DESCRIPTIONS, CATEGORY_KEYWORDS } from '../../../lib/categories-config';
import { getByCategory } from '../../../lib/manifest';

export default async function handler(req, res) {
  const { category } = req.query;

  if (!CATEGORIES[category]) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  try {
    const categoryImages = getByCategory(category);

    const images = categoryImages.map((data) => {
      const id = data.slug || data.id;
      return {
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
      };
    });

    images.sort((a, b) => a.id.localeCompare(b.id));

    const seo = {
      title: `${CATEGORIES[category].name} | Free Virtual Backgrounds`,
      description: SEO_DESCRIPTIONS[category] || CATEGORIES[category].description,
      keywords: CATEGORY_KEYWORDS[category] || [],
      ogImage: images[0]?.filename ? `https://meetbackdrops.com/backdrops/${images[0].filename}` : null
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
        images: images.slice(0, 50),
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
