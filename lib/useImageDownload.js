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
    // Early return if already downloading this image
    if (downloadingImage === image.filename) {
      console.log('Already downloading:', image.filename);
      return;
    }
    
    // Update session activity FIRST (critical fix)
    updateSessionActivity('download');
    
    setDownloadingImage(image.filename);
    
    try {
      // Skip tracking for admin users but still allow download
      const isAdmin = localStorage.getItem('streambackdrops_admin') === 'true';
      
      if (isAdmin) {
        console.log('Admin download - skipping tracking for:', image.filename);
        // Still trigger review modal for admin
        triggerDownloadSuccess(image, category);
        return;
      }
      
      // Get session data AFTER updating activity
      const session = getSessionData();
      
      // Update local download counter
      const currentCount = parseInt(localStorage.getItem('sb_download_count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('sb_download_count', newCount.toString());
      setDownloadCount(newCount);
      
      // Send tracking to Google Sheets FIRST
      const trackSuccess = await trackDownloadToSheets(image, category, session);
      
      if (!trackSuccess) {
        console.warn('Tracking failed, but proceeding with download');
        // Continue with download even if tracking fails
      }
      
      // Send Google Analytics event if available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'download', {
          'event_category': 'engagement',
          'event_label': image.filename,
          'image_name': image.filename,
          'category': category,
          'value': 1
        });
      }
      
      // Actually trigger the file download
      triggerDownloadSuccess(image, category, session);
      
    } catch (error) {
      console.error('Download process failed:', error);
      setDownloadingImage(null);
      
      if (error.message.includes('limit') || error.message.includes('banned')) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      } else {
        // For other errors, try to download anyway without tracking
        console.log('Attempting direct download despite error');
        triggerDirectDownload(image, category);
      }
    }
  };

  const trackDownloadToSheets = async (image, category, session) => {
    try {
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

      const response = await fetch('/api/track-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: image.filename,
          category: category,
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
      return false; // Return false but don't block download
    }
  };

  const triggerDownloadSuccess = (image, category, session) => {
    const baseFilename = image.filename.replace('.webp', '');
    const filename = `StreamBackdrops-${baseFilename}.png`;
    
    // Use Cloudinary URL if available
    if (cloudinaryUrls && cloudinaryUrls[baseFilename]) {
      const imageUrl = cloudinaryUrls[baseFilename];
      const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
      
      // Add session data to URL for tracking
      const sessionParam = session ? encodeURIComponent(JSON.stringify({
        sessionId: session.id,
        visitorId: session.visitorId
      })) : '';
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}&session=${sessionParam}`;
      
      // Create and trigger download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.target = '_blank'; // Open in new tab to avoid navigation issues
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
      
    } else {
      // Fallback to direct image path
      triggerDirectDownload(image, category);
    }
    
    // Show review modal
    setDownloadedImage(image.filename);
    setTimeout(() => {
      setShowReviewModal(true);
      setDownloadingImage(null);
    }, 1500);
  };

  const triggerDirectDownload = (image, category) => {
    // Direct download fallback
    const link = document.createElement('a');
    link.href = `/images/${category}/${image.filename}`;
    link.download = `StreamBackdrops-${image.filename.replace('.webp', '')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadedImage(image.filename);
    setDownloadingImage(null);
    setTimeout(() => {
      setShowReviewModal(true);
    }, 1500);
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