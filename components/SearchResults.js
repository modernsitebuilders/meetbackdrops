import Image from 'next/image';

export default function SearchResults({ 
  results, 
  displayCount,
  downloadingImage,
  filterText,
  isSearching,
  hasSearched,
  onDownload,
  onLoadMore,
  onImageClick
}) {
  
  if (isSearching) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '3rem',
        color: '#6b7280'
      }}>
        Filtering...
      </div>
    );
  }

  if (hasSearched && results.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center',
        padding: '3rem',
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ 
          fontSize: '1.2rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          No backgrounds found for "{filterText}"
        </p>
        <p style={{ 
          fontSize: '0.9rem',
          color: '#9ca3af'
        }}>
          Try different keyword combinations or browse our categories
        </p>
      </div>
    );
  }

  if (!hasSearched || results.length === 0) {
    return null;
  }

  return (
    <>
      <div style={{ 
        marginBottom: '1.5rem',
        color: '#6b7280',
        fontSize: '0.95rem'
      }}>
        Found {results.length} background{results.length !== 1 ? 's' : ''} matching "{filterText}"
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {results.slice(0, displayCount).map((image, index) => (
          <div
            key={image.id}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => onImageClick && onImageClick(image)}
          >
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              overflow: 'hidden'
            }}>
              <Image
                src={`/images/${image.category}/${image.filename}`}
                alt={`${image.title} - Free virtual background`}
                title={`Download ${image.title} - Professional video call background`}
                width={1456}
                height={816}
                style={{ 
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%'
                }}
                loading={index < 8 ? 'eager' : 'lazy'}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
              />
              
              {/* Hover Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                flexDirection: 'column',
                gap: '1rem'
              }}
              className="image-overlay">
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(image, image.category);
                  }}
                  disabled={downloadingImage === image.filename}
                  style={{
                    background: downloadingImage === image.filename ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: downloadingImage === image.filename ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: downloadingImage === image.filename ? 0.7 : 1
                  }}
                >
                  {downloadingImage === image.filename ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        width: '14px',
                        height: '14px',
                        border: '2px solid white',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}></span>
                      Downloading...
                    </>
                  ) : (
                    'Download'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {results.length > displayCount && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={onLoadMore}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Load More ({results.length - displayCount} remaining)
          </button>
        </div>
      )}

      <style jsx>{`
        .image-overlay:hover {
          opacity: 1 !important;
        }
        
        div:hover .image-overlay {
          opacity: 1;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}