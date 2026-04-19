const rawManifest = require('../image-pipeline/final_manifest.json');

// Canonical -> legacy-shape mapping so API consumers still see the old keys.
// Canonical fields are preserved via spread so frontend callers keep working.
function toLegacyShape(img) {
  return {
    ...img,
    filename: img.image_webp,
    downloadName: img.download_png,
    keywords: Array.isArray(img.tags) ? img.tags : [],
    width: 1920,
    height: 1080,
    hdOnly: img.hdOnly === true,
  };
}

const legacyArray = rawManifest.map(toLegacyShape);

const bySlug = Object.create(null);
const byCanonicalId = Object.create(null);
const byFilename = Object.create(null);
const byCategory = Object.create(null);

legacyArray.forEach((img) => {
  if (img.slug) bySlug[img.slug] = img;
  if (img.id) byCanonicalId[img.id] = img;
  if (img.filename) byFilename[img.filename] = img;
  if (img.category) {
    if (!byCategory[img.category]) byCategory[img.category] = [];
    byCategory[img.category].push(img);
  }
});

function getAll() {
  return legacyArray;
}

function getByCategory(category) {
  return byCategory[category] || [];
}

function getById(identifier) {
  if (identifier == null) return null;
  if (bySlug[identifier]) return bySlug[identifier];
  if (byCanonicalId[identifier]) return byCanonicalId[identifier];
  const asIndex = Number(identifier);
  if (Number.isInteger(asIndex) && asIndex >= 0 && asIndex < legacyArray.length) {
    return legacyArray[asIndex];
  }
  return null;
}

function getByFilename(filename) {
  if (!filename) return null;
  return byFilename[filename] || null;
}

// Extension-tolerant filename lookup. Canonical manifest keys are the
// .webp filenames (image_webp). Analytics rows may reference .png or
// other variants; this resolves either to the same manifest entry.
// Returns null when the base name is not present in the manifest —
// never infers category from the filename.
function resolveByAnyExtension(filename) {
  if (!filename) return null;
  if (byFilename[filename]) return byFilename[filename];
  const base = String(filename).replace(/\.(webp|png|jpg|jpeg)$/i, '');
  return byFilename[`${base}.webp`] || null;
}

function getCategories() {
  return Object.keys(byCategory);
}

// Legacy export names kept intact for existing frontend callers.
function getAllImages() {
  return legacyArray;
}

function getImageBySlug(slug) {
  return bySlug[slug] ?? null;
}

function getImagesByCategory(category) {
  return byCategory[category] ?? [];
}

module.exports = {
  getAll,
  getByCategory,
  getById,
  getByFilename,
  resolveByAnyExtension,
  getCategories,
  getAllImages,
  getImageBySlug,
  getImagesByCategory,
};
