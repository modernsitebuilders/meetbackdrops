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

  const sessionData = parseSessionData(req);
  const sessionId = sessionData.sessionId;

  // Localhost bypass
  const isLocalhost = req.headers.host?.includes('localhost');
  if ((!sessionId || sessionId === 'undefined') && !isLocalhost) {
    return res.status(403).json({ 
      error: 'Session required. Please download from streambackdrops.com' 
    });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(500).json({ error: 'Download failed' });
    }
    
    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}