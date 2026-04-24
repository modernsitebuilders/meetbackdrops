import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sb_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleWishlist = (item) => {
    setWishlist(prev => {
      const exists = prev.find(i => i.id === item.id);
      const next = exists
        ? prev.filter(i => i.id !== item.id)
        : [...prev, { ...item, addedAt: Date.now() }];
      try { localStorage.setItem('sb_wishlist', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isWishlisted = (id) => wishlist.some(i => i.id === id);

  const clearWishlist = () => {
    setWishlist([]);
    try { localStorage.removeItem('sb_wishlist'); } catch {}
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isWishlisted,
      clearWishlist,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);

  if (!ctx) {
    return {
      wishlist: [],
      toggleWishlist: () => {},
      isWishlisted: () => false,
      clearWishlist: () => {},
      drawerOpen: false,
      openDrawer: () => {},
      closeDrawer: () => {},
    };
  }

  return ctx;
};
