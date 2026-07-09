const fs = require('fs');
const path = require('path');

// ====== CONFIG ======
const METADATA_FILE = './public/data/image-metadata-complete.json';

// OPTIONAL: paste your top download filenames here
const TOP_DOWNLOADS = [
  "wall-shelves-bright-16.webp",
  "bookshelves-bright-01.webp",
  "office-spaces-19.webp",
  "office-spaces-69.webp",
  "wall-shelves-bright-02.webp",
  "bookshelves-dark-27.webp",
  "valentines-background-14.webp",
  "office-spaces-35.webp",
  "wall-shelves-bright-54.webp",
  "office-spaces-71.webp",
  // add more if needed
];

// ====== LOAD DATA ======
const raw = fs.readFileSync(METADATA_FILE, 'utf-8');
const data = JSON.parse(raw);

// ====== HELPERS ======
const byCategory = (arr) => {
  return arr.reduce((acc, img) => {
    if (!acc[img.category]) acc[img.category] = [];
    acc[img.category].push(img);
    return acc;
  }, {});
};

// ====== STEP 1: HD EXCLUSIVES ======
const hdExclusive = data.filter(img => img.hdOnly === true);

// ====== STEP 2: TOP PERFORMERS ======
const topPerformers = data.filter(img =>
  TOP_DOWNLOADS.includes(img.filename)
);

// ====== STEP 3: COMBINE + DEDUPE ======
const combinedMap = new Map();

[...hdExclusive, ...topPerformers].forEach(img => {
  combinedMap.set(img.filename, img);
});

const combined = Array.from(combinedMap.values());

// ====== STEP 4: GROUP BY CATEGORY ======
const grouped = byCategory(combined);

// ====== STEP 5: CATEGORY STRENGTH ======
const categoryStats = Object.entries(grouped).map(([category, images]) => {
  return {
    category,
    count: images.length,
    hdExclusiveCount: images.filter(i => i.hdOnly).length,
  };
}).sort((a, b) => b.count - a.count);

// ====== STEP 6: BUNDLE STRUCTURE ======
const bundles = Object.entries(grouped).map(([category, images]) => {
  return {
    bundleName: formatBundleName(category),
    category,
    imageCount: images.length,
    images: images.map(i => ({
      filename: i.filename,
      title: i.title,
      hdOnly: !!i.hdOnly
    }))
  };
});

// ====== NAME FORMATTER ======
function formatBundleName(category) {
  return category
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) + ' Bundle';
}

// ====== OUTPUT ======
const output = {
  summary: {
    totalSelectedImages: combined.length,
    hdExclusiveCount: hdExclusive.length,
    topPerformerCount: topPerformers.length
  },
  categoryStats,
  bundles
};

// Save file
fs.writeFileSync(
  './bundle-data-output.json',
  JSON.stringify(output, null, 2)
);

console.log("✅ Bundle data generated: bundle-data-output.json");

// ====== BONUS: PRETTY LOG ======
console.log("\n📊 Category Strength:");
categoryStats.forEach(cat => {
  console.log(
    `${cat.category} → ${cat.count} images (${cat.hdExclusiveCount} HD)`
  );
});