const fs = require('fs');

const filePath = 'lib/categories-config.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add bokeh-backgrounds to CATEGORIES
content = content.replace(
  `  "halloween-backgrounds": {
    "name": "Halloween Backgrounds",
    "description": "Festive Halloween backgrounds with pumpkins and fall decor for seasonal video calls",
    "count": 25
  }
};`,
  `  "halloween-backgrounds": {
    "name": "Halloween Backgrounds",
    "description": "Festive Halloween backgrounds with pumpkins and fall decor for seasonal video calls",
    "count": 25
  },
  "bokeh-backgrounds": {
    "name": "Bokeh Backgrounds",
    "description": "Beautiful bokeh light backgrounds with soft, artistic blur effects perfect for elegant video calls",
    "count": 66
  }
};`
);

// 2. Add to CATEGORY_ORDER
content = content.replace(
  `  "halloween-backgrounds"
];`,
  `  "halloween-backgrounds",
  "bokeh-backgrounds"
];`
);

// 3. Update TOTAL_IMAGES
content = content.replace(
  'export const TOTAL_IMAGES = 437;',
  'export const TOTAL_IMAGES = 503;'
);

// 4. Add to SEO_DESCRIPTIONS
content = content.replace(
  `  "halloween-backgrounds": "Free Halloween virtual backgrounds for video calls. Festive seasonal scenes with pumpkins, fall decorations, and autumn atmosphere."
};`,
  `  "halloween-backgrounds": "Free Halloween virtual backgrounds for video calls. Festive seasonal scenes with pumpkins, fall decorations, and autumn atmosphere.",
  "bokeh-backgrounds": "Free bokeh virtual backgrounds for video calls. Beautiful soft-focus light effects and artistic blur backgrounds for elegant presentations."
};`
);

// 5. Add to CATEGORY_KEYWORDS
content = content.replace(
  `  "halloween-backgrounds": ["halloween backgrounds", "halloween kitchen backgrounds", "seasonal backgrounds", "fall decor", "pumpkin backgrounds", "autumn atmosphere", "halloween video calls"]
};`,
  `  "halloween-backgrounds": ["halloween backgrounds", "halloween kitchen backgrounds", "seasonal backgrounds", "fall decor", "pumpkin backgrounds", "autumn atmosphere", "halloween video calls"],
  "bokeh-backgrounds": ["bokeh backgrounds", "bokeh lights", "soft focus backgrounds", "artistic blur", "light effects", "elegant backgrounds", "professional bokeh"]
};`
);

fs.writeFileSync(filePath, content);
console.log('✓ Updated lib/categories-config.js');
