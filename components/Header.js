import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Header({ currentPage }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close dropdown when route changes
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [router.asPath]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

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

  const dropdownCategories = [
    { name: 'Bookshelves - Dark', path: '/category/bookshelves-dark' },
    { name: 'Kitchens', path: '/category/kitchens' },
    { name: 'Coffee Shops', path: '/category/coffee-shops' },
    { name: 'Art Galleries', path: '/category/art-galleries' },
    { name: 'Urban Lofts', path: '/category/urban-lofts' },
    { name: 'Gardens & Patios', path: '/category/gardens-patios' },
    { name: 'Historic Spaces', path: '/category/historic-spaces' },
    { name: 'Nature & Landscapes', path: '/category/nature-landscapes' },
    { name: 'Libraries', path: '/category/libraries' },
    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds' }
  ];

  const allCategories = [
    { name: 'Bookshelves - Bright', path: '/category/bookshelves-bright', key: 'bookshelves-bright' },
    { name: 'Bookshelves - Dark', path: '/category/bookshelves-dark', key: 'bookshelves-dark' },
    { name: 'Office Spaces', path: '/category/office-spaces', key: 'office-spaces' },
    { name: 'Living Rooms', path: '/category/living-rooms', key: 'living-rooms' },
    { name: 'Kitchens', path: '/category/kitchens', key: 'kitchens' },
    { name: 'Coffee Shops', path: '/category/coffee-shops', key: 'coffee-shops' },
    { name: 'Art Galleries', path: '/category/art-galleries', key: 'art-galleries' },
    { name: 'Urban Lofts', path: '/category/urban-lofts', key: 'urban-lofts' },
    { name: 'Gardens & Patios', path: '/category/gardens-patios', key: 'gardens-patios' },
    { name: 'Historic Spaces', path: '/category/historic-spaces', key: 'historic-spaces' },
    { name: 'Nature & Landscapes', path: '/category/nature-landscapes', key: 'nature-landscapes' },
    { name: 'Libraries', path: '/category/libraries', key: 'libraries' },
    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds', key: 'halloween-backgrounds' }
  ];

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
            {/* Featured Categories */}
            {[
              { name: 'Bookshelves', path: '/category/bookshelves-bright', key: 'bookshelves-bright' },
              { name: 'Office Spaces', path: '/category/office-spaces', key: 'office-spaces' },
              { name: 'Living Rooms', path: '/category/living-rooms', key: 'living-rooms' }
            ].map((item) => (
              <button 
                key={item.key}
                onClick={() => navigate(item.path)}
                style={navButtonStyle(currentPage === item.key, hoveredNav === item.key)}
                onMouseEnter={() => setHoveredNav(item.key)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                {item.name}
              </button>
            ))}
            
            {/* More Categories Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
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
                More Categories <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>
              
              {isDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '0.5rem',
                    minWidth: '200px',
                    zIndex: 10002,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {dropdownCategories.map((category, index) => (
                    <button 
                      key={category.path}
                      onClick={() => navigate(category.path)}
                      style={dropdownItemStyle(hoveredNav === `dropdown-${index}`)}
                      onMouseEnter={() => setHoveredNav(`dropdown-${index}`)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Blog Link */}
            <button 
              onClick={() => navigate('/blog')}
              style={navButtonStyle(currentPage === 'blog', hoveredNav === 'blog')}
              onMouseEnter={() => setHoveredNav('blog')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Blog
            </button>
         </nav>
        </div>
       </header>
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            {/* Dark Overlay */}
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
                {/* Blog Link in Mobile Menu */}
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
                    marginBottom: '0.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    paddingBottom: '1rem'
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
                
                {allCategories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => {
                      navigate(category.path);
                      setIsMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '1rem',
                      textAlign: 'left',
                      background: currentPage === category.key ? '#eff6ff' : 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: currentPage === category.key ? '#2563eb' : '#374151',
                      fontWeight: currentPage === category.key ? '600' : '500',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.2s ease',
                      marginBottom: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== category.key) {
                        e.target.style.background = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== category.key) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    {category.name}
                  </button>
                ))}
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