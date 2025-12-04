// categories-config.js - Auto-generated category configuration
// Updated for curated collection with improved descriptions

  export const CATEGORIES = {
  // BOOKSHELVES (NEW - Curated Premium)
  "bookshelves-bright": {
    "name": "Bookshelves - Bright",
    "description": "Bright, naturally-lit bookshelf backgrounds with excellent clarity for professional video calls and presentations",
    "count": 18,
    "group": "bookshelves"
  },
  "bookshelves-dark": {
    "name": "Bookshelves - Dark",
    "description": "Warm, softly-lit bookshelf backgrounds that create a welcoming atmosphere for client meetings and team calls",
    "count": 24,
    "group": "bookshelves"
  },
  
  // WALL SHELVES (Moved from old bookshelves)
  "wall-shelves-bright": {
    "name": "Wall Shelves - Bright",
    "description": "Clean, minimalist wall shelf backgrounds with bright lighting for modern professional video calls",
    "count": 47,
    "group": "wall-shelves"
  },
  "wall-shelves-dark": {
    "name": "Wall Shelves - Dark",
    "description": "Sleek wall shelf backgrounds with warm ambient lighting for sophisticated video calls",
    "count": 41,
    "group": "wall-shelves"
  },
  
  // PRIMARY CATEGORIES
  "office-spaces": {
    "name": "Office Spaces",
    "description": "Professional corporate office environments perfect for business video conferencing and formal meetings",
    "count": 67
  },
  "living-rooms": {
    "name": "Living Rooms",
    "description": "Comfortable living room backgrounds for casual meetings and personal video calls",
    "count": 47
  },
  "kitchens": {
    "name": "Kitchens",
    "description": "Warm kitchen spaces that create a friendly, approachable atmosphere for casual video calls",
    "count": 18
  },
  "coffee-shops": {
    "name": "Coffee Shops",
    "description": "Cozy coffee shop backgrounds perfect for casual meetings and creative collaborations",
    "count": 19
  },
  "art-galleries": {
    "name": "Art Galleries",
    "description": "Sophisticated art gallery spaces with clean walls and artistic flair for professional presentations",
    "count": 27
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
    "count": 26
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
  },
  
  // SEASONAL (Grouped)
  "christmas-backgrounds": {
    "name": "Christmas Backgrounds",
    "description": "Festive Christmas backgrounds with holiday decorations for seasonal video calls",
    "count": 130,
    "group": "seasonal"
  },
  "halloween-backgrounds": {
    "name": "Halloween Backgrounds",
    "description": "Festive Halloween backgrounds with pumpkins and fall decor for seasonal video calls",
    "count": 25,
    "group": "seasonal"
  },
  
  // ARTISTIC
  "bokeh-backgrounds": {
    "name": "Bokeh Backgrounds",
    "description": "Beautiful bokeh light backgrounds with soft, artistic blur effects perfect for elegant video calls",
    "count": 66
  }
};

export const CATEGORY_ORDER = [
  "bookshelves-bright",
  "bookshelves-dark",
  "wall-shelves-bright",
  "wall-shelves-dark",
  "office-spaces",
  "living-rooms",
  "kitchens",
  "coffee-shops",
  "art-galleries",
  "urban-lofts",
  "gardens-patios",
  "historic-spaces",
  "nature-landscapes",
  "libraries",
  "christmas-backgrounds",
  "halloween-backgrounds",
  "bokeh-backgrounds"
];

export const DEFAULT_CATEGORY = 'bookshelves-bright';

export const TOTAL_IMAGES = 652;

export function formatPublicCount(count) {
  if (count === 0) return '0';
  const roundedDown = Math.floor(count / 100) * 100;
  return `${roundedDown}+`;
}

export const TOTAL_IMAGES_FORMATTED = formatPublicCount(TOTAL_IMAGES);
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
// Helper function to get total number of categories
export function getTotalCategories() {
  return Object.keys(CATEGORIES).length;
}

