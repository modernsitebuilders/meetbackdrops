import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import ReviewModal from '../../components/ReviewModal';
import styles from '../../styles/CategoryPage.module.css';
import RateLimitModal from '../../components/RateLimitModal';
import BreadcrumbSchema from '../../components/BreadcrumbSchema';
import { getSessionData, updateSessionActivity } from '../../lib/sessionTracking';

export default function MostPopular() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cloudinaryUrls, setCloudinaryUrls] = useState({});

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [downloadedImage, setDownloadedImage] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitError, setRateLimitError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch from static cache instead of API
        const response = await fetch('/popular-cache.json');
        
        if (!response.ok) {
          throw new Error('Cache not found');
        }
        
        const cacheData = await response.json();
        
        // Fetch Cloudinary URLs
        let urlsData = {};
        try {
          const urlsResponse = await fetch('/cloudinary-urls.json');
          if (urlsResponse.ok) {
            urlsData = await urlsResponse.json();
          }
        } catch (err) {
          console.log('Cloudinary URLs not found, will use fallback');
        }
        
        setImages(cacheData.images);
        setCloudinaryUrls(urlsData);
        setLoading(false);
        console.log('Loaded images:', cacheData.images.length);
        
      } catch (err) {
        console.error('Failed to load popular images:', err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleImageDownload = async (image, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    try {
      // Admin bypass
      if (typeof window !== 'undefined' && localStorage.getItem('streambackdrops_admin') === 'true') {
        const baseFilename = image.filename.replace('.webp', '');
        const link = document.createElement('a');
        link.href = `/images/${image.category}/${image.filename}`;
        link.download = `StreamBackdrops-${baseFilename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const session = getSessionData();
      updateSessionActivity('download');

      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: image.filename.replace('.webp', '.png'),
          category: image.category,
          sessionId: session?.id || null,
          originalReferrer: session?.originalReferrer || 'direct',
          originalUtmSource: session?.originalUtmSource || null,
          originalUtmMedium: session?.originalUtmMedium || null,
          originalUtmCampaign: session?.originalUtmCampaign || null,
          landingPage: session?.landingPage || null,
          pageViewsInSession: session?.pageViews || 0,
          downloadsInSession: (session?.downloads || 0) + 1
        })
      });

      const baseFilename = image.filename.replace('.webp', '').replace('.png', '');
      const imageUrl = cloudinaryUrls[baseFilename];
      console.log('Looking for:', baseFilename, 'Found:', imageUrl ? 'YES' : 'NO');
      
      if (imageUrl) {
        const cloudinaryPngUrl = imageUrl.replace('/upload/', '/upload/f_png/');
        const filename = `StreamBackdrops-${baseFilename}.png`;
        const downloadUrl = `/api/download?url=${encodeURIComponent(cloudinaryPngUrl)}&filename=${encodeURIComponent(filename)}`;
        
        const response = await fetch(downloadUrl, { method: 'HEAD' });
        
        if (!response.ok) {
          const errorResponse = await fetch(downloadUrl);
          const errorData = await errorResponse.json();
          throw new Error(errorData.error || 'Download limit reached');
        }
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.warn('No Cloudinary URL found, using direct webp download');
        const link = document.createElement('a');
        link.href = image.webPath;
        link.download = `StreamBackdrops-${baseFilename}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      setDownloadedImage(image.filename);
      setTimeout(() => setShowReviewModal(true), 2000);
      
    } catch (error) {
      if (error.message && (error.message.includes('limit') || error.message.includes('banned'))) {
        setRateLimitError(error.message);
        setShowRateLimitModal(true);
      } else {
        console.error('Download failed:', error);
      }
    }
  };

  const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <button className={styles.modalClose} onClick={onClose}>×</button>
          
          <div className={styles.modalImageContainer}>
            <Image
  src={image.webPath}
  alt="Popular virtual background"
  width={800}
  height={450}
  sizes="(max-width: 768px) 100vw, 800px"
  style={{ objectFit: 'cover' }}
/>
            <div className={styles.popularBadge}>
              Popular Choice
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              onClick={() => handleImageDownload(image)}
              className={styles.downloadButton}
            >
              Download Image
            </button>
            <Link 
              href={`/category/${image.category}`}
              className={styles.categoryLink}
            >
              View {image.category.replace(/-/g, ' ')} category →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Most Popular Virtual Backgrounds | StreamBackdrops</title>
        <meta 
          name="description" 
          content="Download the most popular free virtual backgrounds for Zoom, Teams, and Google Meet. Proven favorites from thousands of downloads." 
        />
        <link rel="canonical" href="https://streambackdrops.com/category/most-popular" />

        <BreadcrumbSchema items={[
          { name: "Home", url: "https://streambackdrops.com" },
          { name: "Most Popular", url: "https://streambackdrops.com/category/most-popular" }
        ]} />
      </Head>

      <div className={styles.categoryPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            Most Popular Backgrounds
          </h1>
          <p className={styles.description}>
            Our most downloaded virtual backgrounds - proven favorites from thousands of users
          </p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading popular backgrounds...</p>
          </div>
        ) : (
          <>
            <div className={styles.stats}>
              <span>Top {images.length} most downloaded backgrounds</span>
            </div>

            <div className={styles.gallery}>
              {images.map((image, index) => (
                <div 
                  key={image.filename}
                  className={styles.imageCard}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className={styles.imageWrapper}>
                    <Image
  src={image.webPath}
  alt="Popular virtual background"
  width={800}
  height={450}
  sizes="(max-width: 768px) 100vw, 800px"
  style={{ objectFit: 'cover' }}
/>
                    <div className={styles.hoverOverlay}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageDownload(image);
                        }}
                        className={styles.hoverDownloadButton}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <ImageModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />

        {showReviewModal && (
          <ReviewModal 
            onClose={() => setShowReviewModal(false)}
          />
        )}

        {showRateLimitModal && (
          <RateLimitModal 
            onClose={() => setShowRateLimitModal(false)}
            errorMessage={rateLimitError}
          />
        )}

        <section className={styles.whyPopular}>
          <h2>Why These Backgrounds Are Popular</h2>
          <div className={styles.reasonsGrid}>
            <div className={styles.reason}>
              <h3>✨ Proven Quality</h3>
              <p>Downloaded by thousands of professionals who trust these backgrounds</p>
            </div>
            <div className={styles.reason}>
              <h3>🎯 Versatile</h3>
              <p>Work great across different meeting types and lighting conditions</p>
            </div>
            <div className={styles.reason}>
              <h3>📸 Professional</h3>
              <p>Selected by users for their clean, polished appearance</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}