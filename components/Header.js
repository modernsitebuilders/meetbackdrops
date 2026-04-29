import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWishlist } from '../lib/WishlistContext';

// Mobile menu only renders when the user opens it on a small viewport.
const MobileMenu = dynamic(() => import('./MobileMenu'), { ssr: false });

function trackAnalytics(eventType, filename, category) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, filename, category }),
  }).catch(() => {});
}

export default function Header({ currentPage }) {
  const router = useRouter();
  const wishlistContext = useWishlist() || {};

const wishlist = wishlistContext.wishlist || [];
const openDrawer = wishlistContext.openDrawer || (() => {});
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
    color: isActive ? '#9a6a3a' : '#374151',
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
  const officesItems = [
    { name: 'Office Spaces', path: '/category/office-spaces' },
    { name: 'Home Offices', path: '/category/home-office' }
  ];

  const collectionsItems = [
    { name: 'Most Popular', path: '/category/most-popular' },
    { name: 'Browse by Keywords', path: '/browse' },
    { name: 'Recently Added', path: '/category/recently-added' }
  ];

  const seasonalItems = [
    { name: 'Christmas 🎄', path: '/category/christmas-backgrounds' },
    { name: 'Halloween 🎃', path: '/category/halloween-backgrounds' },
    { name: 'Valentine\'s Day 💕', path: '/category/valentines-backgrounds' },
    { name: 'Easter 🐣', path: '/category/easter-backgrounds' },
    { name: 'Spring 🌸', path: '/category/spring-backgrounds' },
    { name: 'Summer ☀️', path: '/category/summer-backgrounds' }
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
{ name: 'Conference Rooms', path: '/category/conference-rooms' },
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
            aria-label="StreamBackdrops home"
            style={{
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#111827',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
              letterSpacing: '-0.02em',
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: '0.4rem'
            }}
          >
            StreamBackdrops
            <span style={{
              fontFamily: 'inherit',
              fontSize: '0.65rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9a6a3a',
              fontWeight: 600,
              borderLeft: '1px solid #e6e2dc',
              paddingLeft: '0.6rem'
            }}>
              Studio
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
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
            
            {/* Bookshelves */}
            <button
              onClick={() => navigate('/category/bookshelves')}
              style={navButtonStyle(currentPage === 'bookshelves', hoveredNav === 'bookshelves')}
              onMouseEnter={() => setHoveredNav('bookshelves')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Bookshelves
            </button>

            {/* Wall Shelves */}
            <button
              onClick={() => navigate('/category/wall-shelves')}
              style={navButtonStyle(currentPage === 'wall-shelves', hoveredNav === 'wall-shelves')}
              onMouseEnter={() => setHoveredNav('wall-shelves')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              Wall Shelves
            </button>

            {/* Offices Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'offices' ? null : 'offices');
                  setOpenNestedDropdown(null);
                }}
                aria-expanded={openDropdown === 'offices'}
                aria-haspopup="true"
                style={{
                  ...navButtonStyle(
                    currentPage === 'office-spaces' || currentPage === 'home-office',
                    hoveredNav === 'offices'
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={() => setHoveredNav('offices')}
                onMouseLeave={() => setHoveredNav(null)}
              >
                Offices
                <span aria-hidden="true" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
              </button>
              {openDropdown === 'offices' && renderDropdown(officesItems, 'offices')}
            </div>

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
                aria-expanded={openDropdown === 'more'}
                aria-haspopup="true"
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
                <span aria-hidden="true" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
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
                aria-expanded={openDropdown === 'collections'}
                aria-haspopup="true"
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
                <span aria-hidden="true" style={{ fontSize: '0.7rem', marginLeft: '0.25rem' }}>▼</span>
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

           {/* Wishlist */}
           <button
             onClick={() => { trackAnalytics('wishlist_drawer_opened', null, 'header'); openDrawer(); }}
             aria-label={`Saved HD images${wishlist.length > 0 ? ` (${wishlist.length})` : ''}`}
             style={{
               position: 'relative',
               background: 'none', border: 'none',
               cursor: 'pointer', padding: '0.5rem 0.6rem',
               borderRadius: '0.5rem',
               color: wishlist.length > 0 ? '#9a6a3a' : '#6b7280',
               fontSize: '1.25rem', lineHeight: 1,
               transition: 'color 0.15s',
             }}
           >
             {wishlist.length > 0 ? '💙' : '🤍'}
             {wishlist.length > 0 && (
               <span style={{
                 position: 'absolute', top: '2px', right: '2px',
                 background: '#9a6a3a', color: 'white',
                 borderRadius: '99px', fontSize: '0.6rem',
                 fontWeight: 700, minWidth: '16px', height: '16px',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 padding: '0 3px',
               }}>{wishlist.length}</span>
             )}
           </button>

           {/* HD Backgrounds */}
<button
  onClick={() => { trackAnalytics('nav_hd_click', null, 'header'); navigate('/hd'); }}
  style={{
    ...navButtonStyle(currentPage === 'hd', hoveredNav === 'hd'),
    color: '#111827',
    fontWeight: '600',
    letterSpacing: '0.04em'
  }}
  onMouseEnter={() => setHoveredNav('hd')}
  onMouseLeave={() => setHoveredNav(null)}
>
  HD Editions
</button>

{/* Team Licensing — B2B CTA */}
<button
  onClick={() => { trackAnalytics('nav_licensing_click', null, 'header'); navigate('/licensing'); }}
  style={{
    padding: '0.6rem 1.1rem',
    borderRadius: '2px',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    background: hoveredNav === 'licensing' ? '#000' : '#111827',
    color: '#fff',
    border: '1px solid #111827',
    transition: 'background 0.2s ease',
    marginLeft: '0.5rem'
  }}
  onMouseEnter={() => setHoveredNav('licensing')}
  onMouseLeave={() => setHoveredNav(null)}
>
  Team Licensing
</button>
          </nav>
        </div>
      </header>

      {isMobileMenuOpen && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navigate={navigate}
          currentPage={currentPage}
          officesItems={officesItems}
          collectionsItems={collectionsItems}
          moreCategories={moreCategories}
        />
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