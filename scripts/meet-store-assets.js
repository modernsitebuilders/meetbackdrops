// One-off generator for the Google Workspace Marketplace Store Listing assets
// for the MeetBackdrops Google Meet add-on. Produces icons, the card banner,
// and a 1280x800 product screenshot into ./meet-addon-store-assets/.
// Run: node scripts/meet-store-assets.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(process.cwd(), 'meet-addon-store-assets');
const LOGO = path.join(process.cwd(), 'public', 'web-app-manifest-512x512.png');
const WORDMARK = path.join(process.cwd(), 'public', 'meetbackdrops-wordmark.svg');
const API = 'https://meetbackdrops.com/api/zoom/backgrounds?limit=6';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // --- Icons (32/48/96/128) from the 512 logo, alpha preserved ---
  for (const size of [32, 48, 96, 128]) {
    await sharp(LOGO).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png().toFile(path.join(OUT, `icon-${size}.png`));
  }
  console.log('icons: 32/48/96/128 ✓');

  // --- Card banner 220x140: white card + centered wordmark + gold rule ---
  const wmForBanner = await sharp(WORDMARK).resize({ width: 176 }).png().toBuffer();
  const wmMeta = await sharp(wmForBanner).metadata();
  await sharp({ create: { width: 220, height: 140, channels: 4, background: '#ffffff' } })
    .composite([
      { input: wmForBanner, left: Math.round((220 - wmMeta.width) / 2), top: Math.round((140 - wmMeta.height) / 2) - 6 },
      { input: Buffer.from('<svg width="220" height="140"><rect x="78" y="104" width="64" height="3" rx="1.5" fill="#E0A82E"/></svg>'), left: 0, top: 0 },
    ])
    .png().toFile(path.join(OUT, 'card-banner-220x140.png'));
  console.log('card banner 220x140 ✓');

  // --- Screenshot 1280x800: faithful panel mock with real backdrops ---
  let items = [];
  try {
    const res = await fetch(API);
    items = (await res.json()).items.slice(0, 6);
  } catch (e) {
    console.warn('API fetch failed, using placeholders:', e.message);
  }

  // Download + JPEG-encode thumbnails as base64 (resvg embeds data URIs).
  const tiles = [];
  for (const it of items) {
    try {
      const buf = Buffer.from(await (await fetch(it.thumbUrl)).arrayBuffer());
      const jpg = await sharp(buf).resize(376, 190, { fit: 'cover' }).jpeg({ quality: 86 }).toBuffer();
      tiles.push({ title: it.title, data: jpg.toString('base64') });
    } catch (e) {
      tiles.push({ title: it.title || 'Backdrop', data: null });
    }
  }
  while (tiles.length < 6) tiles.push({ title: 'Backdrop', data: null });

  const wmHeader = await sharp(WORDMARK).resize({ width: 300 }).png().toBuffer();
  const wmH = (await sharp(wmHeader).metadata()).height;

  const PAD = 48, COLW = 376, GAP = 28, IMGH = 190, BODYH = 66;
  const cols = [PAD, PAD + COLW + GAP, PAD + 2 * (COLW + GAP)];
  const rows = [210, 210 + IMGH + BODYH + 24];

  let clips = '', tilesSvg = '';
  tiles.forEach((t, i) => {
    const x = cols[i % 3], y = rows[Math.floor(i / 3)];
    const id = `clip${i}`;
    clips += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${COLW}" height="${IMGH}" rx="10"/></clipPath>`;
    tilesSvg += `<rect x="${x}" y="${y}" width="${COLW}" height="${IMGH + BODYH}" rx="10" fill="#ffffff" stroke="#e5e7eb"/>`;
    if (t.data) {
      tilesSvg += `<image x="${x}" y="${y}" width="${COLW}" height="${IMGH}" href="data:image/jpeg;base64,${t.data}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
    } else {
      tilesSvg += `<rect x="${x}" y="${y}" width="${COLW}" height="${IMGH}" rx="10" fill="#e5e7eb"/>`;
    }
    tilesSvg += `<text x="${x + 18}" y="${y + IMGH + 28}" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="600" fill="#111827">${esc((t.title || '').slice(0, 34))}</text>`;
    tilesSvg += `<rect x="${x + 18}" y="${y + IMGH + 40}" width="104" height="22" rx="5" fill="#111827"/>`;
    tilesSvg += `<text x="${x + 70}" y="${y + IMGH + 55}" font-family="Helvetica,Arial,sans-serif" font-size="12" font-weight="600" fill="#ffffff" text-anchor="middle">Download</text>`;
  });

  const svg = `<svg width="1280" height="800" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>${clips}</defs>
    <rect width="1280" height="800" fill="#F5F5F5"/>
    <image x="${PAD}" y="44" width="300" height="${wmH}" href="data:image/png;base64,${wmHeader.toString('base64')}"/>
    <rect x="1054" y="52" width="178" height="34" rx="17" fill="#ffffff" stroke="#e5e7eb"/>
    <circle cx="1078" cy="69" r="4" fill="#16a34a"/>
    <text x="1090" y="74" font-family="Helvetica,Arial,sans-serif" font-size="14" font-weight="600" fill="#15803d">Connected to Meet</text>
    <rect x="${PAD}" y="128" width="1184" height="56" rx="8" fill="#ffffff" stroke="#bbf7d0"/>
    <text x="68" y="161" font-family="Helvetica,Arial,sans-serif" font-size="15" fill="#166534"><tspan font-weight="700">How to apply:</tspan> download a backdrop, then in Meet open ⋮ More options → Apply visual effects → ＋ Add a background.</text>
    ${tilesSvg}
  </svg>`;

  await sharp(Buffer.from(svg)).flatten({ background: '#F5F5F5' }).png().toFile(path.join(OUT, 'screenshot-1280x800.png'));
  console.log('screenshot 1280x800 ✓ (' + tiles.filter(t => t.data).length + ' real backdrops)');

  console.log('\nAll assets written to', OUT);
  for (const f of fs.readdirSync(OUT)) {
    const m = await sharp(path.join(OUT, f)).metadata();
    console.log(`  ${f}  ${m.width}x${m.height}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
