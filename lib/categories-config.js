// categories-config.js - Auto-generated category configuration
// Updated for curated collection with improved descriptions

export const CATEGORIES = {
  "bookshelves": {
    "name": "Bookshelves",
    "description": "Professional bookshelf virtual backgrounds — bright and dark lighting — for video calls and presentations",
    "count": 117
  },

  "wall-shelves": {
    "name": "Wall Shelves",
    "description": "Clean, minimalist wall shelf virtual backgrounds — bright and dark — for modern professional video calls",
    "count": 105
  },
  
  // PRIMARY CATEGORIES
  "office-spaces": {
    "name": "Office Spaces",
    "description": "Professional corporate office environments perfect for business video conferencing and formal meetings",
    "count": 100
  },
  "home-office": {
    "name": "Home Offices",
    "description": "Warm, personal home office backgrounds for work-from-home video calls — cozy yet professional",
    "count": 56
  },
  "living-rooms": {
    "name": "Living Rooms",
    "description": "Comfortable living room backgrounds for casual meetings and personal video calls",
    "count": 39
  },
  "kitchens": {
    "name": "Kitchens",
    "description": "Warm kitchen spaces that create a friendly, approachable atmosphere for casual video calls",
    "count": 26
  },
  "coffee-shops": {
    "name": "Coffee Shops",
    "description": "Cozy coffee shop backgrounds perfect for casual meetings and creative collaborations",
    "count": 38
  },
  "art-galleries": {
    "name": "Art Galleries",
    "description": "Sophisticated art gallery spaces with clean walls and artistic flair for professional presentations",
    "count": 28
  },
  "urban-lofts": {
    "name": "Urban Lofts",
    "description": "Modern industrial loft spaces with exposed brick and contemporary design for creative video calls",
    "count": 28
  },
  "gardens-patios": {
    "name": "Gardens & Patios",
    "description": "Beautiful outdoor garden and patio backgrounds that bring natural beauty to your video calls",
    "count": 31
  },
  "historic-spaces": {
    "name": "Historic Spaces",
    "description": "Elegant historic interiors including ballrooms, Art Deco corridors, and architectural spaces",
    "count": 22
  },
  "nature-landscapes": {
    "name": "Nature & Landscapes",
    "description": "Stunning natural landscapes including mountains, deserts, and scenic outdoor environments",
    "count": 40
  },
  "libraries": {
    "name": "Libraries",
    "description": "Classic library rooms with floor-to-ceiling books, perfect for academic and professional settings",
    "count": 10
  },
  "conference-rooms": {
    "name": "Conference Rooms",
    "description": "Professional conference room backgrounds perfect for team meetings, presentations, and collaborative video calls",
    "count": 39
  },
  
  // SEASONAL (Grouped)
  "christmas-backgrounds": {
    "name": "Christmas Backgrounds",
    "description": "Festive Christmas backgrounds with holiday decorations for seasonal video calls",
    "count": 93,
    "group": "seasonal"
  },
  "halloween-backgrounds": {
    "name": "Halloween Backgrounds",
    "description": "Festive Halloween backgrounds with pumpkins and fall decor for seasonal video calls",
    "count": 18,
    "group": "seasonal"
  },
  "valentines-backgrounds": {
    "name": "Valentine's Day Backgrounds",
    "description": "Romantic Valentine's Day backgrounds with hearts and festive decor for seasonal video calls",
    "count": 11,
    "group": "seasonal"
  },
  "easter-backgrounds": {
    "name": "Easter Backgrounds",
    "description": "Bright Easter backgrounds with spring pastel decor, bunnies, and seasonal charm for holiday video calls",
    "count": 78,
    "group": "seasonal"
  },
  "spring-backgrounds": {
    "name": "Spring Backgrounds",
    "description": "Fresh spring backgrounds with blooming flowers, sunrooms, and outdoor seasonal scenery for video calls",
    "count": 54,
    "group": "seasonal"
  },

  // ARTISTIC
  "bokeh-backgrounds": {
    "name": "Bokeh Backgrounds",
    "description": "Beautiful bokeh light backgrounds with soft, artistic blur effects perfect for elegant video calls",
    "count": 50
  }
};

export const CATEGORY_ORDER = [
  "bookshelves",
  "wall-shelves",
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
  "spring-backgrounds",
  "bokeh-backgrounds"
];

export const DEFAULT_CATEGORY = 'bookshelves';

export const TOTAL_IMAGES = 1013;

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
  "bookshelves": "Download 100+ free bookshelf virtual backgrounds for Zoom, Teams & Google Meet. Bright, well-lit and warm ambient settings — professional backdrops for any video call. No signup, instant download.",
  "wall-shelves": "Free wall shelf virtual backgrounds for video calls. Clean, minimalist floating shelf backgrounds — bright and ambient — perfect for modern professional workspaces. No signup, instant download.",
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
  "spring-backgrounds": "Free spring virtual backgrounds for video calls. Fresh flowers, sunrooms, greenhouses & outdoor spring scenery — no signup, no watermarks, instant download.",
  "bokeh-backgrounds": "Free bokeh virtual backgrounds for video calls. Beautiful soft-focus light effects and artistic blur backgrounds for elegant presentations."
};

export const CATEGORY_KEYWORDS = {
  "bookshelves": ["bookshelf backgrounds", "bookshelf zoom background", "bookshelves virtual background", "library background", "book background for zoom", "professional bookshelf"],
  "wall-shelves": ["wall shelf backgrounds", "floating shelf background", "shelf virtual background", "minimalist shelf backgrounds", "modern shelf zoom background"],
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
  "spring-backgrounds": ["spring backgrounds", "spring virtual backgrounds", "spring video call backgrounds", "flower backgrounds", "sunroom backgrounds", "greenhouse backgrounds", "seasonal backgrounds", "spring zoom backgrounds"],
  "bokeh-backgrounds": ["bokeh backgrounds", "bokeh lights", "soft focus backgrounds", "artistic blur", "light effects", "elegant backgrounds", "professional bokeh"]
};
