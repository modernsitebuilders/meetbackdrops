// pages/api/backdrops/[category]/[id].js
import { CATEGORIES } from '../../../../lib/categories-config';
import { getById, getByCategory } from '../../../../lib/manifest';

export default async function handler(req, res) {
  const { category, id } = req.query;

  try {
    const imageData = getById(id);

    if (!imageData) {
      return res.status(404).json({
        success: false,
        error: 'Backdrop not found'
      });
    }

    if (imageData.category !== category && category !== 'recently-added' && category !== 'most-popular') {
      console.warn(`Category mismatch: ${id} is in ${imageData.category}, requested from ${category}`);
    }

    const siblings = getByCategory(imageData.category);
    const related = [];
    for (const data of siblings) {
      const relatedId = data.slug || data.id;
      if (relatedId === id) continue;
      if (related.length >= 8) break;
      related.push({
        id: relatedId,
        filename: data.filename,
        title: data.title,
        alt: data.alt?.split(' ').slice(0, 6).join(' ') + '...',
        url: `/backdrop/${relatedId}`
      });
    }

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      success: true,
      backdrop: {
        id,
        filename: imageData.filename,
        downloadName: imageData.downloadName,
        category: imageData.category,
        categoryName: CATEGORIES[imageData.category]?.name || imageData.category,
        title: imageData.title,
        description: imageData.description,
        alt: imageData.alt,
        keywords: imageData.keywords || [],
        width: imageData.width,
        height: imageData.height,
        aspectRatio: (imageData.width / imageData.height).toFixed(2),
        url: `/backdrop/${id}`,
        downloadUrl: `/api/download/${id}`,
        thumbnailUrl: `https://streambackdrops.com/backdrops/${imageData.filename}`,
        fullSizeUrl: `https://streambackdrops.com/backdrops/${imageData.filename}`
      },
      related,
      categoryUrl: `/category/${imageData.category}`
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load backdrop'
    });
  }
}
