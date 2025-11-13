import { useState } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';

export default function ImageLookup() {
  const [filename, setFilename] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!filename.trim()) {
      setError('Please enter a filename');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      // Remove .png or .webp extension if user added it
      const cleanFilename = filename.replace(/\.(png|webp)$/i, '');
      
      // Try to fetch from Cloudinary
      const cloudinaryUrl = `https://res.cloudinary.com/dnhju6mhg/image/upload/v1/${cleanFilename}.png`;
      
      // Check if image exists
      const response = await fetch(cloudinaryUrl, { method: 'HEAD' });
      
      if (response.ok) {
        setImageUrl(cloudinaryUrl);
      } else {
        setError('Image not found. Make sure the filename is correct (without .png or .webp extension)');
      }
    } catch (err) {
      setError('Error looking up image. Please try again.');
    } finally {
      setLoading(false);
    }
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
            placeholder="e.g., office-spaces-01"
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
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              marginBottom: '16px'
            }}>
              <img
                src={imageUrl}
                alt={filename}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              wordBreak: 'break-all'
            }}>
              <strong>URL:</strong> {imageUrl}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}