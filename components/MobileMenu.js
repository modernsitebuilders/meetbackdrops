export default function MobileMenu({ isOpen, onClose, navigate, currentPage, officesItems, collectionsItems, moreCategories }) {
  if (!isOpen) return null;

  const menuButtonStyle = (isActive = false, indent = false) => ({
    display: 'block',
    width: '100%',
    padding: indent ? '0.75rem 1rem 0.75rem 2rem' : '0.75rem 1rem',
    textAlign: 'left',
    background: isActive ? '#eff6ff' : 'transparent',
    border: 'none',
    borderRadius: '0.5rem',
    color: isActive ? '#9a6a3a' : '#374151',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.2s ease'
  });

  const sectionLabelStyle = {
    padding: '0.5rem 1rem',
    fontWeight: '600',
    color: '#6b7280',
    fontSize: '0.85rem'
  };

  const sectionStyle = {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb'
  };

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99998
        }}
      />

      {/* Slide-in Panel */}
      <div
        id="mobile-menu"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '80%',
          maxWidth: '300px',
          background: 'white',
          zIndex: 99999,
          overflowY: 'auto',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', color: '#9a6a3a' }}>Menu</span>
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '0.5rem' }}>
          {/* Search */}
          <div style={sectionStyle}>
            <button
              onClick={() => handleNav('/search')}
              style={menuButtonStyle(currentPage === 'search')}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              ⌕ Search backgrounds
            </button>
          </div>

          {/* Bookshelves */}
          <div style={sectionStyle}>
            <button
              onClick={() => handleNav('/category/bookshelves')}
              style={menuButtonStyle(currentPage === 'bookshelves')}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Bookshelves
            </button>
          </div>

          {/* Wall Shelves */}
          <div style={sectionStyle}>
            <button
              onClick={() => handleNav('/category/wall-shelves')}
              style={menuButtonStyle(currentPage === 'wall-shelves')}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Wall Shelves
            </button>
          </div>

          {/* Offices */}
          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>OFFICES</div>
            {officesItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNav(item.path)}
                style={menuButtonStyle()}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Living Rooms */}
          <div style={sectionStyle}>
            <button
              onClick={() => handleNav('/category/living-rooms')}
              style={menuButtonStyle()}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Living Rooms
            </button>
          </div>

          {/* Collections */}
          <div style={sectionStyle}>
            <div style={sectionLabelStyle}>COLLECTIONS</div>
            {collectionsItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNav(item.path)}
                style={menuButtonStyle()}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* More Categories */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={sectionLabelStyle}>MORE CATEGORIES</div>
            {moreCategories.map((item, i) =>
              item.isNested ? (
                <div key={i}>
                  <div style={{ ...sectionLabelStyle, marginTop: '0.5rem' }}>{item.name.toUpperCase()}</div>
                  {item.items.map((subItem, j) => (
                    <button
                      key={j}
                      onClick={() => handleNav(subItem.path)}
                      style={menuButtonStyle(false, true)}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  key={i}
                  onClick={() => handleNav(item.path)}
                  style={menuButtonStyle()}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {item.name}
                </button>
              )
            )}
          </div>

          {/* Blog */}
          <button
            onClick={() => handleNav('/blog')}
            style={{
              ...menuButtonStyle(currentPage === 'blog'),
              padding: '1rem',
              marginTop: '0.5rem'
            }}
            onMouseEnter={(e) => { if (currentPage !== 'blog') e.target.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { if (currentPage !== 'blog') e.target.style.background = 'transparent'; }}
          >
            📝 Blog
          </button>

          {/* HD Editions */}
          <button
            onClick={() => handleNav('/hd')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#111827',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s ease',
              marginTop: '0.5rem',
              letterSpacing: '0.04em'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
          >
            HD Editions
          </button>

          {/* Branded Backgrounds — B2B CTA */}
          <button
            onClick={() => handleNav('/branded-backgrounds')}
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem',
              textAlign: 'center',
              background: '#111827',
              border: '1px solid #111827',
              borderRadius: '2px',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.85rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s ease',
              marginTop: '0.75rem'
            }}
            onMouseEnter={(e) => { e.target.style.background = '#000'; }}
            onMouseLeave={(e) => { e.target.style.background = '#111827'; }}
          >
            Branded Backgrounds
          </button>
        </div>
      </div>
    </>
  );
}
