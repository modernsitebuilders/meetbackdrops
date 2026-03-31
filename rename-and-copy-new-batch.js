// rename-and-copy-new-batch.js
// Sorts new PNG files alphabetically, renames them sequentially,
// copies to ~/Desktop/new-pngs/{category}/

const fs = require('fs');
const path = require('path');

const HOME = process.env.HOME;
const DOWNLOADS = path.join(HOME, 'Downloads');
const NEW_PNGS_BASE = path.join(HOME, 'Desktop/new-pngs');

const batches = [
  {
    category: 'bookshelves-bright',
    startAt: 43,
    pattern: /streambackdrops_Professional_photography_of_(airy_bright|bright_S|bright_c|bright_h|bright_l|bright_m|bright_t|cheerful|modern_home_libra|sunny)/,
  },
  {
    category: 'office-spaces',
    startAt: 105,
    pattern: /streambackdrops_Professional_photography_of_(executive_office|luxury_office|modern_executive|modern_law|upscale_office)/,
  },
];

function padNum(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

for (const { category, startAt, pattern } of batches) {
  const destDir = path.join(NEW_PNGS_BASE, category);
  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(DOWNLOADS)
    .filter(f => f.endsWith('.png') && pattern.test(f))
    .sort();

  console.log(`\n${category}: ${files.length} files → starting at ${startAt}`);

  files.forEach((file, i) => {
    const num = startAt + i;
    const newName = `${category}-${padNum(num)}.png`;
    const src = path.join(DOWNLOADS, file);
    const dest = path.join(destDir, newName);
    fs.copyFileSync(src, dest);
    console.log(`  ${file.slice(0, 60)}... → ${newName}`);
  });

  console.log(`  ✓ ${files.length} files copied to ${destDir}`);
}
