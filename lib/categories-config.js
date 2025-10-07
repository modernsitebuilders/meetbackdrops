// categories-config.js - Auto-generated category configuration
// Updated for curated collection with improved descriptions

export const CATEGORIES = {
  // EXISTING CATEGORIES (RENAMED)
  "bookshelves-bright": {
    "name": "Bookshelves - Bright",
    "description": "Bright, naturally-lit bookshelf backgrounds with excellent clarity for professional video calls and presentations",
    "count": 48
  },
  "bookshelves-dark": {
    "name": "Bookshelves - Dark",
    "description": "Warm, softly-lit bookshelf backgrounds that create a welcoming atmosphere for client meetings and team calls",
    "count": 49
  },
  "office-spaces": {
  "name": "Office Spaces",
  "description": "Professional corporate office environments perfect for business video conferencing and formal meetings",
  "count": 15
 },
  "living-rooms": {
    "name": "Living Rooms",
    "description": "Comfortable living room backgrounds for casual meetings and personal video calls",
    "count": 37
  },
  "kitchens": {
    "name": "Kitchens",
    "description": "Warm kitchen spaces that create a friendly, approachable atmosphere for casual video calls",
    "count": 18
  },

  // NEW CATEGORIES
  "coffee-shops": {
    "name": "Coffee Shops",
    "description": "Cozy coffee shop backgrounds perfect for casual meetings and creative collaborations",
    "count": 3
  },
  "art-galleries": {
    "name": "Art Galleries",
    "description": "Sophisticated art gallery spaces with clean walls and artistic flair for professional presentations",
    "count": 17
  },
  "urban-lofts": {
    "name": "Urban Lofts",
    "description": "Modern industrial loft spaces with exposed brick and contemporary design for creative video calls",
    "count": 17
  },
  "gardens-patios": {
    "name": "Gardens & Patios",
    "description": "Beautiful outdoor garden and patio backgrounds that bring natural beauty to your video calls",
    "count": 13
  },
  "historic-spaces": {
    "name": "Historic Spaces",
    "description": "Elegant historic interiors including ballrooms, Art Deco corridors, and architectural spaces",
    "count": 8
  },
  "nature-landscapes": {
    "name": "Nature & Landscapes",
    "description": "Stunning natural landscapes including mountains, deserts, and scenic outdoor environments",
    "count": 49
  },
  "libraries": {
    "name": "Libraries",
    "description": "Classic library rooms with floor-to-ceiling books, perfect for academic and professional settings",
    "count": 18
  }
};

export const CATEGORY_ORDER = [
  "bookshelves-bright",
  "bookshelves-dark",
  "office-spaces",
  "living-rooms",
  "kitchens",
  "coffee-shops",
  "art-galleries",
  "urban-lofts",
  "gardens-patios",
  "historic-spaces",
  "nature-landscapes",
  "libraries"
];

export const DEFAULT_CATEGORY = 'bookshelves-bright';

export const TOTAL_IMAGES = 292;

// Helper function to get category display name
export function getCategoryName(slug) {
  return CATEGORIES[slug]?.name || slug;
}

// Helper function to get all categories as array
export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([slug, info]) => ({
    slug,
    ...info
  }));
}

// SEO-optimized category descriptions for meta tags
export const SEO_DESCRIPTIONS = {
  "bookshelves-bright": "Download free well-lit bookshelf virtual backgrounds in HD quality. Perfect for professional video calls with excellent lighting and clarity.",
  "bookshelves-dark": "Free ambient bookshelf virtual backgrounds for video calls. Create a warm, welcoming atmosphere for client meetings and team calls.",
  "office-spaces": "Professional corporate office virtual backgrounds for business video conferencing. HD quality office environments for formal meetings.",
  "living-rooms": "Comfortable living room virtual backgrounds for casual video calls and personal meetings. Cozy home settings for relaxed conversations.",
  "kitchens": "Free kitchen virtual backgrounds for video calls. Warm, friendly kitchen spaces perfect for casual meetings and cooking demonstrations.",
  "coffee-shops": "Cozy coffee shop virtual backgrounds for video calls. Perfect for casual meetings and creative collaboration sessions.",
  "art-galleries": "Sophisticated art gallery virtual backgrounds for professional presentations. Clean, artistic spaces for polished video calls.",
  "urban-lofts": "Modern urban loft virtual backgrounds with industrial design. Contemporary spaces for creative professionals and remote workers.",
  "gardens-patios": "Beautiful garden and patio virtual backgrounds for video calls. Bring natural outdoor beauty to your meetings.",
  "historic-spaces": "Elegant historic interior virtual backgrounds. Ballrooms, Art Deco corridors, and architectural spaces for distinguished video calls.",
  "nature-landscapes": "Stunning nature and landscape virtual backgrounds. Mountains, deserts, and scenic outdoor environments for inspiring video calls.",
  "libraries": "Classic library virtual backgrounds with floor-to-ceiling books. Perfect for academic presentations and professional settings."
};

// Keywords for each category (for SEO)
export const CATEGORY_KEYWORDS = {
  "bookshelves-bright": ["bright bookshelf backgrounds", "well lit bookshelves", "natural lighting", "clear video calls", "professional lighting"],
  "bookshelves-dark": ["dark bookshelf backgrounds", "ambient lighting", "warm backgrounds", "cozy office", "soft lighting"],
  "office-spaces": ["office backgrounds", "corporate spaces", "business environments", "professional workspaces", "meeting rooms", "formal offices"],
  "living-rooms": ["living room backgrounds", "home backgrounds", "casual video calls", "comfortable settings", "personal meetings"],
  "kitchens": ["kitchen backgrounds", "cooking backgrounds", "home kitchen", "casual meetings", "friendly atmosphere"],
  "coffee-shops": ["coffee shop backgrounds", "cafe backgrounds", "casual meeting spaces", "creative workspace", "cozy atmosphere"],
  "art-galleries": ["art gallery backgrounds", "museum backgrounds", "sophisticated spaces", "artistic settings", "professional presentations"],
  "urban-lofts": ["urban loft backgrounds", "industrial spaces", "modern design", "contemporary workspace", "creative environments"],
  "gardens-patios": ["garden backgrounds", "patio backgrounds", "outdoor spaces", "natural settings", "green environments"],
  "historic-spaces": ["historic interior backgrounds", "ballroom backgrounds", "Art Deco spaces", "architectural backgrounds", "elegant settings"],
  "nature-landscapes": ["nature backgrounds", "landscape backgrounds", "mountain backgrounds", "outdoor scenery", "natural environments"],
  "libraries": ["library backgrounds", "book backgrounds", "academic settings", "study spaces", "professional environments"]
};