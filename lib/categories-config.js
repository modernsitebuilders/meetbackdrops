// categories-config.js - Auto-generated category configuration
// Updated for curated collection with improved descriptions

export const CATEGORIES = {
  // BOOKSHELVES (NEW - Curated Premium)
  "bookshelves-bright": {
    "name": "Bookshelves - Bright",
    "description": "Bright, naturally-lit bookshelf backgrounds with excellent clarity for professional video calls and presentations",
    "count": 42,
    "group": "bookshelves"
  },
  "bookshelves-dark": {
    "name": "Bookshelves - Dark",
    "description": "Warm, softly-lit bookshelf backgrounds that create a welcoming atmosphere for client meetings and team calls",
    "count": 63,
    "group": "bookshelves"
  },
  
  // WALL SHELVES (Moved from old bookshelves)
  "wall-shelves-bright": {
    "name": "Wall Shelves - Bright",
    "description": "Clean, minimalist wall shelf backgrounds with bright lighting for modern professional video calls",
    "count": 55,
    "group": "wall-shelves"
  },
  "wall-shelves-dark": {
    "name": "Wall Shelves - Dark",
    "description": "Sleek wall shelf backgrounds with warm ambient lighting for sophisticated video calls",
    "count": 79,
    "group": "wall-shelves"
  },
  
  // PRIMARY CATEGORIES
  "office-spaces": {
    "name": "Office Spaces",
    "description": "Professional corporate office environments perfect for business video conferencing and formal meetings",
    "count": 104
  },
  "home-office": {
    "name": "Home Offices",
    "description": "Warm, personal home office backgrounds for work-from-home video calls — cozy yet professional",
    "count": 75
  },
  "living-rooms": {
    "name": "Living Rooms",
    "description": "Comfortable living room backgrounds for casual meetings and personal video calls",
    "count": 71
  },
  "kitchens": {
    "name": "Kitchens",
    "description": "Warm kitchen spaces that create a friendly, approachable atmosphere for casual video calls",
    "count": 18
  },
  "coffee-shops": {
    "name": "Coffee Shops",
    "description": "Cozy coffee shop backgrounds perfect for casual meetings and creative collaborations",
    "count": 44
  },
  "art-galleries": {
    "name": "Art Galleries",
    "description": "Sophisticated art gallery spaces with clean walls and artistic flair for professional presentations",
    "count": 44
  },
  "urban-lofts": {
    "name": "Urban Lofts",
    "description": "Modern industrial loft spaces with exposed brick and contemporary design for creative video calls",
    "count": 45
  },
  "gardens-patios": {
    "name": "Gardens & Patios",
    "description": "Beautiful outdoor garden and patio backgrounds that bring natural beauty to your video calls",
    "count": 44
  },
  "historic-spaces": {
    "name": "Historic Spaces",
    "description": "Elegant historic interiors including ballrooms, Art Deco corridors, and architectural spaces",
    "count": 37
  },
  "nature-landscapes": {
    "name": "Nature & Landscapes",
    "description": "Stunning natural landscapes including mountains, deserts, and scenic outdoor environments",
    "count": 99
  },
  "libraries": {
    "name": "Libraries",
    "description": "Classic library rooms with floor-to-ceiling books, perfect for academic and professional settings",
    "count": 70
  },
  "conference-rooms": {
    "name": "Conference Rooms",
    "description": "Professional conference room backgrounds perfect for team meetings, presentations, and collaborative video calls",
    "count": 48
  },
  
  // SEASONAL (Grouped)
  "christmas-backgrounds": {
    "name": "Christmas Backgrounds",
    "description": "Festive Christmas backgrounds with holiday decorations for seasonal video calls",
    "count": 152,
    "group": "seasonal"
  },
  "halloween-backgrounds": {
    "name": "Halloween Backgrounds",
    "description": "Festive Halloween backgrounds with pumpkins and fall decor for seasonal video calls",
    "count": 25,
    "group": "seasonal"
  },
  "valentines-backgrounds": {
    "name": "Valentine's Day Backgrounds",
    "description": "Romantic Valentine's Day backgrounds with hearts and festive decor for seasonal video calls",
    "count": 20,
    "group": "seasonal"
  },
  "easter-backgrounds": {
    "name": "Easter Backgrounds",
    "description": "Bright Easter backgrounds with spring pastel decor, bunnies, and seasonal charm for holiday video calls",
    "count": 90,
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
  "home-office",
  "living-rooms",
  "kitchens",
  "coffee-shops",
  "art-galleries",
  "urban-lofts",
  "gardens-patios",
  "historic-spaces",
  "nature-landscapes",
  "libraries",
  "conference-rooms",
  "christmas-backgrounds",
  "halloween-backgrounds",
  "valentines-backgrounds",
  "easter-backgrounds",
  "bokeh-backgrounds"
];

export const DEFAULT_CATEGORY = 'bookshelves-bright';

export const TOTAL_IMAGES = 1291;

export function formatPublicCount(count) {
  if (count === 0) return '0';
  const roundedDown = Math.floor(count / 100) * 100;
  return `${roundedDown}+`;
}

export const TOTAL_IMAGES_FORMATTED = formatPublicCount(TOTAL_IMAGES);

export function getCategoryName(slug) {
  return CATEGORIES[slug]?.name || slug;
}

export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([slug, info]) => ({
    slug,
    ...info
  }));
}