// SEO-optimized category descriptions for meta tags
export const SEO_DESCRIPTIONS = {
  "bookshelves-bright": "Download free well-lit bookshelf virtual backgrounds in high quality. Perfect for professional video calls with excellent lighting and clarity.",
  "bookshelves-dark": "Free ambient bookshelf virtual backgrounds for video calls. Create a warm, welcoming atmosphere for client meetings and team calls.",
  "wall-shelves-bright": "Free bright wall shelf virtual backgrounds for video calls. Clean, minimalist floating shelf backgrounds with professional lighting for modern workspaces.",
  "wall-shelves-dark": "Free dark wall shelf virtual backgrounds for video calls. Warm ambient floating shelf backgrounds perfect for sophisticated video presentations.",
  "office-spaces": "Professional corporate office virtual backgrounds for business video conferencing. High quality office environments for formal meetings.",
  "living-rooms": "Comfortable living room virtual backgrounds for casual video calls and personal meetings. Cozy home settings for relaxed conversations.",
  "kitchens": "Free kitchen virtual backgrounds for video calls. Warm, friendly kitchen spaces perfect for casual meetings and cooking demonstrations.",
  "coffee-shops": "Cozy coffee shop virtual backgrounds for video calls. Perfect for casual meetings and creative collaboration sessions.",
  "art-galleries": "Sophisticated art gallery virtual backgrounds for professional presentations. Clean, artistic spaces for polished video calls.",
  "urban-lofts": "Modern urban loft virtual backgrounds with industrial design. Contemporary spaces for creative professionals and remote workers.",
  "gardens-patios": "Beautiful garden and patio virtual backgrounds for video calls. Bring natural outdoor beauty to your meetings.",
  "historic-spaces": "Elegant historic interior virtual backgrounds. Ballrooms, Art Deco corridors, and architectural spaces for distinguished video calls.",
  "nature-landscapes": "Stunning nature and landscape virtual backgrounds. Mountains, deserts, and scenic outdoor environments for inspiring video calls.",
  "libraries": "Classic library virtual backgrounds with floor-to-ceiling books. Perfect for academic presentations and professional settings.",
  "christmas-backgrounds": "Free Christmas virtual backgrounds for video calls. Festive holiday backgrounds with Christmas trees, decorations, and cozy winter atmosphere.",
  "halloween-backgrounds": "Free Halloween virtual backgrounds for video calls. Festive seasonal scenes with pumpkins, fall decorations, and autumn atmosphere.",
  "bokeh-backgrounds": "Free bokeh virtual backgrounds for video calls. Beautiful soft-focus light effects and artistic blur backgrounds for elegant presentations."
};

// Keywords for each category (for SEO)
export const CATEGORY_KEYWORDS = {
  "bookshelves-bright": ["bright bookshelf backgrounds", "well lit bookshelves", "natural lighting", "clear video calls", "professional lighting"],
  "bookshelves-dark": ["dark bookshelf backgrounds", "ambient lighting", "warm backgrounds", "cozy office", "soft lighting"],
  "wall-shelves-bright": ["bright wall shelf backgrounds", "floating shelves bright", "minimalist shelves", "modern wall shelves", "clean shelf backgrounds"],
  "wall-shelves-dark": ["dark wall shelf backgrounds", "floating shelves dark", "ambient wall shelves", "warm shelf lighting", "sophisticated backgrounds"],
  "office-spaces": ["office backgrounds", "corporate spaces", "business environments", "professional workspaces", "meeting rooms", "formal offices"],
  "living-rooms": ["living room backgrounds", "home backgrounds", "casual video calls", "comfortable settings", "personal meetings"],
  "kitchens": ["kitchen backgrounds", "cooking backgrounds", "home kitchen", "casual meetings", "friendly atmosphere"],
  "coffee-shops": ["coffee shop backgrounds", "cafe backgrounds", "casual meeting spaces", "creative workspace", "cozy atmosphere"],
  "art-galleries": ["art gallery backgrounds", "museum backgrounds", "sophisticated spaces", "artistic settings", "professional presentations"],
  "urban-lofts": ["urban loft backgrounds", "industrial spaces", "modern design", "contemporary workspace", "creative environments"],
  "gardens-patios": ["garden backgrounds", "patio backgrounds", "outdoor spaces", "natural settings", "green environments"],
  "historic-spaces": ["historic interior backgrounds", "ballroom backgrounds", "Art Deco spaces", "architectural backgrounds", "elegant settings"],
  "nature-landscapes": ["nature backgrounds", "landscape backgrounds", "mountain backgrounds", "outdoor scenery", "natural environments"],
  "libraries": ["library backgrounds", "book backgrounds", "academic settings", "study spaces", "professional environments"],
  "christmas-backgrounds": ["christmas backgrounds", "holiday backgrounds", "christmas video calls", "festive backgrounds", "winter backgrounds", "seasonal backgrounds", "christmas decorations", "holiday video calls"],
  "halloween-backgrounds": ["halloween backgrounds", "halloween kitchen backgrounds", "seasonal backgrounds", "fall decor", "pumpkin backgrounds", "autumn atmosphere", "halloween video calls"],
  "bokeh-backgrounds": ["bokeh backgrounds", "bokeh lights", "soft focus backgrounds", "artistic blur", "light effects", "elegant backgrounds", "professional bokeh"]
};