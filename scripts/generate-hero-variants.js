// Generate responsive variants of the homepage hero collage images.
// The hero grid renders each cell at ~328px wide on desktop and ~116px wide
// on mobile, so the original 1456w files are 4–5× oversized. This produces
// 400w and 700w webp variants so srcset can pick the right size.

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const HERO_DIR = path.join(__dirname, '..', 'public', 'images', 'hero');
const TARGETS = [400, 700];

async function main() {
  const files = fs
    .readdirSync(HERO_DIR)
    .filter((f) => f.endsWith('.webp'))
    .filter((f) => !/-\d+w\.webp$/.test(f));

  for (const file of files) {
    const base = file.replace(/\.webp$/, '');
    const input = path.join(HERO_DIR, file);
    for (const width of TARGETS) {
      const output = path.join(HERO_DIR, `${base}-${width}w.webp`);
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(output);
      const { size } = fs.statSync(output);
      console.log(`${path.basename(output)}  ${(size / 1024).toFixed(1)} KB`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
