// pages/api/download.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { folder, filename } = req.query;
  
  if (!folder || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Create the StreamBackdrops branded filename
  const baseFilename = filename.replace('.webp', '');
  const downloadName = `StreamBackdrops-${baseFilename}.png`;
  
  // Get the actual file path
  const filePath = path.join(process.cwd(), 'public', 'images', folder, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Read the file
  const fileBuffer = fs.readFileSync(filePath);
  
  // Set headers to force download with our custom filename
  res.setHeader('Content-Type', 'image/webp');
  res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
  res.send(fileBuffer);
}