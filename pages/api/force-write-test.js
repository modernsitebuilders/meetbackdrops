import { google } from 'googleapis';

export default async function handler(req, res) {
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

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Analytics!A:I',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [['FORCED TEST', 'test', 'test', 'test', 'test', 'test', 'test', 'test', 'test']]
      }
    });

    res.status(200).json({ 
      success: true, 
      updatedRange: result.data.updates.updatedRange,
      updatedRows: result.data.updates.updatedRows
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
}