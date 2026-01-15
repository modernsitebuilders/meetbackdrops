function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const dailyDownloads = parseInt(cookies.dl_count_daily || '0');
  
  if (dailyDownloads >= 5) {
    return res.status(429).json({ 
      error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
    });
  }
  
  const downloadTimestamps = cookies.dl_timestamps ? 
    cookies.dl_timestamps.split(',').map(ts => parseInt(ts)) : [];
  
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentDownloads = downloadTimestamps.filter(ts => ts > thirtyDaysAgo);
  
  if (recentDownloads.length >= 10) {
    const oldestDownload = Math.min(...recentDownloads);
    const daysUntilAvailable = Math.ceil((oldestDownload + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000));
    
    return res.status(429).json({ 
      error: `Monthly download limit of 10 reached. Your oldest download will expire in ${daysUntilAvailable} day${daysUntilAvailable !== 1 ? 's' : ''}.` 
    });
  }

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const buffer = await response.arrayBuffer();
    const newTimestamps = [...recentDownloads, Date.now()].join(',');
    
    res.setHeader('Set-Cookie', [
      `dl_count_daily=${dailyDownloads + 1}; Max-Age=${24 * 60 * 60}; Path=/; SameSite=Lax; Secure`,
      `dl_timestamps=${newTimestamps}; Max-Age=${30 * 24 * 60 * 60}; Path=/; SameSite=Lax; Secure`
    ]);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Track successful download AFTER limit check passes
    const category = filename.match(/^(.+?)-\d+\.png$/)?.[1] || 'unknown';
    fetch(`${req.headers.origin || 'https://streambackdrops.com'}/api/track-download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: filename,
        category: category,
        sessionId: cookies.sb_session || null,
        originalReferrer: cookies.sb_ref || 'direct',
        originalUtmSource: cookies.sb_utm_source || null,
        originalUtmMedium: cookies.sb_utm_medium || null,
        originalUtmCampaign: cookies.sb_utm_campaign || null,
        landingPage: cookies.sb_landing || null,
        pageViewsInSession: parseInt(cookies.sb_pageviews || '0'),
        downloadsInSession: parseInt(cookies.sb_downloads || '0') + 1,
        visitorId: cookies.sb_visitor || 'unknown',
        visitorType: cookies.sb_visitor_type || 'new'
      })
    }).catch(() => {});
    
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}