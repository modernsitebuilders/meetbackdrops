// lib/getImageCounts.js
import imageMetadata from '../public/images-metadata.json';

export function getImageCounts() {
  const counts = {};
  
  // Count images by category from metadata
  Object.values(imageMetadata).forEach(image => {
    if (image.category) {
      counts[image.category] = (counts[image.category] || 0) + 1;
    }
  });
  
  return counts;
}

export function getTotalImageCount() {
  return Object.keys(imageMetadata).length;
}

export function getCategoryCount(categorySlug) {
  const counts = getImageCounts();
  return counts[categorySlug] || 0;
}

// NEW FUNCTION: Format count for public display (rounds down to nearest 10 and adds +)
export function formatPublicCount(count) {
  if (count === 0) return '0';
  const roundedDown = Math.floor(count / 10) * 10;
  return `${roundedDown}+`;
}

// Get formatted total for public display
export function getFormattedTotalCount() {
  const total = getTotalImageCount();
  return formatPublicCount(total);
}

// Get formatted category count for public display
export function getFormattedCategoryCount(categorySlug) {
  const count = getCategoryCount(categorySlug);
  return formatPublicCount(count);
}