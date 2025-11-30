const fs = require('fs');

const mapping = {
  1: 'christmas-traditional-01', 7: 'christmas-traditional-02', 8: 'christmas-traditional-03',
  9: 'christmas-traditional-04', 19: 'christmas-traditional-05', 21: 'christmas-traditional-06',
  26: 'christmas-traditional-07', 29: 'christmas-traditional-08', 35: 'christmas-traditional-09',
  41: 'christmas-traditional-10', 4: 'christmas-modern-01', 5: 'christmas-modern-02',
  10: 'christmas-modern-03', 11: 'christmas-modern-04', 13: 'christmas-modern-05',
  14: 'christmas-modern-06', 15: 'christmas-modern-07', 16: 'christmas-modern-08',
  18: 'christmas-modern-09', 20: 'christmas-modern-10', 24: 'christmas-modern-11',
  25: 'christmas-modern-12', 28: 'christmas-modern-13', 32: 'christmas-modern-14',
  33: 'christmas-modern-15', 34: 'christmas-modern-16', 43: 'christmas-modern-17',
  44: 'christmas-modern-18', 2: 'christmas-rustic-01', 3: 'christmas-rustic-02',
  12: 'christmas-rustic-03', 17: 'christmas-rustic-04', 22: 'christmas-rustic-05',
  23: 'christmas-rustic-06', 27: 'christmas-rustic-07', 30: 'christmas-rustic-08',
  31: 'christmas-rustic-09', 36: 'christmas-rustic-10', 37: 'christmas-rustic-11',
  38: 'christmas-rustic-12', 39: 'christmas-rustic-13', 40: 'christmas-rustic-14',
  42: 'christmas-rustic-15'
};

fs.writeFileSync('./christmas-filename-mapping.json', JSON.stringify(mapping, null, 2));
console.log('✓ Mapping saved');

const csv = fs.readFileSync('./stream backdrops - Analytics (12).csv', 'utf8');
let updated = csv;

Object.entries(mapping).forEach(([oldNum, newName]) => {
  const oldName = `christmas-background-${String(oldNum).padStart(2, '0')}`;
  const regex = new RegExp(oldName, 'g');
  updated = updated.replace(regex, newName);
});

fs.writeFileSync('./stream_backdrops_Analytics_UPDATED.csv', updated);
console.log('✓ Updated CSV saved');
