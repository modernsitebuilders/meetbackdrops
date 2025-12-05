import { CATEGORIES } from '../lib/categories-config';

// data/categoryData.js
export const categoryInfo = {
  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    description: 'Bright bookshelf backgrounds for professional video calls',
    seoDescription: 'Download free well-lit bookshelf virtual backgrounds for video calls. Bright, professional backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-bright'].count}, (_, i) => ({
      filename: `bookshelves-bright-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Bright Bookshelf Background ${i + 1}`
    }))
  },
  
  'wall-shelves-bright': {
    name: 'Wall Shelves - Bright',
    description: 'Clean, minimalist wall shelf backgrounds with bright lighting',
    seoDescription: 'Download free bright wall shelf virtual backgrounds for video calls. Minimalist floating shelf backgrounds.',
    images: Array.from({length: CATEGORIES['wall-shelves-bright'].count}, (_, i) => ({
      filename: `wall-shelves-bright-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Bright Wall Shelf Background ${i + 1}`
    }))
  },
  
  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    description: 'Warm bookshelf backgrounds with ambient lighting for professional video calls',
    seoDescription: 'Download free ambient bookshelf virtual backgrounds for video calls. Atmospheric, sophisticated backgrounds.',
    images: Array.from({length: CATEGORIES['bookshelves-dark'].count}, (_, i) => ({
      filename: `bookshelves-dark-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Dark Bookshelf Background ${i + 1}`
    }))
  },
  
  'wall-shelves-dark': {
    name: 'Wall Shelves - Dark',
    description: 'Sleek wall shelf backgrounds with warm ambient lighting',
    seoDescription: 'Download free dark wall shelf virtual backgrounds for video calls. Warm ambient floating shelf backgrounds.',
    images: Array.from({length: CATEGORIES['wall-shelves-dark'].count}, (_, i) => ({
      filename: `wall-shelves-dark-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Dark Wall Shelf Background ${i + 1}`
    }))
  },
  
  'office-spaces': {
    name: 'Office Spaces',
    description: 'Professional office backgrounds for business calls',
    seoDescription: 'Download free professional office virtual backgrounds for video calls. Executive office backgrounds.',
    images: Array.from({length: CATEGORIES['office-spaces'].count}, (_, i) => ({
      filename: `office-spaces-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Office Space Background ${i + 1}`
    }))
  },
  
  'living-rooms': {
    name: 'Living Rooms',
    description: 'Comfortable home backgrounds for casual video calls',
    seoDescription: 'Download free living room virtual backgrounds for video calls. Comfortable home settings for casual meetings.',
    images: Array.from({length: CATEGORIES['living-rooms'].count}, (_, i) => ({
      filename: `living-room-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Living Room Background ${i + 1}`
    }))
  },
  
  'kitchens': {
    name: 'Kitchens',
    description: 'Kitchen backgrounds for cooking shows and casual calls',
    seoDescription: 'Download free kitchen virtual backgrounds for video calls. Professional kitchen environments for cooking content.',
    images: Array.from({length: CATEGORIES['kitchens'].count}, (_, i) => ({
      filename: `kitchen-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Kitchen Background ${i + 1}`
    }))
  },
  
  'coffee-shops': {
    name: 'Coffee Shops',
    description: 'Cozy coffee shop backgrounds for casual meetings',
    seoDescription: 'Download free coffee shop virtual backgrounds for video calls. Perfect for casual meetings and creative collaboration.',
    images: Array.from({length: CATEGORIES['coffee-shops'].count}, (_, i) => ({
      filename: `coffee-shop-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Coffee Shop Background ${i + 1}`
    }))
  },
  
  'art-galleries': {
    name: 'Art Galleries',
    description: 'Sophisticated art gallery spaces with clean walls and/or artwork',
    seoDescription: 'Download free art gallery virtual backgrounds for video calls. Clean, artistic spaces for professional presentations.',
    images: Array.from({length: CATEGORIES['art-galleries'].count}, (_, i) => ({
      filename: `art-gallery-${i + 1}.webp`,
      title: `Art Gallery Background ${i + 1}`
    }))
  },
  
  'urban-lofts': {
    name: 'Urban Lofts',
    description: 'Modern industrial loft spaces with contemporary design',
    seoDescription: 'Download free urban loft virtual backgrounds for video calls. Industrial spaces for creative professionals.',
    images: Array.from({length: CATEGORIES['urban-lofts'].count}, (_, i) => ({
      filename: `urban-loft-${i + 1}.webp`,
      title: `Urban Loft Background ${i + 1}`
    }))
  },
  
  'gardens-patios': {
    name: 'Gardens & Patios',
    description: 'Beautiful outdoor garden and patio backgrounds',
    seoDescription: 'Download free garden and patio virtual backgrounds for video calls. Natural outdoor beauty for your meetings.',
    images: Array.from({length: CATEGORIES['gardens-patios'].count}, (_, i) => ({
      filename: `garden-patio-${i + 1}.webp`,
      title: `Garden Patio Background ${i + 1}`
    }))
  },
  
  'historic-spaces': {
    name: 'Historic Spaces',
    description: 'Elegant historic interiors and architectural spaces',
    seoDescription: 'Download free historic space virtual backgrounds for video calls. Ballrooms and Art Deco spaces for distinguished calls.',
    images: Array.from({length: CATEGORIES['historic-spaces'].count}, (_, i) => ({
      filename: `historic-space-${i + 1}.webp`,
      title: `Historic Space Background ${i + 1}`
    }))
  },
  
  'nature-landscapes': {
    name: 'Nature & Landscapes',
    description: 'Stunning natural landscapes and scenic outdoor views',
    seoDescription: 'Download free nature and landscape virtual backgrounds for video calls. Mountains, deserts, and scenic environments.',
    images: Array.from({length: CATEGORIES['nature-landscapes'].count}, (_, i) => ({
      filename: `nature-landscape-${i + 1}.webp`,
      title: `Nature Landscape Background ${i + 1}`
    }))
  },
  
  'libraries': {
    name: 'Libraries',
    description: 'Classic library rooms with floor-to-ceiling books',
    seoDescription: 'Download free library virtual backgrounds for video calls. Perfect for academic presentations and professional settings.',
    images: Array.from({length: CATEGORIES['libraries'].count}, (_, i) => ({
      filename: `library-${i + 1}.webp`,
      title: `Library Background ${i + 1}`
    }))
  },

 'christmas-backgrounds': {
    name: 'Christmas Backgrounds',
    description: 'Festive Christmas backgrounds with holiday decorations for seasonal video calls',
    seoDescription: '150+ free Christmas virtual backgrounds for Zoom, Teams & Google Meet. Festive 2025 holiday backgrounds - no signup, no watermarks.',    images: Array.from({length: 152}, (_, i) => ({
      filename: `christmas-background-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Christmas Background ${i + 1}`
    }))
  },

  'halloween-backgrounds': {
    name: 'Halloween Backgrounds',
    description: 'Festive Halloween backgrounds with pumpkins, fall decor, and seasonal atmosphere',
    seoDescription: 'Download free Halloween virtual backgrounds for video calls. Spooky seasonal backgrounds with pumpkins and autumn decor.',
    images: Array.from({length: CATEGORIES['halloween-backgrounds'].count}, (_, i) => ({
      filename: `halloween-background-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Halloween Background ${i + 1}`
    }))
  },

  
  'bokeh-backgrounds': {
    name: 'Bokeh Backgrounds',
    description: 'Beautiful bokeh light backgrounds with soft, artistic blur effects for elegant video calls',
    seoDescription: 'Download free bokeh virtual backgrounds for video calls. Soft-focus light effects and artistic blur backgrounds.',
    images: Array.from({length: CATEGORIES['bokeh-backgrounds'].count}, (_, i) => ({
      filename: `bokeh-${i + 1}.webp`,
      title: `Bokeh Background ${i + 1}`
    }))
  }
};

export const folderMap = {
  'bookshelves-bright': 'bookshelves-bright',
  'bookshelves-dark': 'bookshelves-dark',
  'wall-shelves-bright': 'wall-shelves-bright',
  'wall-shelves-dark': 'wall-shelves-dark',
  'office-spaces': 'office-spaces',
  'living-rooms': 'living-rooms',
  'kitchens': 'kitchens',
  'coffee-shops': 'coffee-shops',
  'art-galleries': 'art-galleries',
  'urban-lofts': 'urban-lofts',
  'gardens-patios': 'gardens-patios',
  'historic-spaces': 'historic-spaces',
  'nature-landscapes': 'nature-landscapes',
  'libraries': 'libraries',
  'christmas-backgrounds': 'christmas-backgrounds',
  'halloween-backgrounds': 'halloween-backgrounds',
  'eid-backgrounds': 'eid-backgrounds',
  'bokeh-backgrounds': 'bokeh-backgrounds'
};