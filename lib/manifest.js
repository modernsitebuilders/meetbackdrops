const rawManifest = require('../image-pipeline/final_manifest.json');

const bySlug = Object.fromEntries(rawManifest.map(img => [img.slug, img]));
const byCategory = rawManifest.reduce((acc, img) => {
  if (!acc[img.category]) acc[img.category] = [];
  acc[img.category].push(img);
  return acc;
}, {});

function getAllImages() { return rawManifest; }
function getImageBySlug(slug) { return bySlug[slug] ?? null; }
function getImagesByCategory(category) { return byCategory[category] ?? []; }
function getCategories() { return Object.keys(byCategory); }

module.exports = { getAllImages, getImageBySlug, getImagesByCategory, getCategories };
