// consolidate-analytics.js
// Manual archive endpoint. Call POST /api/consolidate-analytics to immediately
// move old Analytics rows to Analytics_Archive, keeping the last KEEP_ROWS rows.
// This runs automatically from track-download.js when rows exceed 18,000,
// but can also be triggered manually at any time.

import { google } from 'googleapis';

const KEEP_ROWS = 10000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    if (allRows.length <= KEEP_ROWS + 1) {
      return res.status(200).json({
        message: 'No archive needed',
        currentRows: allRows.length,
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

    // Append old rows to Archive
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Analytics_Archive!A:P',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: rowsToArchive }
    });

    // Rewrite Analytics with only header + recent rows
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: 'Analytics!A:P' });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Analytics!A1',
      valueInputOption: 'RAW',
      resource: { values: [header, ...rowsToKeep] }
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
