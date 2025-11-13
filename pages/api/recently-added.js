import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnhju6mhg',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  try {
    const { offset = 0, limit = 25 } = req.query;
    
    // Get all images uploaded in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString().split('T')[0];
    
    const result = await cloudinary.v2.search
      .expression(`resource_type:image AND created_at>="${dateString}"`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    // Parse images and extract category from filename pattern
    const allRecentImages = result.resources
      .filter(img => img.public_id && !img.public_id.includes('/'))
      .map(img => {
        const filename = img.public_id;
        
        // Determine category from filename pattern
        let category = 'unknown';
        if (filename.startsWith('bookshelves-bright-')) category = 'bookshelves-bright';
        else if (filename.startsWith('bookshelves-dark-')) category = 'bookshelves-dark';
        else if (filename.startsWith('wall-shelves-bright-')) category = 'wall-shelves-bright';
        else if (filename.startsWith('wall-shelves-dark-')) category = 'wall-shelves-dark';
        else if (filename.startsWith('office-spaces-')) category = 'office-spaces';
        else if (filename.startsWith('living-room-')) category = 'living-rooms';
        else if (filename.startsWith('kitchen-')) category = 'kitchens';
        else if (filename.startsWith('coffee-shop-')) category = 'coffee-shops';
        else if (filename.startsWith('art-gallery-')) category = 'art-galleries';
        else if (filename.startsWith('urban-loft-')) category = 'urban-lofts';
        else if (filename.startsWith('garden-patio-')) category = 'gardens-patios';
        else if (filename.startsWith('historic-')) category = 'historic-spaces';
        else if (filename.startsWith('nature-')) category = 'nature-landscapes';
        else if (filename.startsWith('library-')) category = 'libraries';
        else if (filename.startsWith('bokeh-')) category = 'bokeh-backgrounds';
        else if (filename.startsWith('christmas-')) category = 'christmas-backgrounds';
        else if (filename.startsWith('halloween-')) category = 'halloween-backgrounds';
        
        return {
          filename: filename + '.webp',
          downloadName: filename + '.png',
          category: category,
          uploadDate: img.created_at,
          title: filename.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
        };
      })
      .filter(img => img.category !== 'unknown');

    // Apply pagination
    const startIndex = parseInt(offset);
    const limitNum = parseInt(limit);
    const paginatedImages = allRecentImages.slice(startIndex, startIndex + limitNum);
    const hasMore = startIndex + limitNum < allRecentImages.length;

    res.status(200).json({ 
      images: paginatedImages,
      total: allRecentImages.length,
      hasMore: hasMore,
      nextOffset: startIndex + limitNum
    });
    
  } catch (error) {
    console.error('Failed to fetch recent images:', error);
    res.status(500).json({ error: 'Failed to fetch recent images' });
  }
}