import { google } from 'googleapis';
import crypto from 'crypto';

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + 'salt_streambackdrops').digest('hex').substring(0, 16);
}

export default async function handler(req, res) {
  console.log('📥 Download tracking request received:', {
    method: req.method,
    hasBody: !!req.body,
    filename: req.body?.filename,
    category: req.body?.category,
    timestamp: new Date().toISOString()
  });

  if (req.method !== 'POST') {
    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block tracking from bots, crawlers, and build processes
  const userAgent = req.headers['user-agent'] || '';
  
  const isBot = !userAgent || 
    userAgent.includes('bot') || 
    userAgent.includes('Bot') ||
    userAgent.includes('crawler') || 
    userAgent.includes('spider') ||
    userAgent.includes('Prerender') ||
    userAgent.toLowerCase().startsWith('node') ||
    userAgent.includes('axios') ||
    userAgent.includes('python') ||
    userAgent.includes('curl') ||
    userAgent.includes('wget');

  if (isBot) {
    console.log('🤖 Skipping bot/crawler:', userAgent);
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  // Hash IP for rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
  const hashedIP = hashIP(ip);

  const {
    filename, 
    category,
    sessionId,
    originalReferrer,
    originalUtmSource,
    originalUtmMedium,
    originalUtmCampaign,
    landingPage,
    pageViewsInSession,
    downloadsInSession,
    visitorId,
    visitorType
  } = req.body;
  
  if (!filename) {
    console.log('❌ Missing filename in request');
    return res.status(400).json({ success: false, error: 'Missing filename' });
  }
  
  console.log('📊 Processing download tracking for:', {
    filename,
    category,
    sessionId: sessionId?.substring(0, 10) + '...',
    visitorId: visitorId?.substring(0, 10) + '...',
    visitorType
  });

  const categoryMap = {
    'art-gallery': 'art-galleries',
    'bokeh': 'bokeh-backgrounds',
    'bookshelf': 'bookshelves-dark',
    'office-space': 'office-spaces',
    'historic-space': 'historic-spaces',
    'nature-landscape': 'nature-landscapes',
    'living-room': 'living-rooms',
    'conference-room': 'conference-rooms',
    'coffee-shop': 'coffee-shops',
    'urban-loft': 'urban-lofts',
    'garden': 'gardens-patios',
    'library': 'libraries',
    'kitchen': 'kitchens'
  };
  
  let cleanCategory = category || 'unknown';
  if (cleanCategory.includes('.')) {
    cleanCategory = cleanCategory.replace(/\.webp$/i, '').replace(/\.png$/i, '').replace(/-\d+$/, '');
  }
  
  cleanCategory = categoryMap[cleanCategory] || cleanCategory;
  
  try {
    if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SERVICE_EMAIL || !process.env.GOOGLE_SHEET_ID) {
      console.error('❌ Missing Google Sheets environment variables');
      throw new Error('Google Sheets configuration missing');
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

   console.log('🔍 Checking for duplicates...');
    let duplicateCheckPassed = true;
    let rows = [];
    let totalRows = 0;

    try {
      // Get sheet row count first (fast metadata call, no data transfer)
      const meta = await sheets.spreadsheets.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        ranges: ['Analytics'],
        includeGridData: false,
        fields: 'sheets.properties.gridProperties.rowCount,sheets.properties.title'
      });
      // gridProperties.rowCount = total grid rows (includes empty rows), used only to
      // compute startRow for the windowed read. The actual data row count is set below.
      const gridRows = meta.data.sheets?.find(s => s.properties.title === 'Analytics')
        ?.properties.gridProperties.rowCount || 0;
      totalRows = gridRows; // temporary — overwritten with actual data count after reading

      // Read only the last 3,500 rows (~35 days at current volume) instead of all 18k+
      const ROWS_TO_READ = 3500;
      const startRow = Math.max(2, totalRows - ROWS_TO_READ);
      console.log(`📊 Reading rows ${startRow}–${totalRows} of Analytics (${totalRows - startRow} rows)`);

      const recentData = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `Analytics!A${startRow}:P`,
      });

      rows = recentData.data.values || [];
      // Use actual data row count instead of gridProperties.rowCount (which includes empty rows
      // and stays inflated after archives, causing spurious re-triggers)
      totalRows = (startRow - 2) + rows.length; // rows before our range + rows we read
      
      // Check entire session history (no time limit) - prevent same file download twice
      for (let i = rows.length - 1; i >= 1; i--) {
        const row = rows[i];
        if (row && row.length >= 10) {
          // If different session, skip (no need to check other sessions)
          if (row[9] !== sessionId) continue;
          
          // Found our session - check if same file was already downloaded
          if (row[1] === 'download' && row[3] === filename) {
            console.log('⭕ Skipping duplicate download:', {
              filename,
              sessionId: sessionId?.substring(0, 10) + '...',
              previousDownloadTime: row[0]
            });
            duplicateCheckPassed = false;
            break;
          }
        }
      }
    } catch (duplicateError) {
      console.warn('⚠️ Duplicate check failed, proceeding anyway:', duplicateError.message);
    }

   if (!duplicateCheckPassed) {
      return res.status(200).json({ success: true, skipped: 'recent_duplicate' });
    }

    // Check admin bypass
    const isAdmin = req.body.isAdmin === true;
    
    if (!isAdmin) {
      // Check daily limit (5 downloads per 24 hours)
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      let dailyCount = 0;
      
      for (let i = rows.length - 1; i >= 1; i--) {
        const row = rows[i];
        if (!row || row.length < 16) continue;
        const eventType = row[1];
        const rowHashedIP = row[15];
        const timestamp = new Date(row[0]).getTime();
        
        if (eventType === 'download' && rowHashedIP === hashedIP && timestamp > oneDayAgo) {
          dailyCount++;
        }
      }
      
      if (dailyCount >= 5) {
        const now = new Date();
        const deniedData = [
          now.toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          'download_denied',
          originalUtmSource ? `${originalUtmSource}${originalUtmMedium ? '/' + originalUtmMedium : ''}${originalUtmCampaign ? '/' + originalUtmCampaign : ''}` : (originalReferrer || 'direct'),
          filename,
          cleanCategory,
          pageViewsInSession || 0,
          downloadsInSession || 0,
          visitorType || 'new',
          landingPage || '',
          sessionId || '',
          visitorId || 'unknown',
          now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
          now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          req.headers['user-agent'] || 'unknown',
          req.headers['referer'] || 'direct',
          hashedIP
        ];
        
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Analytics!A:P',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [deniedData]
          }
        });
        
        console.log('⛔ Daily limit reached for IP:', hashedIP.substring(0, 8) + '...');
        return res.status(429).json({ 
          error: 'Daily download limit reached. You can download 5 images per day. Come back tomorrow!'
        });
      }
      
      // Check monthly limit (10 downloads per 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      let monthlyCount = 0;
      let oldestDownloadDate = null;
      
      for (let i = rows.length - 1; i >= 1; i--) {
        const row = rows[i];
        if (!row || row.length < 16) continue;
        const eventType = row[1];
        const rowHashedIP = row[15];
        const timestamp = new Date(row[0]);
        
        if (eventType === 'download' && rowHashedIP === hashedIP && timestamp.getTime() > thirtyDaysAgo) {
          monthlyCount++;
          if (!oldestDownloadDate || timestamp < oldestDownloadDate) {
            oldestDownloadDate = timestamp;
          }
        }
      }
      
      if (monthlyCount >= 10) {
        const daysUntilExpiry = oldestDownloadDate ? Math.ceil((oldestDownloadDate.getTime() + 30*24*60*60*1000 - Date.now()) / (24*60*60*1000)) : 1;
        const now = new Date();
        const deniedData = [
          now.toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          'download_denied',
          originalUtmSource ? `${originalUtmSource}${originalUtmMedium ? '/' + originalUtmMedium : ''}${originalUtmCampaign ? '/' + originalUtmCampaign : ''}` : (originalReferrer || 'direct'),
          filename,
          cleanCategory,
          pageViewsInSession || 0,
          downloadsInSession || 0,
          visitorType || 'new',
          landingPage || '',
          sessionId || '',
          visitorId || 'unknown',
          now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
          now.toLocaleTimeString('en-US', {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          req.headers['user-agent'] || 'unknown',
          req.headers['referer'] || 'direct',
          hashedIP
        ];
        
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEET_ID,
          range: 'Analytics!A:P',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [deniedData]
          }
        });
        
        console.log('⛔ Monthly limit reached for IP:', hashedIP.substring(0, 8) + '...');
        return res.status(429).json({ 
          error: `Monthly download limit reached. Your oldest download will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}, then you can download more!`
        });
      }
    } else {
      console.log('👑 Admin bypass - skipping limits');
    }

    let originalSource = originalReferrer || 'direct';
    if (originalUtmSource) {
      originalSource = originalUtmSource;
      if (originalUtmMedium) {
        originalSource += `/${originalUtmMedium}`;
      }
      if (originalUtmCampaign) {
        originalSource += `/${originalUtmCampaign}`;
      }
    }

    const now = new Date();

    const downloadData = [
      now.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      'download',
      originalSource,
      filename,
      cleanCategory,
      pageViewsInSession || 0,
      downloadsInSession || 0,
      visitorType || 'new',
      landingPage || '',
      sessionId || '',
      visitorId || 'unknown',
      now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
      now.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      req.headers['user-agent'] || 'unknown',
      req.headers['referer'] || 'direct',
      hashedIP
    ];

    console.log('📝 Appending to Google Sheets:', {
      filename,
      cleanCategory,
      timestamp: downloadData[0]
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:P',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [downloadData]
      }
    });

    console.log('✅ Download tracked successfully:', {
      filename,
      category: cleanCategory,
      sessionId: sessionId?.substring(0, 10) + '...',
      timestamp: now.toISOString()
    });

    res.status(200).json({ success: true });

    // Archive old rows if sheet is getting large (fire and forget — does not block response)
    if (totalRows > 18000) {
      console.log(`📦 Sheet at ${totalRows} rows — triggering background archive...`);
      archiveOldAnalyticsData(sheets, process.env.GOOGLE_SHEET_ID).catch(err => {
        console.error('📦 Archive error (non-critical):', err.message);
      });
    }

  } catch (error) {
    console.error('❌ Download tracking failed:', {
      error: error.message,
      stack: error.stack,
      filename,
      category: cleanCategory,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      success: false,
      error: 'Tracking failed but download may proceed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Moves rows older than the most recent KEEP_ROWS to Analytics_Archive tab.
// Called fire-and-forget when Analytics exceeds 18,000 rows.
async function archiveOldAnalyticsData(sheets, spreadsheetId) {
  const KEEP_ROWS = 10000; // ~100 days at current volume; covers the 30-day rate-limit window easily

  try {
    // Read all Analytics data (allRows.length is the accurate data count, unlike
    // gridProperties.rowCount which includes empty rows and stays inflated after archives)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Analytics!A:P'
    });

    const allRows = response.data.values || [];
    if (allRows.length <= KEEP_ROWS + 1) {
      console.log('📦 Archive skipped — actual data rows:', allRows.length);
      return;
    }
    console.log(`📦 Archiving Analytics: ${allRows.length} data rows → keeping last ${KEEP_ROWS}`);

    const header = allRows[0];
    const dataRows = allRows.slice(1);
    const rowsToArchive = dataRows.slice(0, dataRows.length - KEEP_ROWS);
    const rowsToKeep = dataRows.slice(dataRows.length - KEEP_ROWS);

    console.log(`📦 Moving ${rowsToArchive.length} rows to Archive, keeping ${rowsToKeep.length}`);

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
      // Write header to the new archive sheet
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
    const sheetMeta2 = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });
    const analyticsSheetId = sheetMeta2.data.sheets.find(
      s => s.properties.title === 'Analytics'
    )?.properties.sheetId;

    // Delete old rows from Analytics (rows 1..rowsToArchive.length, 0-indexed, after header)
    // This is safe: if it fails, Analytics still has all its data intact.
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

    console.log(`✅ Archive complete. Analytics trimmed to ${rowsToKeep.length + 1} rows.`);
  } catch (err) {
    console.error('📦 archiveOldAnalyticsData failed:', err.message);
  }
}