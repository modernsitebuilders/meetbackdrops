// Score calculation for the full image library.
//
// Category is resolved from the canonical manifest by filename; the
// analytics normalizer only handles legacy category names from
// Sheets rows where the filename itself is not in the manifest (a
// rare edge case). No filename-shape inference occurs here.

import { google } from 'googleapis';
import { getAll, resolveByAnyExtension } from '../../lib/manifest';
import { normalizeAnalyticsCategory, isDownloadEvent } from '../../lib/analyticsNormalize';

const RESET_DATE = new Date('2026-01-25');

let cachedScores = null;
let lastCalculated = null;

export default async function handler(req, res) {
  try {
    if (cachedScores && lastCalculated && (Date.now() - lastCalculated < 3600000)) {
      return res.status(200).json({
        message: 'Returning cached scores',
        cached: true,
        calculatedAt: new Date(lastCalculated).toISOString(),
        scores: cachedScores
      });
    }

    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const allImagesData = getAll();

    let staticScores = {};
    try {
      const staticData = require('../../public/data/image-scores-static.json');
      staticScores = staticData.scores || {};
    } catch (e) {
      // Static file unavailable — fall back to neutral baseline.
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
    });

    const rows = response.data.values || [];
    const now = new Date();

    // Display names for the category column in response summaries. Not
    // used for classification; just a label lookup keyed by canonical slug.
    const categoryNames = {
      'bookshelves': 'Bookshelves',
      'wall-shelves': 'Wall Shelves',
      'office-spaces': 'Office Spaces',
      'home-office': 'Home Offices',
      'living-rooms': 'Living Rooms',
      'kitchens': 'Kitchens',
      'coffee-shops': 'Coffee Shops',
      'art-galleries': 'Art Galleries',
      'urban-lofts': 'Urban Lofts',
      'gardens-patios': 'Gardens & Patios',
      'historic-spaces': 'Historic Spaces',
      'nature-landscapes': 'Nature & Landscapes',
      'libraries': 'Libraries',
      'christmas-backgrounds': 'Christmas Backgrounds',
      'halloween-backgrounds': 'Halloween Backgrounds',
      'valentines-backgrounds': "Valentine's Backgrounds",
      'easter-backgrounds': 'Easter Backgrounds',
      'spring-backgrounds': 'Spring Backgrounds',
      'summer-backgrounds': 'Summer Backgrounds',
      'bokeh-backgrounds': 'Bokeh Backgrounds'
    };

    const imageStats = {};

    // Seed stats for every manifest image so scoring covers the full library.
    allImagesData.forEach((image) => {
      const category = image.category;
      const categoryDisplayName = categoryNames[category] || category;

      imageStats[image.filename] = {
        category: categoryDisplayName,
        categorySlug: category,
        folder: image.folder || category,
        downloads: 0,
        firstSeen: now,
        lastDownload: null,
        recentDownloads: 0,
        score: 0
      };
    });

    rows.slice(1).forEach(row => {
      const timestamp = row[0];
      const eventType = row[1];
      let filename = row[3];

      if (!filename) return;

      if (filename.startsWith('MeetBackdrops-')) {
        filename = filename.replace('MeetBackdrops-', '');
      } else if (filename.startsWith('StreamBackdrops-')) {
        filename = filename.replace('StreamBackdrops-', '');
      }

      if (filename.startsWith('/') ||
          filename.includes('/category/') ||
          filename.includes('/blog') ||
          filename.includes('/contact') ||
          filename.includes('/about') ||
          !filename.match(/\.(webp|jpg|jpeg|png)$/i)) {
        return;
      }

      // Resolve the manifest entry by filename; reject rows whose
      // filename does not correspond to a real image. Category is
      // never inferred from filename shape.
      const manifestEntry = resolveByAnyExtension(filename);
      if (!manifestEntry) return;
      const matchedFilename = manifestEntry.filename;

      const eventDate = new Date(timestamp);

      if (eventDate < imageStats[matchedFilename].firstSeen) {
        imageStats[matchedFilename].firstSeen = eventDate;
      }

      if (eventDate < RESET_DATE) return;

      if (isDownloadEvent(eventType)) {
        imageStats[matchedFilename].downloads += 1;

        if (!imageStats[matchedFilename].lastDownload || eventDate > imageStats[matchedFilename].lastDownload) {
          imageStats[matchedFilename].lastDownload = eventDate;
        }

        const daysSinceEvent = (now - eventDate) / (1000 * 60 * 60 * 24);
        if (daysSinceEvent <= 30) {
          imageStats[matchedFilename].recentDownloads += 1;
        }
      }
    });

    Object.keys(imageStats).forEach(filename => {
      const stats = imageStats[filename];

      let score;

      if (stats.downloads === 0) {
        const baseName = filename.replace(/\.(webp|png|jpg|jpeg)$/i, '');
        const staticEntry = staticScores[filename]
          || staticScores[`${baseName}.webp`]
          || staticScores[`${baseName}.png`];
        const baseScore = staticEntry?.score ?? 30;

        const startDate = stats.firstSeen < RESET_DATE ? RESET_DATE : stats.firstSeen;
        const monthsOld = (now - startDate) / (1000 * 60 * 60 * 24 * 30);
        score = Math.max(0, baseScore - Math.floor(monthsOld) * 2);
      } else {
        score = 30;
        score += (stats.downloads * 10);

        if (stats.lastDownload) {
          const monthsSinceDownload = (now - stats.lastDownload) / (1000 * 60 * 60 * 24 * 30);
          score -= Math.floor(monthsSinceDownload) * 5;
        }
      }

      stats.score = score;
      stats.daysOld = Math.floor((now - stats.firstSeen) / (1000 * 60 * 60 * 24));
      stats.daysSinceLastDownload = stats.lastDownload
        ? Math.floor((now - stats.lastDownload) / (1000 * 60 * 60 * 24))
        : null;

      stats.flaggedForRemoval = score === 0;
    });

    cachedScores = imageStats;
    lastCalculated = Date.now();

    const summary = {
      totalImages: Object.keys(imageStats).length,
      zeroDownloads: Object.values(imageStats).filter(s => s.downloads === 0).length,
      flaggedForRemoval: Object.values(imageStats).filter(s => s.flaggedForRemoval).length,
      topPerformers: Object.entries(imageStats)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 10)
        .map(([filename, stats]) => ({
          filename,
          category: stats.category,
          score: stats.score,
          downloads: stats.downloads
        })),
      bottomPerformers: Object.entries(imageStats)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 10)
        .map(([filename, stats]) => ({
          filename,
          category: stats.category,
          score: stats.score,
          downloads: stats.downloads,
          daysOld: stats.daysOld
        }))
    };

    res.status(200).json({
      message: 'Scores calculated successfully',
      cached: false,
      calculatedAt: new Date(lastCalculated).toISOString(),
      scores: imageStats,
      summary
    });

  } catch (error) {
    console.error('Error calculating scores:', error);
    res.status(500).json({ error: 'Failed to calculate scores', details: error.message });
  }
}
