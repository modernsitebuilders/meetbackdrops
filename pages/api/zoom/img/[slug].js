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

// Same-origin proxy for Zoom Apps. The Zoom Apps iframe CSP and the
// Apps SDK's image downloader are both pinned to the Home URL domain
// unless extra domains are approved on the Marketplace listing. By
// serving the PNG bytes from meetbackdrops.com we sidestep the allow
// list entirely.
export default async function handler(req, res) {
  const raw = req.query.slug || '';
  const slug = String(raw).replace(/\.png$/i, '');
  if (!slug || !/^[a-z0-9-]+$/i.test(slug)) {
    return res.status(400).send('bad slug');
  }
  const manifest = loadManifest();
  const entry = manifest.find((m) => m.slug === slug);
  if (!entry) return res.status(404).send('not found');

  const upstream = `${R2_BASE}/${entry.slug}.png`;
  const r = await fetch(upstream);
  if (!r.ok) return res.status(r.status).send('upstream error');

  res.setHeader('Content-Type', r.headers.get('content-type') || 'image/png');
  const len = r.headers.get('content-length');
  if (len) res.setHeader('Content-Length', len);
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

  const reader = r.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(Buffer.from(value));
  }
  res.end();
}
