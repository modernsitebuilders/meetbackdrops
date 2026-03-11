import { CATEGORIES } from '../lib/categories-config';

// data/categoryData.js
export const categoryInfo = {
  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    description: 'Bright bookshelf backgrounds for professional video calls',
    seoDescription: 'Download 50+ free bright bookshelf virtual backgrounds for Zoom, Teams & Google Meet. Well-lit, professional settings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['bookshelves-bright'].count}, (_, i) => ({
      filename: `bookshelves-bright-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Bright Bookshelf Background ${i + 1}`
    }))
  },
  
  'wall-shelves-bright': {
    name: 'Wall Shelves - Bright',
    description: 'Clean, minimalist wall shelf backgrounds with bright lighting',
    seoDescription: 'Download free minimalist wall shelf virtual backgrounds for Zoom, Teams & Google Meet. Clean, modern floating shelf settings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['wall-shelves-bright'].count}, (_, i) => ({
      filename: `wall-shelves-bright-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Bright Wall Shelf Background ${i + 1}`
    }))
  },
  
  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    description: 'Warm bookshelf backgrounds with ambient lighting for professional video calls',
    seoDescription: 'Download 50+ free dark bookshelf virtual backgrounds for Zoom, Teams & Google Meet. Atmospheric, ambient settings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['bookshelves-dark'].count}, (_, i) => ({
      filename: `bookshelves-dark-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Dark Bookshelf Background ${i + 1}`
    }))
  },
  
  'wall-shelves-dark': {
    name: 'Wall Shelves - Dark',
    description: 'Sleek wall shelf backgrounds with warm ambient lighting',
    seoDescription: 'Download free dark wall shelf virtual backgrounds for Zoom, Teams & Google Meet. Warm, ambient floating shelf settings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['wall-shelves-dark'].count}, (_, i) => ({
      filename: `wall-shelves-dark-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Dark Wall Shelf Background ${i + 1}`
    }))
  },
  
  'office-spaces': {
    name: 'Office Spaces',
    description: 'Professional office backgrounds for business calls',
    seoDescription: 'Download 60+ free professional office virtual backgrounds for Zoom, Teams & Google Meet. Executive settings for business calls — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['office-spaces'].count}, (_, i) => ({
      filename: `office-spaces-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Office Space Background ${i + 1}`
    }))
  },
  
  'home-office': {
    name: 'Home Offices',
    description: 'Warm, personal home office backgrounds for work-from-home video calls',
    seoDescription: 'Download free home office virtual backgrounds for Zoom, Teams & Google Meet. Cozy, professional work-from-home settings for remote workers — no signup required, instant download.',
    images: Array.from({length: CATEGORIES['home-office'].count}, (_, i) => ({
      filename: `home-offices-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Home Office Background ${i + 1}`
    }))
  },
  
  'living-rooms': {
    name: 'Living Rooms',
    description: 'Comfortable home backgrounds for casual video calls',
    seoDescription: 'Download free living room virtual backgrounds for Zoom, Teams & Google Meet. Comfortable, homey settings for casual video meetings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['living-rooms'].count}, (_, i) => ({
      filename: `living-room-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Living Room Background ${i + 1}`
    }))
  },
  
  'kitchens': {
    name: 'Kitchens',
    description: 'Kitchen backgrounds for cooking shows and casual calls',
    seoDescription: 'Download free kitchen virtual backgrounds for Zoom, Teams & Google Meet. Professional kitchens and home cooking settings — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['kitchens'].count}, (_, i) => ({
      filename: `kitchen-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Kitchen Background ${i + 1}`
    }))
  },
  
  'coffee-shops': {
    name: 'Coffee Shops',
    description: 'Cozy coffee shop backgrounds for casual meetings',
    seoDescription: 'Download free coffee shop virtual backgrounds for Zoom, Teams & Google Meet. Cozy café settings for creative calls — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['coffee-shops'].count}, (_, i) => ({
      filename: `coffee-shop-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Coffee Shop Background ${i + 1}`
    }))
  },
  
  'art-galleries': {
    name: 'Art Galleries',
    description: 'Sophisticated art gallery spaces with clean walls and/or artwork',
    seoDescription: 'Download free art gallery virtual backgrounds for Zoom, Teams & Google Meet. Clean, sophisticated gallery spaces for professional presentations — no signup required, instant download.',
    images: Array.from({length: CATEGORIES['art-galleries'].count}, (_, i) => ({
      filename: `art-gallery-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Art Gallery Background ${i + 1}`
    }))
  },
  
  'urban-lofts': {
    name: 'Urban Lofts',
    description: 'Modern industrial loft spaces with contemporary design',
    seoDescription: 'Download free urban loft virtual backgrounds for Zoom, Teams & Google Meet. Industrial, modern spaces for creative professionals — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['urban-lofts'].count}, (_, i) => ({
      filename: `urban-loft-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Urban Loft Background ${i + 1}`
    }))
  },
  
  'gardens-patios': {
    name: 'Gardens & Patios',
    description: 'Beautiful outdoor garden and patio backgrounds',
    seoDescription: 'Download free garden and patio virtual backgrounds for Zoom, Teams & Google Meet. Beautiful outdoor settings for video calls — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['gardens-patios'].count}, (_, i) => ({
      filename: `garden-patio-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Garden Patio Background ${i + 1}`
    }))
  },
  
  'historic-spaces': {
    name: 'Historic Spaces',
    description: 'Elegant historic interiors and architectural spaces',
    seoDescription: 'Download free historic virtual backgrounds for Zoom, Teams & Google Meet. Elegant ballrooms and Art Deco interiors — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['historic-spaces'].count}, (_, i) => ({
      filename: `historic-space-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Historic Space Background ${i + 1}`
    }))
  },
  
  'nature-landscapes': {
    name: 'Nature & Landscapes',
    description: 'Stunning natural landscapes and scenic outdoor views',
    seoDescription: 'Download free nature and landscape virtual backgrounds for Zoom, Teams & Google Meet. Mountains, forests & scenic views — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['nature-landscapes'].count}, (_, i) => ({
      filename: `nature-landscape-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Nature Landscape Background ${i + 1}`
    }))
  },
  
  'libraries': {
    name: 'Libraries',
    description: 'Classic library rooms with floor-to-ceiling books',
    seoDescription: 'Download free library virtual backgrounds for Zoom, Teams & Google Meet. Classic floor-to-ceiling bookshelves — perfect for academic and professional calls. No signup required.',
    images: Array.from({length: CATEGORIES['libraries'].count}, (_, i) => ({
      filename: `library-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Library Background ${i + 1}`
    }))
  },

  'conference-rooms': {
    name: 'Conference Rooms',
    description: 'Professional conference room backgrounds for team meetings and presentations',
    seoDescription: 'Download free conference room virtual backgrounds for Zoom, Teams & Google Meet. Modern meeting spaces for professional business calls — no signup required, instant download.',
    images: Array.from({length: CATEGORIES['conference-rooms'].count}, (_, i) => ({
      filename: `conference-room-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Conference Room Background ${i + 1}`
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
    seoDescription: 'Download free Halloween virtual backgrounds for Zoom, Teams & Google Meet. Spooky pumpkins, autumn decor & seasonal scenes — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['halloween-backgrounds'].count}, (_, i) => ({
      filename: `halloween-background-${String(i + 1).padStart(2, '0')}.webp`,
      title: `Halloween Background ${i + 1}`
    }))
  },


  'valentines-backgrounds': {
  name: 'Valentine\'s Day Backgrounds',
  description: 'Romantic Valentine\'s Day backgrounds with hearts and festive decor',
  seoDescription: 'Download free Valentine\'s Day virtual backgrounds for Zoom, Teams & Google Meet. Romantic hearts, flowers & festive scenes — no signup required, no watermarks, instant download.',
  images: Array.from({length: CATEGORIES['valentines-backgrounds'].count}, (_, i) => ({
    filename: `valentines-background-${String(i + 1).padStart(2, '0')}.webp`,
    title: `Valentine's Day Background ${i + 1}`
  }))
},

  
  'bokeh-backgrounds': {
    name: 'Bokeh Backgrounds',
    description: 'Beautiful bokeh light backgrounds with soft, artistic blur effects for elegant video calls',
    seoDescription: 'Download free bokeh virtual backgrounds for Zoom, Teams & Google Meet. Soft-focus light effects and artistic blur backgrounds — no signup required, no watermarks, instant download.',
    images: Array.from({length: CATEGORIES['bokeh-backgrounds'].count}, (_, i) => ({
      filename: `bokeh-${String(i + 1).padStart(2, '0')}.webp`,
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
  'home-office': 'home-office',

  'living-rooms': 'living-rooms',
  'kitchens': 'kitchens',
  'coffee-shops': 'coffee-shops',
  'art-galleries': 'art-galleries',
  'urban-lofts': 'urban-lofts',
  'gardens-patios': 'gardens-patios',
  'historic-spaces': 'historic-spaces',
  'nature-landscapes': 'nature-landscapes',
  'libraries': 'libraries',
  'conference-rooms': 'conference-rooms',
  'christmas-backgrounds': 'christmas-backgrounds',
  'halloween-backgrounds': 'halloween-backgrounds',
  'valentines-backgrounds': 'valentines-backgrounds',
  'bokeh-backgrounds': 'bokeh-backgrounds'
};