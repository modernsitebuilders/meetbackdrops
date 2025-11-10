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

    Object.keys(imageMetadata).forEach((key) => {
      const image = imageMetadata[key];
      
      // Create searchable text from all image fields
      const categoryText = image.category ? image.category.toLowerCase() : '';
      const altText = image.alt ? image.alt.toLowerCase() : '';
      const titleText = image.title ? image.title.toLowerCase() : '';
      const keywordsText = image.keywords && Array.isArray(image.keywords) 
        ? image.keywords.map(k => k.toLowerCase()).join(' ')
        : '';
      
      const allImageText = `${categoryText} ${altText} ${titleText} ${keywordsText}`;
      
      // Check if image matches ALL selected keywords
      const matchesAllKeywords = searchLower.every(keyword => 
        allImageText.includes(keyword)
      );
      
      if (!matchesAllKeywords) {
        return; // Skip this image if it doesn't have all keywords
      }
      
      // Now calculate score for ranking
      let score = 0;
      
      searchLower.forEach(keyword => {
        // Exact keyword match (best)
        if (image.keywords && Array.isArray(image.keywords)) {
          const hasExactKeyword = image.keywords.some(k => 
            k.toLowerCase() === keyword
          );
          if (hasExactKeyword) {
            score += 10;
          }
        }
        
        // Category match (very good)
        if (categoryText.includes(keyword)) {
          score += 8;
        }
        
        // Title match (good)
        if (titleText.includes(keyword)) {
          score += 5;
        }
        
        // Alt text match (okay)
        if (altText.includes(keyword)) {
          score += 3;
        }
      });
      
      matchedImages.push({
        ...image,
        id: key,
        score: score
      });
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