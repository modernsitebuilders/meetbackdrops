// Resolves a filename against the canonical manifest and returns
// the pipeline-assigned category + folder. Used by /image-lookup
// so the client never has to infer category from the filename.
import { resolveByAnyExtension } from '../../lib/manifest';

export default function handler(req, res) {
  const filename = String(req.query.filename || '').trim();
  if (!filename) {
    return res.status(400).json({ error: 'filename required' });
  }

  const entry = resolveByAnyExtension(filename);
  if (!entry) {
    return res.status(404).json({ error: 'not in manifest' });
  }

  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  res.status(200).json({
    filename: entry.filename,
    category: entry.category,
    folder: entry.folder,
    slug: entry.slug,
  });
}
