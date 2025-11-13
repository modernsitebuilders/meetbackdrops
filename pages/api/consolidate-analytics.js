import { google } from 'googleapis';

export default async function handler(req, res) {
  // You can call this endpoint manually or set up a cron job
  // For security, you might want to add a secret key check
  
  const CONSOLIDATION_THRESHOLD = 20000; // Consolidate when we have more than this many rows
  const ROWS_TO_KEEP_DETAILED = 10000; // Keep the most recent 1000 rows detailed
  
  try {
    // Setup Google Sheets auth
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

    // Read all current data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I'
    });

    const rows = response.data.values;
    
    if (!rows || rows.length <= CONSOLIDATION_THRESHOLD) {
      return res.status(200).json({ 
        message: 'No consolidation needed yet',
        currentRows: rows?.length || 0,
        threshold: CONSOLIDATION_THRESHOLD
      });
    }

    // Separate header, old rows to consolidate, and recent rows to keep
    const header = rows[0]; // First row is your header
    const dataRows = rows.slice(1); // All data rows
    
    const oldRows = dataRows.slice(0, dataRows.length - ROWS_TO_KEEP_DETAILED);
    const recentRows = dataRows.slice(dataRows.length - ROWS_TO_KEEP_DETAILED);

    // Create summary statistics from old rows
    const summary = consolidateRows(oldRows);
    
    // Build new sheet: header + summary rows + recent detailed rows
    const newData = [
      header,
      ...summary,
      ...recentRows
    ];

    // Clear the entire sheet
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I'
    });

    // Write back the consolidated data
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
      valueInputOption: 'RAW',
      resource: {
        values: newData
      }
    });

    res.status(200).json({ 
      success: true,
      originalRows: rows.length,
      consolidatedRows: newData.length,
      oldRowsConsolidated: oldRows.length,
      summaryRowsCreated: summary.length,
      recentRowsKept: recentRows.length
    });
    
  } catch (error) {
    console.error('Consolidation failed:', error);
    res.status(500).json({ error: error.message });
  }
}

function consolidateRows(rows) {
  // Group by date (column H is the date)
  const byDate = {};
  
  rows.forEach(row => {
    const date = row[7] || 'unknown'; // Column H (index 7) is the date
    if (!byDate[date]) {
      byDate[date] = {
        pageViews: 0,
        downloads: 0,
        categories: {},
        filenames: {}
      };
    }
    
    const eventType = row[1]; // Column B is event type
    if (eventType === 'page_view') {
      byDate[date].pageViews++;
    } else if (eventType === 'download') {
      byDate[date].downloads++;
      
      // Track which files were downloaded
      const filename = row[2] || 'unknown';
      byDate[date].filenames[filename] = (byDate[date].filenames[filename] || 0) + 1;
    }
    
    // Track categories
    const category = row[3] || 'n/a';
    byDate[date].categories[category] = (byDate[date].categories[category] || 0) + 1;
  });

  // Convert to summary rows
  const summaryRows = [];
  
  Object.keys(byDate).sort().forEach(date => {
    const stats = byDate[date];
    
    // Add a page view summary row
    if (stats.pageViews > 0) {
      summaryRows.push([
        date,
        'SUMMARY',
        `${stats.pageViews} page views`,
        'all categories',
        'consolidated',
        'n/a',
        'n/a',
        date,
        '00:00:00'
      ]);
    }
    
    // Add a download summary row
    if (stats.downloads > 0) {
      const topFiles = Object.entries(stats.filenames)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([file, count]) => `${file}(${count})`)
        .join(', ');
      
      summaryRows.push([
        date,
        'SUMMARY',
        `${stats.downloads} downloads`,
        Object.keys(stats.categories).join(', '),
        'consolidated',
        'n/a',
        'n/a',
        date,
        '00:00:00'
      ]);
    }
  });
  
  return summaryRows;
}