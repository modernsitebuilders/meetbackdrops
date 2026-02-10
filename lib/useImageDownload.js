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
    
    // Update session activity
    updateSessionActivity('download');
    
    setDownloadingImage(image.filename);
    
    try {
      // Skip tracking for admin users
      const isAdmin = localStorage.getItem('streambackdrops_admin') === 'true';
      
      if (isAdmin) {
        console.log('Admin download - skipping tracking for:', image.filename);
        triggerDownloadSuccess(image, category);
        return;
      }
      
      // Get session data
      const session = getSessionData();
      
      // Update local download counter
      const currentCount = parseInt(localStorage.getItem('sb_download_count') || '0');
      const newCount = currentCount + 1;
      localStorage.setItem('sb_download_count', newCount.toString());
      setDownloadCount(newCount);
      
      // Send tracking to Google Sheets with PNG filename
      const trackSuccess = await trackDownloadToSheets(image, category, session);
      
      if (!trackSuccess) {
        console.warn('Tracking failed, but proceeding with download');
      }
      
      // Send Google Analytics event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'download', {
          'event_category': 'engagement',
          'event_label': image.filename,
          'image_name': image.filename,
          'category': category,
          'value': 1
        });
      }
      
      // Trigger the file download with rate limit handling
      await triggerDownloadWithRateLimitHandling(image, category, session);
      
      // Show review modal on success
      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
        setDownloadingImage(null);
      }, 1000);
      
    } catch (error) {
      console.error('Download process failed:', error);
      setDownloadingImage(null);
      
      // Check for rate limit errors
      if (error.message.includes('limit') || 
          error.message.includes('429') || 
          error.message.includes('Download limit')) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      }
    }
  };

  const trackDownloadToSheets = async (image, category, session) => {
    try {
      // Create PNG filename for tracking
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
          filename: pngFilename, // Send PNG filename
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
      return false;
    }
  };

  const triggerDownloadWithRateLimitHandling = async (image, category, session) => {
    return new Promise((resolve, reject) => {
      const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      const pngFilename = `StreamBackdrops-${baseFilename}.png`;
      
      let cloudinaryPngUrl;
      if (cloudinaryUrls && cloudinaryUrls[baseFilename]) {
        const imageUrl = cloudinaryUrls[baseFilename];
        cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
      }
      
      if (!cloudinaryPngUrl) {
        // Fallback to direct download
        triggerDirectDownload(image, category);
        resolve();
        return;
      }
      
      const sessionParam = session ? encodeURIComponent(JSON.stringify({
        sessionId: session.id,
        visitorId: session.visitorId
      })) : '';
      
      const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(pngFilename)}&session=${sessionParam}`;
      
      // Create hidden iframe to trigger download
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      // Set up error handling
      iframe.onload = () => {
        setTimeout(() => {
          try {
            // Try to read iframe content for errors
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const bodyText = iframeDoc.body?.textContent || '';
            
            // Check for rate limit errors
            if (bodyText.includes('limit reached') || 
                bodyText.includes('429') || 
                bodyText.includes('Daily download') || 
                bodyText.includes('Monthly download')) {
              
              // Try to parse JSON error
              try {
                const jsonMatch = bodyText.match(/\{.*\}/);
                if (jsonMatch) {
                  const errorData = JSON.parse(jsonMatch[0]);
                  reject(new Error(errorData.error || 'Download limit reached'));
                } else {
                  // Extract error message from text
                  const errorMatch = bodyText.match(/"error":"([^"]+)"/) || 
                                   bodyText.match(/error["']?\s*:\s*["']([^"']+)["']/);
                  reject(new Error(errorMatch ? errorMatch[1] : 'Download limit reached'));
                }
              } catch {
                reject(new Error('Download limit reached'));
              }
            } else {
              // Download likely succeeded
              resolve();
            }
          } catch (e) {
            // Cross-origin issues - assume success
            resolve();
          }
          
          // Clean up
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      };
      
      iframe.onerror = () => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(new Error('Download failed'));
      };
      
      // Start download
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      
      // Fallback timeout
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
          resolve(); // Assume success after timeout
        }
      }, 5000);
    });
  };

  const triggerDirectDownload = (image, category) => {
    // Direct download fallback
    const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const pngFilename = `StreamBackdrops-${baseFilename}.png`;
    
    const link = document.createElement('a');
    link.href = `/images/${category}/${image.filename}`;
    link.download = pngFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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