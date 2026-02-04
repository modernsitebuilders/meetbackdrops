// lib/imageScoring.js
export function calculateImageScore(image, currentDate = new Date()) {
  const RESET_DATE = new Date('2026-01-25');
  
  // Safely parse dates
  const createdDate = image.createdDate ? new Date(image.createdDate) : RESET_DATE;
  const lastDownloadDate = image.lastDownload ? new Date(image.lastDownload) : null;
  
  // Calculate days
  const daysOld = Math.max(0, Math.floor((currentDate - createdDate) / (1000 * 60 * 60 * 24)));
  const daysInactive = lastDownloadDate 
    ? Math.max(0, Math.floor((currentDate - lastDownloadDate) / (1000 * 60 * 60 * 24)))
    : daysOld;
  
  // Base score starts at 50
  let score = 50;
  
  // 1. Download boost: 5 points per download
  score += (image.totalDownloads || 0) * 5;
  
  // 2. Inactivity penalty: -1 per month (very slow)
  score -= Math.floor(daysInactive / 30);
  
  // 3. New image bonus: +15 for first 90 days, fades linearly
  if (daysOld < 90) {
    const newBonus = 15 * (1 - (daysOld / 90));
    score += newBonus;
  }
  
  // 4. Recent download bonus: +10 for downloads in last 30 days, fades
  if (daysInactive < 30) {
    const recentBonus = 10 * (1 - (daysInactive / 30));
    score += recentBonus;
  }
  
  // 5. Legacy protection: Any download = never below 30
  if ((image.totalDownloads || 0) > 0) {
    score = Math.max(30, score);
  }
  
  // 6. Cap at 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// NEW: Match filenames accounting for StreamBackdrops- prefix and different extensions
export function matchFilenames(filename1, filename2) {
  if (!filename1 || !filename2) return false;
  
  // Remove StreamBackdrops- prefix
  const clean1 = filename1.replace('StreamBackdrops-', '');
  const clean2 = filename2.replace('StreamBackdrops-', '');
  
  // Remove extensions for comparison
  const base1 = clean1.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const base2 = clean2.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  
  return base1 === base2;
}

// NEW: Find matching analytics entry
export function findMatchingAnalytics(filename, analyticsData) {
  if (!filename || !analyticsData) return null;
  
  // First try exact match
  if (analyticsData[filename]) {
    return analyticsData[filename];
  }
  
  // Try to match with different extensions
  const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
  const variants = [
    `${baseName}.webp`,
    `${baseName}.png`,
    `${baseName}.jpg`,
    `${baseName}.jpeg`,
    `StreamBackdrops-${baseName}.webp`,
    `StreamBackdrops-${baseName}.png`,
    `StreamBackdrops-${baseName}.jpg`,
    `StreamBackdrops-${baseName}.jpeg`
  ];
  
  for (const variant of variants) {
    if (analyticsData[variant]) {
      return analyticsData[variant];
    }
  }
  
  return null;
}

export function calculateAllScores(images, metadataMap = {}, analyticsData = {}) {
  const currentDate = new Date();
  const scores = {};
  
  images.forEach(image => {
    const filename = image.filename || image.id;
    
    // Get metadata for this image
    const meta = metadataMap[filename] || {};
    
    // Find matching analytics (handles StreamBackdrops- prefix and .png extensions)
    const analytics = findMatchingAnalytics(filename, analyticsData) || {};
    
    // Prepare image data for scoring
    const imageData = {
      createdDate: meta.firstSeen || image.createdDate || currentDate,
      totalDownloads: analytics.downloads || image.downloads || 0,
      lastDownload: analytics.lastDownload || image.lastDownload || null
    };
    
    // Calculate score
    scores[filename] = calculateImageScore(imageData, currentDate);
  });
  
  return scores;
}

export function getTopImages(images, scores, count = 10) {
  const imagesWithScores = images.map(image => ({
    ...image,
    score: scores[image.filename] || 0
  }));
  
  return imagesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(img => img.filename);
}