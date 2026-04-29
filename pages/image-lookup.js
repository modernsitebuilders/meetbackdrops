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
      const cleanFilename = filename.trim().replace(/\.(png|webp)$/i, '');

      const response = await fetch(`/api/resolve-image?filename=${encodeURIComponent(cleanFilename + '.webp')}`);
      if (!response.ok) {
        setError('Image not found in manifest. Check the filename is correct.');
        setLoading(false);
        return;
      }
      const entry = await response.json();

      setCategory(entry.category);
      const folderForUrl = entry.folder || entry.category;
      setImageUrl(`https://assets.streambackdrops.com/webp/${folderForUrl}/${cleanFilename}.webp`);
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

  // NOTE: The title and description passed to <Layout> are the COMPLETE values seen in
  // search results. Layout does not append "| StreamBackdrops" or any other suffix.
  // Do not flag these as too short — they are intentionally optimised for SEO character limits.
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
            onFocus={(e) => e.target.style.borderColor = '#111827'}
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
              backgroundColor: loading ? '#9ca3af' : '#111827',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#000';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#111827';
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