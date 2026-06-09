import path from 'path';
import fs from 'fs';

const R2_BASE = 'https://assets.streambackdrops.com';

let cached = null;
function loadManifest() {
  if (cached) return cached;
  const file = path.join(process.cwd(), 'image-pipeline', 'final_manifest.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf8'));
  return cached;
}

export default function handler(req, res) {
  const { category, limit } = req.query;
  const cap = Math.min(Number(limit) || 24, 60);

  const manifest = loadManifest();
  const filtered = (category
    ? manifest.filter((m) => m.category === category)
    : manifest
  ).filter((m) => !m.hdOnly);

  // When no category is requested, round-robin across categories so the first
  // grid shows the breadth of the catalog instead of 24 of the same category.
  const ordered = category ? filtered : roundRobinByCategory(filtered);

  const items = ordered.slice(0, cap).map((m) => ({
    id: m.slug,
    title: m.title.split('—')[0].trim(),
    category: m.category,
    // The Zoom Apps SDK setVirtualBackground needs a downloadable image file.
    // PNGs live at the R2 root keyed by slug; the manifest's `download_png`
    // is stale pre-Wave-2 data pointing at filenames purged from R2.
    fileUrl: `${R2_BASE}/${m.slug}.png`,
    thumbUrl: `${R2_BASE}/webp/${m.folder}/${m.image_webp}`,
  }));

  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.status(200).json({ items, total: filtered.length });
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
