// Dev-only: saves logo-product approvals from /admin/logo-review into
// data/logoReady.json, which ships with the next commit. Disabled in
// production, where the filesystem is read-only anyway.
import fs from 'fs';
import path from 'path';
import { getProduct } from '../../../lib/products';

const FILE = path.join(process.cwd(), 'data', 'logoReady.json');

export default function handler(req, res) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, action, x, y } = req.body || {};
  if (!slug || !['approve', 'reject', 'reset'].includes(action)) {
    return res.status(400).json({ error: 'slug and action (approve|reject|reset) required' });
  }

  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  delete data.approved[slug];
  data.rejected = data.rejected.filter((s) => s !== slug);

  if (action === 'approve') {
    const clamp = (v) => Math.min(0.95, Math.max(0.05, Number(v)));
    if (!Number.isFinite(Number(x)) || !Number.isFinite(Number(y))) {
      return res.status(400).json({ error: 'approve needs x and y' });
    }
    // Record where the render step finds the base image, so checkout and
    // download never have to load the full manifest at runtime.
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'image-pipeline', 'final_manifest.json'), 'utf8'));
    const entry = manifest.find((e) => e.slug === slug);
    if (!entry) return res.status(400).json({ error: `Unknown slug: ${slug}` });
    const hdProduct = entry.hd ? getProduct(`${slug}-hd`) : null;
    data.approved[slug] = {
      x: +clamp(x).toFixed(3),
      y: +clamp(y).toFixed(3),
      png: entry.download_png,
      ...(hdProduct ? { hdKey: hdProduct.r2File } : {}),
    };
  } else if (action === 'reject') {
    data.rejected.push(slug);
  }

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
  return res.status(200).json(data);
}
