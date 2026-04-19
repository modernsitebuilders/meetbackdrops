// Recent uploads list. Queries Cloudinary for created_at timestamps
// (Cloudinary still has the upload history), then resolves every entry
// against the canonical manifest by filename. Category is ALWAYS taken
// from the manifest — never inferred from the filename.
//
// Rows that cannot be resolved against the manifest are dropped. The
// endpoint does not invent classifications for unknown files.
import cloudinary from 'cloudinary';
import { resolveByAnyExtension } from '../../lib/manifest';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  try {
    const { offset = 0, limit = 25 } = req.query;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString().split('T')[0];

    const result = await cloudinary.v2.search
      .expression(`resource_type:image AND created_at>="${dateString}"`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    const allRecentImages = result.resources
      .filter((img) => img.public_id)
      .map((img) => {
        const bareName = img.public_id.includes('/')
          ? img.public_id.split('/').pop()
          : img.public_id;

        const manifestEntry = resolveByAnyExtension(`${bareName}.webp`);
        if (!manifestEntry) return null;

        return {
          filename: manifestEntry.filename,
          downloadName: manifestEntry.downloadName,
          category: manifestEntry.category,
          uploadDate: img.created_at,
          title: manifestEntry.title,
        };
      })
      .filter(Boolean);

    const startIndex = parseInt(offset);
    const limitNum = parseInt(limit);
    const paginatedImages = allRecentImages.slice(startIndex, startIndex + limitNum);
    const hasMore = startIndex + limitNum < allRecentImages.length;

    res.setHeader('Cache-Control', 'public, max-age=1800, stale-while-revalidate=3600');
    res.status(200).json({
      images: paginatedImages,
      total: allRecentImages.length,
      hasMore,
      nextOffset: startIndex + limitNum,
    });
  } catch (error) {
    console.error('Failed to fetch recent images:', error);
    res.status(500).json({ error: 'Failed to fetch recent images' });
  }
}
