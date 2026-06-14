// consolidate-analytics.js
// Archive endpoint. Lets the Analytics sheet grow to ARCHIVE_THRESHOLD data
// rows, then moves the oldest rows to Analytics_Archive, keeping the most
// recent KEEP_ROWS. Runs weekly via Vercel cron (Sundays 4am UTC, see
// vercel.json) and can also be triggered manually from the admin panel via POST.

import { google } from 'googleapis';

// Let the sheet fill to ARCHIVE_THRESHOLD before doing anything, then trim back
// down to KEEP_ROWS. These MUST stay distinct — using one value for both makes
// the sheet archive every time it exceeds the floor (the old 10k bug) instead of
// only when it reaches the high-water mark.
const ARCHIVE_THRESHOLD = 20000; // archive only once data rows reach this
const KEEP_ROWS = 10000;         // most-recent rows retained after an archive

export default async function handler(req, res) {
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const isAuthorized = req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;

  if (req.method !== 'POST' && !isVercelCron && !isAuthorized) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Read all Analytics data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Analytics!A:P'
    });

    const allRows = response.data.values || [];

    // allRows includes the header row, so data rows = allRows.length - 1.
    const dataRowCount = allRows.length - 1;
    if (dataRowCount < ARCHIVE_THRESHOLD) {
      return res.status(200).json({
        message: 'No archive needed',
        currentDataRows: Math.max(0, dataRowCount),
        archiveThreshold: ARCHIVE_THRESHOLD,
        keepRows: KEEP_ROWS
      });
    }

    const header = allRows[0];
    const dataRows = allRows.slice(1);
    const rowsToArchive = dataRows.slice(0, dataRows.length - KEEP_ROWS);
    const rowsToKeep = dataRows.slice(dataRows.length - KEEP_ROWS);

    console.log(`📦 Manual archive: moving ${rowsToArchive.length} rows, keeping ${rowsToKeep.length}`);

    // Check if Analytics_Archive sheet exists
    const spreadsheetMeta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });
    const archiveExists = spreadsheetMeta.data.sheets.some(
      s => s.properties.title === 'Analytics_Archive'
    );

    if (!archiveExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests: [{ addSheet: { properties: { title: 'Analytics_Archive' } } }] }
      });
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Analytics_Archive!A1',
        valueInputOption: 'RAW',
        resource: { values: [header] }
      });
      console.log('📦 Created Analytics_Archive sheet');
    }

    // Append old rows to Archive FIRST (safe — Analytics untouched until this succeeds)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Analytics_Archive!A:P',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rowsToArchive }
    });

    // Get the Analytics sheet ID for deleteDimension
    const sheetIdMeta = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });
    const analyticsSheetId = sheetIdMeta.data.sheets.find(
      s => s.properties.title === 'Analytics'
    )?.properties.sheetId;

    // Delete old rows from Analytics — safe because if this fails, Analytics still has all data.
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: analyticsSheetId,
              dimension: 'ROWS',
              startIndex: 1,                      // row after header (0-indexed)
              endIndex: rowsToArchive.length + 1  // exclusive
            }
          }
        }]
      }
    });

    console.log(`✅ Manual archive complete.`);

    return res.status(200).json({
      success: true,
      rowsArchived: rowsToArchive.length,
      rowsKept: rowsToKeep.length,
      analyticsNowHas: rowsToKeep.length + 1
    });

  } catch (error) {
    console.error('Archive failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
