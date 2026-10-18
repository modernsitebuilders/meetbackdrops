// pages/api/popular/images.js
//
// Top 25 images for /most-popular, ranked by the same site-wide popularity
// every grid uses (lib/popularity.js; recency-weighted downloads, refreshed
// daily from Neon into public/data/image-scores-static.json). This list ranks
// by raw popularity only — the new-image tier exists to give unproven images
// grid exposure, not to put them on a "most popular" list.

import fs from 'fs';
import path from 'path';
import { getAll } from '../../../lib/manifest';

const LIMIT = 25;

export default function handler(req, res) {
  try {
    const file = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'public', 'data', 'image-scores-static.json'), 'utf8'));
    const scores = file.scores || {};

    const images = getAll()
      .map((img) => ({ img, s: scores[img.filename] }))
      .filter(({ s }) => s && s.popularity > 0)
      .sort((a, b) => b.s.popularity - a.s.popularity)
      .slice(0, LIMIT)
      .map(({ img, s }, i) => ({
        rank: i + 1,
        filename: img.filename,
        title: img.title || null,
        category: img.category,
        score: s.popularity,
        downloads: s.downloads30d,
        lastDownload: s.lastDownload,
        webPath: `https://assets.streambackdrops.com/webp/${img.folder || img.category}/${img.filename}`,
      }));

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      success: true,
      lastUpdated: file.generatedAt || null,
      totalImages: Object.keys(scores).length,
      images,
    });
  } catch (error) {
    console.error('Error reading popularity scores:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch popular images', details: error.message });
  }
}