export function getTotalCategories() {
  return Object.keys(CATEGORIES).length;
}

export const SEO_DESCRIPTIONS = {
  "bookshelves-bright": "Download free well-lit bookshelf virtual backgrounds in high quality. Perfect for professional video calls with excellent lighting and clarity.",
  "bookshelves-dark": "Free ambient bookshelf virtual backgrounds for video calls. Create a warm, welcoming atmosphere for client meetings and team calls.",
  "wall-shelves-bright": "Free bright wall shelf virtual backgrounds for video calls. Clean, minimalist floating shelf backgrounds with professional lighting for modern workspaces.",
  "wall-shelves-dark": "Free dark wall shelf virtual backgrounds for video calls. Warm ambient floating shelf backgrounds perfect for sophisticated video presentations.",
  "office-spaces": "Professional corporate office virtual backgrounds for business video conferencing. High quality office environments for formal meetings.",
  "home-office": "Free home office virtual backgrounds for video calls. Warm, professional work-from-home settings perfect for remote workers, freelancers, and hybrid teams.",
  "living-rooms": "Comfortable living room virtual backgrounds for casual video calls and personal meetings. Cozy home settings for relaxed conversations.",
  "kitchens": "Free kitchen virtual backgrounds for video calls. Warm, friendly kitchen spaces perfect for casual meetings and cooking demonstrations.",
  "coffee-shops": "Cozy coffee shop virtual backgrounds for video calls. Perfect for casual meetings and creative collaboration sessions.",
  "art-galleries": "Sophisticated art gallery virtual backgrounds for professional presentations. Clean, artistic spaces for polished video calls.",
  "urban-lofts": "Modern urban loft virtual backgrounds with industrial design. Contemporary spaces for creative professionals and remote workers.",
  "gardens-patios": "Beautiful garden and patio virtual backgrounds for video calls. Bring natural outdoor beauty to your meetings.",
  "historic-spaces": "Elegant historic interior virtual backgrounds. Ballrooms, Art Deco corridors, and architectural spaces for distinguished video calls.",
  "nature-landscapes": "Stunning nature and landscape virtual backgrounds. Mountains, deserts, and scenic outdoor environments for inspiring video calls.",
  "libraries": "Classic library virtual backgrounds with floor-to-ceiling books. Perfect for academic presentations and professional settings.",
  "conference-rooms": "Professional conference room virtual backgrounds for team meetings and presentations. Modern meeting spaces for collaborative video calls.",
  "christmas-backgrounds": "Free Christmas virtual backgrounds for video calls. Festive holiday backgrounds with Christmas trees, decorations, and cozy winter atmosphere.",
  "halloween-backgrounds": "Free Halloween virtual backgrounds for video calls. Festive seasonal scenes with pumpkins, fall decorations, and autumn atmosphere.",
  "valentines-backgrounds": "Free Valentine's Day virtual backgrounds for video calls. Romantic backgrounds with hearts, roses, and festive Valentine's decor for seasonal celebrations.",
  "easter-backgrounds": "Free Easter virtual backgrounds for video calls. Spring pastel scenes with Easter eggs, bunnies, and seasonal holiday decor — no signup required, no watermarks, instant download.",
  "bokeh-backgrounds": "Free bokeh virtual backgrounds for video calls. Beautiful soft-focus light effects and artistic blur backgrounds for elegant presentations."
};

