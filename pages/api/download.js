import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  const { filename, folder } = req.query;
  
  if (!filename || !folder) {
    return res.status(400).json({ error: 'Filename and folder required' });
  }
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', folder, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Convert WebP to PNG using sharp
    const pngBuffer = await sharp(filePath)
      .png()
      .toBuffer();
    
    // Force download as PNG
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.webp', '.png')}"`);
    res.setHeader('Content-Length', pngBuffer.length);
    
    res.send(pngBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}