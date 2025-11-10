import { useImageSearch } from '../lib/useImageSearch';
import { useImageDownload } from '../lib/useImageDownload';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import KeywordFilter from '../components/KeywordFilter';
import SearchResults from '../components/SearchResults';
import ImagePreviewModal from '../components/ImagePreviewModal';
import imageMetadata from '../public/data/image-metadata-complete.json';
import { formatPublicCount, TOTAL_IMAGES_FORMATTED } from '../lib/categories-config';
import cloudinaryUrls from '../cloudinary-urls.json';
import ReviewModal from '../components/ReviewModal';


export default function BrowsePage() {
  const { results, isSearching, hasSearched, performSearch } = useImageSearch(imageMetadata);
  const { handleDownload, showReviewModal, setShowReviewModal } = useImageDownload(cloudinaryUrls);
  const [displayCount, setDisplayCount] = useState(24);
  const [selectedKeywords, setSelectedKeywords] = useState({});
  const [previewImage, setPreviewImage] = useState(null);


   // Organized search keywords by category
  const searchCategories = {
    'Style': ['Modern', 'Traditional', 'Minimalist', 'Luxury', 'Cozy', 'Professional', 'Industrial'],
    'Lighting': ['Bright', 'Dark', 'Natural Light', 'Warm'],
    'Features': ['Bookshelf', 'Plants', 'Wood', 'City View', 'Office', 'Fireplace', 'Windows']
  };

  // Trigger search when keywords change
useEffect(() => {
  performSearch(selectedKeywords);
  setDisplayCount(24); // Reset display count on new search
}, [selectedKeywords]);

  // Handle filter changes from KeywordFilter component
  const handleFilterChange = (newKeywords) => {
    setSelectedKeywords(newKeywords);
  };

  const activeFilterCount = Object.keys(selectedKeywords).length;
  const filterText = activeFilterCount > 0 
    ? Object.values(selectedKeywords).join(' • ')
    : '';

  return (
    <Layout 
      title="Browse Virtual Backgrounds - StreamBackdrops.com"
      description={`Browse through ${TOTAL_IMAGES_FORMATTED} free HD virtual backgrounds by keyword - filter by style, lighting, and features`}
      currentPage="browse"
    >
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        padding: '2rem 1rem'
      }}>
        {/* Header */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Browse Backgrounds
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1rem'
          }}>
            Filter through {TOTAL_IMAGES_FORMATTED} professional virtual backgrounds
          </p>
        </div>

        {/* Keyword Filter Component */}
        <KeywordFilter 
          searchCategories={searchCategories}
          selectedKeywords={selectedKeywords}
          onFilterChange={handleFilterChange}
        />

        {/* Results */}
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto'
        }}>
          <SearchResults
            results={results}
            displayCount={displayCount}
            filterText={filterText}
            isSearching={isSearching}
            hasSearched={hasSearched}
            onDownload={handleDownload}
            onLoadMore={() => setDisplayCount(displayCount + 24)}
            onImageClick={setPreviewImage}
          />
        </div>
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        image={previewImage}
        slug={previewImage?.category}
        onClose={() => setPreviewImage(null)}
        onDownload={handleDownload}
      />

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal 
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </Layout>
  );
}