export const CATEGORY_KEYWORDS = {
  "bookshelves-bright": ["bright bookshelf backgrounds", "well lit bookshelves", "natural lighting", "clear video calls", "professional lighting"],
  "bookshelves-dark": ["dark bookshelf backgrounds", "ambient lighting", "warm backgrounds", "cozy office", "soft lighting"],
  "wall-shelves-bright": ["bright wall shelf backgrounds", "floating shelves bright", "minimalist shelves", "modern wall shelves", "clean shelf backgrounds"],
  "wall-shelves-dark": ["dark wall shelf backgrounds", "floating shelves dark", "ambient wall shelves", "warm shelf lighting", "sophisticated backgrounds"],
  "office-spaces": ["office backgrounds", "corporate spaces", "business environments", "professional workspaces", "meeting rooms", "formal offices"],
  "home-office": ["home office backgrounds", "work from home backgrounds", "remote work backgrounds", "home office zoom background", "wfh backgrounds", "home workspace"],
  "living-rooms": ["living room backgrounds", "home backgrounds", "casual video calls", "comfortable settings", "personal meetings"],
  "kitchens": ["kitchen backgrounds", "cooking backgrounds", "home kitchen", "casual meetings", "friendly atmosphere"],
  "coffee-shops": ["coffee shop backgrounds", "cafe backgrounds", "casual meeting spaces", "creative workspace", "cozy atmosphere"],
  "art-galleries": ["art gallery backgrounds", "museum backgrounds", "sophisticated spaces", "artistic settings", "professional presentations"],
  "urban-lofts": ["urban loft backgrounds", "industrial spaces", "modern design", "contemporary workspace", "creative environments"],
  "gardens-patios": ["garden backgrounds", "patio backgrounds", "outdoor spaces", "natural settings", "green environments"],
  "historic-spaces": ["historic interior backgrounds", "ballroom backgrounds", "Art Deco spaces", "architectural backgrounds", "elegant settings"],
  "nature-landscapes": ["nature backgrounds", "landscape backgrounds", "mountain backgrounds", "outdoor scenery", "natural environments"],
  "libraries": ["library backgrounds", "book backgrounds", "academic settings", "study spaces", "professional environments"],
  "conference-rooms": ["conference room backgrounds", "meeting room backgrounds", "boardroom backgrounds", "professional meetings", "team collaboration", "presentation backgrounds"],
  "christmas-backgrounds": ["christmas backgrounds", "holiday backgrounds", "christmas video calls", "festive backgrounds", "winter backgrounds", "seasonal backgrounds", "christmas decorations", "holiday video calls"],
  "halloween-backgrounds": ["halloween backgrounds", "halloween kitchen backgrounds", "seasonal backgrounds", "fall decor", "pumpkin backgrounds", "autumn atmosphere", "halloween video calls"],
  "valentines-backgrounds": ["valentines backgrounds", "valentine's day backgrounds", "romantic backgrounds", "hearts backgrounds", "love backgrounds", "seasonal backgrounds", "february backgrounds", "valentines video calls"],
  "easter-backgrounds": ["easter backgrounds", "easter video call backgrounds", "spring backgrounds", "easter bunny backgrounds", "pastel backgrounds", "seasonal backgrounds", "easter eggs backgrounds", "holiday video calls"],
  "bokeh-backgrounds": ["bokeh backgrounds", "bokeh lights", "soft focus backgrounds", "artistic blur", "light effects", "elegant backgrounds", "professional bokeh"]
};
