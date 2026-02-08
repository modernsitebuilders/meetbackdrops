// pages/api/categories.js - Updated without casual-backgrounds category
export default function handler(req, res) {
  // Prevent caching to ensure fresh data
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const categories = {
  'bookshelves-bright': {
    name: 'Bookshelves - Bright',
    count: 48,
    description: 'Bright, naturally-lit bookshelf backgrounds with excellent clarity for professional video calls'
  },
  'bookshelves-dark': {
    name: 'Bookshelves - Dark',
    count: 49,
    description: 'Warm, softly-lit bookshelf backgrounds that create a welcoming atmosphere for client meetings'
  },
  'office-spaces': {
    name: 'Office Spaces',
    count: 44,
    description: 'Professional corporate office environments perfect for business video conferencing'
  },
  'living-rooms': {
    name: 'Living Rooms',
    count: 37,
    description: 'Comfortable living room backgrounds for casual meetings and personal video calls'
  },
  'kitchens': {
    name: 'Kitchens',
    count: 18,
    description: 'Warm kitchen spaces that create a friendly, approachable atmosphere for casual video calls'
  },
  'conference-rooms': {
    name: 'Conference Rooms',
    description: 'Professional conference room backgrounds for team meetings',
    count: 48
  },
  'coffee-shops': {
    name: 'Coffee Shops',
    count: 3,
    description: 'Cozy coffee shop backgrounds perfect for casual meetings and creative collaborations'
  },
  'art-galleries': {
    name: 'Art Galleries',
    count: 17,
    description: 'Sophisticated art gallery spaces with clean walls and artistic flair for professional presentations'
  },
  'urban-lofts': {
    name: 'Urban Lofts',
    count: 17,
    description: 'Modern industrial loft spaces with exposed brick and contemporary design for creative video calls'
  },
  'gardens-patios': {
    name: 'Gardens & Patios',
    count: 13,
    description: 'Beautiful outdoor garden and patio backgrounds that bring natural beauty to your video calls'
  },
  'historic-spaces': {
    name: 'Historic Spaces',
    count: 8,
    description: 'Elegant historic interiors including ballrooms, Art Deco corridors, and architectural spaces'
  },
  'nature-landscapes': {
    name: 'Nature & Landscapes',
    count: 49,
    description: 'Stunning natural landscapes including mountains, deserts, and scenic outdoor environments'
  },
  'libraries': {
    name: 'Libraries',
    count: 18,
    description: 'Classic library rooms with floor-to-ceiling books, perfect for academic and professional settings'
  }
};
  
  console.log('📊 Serving categories:', Object.keys(categories));
  res.status(200).json(categories);
}
