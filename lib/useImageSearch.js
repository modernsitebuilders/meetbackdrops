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
      
      // Safety check - make sure image has required fields
      if (!image || !image.keywords) {
        return;
      }
      
      // Build searchable text from image data
      const searchableText = [
        image.title || '',
        image.description || '',
        image.category || '',
        image.alt || '',
        ...(image.keywords || [])
      ].join(' ').toLowerCase();
      
      // Calculate match score
      let score = 0;
      let matchCount = 0;
      
      searchLower.forEach(keyword => {
        if (searchableText.includes(keyword)) {
          matchCount++;
          // Higher score for title/category matches
          if ((image.title || '').toLowerCase().includes(keyword)) {
            score += 3;
          }
          if ((image.category || '').toLowerCase().includes(keyword)) {
            score += 2;
          }
          // Check alt text
          if ((image.alt || '').toLowerCase().includes(keyword)) {
            score += 2;
          }
          // Check keywords array
          if (image.keywords && image.keywords.some(k => k.toLowerCase().includes(keyword))) {
            score += 1;
          }
        }
      });
      
      // Only include images that match at least one keyword
      if (matchCount > 0) {
        matchedImages.push({ 
          ...image, 
          id: key, 
          score: score,
          matchCount: matchCount
        });
      }
      
      seenIds.add(key); // Mark this ID as processed
    });

    // Sort by score (highest first), then by match count
    matchedImages.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.matchCount - a.matchCount;
    });

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