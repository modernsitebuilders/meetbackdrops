// pages/api/calculate-scores.js
//
// Serves the site-wide popularity scores (public/data/image-scores-static.json,
// refreshed daily from Neon by scripts/data-platform/generate-scores.mjs; rules in
// lib/popularity.js) in the shape the /admin/scores dashboard reads. Nothing is
// computed here — every page and this API read the same file, so the dashboard
// shows exactly what the grids sort by.

import fs from 'fs';
import path from 'path';
import { getAll } from '../../lib/manifest';
import { CATEGORIES } from '../../lib/categories-config';
import { daysOnSite } from '../../lib/popularity';

export default function handler(req, res) {
  try {
    const file = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'public', 'data', 'image-scores-static.json'), 'utf8'));
    const all = file.scores || {};
    const now = new Date();

    const scores = {};
    for (const img of getAll()) {
      const s = all[img.filename] || {};
      const days = daysOnSite(img.addedAt, now);
      scores[img.filename] = {
        category: CATEGORIES[img.category]?.name || img.category,
        categorySlug: img.category,
        folder: img.folder || img.category,
        score: Math.round((s.popularity || 0) * 100) / 100,
        rankScore: s.score ?? 0,
        tier: s.tier ?? 0,
        downloads: s.downloads365d || 0,
        recentDownloads: s.downloads30d || 0,
        lastDownload: s.lastDownload || null,
        daysOld: Number.isFinite(days) ? Math.floor(days) : null,
      };
    }

    const values = Object.entries(scores);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      calculatedAt: file.generatedAt || null,
      scores,
      summary: {
        totalImages: values.length,
        zeroDownloads: values.filter(([, s]) => s.downloads === 0).length,
        proven: values.filter(([, s]) => s.tier === 2).length,
        new: values.filter(([, s]) => s.tier === 1).length,
        stale: values.filter(([, s]) => s.tier === 0).length,
      },
    });
  } catch (error) {
    console.error('Error reading scores:', error);
    res.status(500).json({ error: 'Failed to read scores', details: error.message });
  }
}
