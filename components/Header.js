import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ currentPage }) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openNestedDropdown, setOpenNestedDropdown] = useState(null);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setOpenNestedDropdown(null);
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
      setOpenNestedDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navigate = (path) => {
    if (process.env.NODE_ENV === 'development') {
      window.location.href = path;
    } else {
      router.push(path);
    }
  };

  const navButtonStyle = (isActive = false, isHovered = false) => ({
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    color: isActive ? '#2563eb' : '#374151',
    fontWeight: '500',
    fontSize: '0.95rem',
    background: isHovered ? '#f3f4f6' : 'transparent',
    border: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transform: isHovered ? 'translateY(-1px)' : 'none'
  });

  const dropdownItemStyle = (isHovered = false) => ({
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    background: isHovered ? '#f3f4f6' : 'transparent',
    border: 'none',
    color: '#374151',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '0.375rem',
    fontFamily: 'inherit',
    transition: 'background 0.2s ease'
  });

  // Navigation data structures
  const bookshelvesItems = [
    { name: 'Bright', path: '/category/bookshelves-bright' },
    { name: 'Dark', path: '/category/bookshelves-dark' }
  ];

  const wallShelvesItems = [
    { name: 'Bright', path: '/category/wall-shelves-bright' },
    { name: 'Dark', path: '/category/wall-shelves-dark' }
  ];

  const collectionsItems = [
    { name: 'Most Popular', path: '/category/most-popular' },
    { name: 'Browse by Keywords', path: '/browse' },
    { name: 'Recently Added', path: '/category/recently-added' }
  ];

  const seasonalItems = [
    { name: 'Christmas 🎄', path: '/category/christmas-backgrounds' },
    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds' },
    { name: 'Valentine\'s Day 💕', path: '/category/valentines-backgrounds' }
  ];

  const moreCategories = [
    { name: 'Kitchens', path: '/category/kitchens' },
    { name: 'Coffee Shops', path: '/category/coffee-shops' },
    { 
      name: 'Seasonal', 
      path: null, 
      isNested: true,
      items: seasonalItems
    },
    { name: 'Art Galleries', path: '/category/art-galleries' },
    { name: 'Urban Lofts', path: '/category/urban-lofts' },
    { name: 'Gardens & Patios', path: '/category/gardens-patios' },
    { name: 'Historic Spaces', path: '/category/historic-spaces' },
    { name: 'Nature & Landscapes', path: '/category/nature-landscapes' },
    { name: 'Libraries', path: '/category/libraries' },
    { name: 'Bokeh Backgrounds', path: '/category/bokeh-backgrounds' }
  ];

  const renderDropdown = (items, dropdownKey) => (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '0.5rem',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '0.5rem',
      minWidth: '200px',
      zIndex: 1000
    }}>
      {items.map((item, index) => (
        <div key={index} style={{ position: 'relative' }}>
          {item.isNested ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenNestedDropdown(openNestedDropdown === item.name ? null : item.name);
                }}
                style={{
                  ...dropdownItemStyle(false),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {item.name}
                {item.name}
                <span style={{ marginLeft: '0.5rem' }}>‹</span>
              </button>
              
              {openNestedDropdown === item.name && (
                <div style={{
                  position: 'absolute',
                  right: '100%',  // ← CHANGED FROM left to right
                  top: 0,
                  marginRight: '0.25rem',  // ← CHANGED FROM marginLeft
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  padding: '0.5rem',
                  minWidth: '180px',
                  zIndex: 1001
                }}>
                  {item.items.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => navigate(subItem.path)}
                      style={dropdownItemStyle(false)}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate(item.path)}
              style={dropdownItemStyle(false)}
              onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {item.name}
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '70px'
        }}>
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#2563eb',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit'
            }}
          >
            StreamBackdrops
          </button>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#374151',
              padding: '0.5rem'
            }}
          >
            ☰
          </button>

          {/* Desktop Navigation */}
          <nav style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}
          className="desktop-nav">
            
            {/* Bookshelves Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'bookshelves' ? null : 'bookshelves');
                  setOpenNestedDropdown(null);
                }}
                style={{
                  ...navButtonStyle(
                    currentPage === 'bookshelves-bright' || currentPage === 'bookshelves-dark',
                    hoveredNav === 'bookshelves'
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={() => setHoveredNav('bookshelves')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                Bookshelves
                <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
              </button>
              {openDropdown === 'bookshelves' && renderDropdown(bookshelvesItems, 'bookshelves')}
            </div>

{/* Wall Shelves Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'wall-shelves' ? null : 'wall-shelves');
                  setOpenNestedDropdown(null);
                }}
                style={{
                  ...navButtonStyle(
                    currentPage === 'wall-shelves-bright' || currentPage === 'wall-shelves-dark',
                    hoveredNav === 'wall-shelves'
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={() => setHoveredNav('wall-shelves')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                Wall Shelves
                <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
              </button>
              {openDropdown === 'wall-shelves' && renderDropdown(wallShelvesItems, 'wall-shelves')}
            </div>

            {/* Office Spaces */}
            <button 
              onClick={() => navigate('/category/office-spaces')}
              style={navButtonStyle(currentPage === 'office-spaces', hoveredNav === 'office-spaces')}
              onMouseEnter={() => setHoveredNav('office-spaces')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Office Spaces
            </button>

            {/* Living Rooms */}
            <button 
              onClick={() => navigate('/category/living-rooms')}
              style={navButtonStyle(currentPage === 'living-rooms', hoveredNav === 'living-rooms')}
              onMouseEnter={() => setHoveredNav('living-rooms')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Living Rooms
            </button>

            {/* More Categories Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'more' ? null : 'more');
                  setOpenNestedDropdown(null);
                }}
                style={{
                  ...navButtonStyle(false, hoveredNav === 'more'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={() => setHoveredNav('more')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                More Categories
                <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
              </button>
              {openDropdown === 'more' && renderDropdown(moreCategories, 'more')}
            </div>

            {/* Collections Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'collections' ? null : 'collections');
                  setOpenNestedDropdown(null);
                }}
                style={{
                  ...navButtonStyle(false, hoveredNav === 'collections'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={() => setHoveredNav('collections')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                Collections
                <span style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
              </button>
              {openDropdown === 'collections' && renderDropdown(collectionsItems, 'collections')}
            </div>

            {/* Blog */}
            <button 
              onClick={() => navigate('/blog')}
              style={navButtonStyle(currentPage === 'blog', hoveredNav === 'blog')}
              onMouseEnter={() => setHoveredNav('blog')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Blog
            </button>

           {/* HD Backgrounds */}
<button 
  onClick={() => navigate('/hd')}
  style={{
    ...navButtonStyle(currentPage === 'hd', hoveredNav === 'hd'),
    background: hoveredNav === 'hd' ? '#fef3c7' : (currentPage === 'hd' ? '#fef3c7' : 'transparent'),
    color: '#92400e',
    fontWeight: '600'
  }}
  onMouseEnter={() => setHoveredNav('hd')}
  onMouseLeave={() => setHoveredNav(null)}
>
  ⭐ HD Backgrounds
</button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 99998
            }}
          />
          
          {/* Slide-in Menu */}
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '80%',
            maxWidth: '300px',
            background: 'white',
            zIndex: 99999,
            overflowY: 'auto',
            boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {/* Close Button */}
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
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

            {/* Menu Items */}
            <div style={{ padding: '0.5rem' }}>
              {/* Bookshelves Section */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ padding: '0.5rem 1rem', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>BOOKSHELVES</div>
                {bookshelvesItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Wall Shelves Section */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ padding: '0.5rem 1rem', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>WALL SHELVES</div>
                {wallShelvesItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Featured Categories */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => {
                    navigate('/category/office-spaces');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Office Spaces
                </button>
                <button
                  onClick={() => {
                    navigate('/category/living-rooms');
                    setIsMobileMenuOpen(false);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Living Rooms
                </button>
              </div>

              {/* Collections */}
              <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ padding: '0.5rem 1rem', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>COLLECTIONS</div>
                {collectionsItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#374151',
                      fontWeight: '500',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Other Categories */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem 1rem', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>MORE CATEGORIES</div>
                {moreCategories.map((item, index) => (
                  item.isNested ? (
                    <div key={index}>
                      <div style={{ padding: '0.5rem 1rem', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>{item.name.toUpperCase()}</div>
                      {item.items.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => {
                            navigate(subItem.path);
                            setIsMobileMenuOpen(false);
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2rem',
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0.5rem',
                            color: '#374151',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      key={index}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#374151',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      {item.name}
                    </button>
                  )
                ))}
              </div>

              {/* Blog */}
              <button
                onClick={() => {
                  navigate('/blog');
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: currentPage === 'blog' ? '#eff6ff' : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: currentPage === 'blog' ? '#2563eb' : '#374151',
                  fontWeight: currentPage === 'blog' ? '600' : '500',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'blog') {
                    e.target.style.background = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'blog') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                📝 Blog
              </button>

              {/* HD Premium */}
              <button
                onClick={() => {
                  navigate('/hd');
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: currentPage === 'hd' ? '#fef3c7' : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#92400e',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.2s ease',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 'hd') {
                    e.target.style.background = '#fef3c7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 'hd') {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                ⭐ HD Backgrounds
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Styles */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          
          .mobile-menu-btn {
            display: block !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}