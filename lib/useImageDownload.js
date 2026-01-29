import { useState } from 'react';
import { getSessionData, updateSessionActivity, getOrCreateVisitorId, isReturningVisitor, getVisitorType } from '../lib/sessionTracking';

export function useImageDownload(cloudinaryUrls) {
  console.log('=== CLOUDINARY DEBUG ===');
  console.log('Total URLs:', Object.keys(cloudinaryUrls).length);
  console.log('Has nature-10?', !!cloudinaryUrls['nature-landscapes-10']);
  console.log('=======================');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(null);
  const [downloadCount, setDownloadCount] = useState(1);
  const [downloadCooldowns, setDownloadCooldowns] = useState({});

  const handleDownload = async (image, category) => {
  // Prevent double-clicks
  if (downloadingImage === image.filename) {
    return;
  }
  
  // Check cooldown (3 seconds)
  const now = Date.now();
  const lastDownload = downloadCooldowns[image.filename] || 0;
  if (now - lastDownload < 3000) {
    console.log('Cooldown active, skipping download');
    return;
  }
  
// Set cooldown
setDownloadCooldowns(prev => ({ ...prev, [image.filename]: now }));

// Set downloading state immediately for instant feedback
setDownloadingImage(image.filename);

// Clear downloading state after 5 seconds
setTimeout(() => {
  setDownloadingImage(null);
}, 5000);
  
  console.log('DOWNLOAD DEBUG:', {
    filename: image.filename,
    category,
    cloudinaryUrlsCount: Object.keys(cloudinaryUrls).length,
    hasCloudinaryUrls: !!cloudinaryUrls
  });
    
  try {
    // Admin bypass - direct PNG download
    if (localStorage.getItem('streambackdrops_admin') === 'true') {
      const baseFilename = image.filename.replace('.webp', '');
      const link = document.createElement('a');
      link.href = `/images/${category}/${image.filename}`;
      link.download = `StreamBackdrops-${baseFilename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadingImage(null);
      return;
    }
    
    // Update session download counter
    updateSessionActivity('download');

    // Update download counter
    const currentCount = parseInt(localStorage.getItem('sb_download_count') || '0') + 1;
    localStorage.setItem('sb_download_count', currentCount.toString());
    setDownloadCount(currentCount);
    
    // Get session data for attribution (after update)
    const session = getSessionData();
    
    // Track with Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download', {
        'event_category': 'engagement',
        'event_label': image.filename,
        'image_name': image.filename,
        'category': category,
        'value': 1
      });
    }

    // Get Cloudinary URL and trigger download
    const baseFilename = image.filename.replace('.webp', '');
    const filename = `StreamBackdrops-${baseFilename}.png`;
    const imageUrl = cloudinaryUrls[baseFilename];
    
    console.log('LOOKUP:', { baseFilename, imageUrl, exists: !!imageUrl });
    
    // Prepare session data
    const sessionData = session ? {
      sessionId: session.id,
      originalReferrer: session.originalReferrer,
      originalUtmSource: session.originalUtmSource,
      originalUtmMedium: session.originalUtmMedium,
      originalUtmCampaign: session.originalUtmCampaign,
      landingPage: session.landingPage,
      pageViewsInSession: session.pageViews,
      downloadsInSession: session.downloads,
      visitorId: session.visitorId,
      visitorType: getVisitorType()
    } : {};
    
    if (imageUrl) {
  const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
  const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}&sessionData=${encodeURIComponent(JSON.stringify(sessionData))}`;
  
  // Download immediately - no HEAD check
  const link = document.createElement('a');
  link.href = downloadUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
} else {
  console.error(`No Cloudinary URL found for ${baseFilename}`);
}
    
    // Track download
    try {
      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          category,
          ...sessionData
        })
      });
    } catch (e) {
      console.error('Track failed:', e);
    }
    try {
  await fetch('/api/track-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      category,
      ...sessionData
    })
  });
  
  // Check count AFTER download
  const countCheck = await fetch(`/api/check-limits?sessionId=${sessionData.sessionId}`);
  const { dailyCount, atLimit, message } = await countCheck.json();
  
  if (atLimit) {
    setRateLimitError(message);
    setShowRateLimitModal(true);
    setDownloadingImage(null);
    return;
  }
} catch (e) {
  console.error('Track failed:', e);
}
    // Clear downloading state
    setDownloadingImage(null);
    
    // Show review modal after 2 seconds
    setDownloadedImage(image.filename);
    setTimeout(() => {
      setShowReviewModal(true);
    }, 5000);
    
  } catch (error) {
    console.error('Download failed:', error);
    setDownloadingImage(null);
    throw error; // Re-throw so wrapper can catch it
  }
};

  const handleDownloadWithErrorHandling = async (image, category) => {
    try {
      await handleDownload(image, category);
    } catch (error) {
      if (error.message.includes('limit') || error.message.includes('banned')) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      } else {
        console.error('Download failed:', error);
      }
    }
  };

  return {
    handleDownload: handleDownloadWithErrorHandling,
    showReviewModal,
    setShowReviewModal,
    downloadedImage,
    showRateLimitModal,
    setShowRateLimitModal,
    rateLimitError,
    downloadingImage,
    downloadCount
  };
}