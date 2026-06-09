const fs = require('fs');
const path = require('path');

// === FILE PATHS ===
const METADATA_PATH = path.join(__dirname, '../public/data/image-metadata-complete.json');
const OUTPUT_PATH = path.join(__dirname, '../bundle-images-output.json');

// === 👉 PASTE YOUR TOP DOWNLOAD FILENAMES HERE ===
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
  "bookshelves-bright-42.webp",
  "library-17.webp",
  "office-spaces-33.webp",
  "valentines-background-20.webp",
  "wall-shelves-bright-01.webp",
  "wall-shelves-bright-51.webp",
  "bookshelves-bright-19.webp",
  "office-spaces-36.webp",
  "bookshelves-bright-20.webp",
  "bookshelves-dark-28.webp",
  "office-spaces-02.webp",
  "office-spaces-05.webp",
  // 👉 add more if needed
];

// === LOAD METADATA ===
const raw = fs.readFileSync(METADATA_PATH);
const allImages = JSON.parse(raw);

// === FILTER HD EXCLUSIVES ===
const hdExclusives = allImages.filter(img => img.hdOnly === true);

// === FILTER TOP DOWNLOADS ===
const topDownloads = allImages.filter(img =>
  TOP_DOWNLOADS.includes(img.filename)
);

// === REMOVE DUPLICATES ===
const combinedMap = new Map();

[...hdExclusives, ...topDownloads].forEach(img => {
  combinedMap.set(img.filename, img);
});

const finalImages = Array.from(combinedMap.values());

// === GROUP BY CATEGORY (for easier bundling later) ===
const grouped = finalImages.reduce((acc, img) => {
  if (!acc[img.category]) acc[img.category] = [];
  acc[img.category].push(img);
  return acc;
}, {});

// === OUTPUT ===
const output = {
  totalImages: finalImages.length,
  breakdown: Object.keys(grouped).map(cat => ({
    category: cat,
    count: grouped[cat].length
  })),
  images: finalImages
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

console.log("✅ Bundle image data extracted!");
console.log(`📦 Total images: ${finalImages.length}`);
console.log(`📁 Saved to: ${OUTPUT_PATH}`);