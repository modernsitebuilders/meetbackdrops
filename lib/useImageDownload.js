import { useState, useEffect } from 'react';
import { getSessionData, updateSessionActivity, getVisitorType } from '../lib/sessionTracking';

export function useImageDownload(cloudinaryUrls) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');
  const [downloadingImage, setDownloadingImage] = useState(null);
  const [downloadCount, setDownloadCount] = useState(1);
  const [pendingRateLimitImage, setPendingRateLimitImage] = useState(null);
  const [pendingRateLimitCategory, setPendingRateLimitCategory] = useState(null);
  const [emailBonusUsed, setEmailBonusUsed] = useState(false);

  useEffect(() => {
    setEmailBonusUsed(localStorage.getItem('sb_email_bonus_used') === 'true');
  }, []);

  const handleDownload = async (image, category, eventType = 'cat_image_download') => {
    if (downloadingImage === image.filename) {
      return;
    }
  
    setDownloadingImage(image.filename);
    
    try {
      const isAdmin = localStorage.getItem('streambackdrops_admin') === 'true';
      
      if (isAdmin) {
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
      
     await trackDownloadToSheets(image, category, session, isAdmin, eventType);

     updateSessionActivity('download');
      
      // If we get here, tracking succeeded (no error thrown)
      
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
        setPendingRateLimitImage(image);
        setPendingRateLimitCategory(category);
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      }
    }
  };

  const handleEmailBonus = async (email) => {
    const image = pendingRateLimitImage;
    const category = pendingRateLimitCategory;
    if (!image || !category) return;

    localStorage.setItem('sb_email_bonus_used', 'true');
    setEmailBonusUsed(true);
    setShowRateLimitModal(false);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType: 'email_bonus_download', email, category, filename: image.filename }),
    }).catch(() => {});

    const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
    const pngFilename = `StreamBackdrops-${baseFilename}.png`;
    const cloudinaryUrl = cloudinaryUrls?.[baseFilename]
      ? cloudinaryUrls[baseFilename].replace('/upload/', '/upload/f_png/')
      : `https://res.cloudinary.com/dnhju6mhg/image/upload/f_png/${baseFilename}.png`;

    try {
      const response = await fetch(cloudinaryUrl);
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = pngFilename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl); }, 1000);
        return;
      }
    } catch {}

    // Fallback to local webp
    try {
      const webpResponse = await fetch(`https://res.cloudinary.com/dnhju6mhg/image/upload/webp/${category}/${image.filename}`);
      const blob = await webpResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `StreamBackdrops-${baseFilename}.webp`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(blobUrl); }, 1000);
    } catch {}
  };

  const trackDownloadToSheets = async (image, category, session, isAdmin, eventType = 'cat_image_download') => {
    try {
      const baseFilename = image.filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
      const pngFilename = `StreamBackdrops-${baseFilename}.png`;
      
      const freshSession = getSessionData();  // ADD THIS LINE - get fresh count
      
      const sessionData = session ? {
        sessionId: session.id,
        originalReferrer: session.originalReferrer,
        originalUtmSource: session.originalUtmSource,
        originalUtmMedium: session.originalUtmMedium,
        originalUtmCampaign: session.originalUtmCampaign,
        landingPage: session.landingPage,
        pageViewsInSession: freshSession?.pageViews || 0,     // CHANGE: use fresh
        downloadsInSession: freshSession?.downloads || 0,      // CHANGE: use fresh
        visitorId: session.visitorId,
        visitorType: getVisitorType()
      } : {};

      const response = await fetch('/api/track-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: pngFilename,
          category: category,
          isAdmin: isAdmin,
          eventType: eventType,
          ...sessionData
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Tracking API error:', result);
        if (response.status === 429) {
          throw new Error(result.error || 'Download limit reached');
        }
        return false;
      }

      return result.success || result.skipped === 'recent_duplicate';
      
    } catch (error) {
      console.error('Failed to track download:', error);
      // Re-throw rate limit errors so they reach handleDownload's catch block
      if (error.message && (error.message.includes('limit') || error.message.includes('429'))) {
        throw error;
      }
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
      // Not in cloudinary-urls.json — construct URL directly using known cloud name + public_id pattern
      cloudinaryPngUrl = `https://res.cloudinary.com/dnhju6mhg/image/upload/f_png/${baseFilename}.png`;
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
      // Rate limit errors must be surfaced
      if (response.status === 429) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Download limit reached');
        } catch (e) {
          throw new Error('Download limit reached');
        }
      }
      // Cloudinary image not found — fall back to webp from public/images/
      const webpFilename = `StreamBackdrops-${baseFilename}.webp`;
      const webpResponse = await fetch(`https://res.cloudinary.com/dnhju6mhg/image/upload/webp/${category}/${image.filename}`);
      if (!webpResponse.ok) throw new Error('Download failed');
      const webpBlob = await webpResponse.blob();
      const webpBlobUrl = URL.createObjectURL(webpBlob);
      const webpLink = document.createElement('a');
      webpLink.href = webpBlobUrl;
      webpLink.download = webpFilename;
      webpLink.style.display = 'none';
      document.body.appendChild(webpLink);
      webpLink.click();
      setTimeout(() => { document.body.removeChild(webpLink); URL.revokeObjectURL(webpBlobUrl); }, 1000);
      return;
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

  const handleDownloadWithErrorHandling = async (image, category, eventType = 'cat_image_download') => {
    await handleDownload(image, category, eventType);
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
    emailBonusUsed,
    handleEmailBonus,
  };
}