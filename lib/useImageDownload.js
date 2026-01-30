import { useState } from 'react';
import { getSessionData, updateSessionActivity, getVisitorType } from '../lib/sessionTracking';

export function useImageDownload(cloudinaryUrls) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(null);
  const [downloadCount, setDownloadCount] = useState(1);
  const [downloadCooldowns, setDownloadCooldowns] = useState({});
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null);

  const handleDownload = async (image, category, captchaToken = null) => {
  if (downloadingImage === image.filename) return;
  
  const now = Date.now();
  const lastDownload = downloadCooldowns[image.filename] || 0;
  if (now - lastDownload < 3000) return;
  
  // Check if CAPTCHA needed (BEFORE incrementing count)
  const currentCount = parseInt(localStorage.getItem('sb_download_count') || '0');
  if (currentCount >= 3 && !captchaToken) {
    setPendingDownload({ image, category });
    setShowCaptcha(true);
    return;
  }

  setDownloadCooldowns(prev => ({ ...prev, [image.filename]: now }));
  setDownloadingImage(image.filename);

  setTimeout(() => {
    setDownloadingImage(null);
  }, 3000);
  
  try {
    if (localStorage.getItem('streambackdrops_admin') === 'true') {
      const link = document.createElement('a');
      link.href = `/images/${category}/${image.filename}`;
      link.download = `StreamBackdrops-${image.filename.replace('.webp', '')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    updateSessionActivity('download');
    
    // INCREMENT COUNT HERE - after CAPTCHA passed
    const newCount = currentCount + 1;
    localStorage.setItem('sb_download_count', newCount.toString());
    setDownloadCount(newCount);
      setDownloadCount(newCount);
      
      const session = getSessionData();
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'download', {
          'event_category': 'engagement',
          'event_label': image.filename,
          'image_name': image.filename,
          'category': category,
          'value': 1
        });
      }

      const baseFilename = image.filename.replace('.webp', '');
      const filename = `StreamBackdrops-${baseFilename}.png`;
      const imageUrl = cloudinaryUrls[baseFilename];
      
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
        const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}&sessionData=${encodeURIComponent(JSON.stringify(sessionData))}${captchaToken ? `&captcha=${captchaToken}` : ''}`;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        
        const countCheck = await fetch(`/api/check-limits?sessionId=${sessionData.sessionId}`);
        const { atLimit, message } = await countCheck.json();
        
        if (atLimit) {
          setRateLimitError(message);
          setShowRateLimitModal(true);
          return;
        }
      } catch (e) {
        console.error('Track failed:', e);
      }
      
      setDownloadedImage(image.filename);
      setTimeout(() => {
        setShowReviewModal(true);
      }, 1500);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadingImage(null);
      throw error;
    }
  };

  const handleCaptchaSuccess = (token) => {
    setShowCaptcha(false);
    if (pendingDownload) {
      handleDownload(pendingDownload.image, pendingDownload.category, token);
      setPendingDownload(null);
    }
  };

  const handleDownloadWithErrorHandling = async (image, category) => {
    try {
      await handleDownload(image, category);
    } catch (error) {
      if (error.message.includes('limit') || error.message.includes('banned')) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
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
    downloadCount,
    showCaptcha,
    setShowCaptcha,
    handleCaptchaSuccess
  };
}