import Image from 'next/image';
import SocialShare from './SocialShare';
import { folderMap } from '../data/categoryData';

export default function ImagePreviewModal({ image, slug, onClose, onDownload }) {
  if (!image) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '4rem'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        style={{
          position: 'fixed',
          top: '2rem',
          right: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          cursor: 'pointer',
          fontSize: '1.5rem',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>

      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '95vw',
          maxHeight: '90vh',
          flexDirection: window.innerWidth < 768 ? 'column' : 'row'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Vertical Social Share */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <SocialShare 
            image={{...image, category: slug}}
            title={`${image.title} - Free Virtual Background`}
            size="large"
            showLabels={false}
            vertical={true}
          />
        </div>
        
        {/* Image Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '90vw',
            maxHeight: '80vh'
          }}>
            <Image
              src={`/images/${folderMap[slug]}/${image.filename}`}
              alt={image.title}
              width={1456}
              height={816}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
              }}
              quality={90}
            />
          </div>
          
          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(image);
            }}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}