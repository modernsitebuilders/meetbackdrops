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

  // Only allow R2 URLs to prevent server-side request forgery
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'assets.streambackdrops.com') {
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

  // Proxy the file from R2 and set Content-Disposition so the browser downloads it.
  try {
    const r2Response = await fetch(url);
    if (!r2Response.ok) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const contentType = r2Response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    const buffer = await r2Response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Download proxy failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}