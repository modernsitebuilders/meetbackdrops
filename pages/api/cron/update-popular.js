// pages/api/cron/update-popular.js
//
// Aggregates download events from Google Sheets and writes the top 25
// to the PopularCache tab. Only downloads whose filename resolves in the
// canonical manifest are counted; category and R2 folder come from that
// manifest entry, never from filename parsing. Because the Wave 2
// migration renamed every file to the slug+hash format, this naturally
// excludes all pre-migration activity (old {category}-NN filenames no
// longer resolve) — the popular page reflects the current catalog only.

import { google } from 'googleapis';
import { calculateImageScore } from '../../../lib/imageScoring';
import { resolveByAnyExtension, getAll } from '../../../lib/manifest';
import { isDownloadEvent } from '../../../lib/analyticsNormalize';

const RESET_DATE = new Date('2026-01-25');

function cleanFilename(filename) {
  if (!filename) return null;

  let clean = filename;
  if (clean.startsWith('MeetBackdrops-')) {
    clean = clean.replace('MeetBackdrops-', '');
  } else if (clean.startsWith('StreamBackdrops-')) {
    clean = clean.replace('StreamBackdrops-', '');
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

      const cleanName = cleanFilename(filename);
      if (!cleanName || !isDownloadEvent(eventType)) continue;

      const eventDate = new Date(timestamp);
      if (eventDate < RESET_DATE) continue;

      // Only count downloads that resolve to a CURRENT catalog image.
      // Pre-migration rows (old {category}-NN filenames) no longer resolve
      // and are dropped. Category and R2 folder always come from the
      // manifest entry — never inferred from filename parsing.
      const manifestEntry = resolveByAnyExtension(cleanName);
      if (!manifestEntry) continue;

      const key = manifestEntry.filename;

      if (!imageStats[key]) {
        imageStats[key] = {
          filename: key,
          category: manifestEntry.category,
          folder: manifestEntry.folder || manifestEntry.category,
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

      return {
        filename: webFilename,
        originalFilename: item.filename,
        category: item.category,
        downloadCount: item.downloads,
        score,
        lastDownload: item.lastDownload,
        webPath: `https://assets.streambackdrops.com/webp/${item.folder}/${webFilename}`
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
      domain: 'meetbackdrops.com',
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
      domain: 'meetbackdrops.com',
      timestamp: new Date().toISOString(),
      hint: 'Check Google Sheets API permissions and ensure "PopularCache" sheet exists'
    });
  }
}
