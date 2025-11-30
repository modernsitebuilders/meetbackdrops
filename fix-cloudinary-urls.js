const fs = require('fs');

const urls = JSON.parse(fs.readFileSync('./cloudinary-urls.json', 'utf8'));

// Map: new name → old number
const mapping = {
  'christmas-modern-01': 4, 'christmas-modern-02': 5, 'christmas-modern-03': 10,
  'christmas-modern-04': 11, 'christmas-modern-05': 13, 'christmas-modern-06': 14,
  'christmas-modern-07': 15, 'christmas-modern-08': 16, 'christmas-modern-09': 18,
  'christmas-modern-10': 20, 'christmas-modern-11': 24, 'christmas-modern-12': 25,
  'christmas-modern-13': 28, 'christmas-modern-14': 32, 'christmas-modern-15': 33,
  'christmas-modern-16': 34, 'christmas-modern-17': 43, 'christmas-modern-18': 44,
  'christmas-traditional-01': 1, 'christmas-traditional-02': 7, 'christmas-traditional-03': 8,
  'christmas-traditional-04': 9, 'christmas-traditional-05': 19, 'christmas-traditional-06': 21,
  'christmas-traditional-07': 26, 'christmas-traditional-08': 29, 'christmas-traditional-09': 35,
  'christmas-traditional-10': 41,
  'christmas-rustic-01': 2, 'christmas-rustic-02': 3, 'christmas-rustic-03': 12,
  'christmas-rustic-04': 17, 'christmas-rustic-05': 22, 'christmas-rustic-06': 23,
  'christmas-rustic-07': 27, 'christmas-rustic-08': 30, 'christmas-rustic-09': 31,
  'christmas-rustic-10': 36, 'christmas-rustic-11': 37, 'christmas-rustic-12': 38,
  'christmas-rustic-13': 39, 'christmas-rustic-14': 40, 'christmas-rustic-15': 42
};

Object.entries(mapping).forEach(([newName, oldNum]) => {
  const oldKey = `christmas-background-${String(oldNum).padStart(2, '0')}`;
  if (urls[oldKey]) {
    urls[newName] = urls[oldKey];
    console.log(`✓ ${newName} → ${oldKey}`);
  }
});

fs.writeFileSync('./cloudinary-urls.json', JSON.stringify(urls, null, 2));
console.log('\n✅ Done! Push and redeploy.');
