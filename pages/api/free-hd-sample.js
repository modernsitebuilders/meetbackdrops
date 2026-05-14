import AWS from 'aws-sdk';
import { google } from 'googleapis';
import { FREE_SAMPLE_IDS } from '../../lib/freeSamples';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function appendEmail(email, sampleId) {
  // Mirrors pages/api/save-email.js — kept inline so we can stamp the
  // sample ID into the source field for attribution.
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const existingEmails = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Email List!A:A',
  });

  const emails = existingEmails.data.values || [];
  const emailExists = emails.some((row) => row[0] === email);

  if (!emailExists) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Email List!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          email,
          `free_hd_sample:${sampleId}`,
          new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        ]],
      },
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, sampleId } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!sampleId || !FREE_SAMPLE_IDS.has(sampleId)) {
    return res.status(400).json({ error: 'Invalid sample selection.' });
  }

  try {
    // Capture email first; if Sheets fails we don't want to give the file away.
    await appendEmail(email, sampleId);

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: 'streambackdrops-premium',
      Key: `${sampleId}.png`,
      Expires: 600,
      ResponseContentDisposition: `attachment; filename="${sampleId}.png"`,
    });

    return res.status(200).json({ url: signedUrl });
  } catch (error) {
    console.error('Free HD sample error:', error);
    return res.status(500).json({ error: 'Something went wrong. Try again in a moment.' });
  }
}
