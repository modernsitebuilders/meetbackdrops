const fs = require('fs');
const path = require('path');

// 1. DATA FROM YOUR FIRST MESSAGE (Popular Downloads)
const POPULAR_LIST = [
    "wall-shelves-bright-16.webp", "bookshelves-bright-01.webp", "office-spaces-19.webp", "office-spaces-69.webp", 
    "wall-shelves-bright-02.webp", "bookshelves-dark-27.webp", "valentines-background-14.webp", "office-spaces-35.webp", 
    "wall-shelves-bright-54.webp", "office-spaces-71.webp", "bookshelves-bright-42.webp", "library-17.webp", 
    "office-spaces-33.webp", "valentines-background-20.webp", "wall-shelves-bright-01.webp", "wall-shelves-bright-51.webp", 
    "bookshelves-bright-19.webp", "office-spaces-36.webp", "bookshelves-bright-20.webp", "bookshelves-dark-28.webp", 
    "office-spaces-02.webp", "office-spaces-05.webp", "wall-shelves-bright-55.webp", "bookshelves-bright-13.webp", 
    "bookshelves-dark-25.webp", "bookshelves-bright-10.webp", "bookshelves-bright-11.webp", "bookshelves-dark-41.webp", 
    "living-room-10.webp", "urban-loft-20.webp", "library-33.webp", "office-spaces-21.webp", "office-spaces-28.webp", 
    "office-spaces-77.webp", "valentines-background-18.webp", "wall-shelves-bright-03.webp", "wall-shelves-bright-49.webp", 
    "bookshelves-dark-07.webp", "office-spaces-16.webp", "wall-shelves-bright-10.webp", "wall-shelves-bright-29.webp", 
    "wall-shelves-bright-30.webp", "wall-shelves-dark-27.webp", "bookshelves-bright-07.webp", "bookshelves-dark-06.webp", 
    "nature-landscape-46.webp", "office-spaces-10.webp", "office-spaces-12.webp", "office-spaces-20.webp", 
    "office-spaces-22.webp", "office-spaces-48.webp", "office-spaces-66.webp", "office-spaces-70.webp", 
    "valentines-background-03.webp", "valentines-background-16.webp", "wall-shelves-bright-17.webp", 
    "wall-shelves-dark-01.webp", "wall-shelves-dark-06.webp", "wall-shelves-dark-26.webp", "wall-shelves-dark-34.webp", 
    "wall-shelves-dark-44.webp", "bookshelves-dark-37.webp", "coffee-shop-12.webp", "easter-background-03.webp", 
    "library-15.webp", "library-34.webp", "valentines-background-05.webp", "wall-shelves-dark-04.webp", 
    "bookshelves-bright-02.webp", "bookshelves-bright-16.webp", "bookshelves-bright-29.webp", "bookshelves-bright-33.webp", 
    "bookshelves-dark-42.webp", "garden-patio-12.webp", "home-offices-74.webp", "nature-landscape-18.webp", 
    "nature-landscape-43.webp", "valentines-background-04.webp", "wall-shelves-bright-38.webp", "wall-shelves-dark-28.webp", 
    "bokeh-13.webp", "bookshelves-bright-03.webp", "bookshelves-bright-09.webp", "bookshelves-bright-17.webp", 
    "bookshelves-bright-38.webp", "bookshelves-dark-23.webp", "bookshelves-dark-29.webp", "bookshelves-dark-38.webp", 
    "coffee-shop-04.webp", "coffee-shop-19.webp", "coffee-shop-22.webp", "garden-patio-14.webp", "living-room-34.webp", 
    "living-room-41.webp", "nature-landscape-36.webp", "office-spaces-01.webp", "office-spaces-24.webp", 
    "office-spaces-34.webp", "office-spaces-56.webp", "office-spaces-59.webp", "office-spaces-62.webp", 
    "office-spaces-63.webp", "office-spaces-79.webp", "urban-loft-26.webp", "wall-shelves-bright-13.webp", 
    "wall-shelves-dark-19.webp", "wall-shelves-dark-24.webp", "wall-shelves-dark-42.webp", "wall-shelves-dark-51.webp", 
    "wall-shelves-dark-69.webp", "wall-shelves-dark-77.webp"
];

// 2. DATA FROM YOUR SECOND MESSAGE (HD List converted to filenames)
const HD_LIST = [
    "bookshelves-bright-01.webp", "bookshelves-bright-02.webp", "bookshelves-bright-04.webp", "bookshelves-bright-06.webp", 
    "bookshelves-bright-07.webp", "bookshelves-bright-10.webp", "bookshelves-bright-11.webp", "bookshelves-bright-13.webp", 
    "bookshelves-bright-19.webp", "bookshelves-bright-20.webp", "bookshelves-bright-23.webp", "bookshelves-bright-42.webp", 
    "bookshelves-dark-02.webp", "bookshelves-dark-06.webp", "bookshelves-dark-07.webp", "bookshelves-dark-08.webp", 
    "bookshelves-dark-09.webp", "bookshelves-dark-25.webp", "bookshelves-dark-27.webp", "bookshelves-dark-28.webp", 
    "bookshelves-dark-37.webp", "wall-shelves-bright-01.webp", "wall-shelves-bright-02.webp", "wall-shelves-bright-03.webp", 
    "wall-shelves-bright-05.webp", "wall-shelves-bright-10.webp", "wall-shelves-bright-13.webp", "wall-shelves-bright-16.webp", 
    "wall-shelves-bright-17.webp", "wall-shelves-bright-28.webp", "wall-shelves-bright-54.webp", "wall-shelves-bright-20.webp", 
    "wall-shelves-bright-29.webp", "wall-shelves-bright-51.webp", "wall-shelves-dark-01.webp", "wall-shelves-dark-02.webp", 
    "wall-shelves-dark-04.webp", "wall-shelves-dark-06.webp", "wall-shelves-dark-17.webp", "wall-shelves-dark-19.webp", 
    "wall-shelves-dark-28.webp", "wall-shelves-dark-29.webp", "wall-shelves-dark-34.webp"
];

// 3. MERGE, DEDUPLICATE, AND EXTRACT
const masterPath = path.join(__dirname, 'public/data/image-metadata-complete.json');
const allFilenames = new Set([...POPULAR_LIST, ...HD_LIST]);
const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const finalExport = masterData.filter(img => allFilenames.has(img.filename));

fs.writeFileSync('final-bundle-inventory.json', JSON.stringify(finalExport, null, 2));
console.log(`✅ Success: ${finalExport.length} metadata records saved to final-bundle-inventory.json`);