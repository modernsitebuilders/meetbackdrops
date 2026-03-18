import { useState } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';

export default function ImageLookup() {
  const [filename, setFilename] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  const handleLookup = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');
    setCategory('');

    try {
      // Remove .png or .webp extension if user added it
      const cleanFilename = filename.trim().replace(/\.(png|webp)$/i, '');
      
      // Determine category from filename
      let cat = '';
      if (cleanFilename.startsWith('bookshelves-bright-')) cat = 'bookshelves-bright';
      else if (cleanFilename.startsWith('bookshelves-dark-')) cat = 'bookshelves-dark';
      else if (cleanFilename.startsWith('wall-shelves-bright-')) cat = 'wall-shelves-bright';
      else if (cleanFilename.startsWith('wall-shelves-dark-')) cat = 'wall-shelves-dark';
      else if (cleanFilename.startsWith('office-spaces-')) cat = 'office-spaces';
      else if (cleanFilename.startsWith('living-room-')) cat = 'living-rooms';
      else if (cleanFilename.startsWith('kitchen-')) cat = 'kitchens';
      else if (cleanFilename.startsWith('coffee-shop-')) cat = 'coffee-shops';
      else if (cleanFilename.startsWith('conference-room-')) cat = 'conference-rooms';
      else if (cleanFilename.startsWith('art-gallery-')) cat = 'art-galleries';
      else if (cleanFilename.startsWith('urban-loft-')) cat = 'urban-lofts';
      else if (cleanFilename.startsWith('garden-patio-')) cat = 'gardens-patios';
      else if (cleanFilename.startsWith('historic-')) cat = 'historic-spaces';
      else if (cleanFilename.startsWith('nature-')) cat = 'nature-landscapes';
      else if (cleanFilename.startsWith('library-')) cat = 'libraries';
      else if (cleanFilename.startsWith('bokeh-')) cat = 'bokeh-backgrounds';
      else if (cleanFilename.startsWith('christmas-')) cat = 'christmas-backgrounds';
      else if (cleanFilename.startsWith('halloween-')) cat = 'halloween-backgrounds';
      else if (cleanFilename.startsWith('valentines-background-')) cat = 'valentines-backgrounds';
      else if (cleanFilename.startsWith('easter-background-')) cat = 'easter-backgrounds';
      
      if (!cat) {
        setError('Could not determine category from filename. Make sure it starts with the category prefix.');
        setLoading(false);
        return;
      }
      
      setCategory(cat);
      // Use the local WebP file
      const webpUrl = `/images/${cat}/${cleanFilename}.webp`;
      setImageUrl(webpUrl);
      
    } catch (err) {
      setError('Error looking up image. Please try again.');
      setLoading(false);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError('');
  };

  const handleImageError = () => {
    setLoading(false);
    setImageUrl('');
    setError('Image not found. Make sure the filename is correct.');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <Layout
      title="Image Lookup Tool - StreamBackdrops"
      description="Look up any image by filename"
      currentPage="image-lookup"
    >
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Image Lookup Tool
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem'
        }}>
          Enter a filename (without extension) to view the image
        </p>

        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., wall-shelves-dark-04"
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          
          <button
            onClick={handleLookup}
            disabled={loading}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: loading ? '#9ca3af' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#2563eb';
            }}
          >
            {loading ? 'Looking...' : 'Lookup'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {imageUrl && (
          <div style={{
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#f9fafb'
          }}>
            {category && (
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginBottom: '12px',
                fontWeight: '600'
              }}>
                Category: {category}
              </div>
            )}
            
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '16px',
              display: loading ? 'flex' : 'block',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: loading ? '200px' : 'auto'
            }}>
              {loading && (
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  Loading image...
                </div>
              )}
              <img
                src={imageUrl}
                alt={filename}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: loading ? 'none' : 'block'
                }}
              />
            </div>
            
            {!loading && (
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                wordBreak: 'break-all'
              }}>
                <strong>Path:</strong> {imageUrl}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}