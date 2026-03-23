import { google } from 'googleapis';
import crypto from 'crypto';

function parseSessionData(req) {
  try {
    const sessionDataParam = req.query.sessionData;
    return sessionDataParam ? JSON.parse(decodeURIComponent(sessionDataParam)) : {};
  } catch (e) {
    return {};
  }
}

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'salt_streambackdrops').digest('hex').substring(0, 16);
}


export default async function handler(req, res) {
  const { url, filename } = req.query;

  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Only allow Cloudinary URLs to prevent server-side request forgery
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'res.cloudinary.com') {
      return res.status(400).json({ error: 'Invalid image source' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const sessionData = parseSessionData(req);
  const sessionId = sessionData.sessionId;

  // Localhost bypass
  const isLocalhost = req.headers.host?.includes('localhost');
  if ((!sessionId || sessionId === 'undefined') && !isLocalhost) {
    return res.status(403).json({ 
      error: 'Session required. Please download from streambackdrops.com' 
    });
  }

  // Insert fl_attachment into the Cloudinary URL so the browser downloads
  // directly from Cloudinary instead of proxying through Vercel.
  try {
    const downloadUrl = url.replace(
      '/image/upload/',
      `/image/upload/fl_attachment:${filename.replace(/\.[^.]+$/, '')}/`
    );
    return res.redirect(302, downloadUrl);
  } catch (error) {
    console.error('Download redirect failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}