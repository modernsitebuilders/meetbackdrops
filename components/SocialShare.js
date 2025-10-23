// components/SocialShare.js
import { useState } from 'react';

export default function SocialShare({ 
  title, 
  size = "large", 
  showLabels = false, 
  vertical = true 
}) {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [showCopied, setShowCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: 'X',
      hoverColor: '#1DA1F2',
      isExternal: true
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: 'f',
      hoverColor: '#4267B2',
      isExternal: true
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: 'in',
      hoverColor: '#0077B5',
      isExternal: true
    },
    {
      name: 'Pinterest',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      icon: 'P',
      hoverColor: '#BD081C',
      isExternal: true
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      hoverColor: '#10B981',
      action: 'copy',
      isExternal: false
    }
  ];

  const containerStyle = {
    display: 'flex',
    flexDirection: vertical ? 'column' : 'row',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const baseButtonStyle = {
    padding: '0.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    color: 'white',
    fontSize: size === 'large' ? '1.5rem' : '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: size === 'large' ? '3rem' : '2.5rem',
    minHeight: size === 'large' ? '3rem' : '2.5rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    textDecoration: 'none'
  };

  return (
    <div style={containerStyle}>
      {showCopied && (
        <div style={{
          position: 'absolute',
          top: '-2rem',
          background: '#10B981',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          fontSize: '0.875rem',
          zIndex: 1000
        }}>
          Link copied to clipboard!
        </div>
      )}
      
      {shareLinks.map((link) => (
        <div key={link.name} style={{ position: 'relative' }}>
          {link.action === 'copy' ? (
            // Copy Link button - no href, proper button element
            <button
              aria-label={`Copy link to clipboard`}
              style={{
                ...baseButtonStyle,
                backgroundColor: hoveredLink === link.name ? link.hoverColor : 'rgba(255, 255, 255, 0.1)',
                transform: hoveredLink === link.name ? 'scale(1.1)' : 'scale(1)'
              }}
              onClick={handleCopy}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
              onFocus={() => setHoveredLink(link.name)}
              onBlur={() => setHoveredLink(null)}
            >
              {link.icon}
              {showLabels && <span style={{ marginLeft: '0.5rem' }}>{link.name}</span>}
            </button>
          ) : (
            // External share links
            <a 
              href={link.url}
              aria-label={`Share on ${link.name}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              style={{
                ...baseButtonStyle,
                backgroundColor: hoveredLink === link.name ? link.hoverColor : 'rgba(255, 255, 255, 0.1)',
                transform: hoveredLink === link.name ? 'scale(1.1)' : 'scale(1)'
              }}
              onMouseEnter={() => setHoveredLink(link.name)}
              onMouseLeave={() => setHoveredLink(null)}
              onFocus={() => setHoveredLink(link.name)}
              onBlur={() => setHoveredLink(null)}
            >
              {link.icon}
              {showLabels && <span style={{ marginLeft: '0.5rem' }}>{link.name}</span>}
            </a>
          )}
          
          {/* Tooltip */}
          {hoveredLink === link.name && (
            <div style={{
              position: 'absolute',
              bottom: '120%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#333',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              zIndex: 1000,
              pointerEvents: 'none'
            }}>
              {link.action === 'copy' ? 'Copy link to clipboard' : `Share on ${link.name}`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}