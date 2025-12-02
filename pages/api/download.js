export default async function handler(req, res) {
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  // Get daily download count
  const dailyDownloads = parseInt(req.cookies.dl_count_daily || '0');
  
  // Check daily limit (5 per day)
  if (dailyDownloads >= 5) {
    return res.status(429).json({ 
      error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
    });
  }
  
  // Get 30-day download timestamps from cookie (stored as comma-separated timestamps)
  const downloadTimestamps = req.cookies.dl_timestamps ? 
    req.cookies.dl_timestamps.split(',').map(ts => parseInt(ts)) : [];
  
  // Filter to only downloads within last 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentDownloads = downloadTimestamps.filter(ts => ts > thirtyDaysAgo);
  
  // Check 30-day limit (10 downloads)
  if (recentDownloads.length >= 10) {
    const oldestDownload = Math.min(...recentDownloads);
    const daysUntilAvailable = Math.ceil((oldestDownload + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000));
    
    return res.status(429).json({ 
      error: `Monthly download limit of 10 reached. Your oldest download will expire in ${daysUntilAvailable} day${daysUntilAvailable !== 1 ? 's' : ''}.` 
    });
  }

  // For HEAD requests, just return 200 if we passed the checks
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  try {
    // Fetch from Cloudinary
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const buffer = await response.arrayBuffer();
    
    // Add current timestamp to download history
    const newTimestamps = [...recentDownloads, Date.now()].join(',');
    
    // Increment download counters
    res.setHeader('Set-Cookie', [
      `dl_count_daily=${dailyDownloads + 1}; Max-Age=${24 * 60 * 60}; Path=/; SameSite=Lax; Secure`,
      `dl_timestamps=${newTimestamps}; Max-Age=${30 * 24 * 60 * 60}; Path=/; SameSite=Lax; Secure`
    ]);
    
    // Set headers to force download with custom filename
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
    
  } catch (error) {
    console.error('Download failed:', error);
    res.status(500).json({ error: 'Download failed' });
  }
}