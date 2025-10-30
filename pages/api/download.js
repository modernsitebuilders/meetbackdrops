export default async function handler(req, res) {
  const { url, filename } = req.query;
  
  if (!url || !filename) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  // Check if user is banned
  const isBanned = req.cookies.user_banned === 'true';
  
  if (isBanned) {
    return res.status(403).json({ 
      error: 'You have been banned from downloading due to excessive use.' 
    });
  }
  
  // Get daily and weekly download counts
  const dailyDownloads = parseInt(req.cookies.dl_count_daily || '0');
  const weeklyDownloads = parseInt(req.cookies.dl_count_weekly || '0');
  
  // Check daily limit (5 per day)
  if (dailyDownloads >= 5) {
    return res.status(429).json({ 
      error: 'Daily download limit of 5 reached. Please try again tomorrow.' 
    });
  }
  
  // Check weekly limit (30 triggers ban)
  if (weeklyDownloads + 1 >= 30) {
    res.setHeader('Set-Cookie', `user_banned=true; Max-Age=${90 * 24 * 60 * 60}; Path=/`);
    return res.status(403).json({ 
      error: 'You have exceeded 30 downloads in a week and have been banned for 90 days.' 
    });
  }

  try {
    // Fetch from Cloudinary
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    
    const buffer = await response.arrayBuffer();
    // Increment download counters
    res.setHeader('Set-Cookie', [
      `dl_count_daily=${dailyDownloads + 1}; Max-Age=${24 * 60 * 60}; Path=/`,
      `dl_count_weekly=${weeklyDownloads + 1}; Max-Age=${7 * 24 * 60 * 60}; Path=/`
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