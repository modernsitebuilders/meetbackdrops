import { useState } from 'react';
import { getSessionData, updateSessionActivity } from '../lib/sessionTracking';

export function useImageDownload(cloudinaryUrls) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(null);

  const handleDownload = async (image, category) => {
    // Set downloading state immediately for instant feedback
    setDownloadingImage(image.filename);
    
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
      
      // Get session data for attribution
      const session = getSessionData();
      
      // Update session download counter
      updateSessionActivity('download');
      
      // Track download via API with session attribution
      fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: image.filename.replace('.webp', '.png'),
          category: category,
          // Include session attribution
          sessionId: session?.id || null,
          originalReferrer: session?.originalReferrer || 'direct',
          originalUtmSource: session?.originalUtmSource || null,
          originalUtmMedium: session?.originalUtmMedium || null,
          originalUtmCampaign: session?.originalUtmCampaign || null,
          landingPage: session?.landingPage || null,
          pageViewsInSession: session?.pageViews || 0,
          downloadsInSession: (session?.downloads || 0) + 1  // Current download number
        })
      }).catch(() => {});
      
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
      const imageUrl = cloudinaryUrls[baseFilename];
      
      if (imageUrl) {
        const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
        const filename = `StreamBackdrops-${baseFilename}.png`;
        
        // Check rate limit before downloading
        const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}`;
        
        try {
          const response = await fetch(downloadUrl, { method: 'HEAD' });
          
          if (response.ok) {
            // Rate limit OK, proceed with download
            const link = document.createElement('a');
            link.href = downloadUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // Rate limit hit, get error message
            const errorResponse = await fetch(downloadUrl);
            const errorData = await errorResponse.json();
            throw new Error(errorData.error || 'Download limit reached');
          }
        } catch (error) {
          if (error.message.includes('limit') || error.message.includes('banned')) {
            throw error; // Re-throw to be caught by parent
          }
          // For other errors, try direct download anyway
          const link = document.createElement('a');
          link.href = downloadUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error(`No Cloudinary URL found for ${baseFilename}`);
      }
      
      // Clear downloading state
      setDownloadingImage(null);
      
      // Show review modal after 2 seconds
      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
      }, 2000);
      
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
    downloadingImage
  };
}