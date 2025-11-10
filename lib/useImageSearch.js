import { useState } from 'react';

export function useImageSearch(imageMetadata) {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = (keywords) => {
    const activeKeywords = Object.values(keywords);
    
    if (activeKeywords.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const searchLower = activeKeywords.map(k => k.toLowerCase());
    const matchedImages = [];
const seenIds = new Set(); // Track seen image IDs to prevent duplicates

Object.keys(imageMetadata).forEach((key) => {
  // Skip if we've already processed this image
  if (seenIds.has(key)) {
    return;
  }
  
  const image = imageMetadata[key];
  // ... matching logic ...
  matchedImages.push({ ...image, id: key, score: score });
  
  seenIds.add(key); // Mark this ID as processed
});

    // Sort by score (highest first)
    matchedImages.sort((a, b) => b.score - a.score);

    setResults(matchedImages);
    setIsSearching(false);
  };

  return {
    results,
    isSearching,
    hasSearched,
    performSearch
  };
}