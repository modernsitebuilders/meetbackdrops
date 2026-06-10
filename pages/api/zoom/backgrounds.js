import path from 'path';
import fs from 'fs';
import { HD_BASE_IDS } from '../../../lib/hdProducts';

const R2_BASE = 'https://assets.streambackdrops.com';

let cached = null;
function loadManifest() {
  if (cached) return cached;
  const file = path.join(process.cwd(), 'image-pipeline', 'final_manifest.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf8'));
  return cached;
}

export default function handler(req, res) {
  const { category, limit, offset } = req.query;
  const cap = Math.min(Number(limit) || 24, 60);
  const skip = Math.max(Number(offset) || 0, 0);
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `${proto}://${host}`;

  const manifest = loadManifest();
  const filtered = (category
    ? manifest.filter((m) => m.category === category)
    : manifest
  ).filter((m) => !m.hdOnly);

  // When no category is requested, round-robin across categories so the first
  // grid shows the breadth of the catalog instead of 24 of the same category.
  const ordered = category ? filtered : roundRobinByCategory(filtered);

  const items = ordered.slice(skip, skip + cap).map((m) => ({
    id: m.slug,
    title: m.title.split('—')[0].trim(),
    category: m.category,
    // fileUrl must be on the Home URL domain — Zoom's Apps SDK image
    // downloader is gated on the Domain Allow List, and adding extra
    // domains there triggers a review that isn't active in dev mode.
    // Same-origin proxy at /api/zoom/img/[slug] streams the R2 bytes.
    fileUrl: `${origin}/api/zoom/img/${m.slug}.png`,
    thumbUrl: `${R2_BASE}/webp/${m.folder}/${m.image_webp}`,
    isHd: HD_BASE_IDS.has(m.slug),
  }));

  // Build category list with counts (from the full free catalog, not just the slice)
  const catCounts = new Map();
  for (const m of manifest.filter((m) => !m.hdOnly)) {
    catCounts.set(m.category, (catCounts.get(m.category) || 0) + 1);
  }
  const LABELS = {
    'office-spaces': 'Office',
    'home-office': 'Home Office',
    'bookshelves': 'Bookshelves',
    'wall-shelves': 'Wall Shelves',
    'libraries': 'Libraries',
    'living-rooms': 'Living Rooms',
    'kitchens': 'Kitchens',
    'nature-landscapes': 'Nature',
    'gardens-patios': 'Gardens',
    'urban-lofts': 'Urban Lofts',
    'coffee-shops': 'Coffee Shops',
    'art-galleries': 'Art Galleries',
    'historic-spaces': 'Historic',
    'neutral-backgrounds': 'Neutral',
    'bokeh-backgrounds': 'Bokeh',
    'christmas-backgrounds': 'Christmas',
    'easter-backgrounds': 'Easter',
    'halloween-backgrounds': 'Halloween',
    'spring-backgrounds': 'Spring',
    'summer-backgrounds': 'Summer',
    'valentines-backgrounds': 'Valentine\'s',
  };
  const categories = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({ slug, label: LABELS[slug] || slug, count }));

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json({ items, total: filtered.length, categories });
}

function roundRobinByCategory(entries) {
  const buckets = new Map();
  for (const e of entries) {
    if (!buckets.has(e.category)) buckets.set(e.category, []);
    buckets.get(e.category).push(e);
  }
  const queues = [...buckets.values()];
  const out = [];
  let alive = true;
  while (alive) {
    alive = false;
    for (const q of queues) {
      if (q.length) {
        out.push(q.shift());
        alive = true;
      }
    }
  }
  return out;
}
