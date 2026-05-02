// pages/api/cron/update-popular.js
//
// Aggregates download events from Google Sheets and writes the top 25
// to the PopularCache tab. Category for each image is resolved from
// the canonical manifest via filename — never from filename parsing.
// Legacy category strings in the Sheets "category" column (pre-rename
// names like 'ambient-lighting') are normalized via the analytics
// normalizer as a fallback when the filename doesn't resolve.

import { google } from 'googleapis';
import { calculateImageScore } from '../../../lib/imageScoring';
import { resolveByAnyExtension, getAll } from '../../../lib/manifest';
import { normalizeAnalyticsCategory, isDownloadEvent } from '../../../lib/analyticsNormalize';

const RESET_DATE = new Date('2026-01-25');

function cleanFilename(filename) {
  if (!filename) return null;

  let clean = filename;
  if (clean.startsWith('MeetBackdrops-')) {
    clean = clean.replace('MeetBackdrops-', '');
  }

  if (clean.startsWith('/') ||
      clean.includes('/category/') ||
      clean.includes('/blog') ||
      clean.includes('/contact') ||
      clean.includes('/about') ||
      !clean.match(/\.(webp|png|jpg|jpeg)$/i)) {
    return null;
  }

  return clean;
}

function toWebpFilename(filename) {
  return filename.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('Starting popular cache update at', new Date().toISOString());

  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('GOOGLE_PRIVATE_KEY environment variable is missing');
    }

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

    console.log('Fetching data from Google Sheets...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:O',
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} rows in Google Sheets`);

    const imageStats = {};
    const now = new Date();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const timestamp = row[0];
      const eventType = row[1];
      const filename = row[3];
      const rawCategory = row[4];

      const cleanName = cleanFilename(filename);
      if (!cleanName || !isDownloadEvent(eventType)) continue;

      const eventDate = new Date(timestamp);
      if (eventDate < RESET_DATE) continue;

      // Canonical category: manifest first, analytics normalizer as a
      // fallback for rows whose filename doesn't appear in the manifest.
      const manifestEntry = resolveByAnyExtension(cleanName);
      const category = manifestEntry
        ? manifestEntry.category
        : normalizeAnalyticsCategory(rawCategory);
      if (!category) continue;

      const key = manifestEntry ? manifestEntry.filename : cleanName;

      if (!imageStats[key]) {
        imageStats[key] = {
          filename: key,
          category,
          downloads: 0,
          lastDownload: null,
        };
      }

      const stats = imageStats[key];
      stats.downloads += 1;
      if (!stats.lastDownload || eventDate > stats.lastDownload) {
        stats.lastDownload = eventDate;
      }
    }

    console.log(`Processed ${Object.keys(imageStats).length} unique images with downloads`);

    console.log('Calculating scores...');
    const scoredImages = Object.values(imageStats).map(item => {
      const imageData = {
        createdDate: RESET_DATE,
        totalDownloads: item.downloads,
        lastDownload: item.lastDownload
      };

      const score = calculateImageScore(imageData, now);
      const webFilename = toWebpFilename(item.filename);
      const manifestEntry = resolveByAnyExtension(webFilename);
      const pathFolder = manifestEntry?.folder || item.category;

      return {
        filename: webFilename,
        originalFilename: item.filename,
        category: item.category,
        downloadCount: item.downloads,
        score,
        lastDownload: item.lastDownload,
        webPath: `https://assets.streambackdrops.com/webp/${pathFolder}/${webFilename}`
      };
    });

    const EXCLUDED_CATEGORIES = [
      'valentines-backgrounds',
      'christmas-backgrounds',
      'halloween-backgrounds',
      'easter-backgrounds'
    ];

    const allImagesArray = getAll();
    const allImagesData = {};
    allImagesArray.forEach(img => { allImagesData[img.filename] = img; });
    const topImages = scoredImages
      .filter(img => {
        const meta = allImagesData[img.filename] || allImagesData[img.originalFilename];
        if (meta?.hdOnly) return false;
        if (EXCLUDED_CATEGORIES.includes(img.category)) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.downloadCount !== a.downloadCount) return b.downloadCount - a.downloadCount;
        if (a.lastDownload && b.lastDownload) return new Date(b.lastDownload) - new Date(a.lastDownload);
        return 0;
      })
      .slice(0, 25);

    console.log(`Top image: ${topImages[0]?.filename} with score ${topImages[0]?.score}`);

    const sheetData = [
      ['=== POPULAR IMAGES CACHE ==='],
      ['Last Updated', new Date().toISOString()],
      ['Total Images Processed', scoredImages.length],
      ['Average Score', scoredImages.length ? Math.round(scoredImages.reduce((sum, img) => sum + img.score, 0) / scoredImages.length) : 0],
      [''],
      ['Rank', 'Web Filename', 'Category', 'Score', 'Downloads', 'Last Download', 'Web Path']
    ];

    topImages.forEach((img, index) => {
      sheetData.push([
        index + 1,
        img.filename,
        img.category,
        img.score,
        img.downloadCount,
        img.lastDownload ? new Date(img.lastDownload).toISOString() : 'Never',
        img.webPath
      ]);
    });

    console.log('Writing to Google Sheets...');

    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'PopularCache!A1:Z1000'
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'PopularCache!A1',
      valueInputOption: 'RAW',
      resource: { values: sheetData }
    });

    const metadata = {
      lastUpdated: new Date().toISOString(),
      totalImages: scoredImages.length,
      topImage: topImages[0]?.filename || '',
      topScore: topImages[0]?.score || 0,
      topImages: topImages.map(img => ({
        rank: topImages.indexOf(img) + 1,
        filename: img.filename,
        category: img.category,
        score: img.score,
        downloads: img.downloadCount,
        lastDownload: img.lastDownload ? new Date(img.lastDownload).toISOString() : null,
        webPath: img.webPath
      }))
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'PopularCache!A30',
      valueInputOption: 'RAW',
      resource: { values: [['=== JSON VERSION ==='], [JSON.stringify(metadata, null, 2)]] }
    });

    try {
      const fs = await import('fs');
      const path = await import('path');
      const cacheData = {
        lastUpdated: new Date().toISOString(),
        images: topImages,
        source: 'google-sheets-backup'
      };

      const tmpPath = path.join('/tmp', 'popular-cache.json');
      fs.writeFileSync(tmpPath, JSON.stringify(cacheData, null, 2));
      console.log('Backup written to /tmp');
    } catch (tmpError) {
      console.warn('Could not write backup to /tmp:', tmpError.message);
    }

    res.status(200).json({
      success: true,
      updated: new Date().toISOString(),
      domain: 'streambackdrops.com',
      recordsProcessed: scoredImages.length,
      topScore: topImages[0]?.score || 0,
      topImage: topImages[0]?.filename || 'None',
      sheetUrl: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit#gid=0`,
      message: 'Popular cache updated in Google Sheets successfully'
    });

  } catch (error) {
    console.error('Error updating popular cache:', error);
    res.status(500).json({
      error: error.message,
      domain: 'streambackdrops.com',
      timestamp: new Date().toISOString(),
      hint: 'Check Google Sheets API permissions and ensure "PopularCache" sheet exists'
    });
  }
}
