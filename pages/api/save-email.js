import { google } from 'googleapis';
import { insertEmailSafe } from '../../lib/neonEvents.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, source } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
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

    const existingEmails = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Email List!A:A'
    });

    const emails = existingEmails.data.values || [];
    const emailExists = emails.some(row => row[0] === email);

    if (!emailExists) {
      // One timestamp value shared by the Sheet write and the Neon live-write so the
      // two rows are byte-identical and reconcile (same row_hash) on the daily sync.
      const emailRow = [
        email,
        source || 'bonus_download',
        new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Email List!A:C',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [emailRow] }
      });
      await insertEmailSafe(emailRow); // live mirror to Neon (safe no-op without DATABASE_URL)
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving email:', error);
    return res.status(500).json({ error: 'Failed to save email' });
  }
}
