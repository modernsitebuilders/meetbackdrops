import { useState } from 'react';
import { getSessionData, updateSessionActivity, getVisitorType } from '../lib/sessionTracking';

export function useImageDownload(cloudinaryUrls) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(null);
  const [downloadCount, setDownloadCount] = useState(1);

  const handleDownload = async (image, category) => {
    if (downloadingImage === image.filename) {
      console.log('Already downloading:', image.filename);
      return;
    }
    
    updateSessionActivity('download');
    setDownloadingImage(image.filename);
    
    try {
      const isAdmin = localStorage.getItem('streambackdrops_admin') === 'true';
      
      if (isAdmin) {
        console.log('Admin download - skipping tracking for:', image.filename);
        await triggerDownloadWithRateLimitHandling(image, category, null, true);
        setDownloadedImage(image.filename);
        setTimeout(() => {
          setShowReviewModal(true);
          setDownloadingImage(null);
        }, 1000);
        return;
      }
      
      const session = getSessionData();
      
      const currentCount = parseInt(localStorage.getItem('sb_download_count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('sb_download_count', newCount.toString());
      setDownloadCount(newCount);
      
     const trackSuccess = await trackDownloadToSheets(image, category, session, isAdmin);
      
      if (!trackSuccess) {
        console.warn('Tracking failed, but proceeding with download');
      }
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'download', {
          'event_category': 'engagement',
          'event_label': image.filename,
          'image_name': image.filename,
          'category': category,
          'value': 1
        });
      }
      
      await triggerDownloadWithRateLimitHandling(image, category, session, false);
      
      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
        setDownloadingImage(null);
      }, 1000);
      
    } catch (error) {
      console.error('Download process failed:', error);
      setDownloadingImage(null);
      
      if (error.message.includes('limit') || 
          error.message.includes('429') || 
          error.message.includes('Download limit')) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      }
    }
  };

  const trackDownloadToSheets = async (image, category, session, isAdmin) => {
    try {
      const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      const pngFilename = `StreamBackdrops-${baseFilename}.png`;
      
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

      console.log('📊 Sending tracking data:', {
        originalFilename: image.filename,
        pngFilename: pngFilename,
        category: category,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/track-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: pngFilename,
          category: category,
          isAdmin: isAdmin,
          ...sessionData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Tracking API error:', result);
        return false;
      }

      return result.success || result.skipped === 'recent_duplicate';
      
    } catch (error) {
      console.error('Failed to track download:', error);
      return false;
    }
  };

  const triggerDownloadWithRateLimitHandling = async (image, category, session, skipLimits) => {
    const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const pngFilename = `StreamBackdrops-${baseFilename}.png`;
    
    let cloudinaryPngUrl;
    if (cloudinaryUrls && cloudinaryUrls[baseFilename]) {
      const imageUrl = cloudinaryUrls[baseFilename];
      cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
    }
    
    if (!cloudinaryPngUrl) {
      console.warn('No Cloudinary URL found for:', baseFilename);
      // No fallback to webp - just warn the user
      throw new Error('Image not available for download. Please try again later.');
    }
    
    // Build the session data param (fixed: was "session", API expects "sessionData")
    const sessionParam = session ? encodeURIComponent(JSON.stringify({
      sessionId: session.id,
      visitorId: session.visitorId
    })) : '';
    
    const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(pngFilename)}&sessionData=${sessionParam}`;
    
    // Use fetch + blob instead of iframe (works on mobile + desktop)
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      // Try to parse error JSON from the API
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      } catch (e) {
        if (e.message && e.message !== 'Download failed') throw e;
        throw new Error(response.status === 429 ? 'Download limit reached' : 'Download failed');
      }
    }
    
    // Get the image as a blob and trigger a real download
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = pngFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  const handleDownloadWithErrorHandling = async (image, category) => {
    await handleDownload(image, category);
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