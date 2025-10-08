// components/SocialShare.js
export default function SocialShare({ image, title, size = "large", showLabels = false, vertical = true }) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Twitter',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: 'X',
      hoverColor: '#1DA1F2'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: 'f',
      hoverColor: '#4267B2'
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: 'in',
      hoverColor: '#0077B5'
    },
    {
      name: 'Pinterest',
      url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      icon: 'P',
      hoverColor: '#BD081C'
    },
    {
      name: 'Copy Link',
      url: '#',
      icon: '🔗',
      hoverColor: '#10B981',
      action: 'copy'
    }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      gap: '0.5rem'
    }}>
      {shareLinks.map((link) => (
        <a 
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={link.action === 'copy' ? (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
          } : undefined}
          style={{
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            color: 'white',
            textDecoration: 'none',
            fontSize: size === 'large' ? '1.5rem' : '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '3rem',
            minHeight: '3rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = link.hoverColor;
            e.target.style.transform = 'scale(1.1)';
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.textContent = `Share on ${link.name}`;
            tooltip.style.cssText = `
              position: absolute;
              bottom: 120%;
              left: 50%;
              transform: translateX(-50%);
              background: #333;
              color: white;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 14px;
              white-space: nowrap;
              z-index: 1000;
              pointer-events: none;
            `;
            e.target.appendChild(tooltip);
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.transform = 'scale(1)';
            
            // Remove tooltip
            const tooltip = e.target.querySelector('div');
            if (tooltip) tooltip.remove();
          }}
        >
          {link.icon}
          {showLabels && <span style={{ marginLeft: '0.5rem' }}>{link.name}</span>}
        </a>
      ))}
    </div>
  );
}