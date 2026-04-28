import { google } from 'googleapis';

// Validates and stores B2B licensing inquiries.
//
// Storage: appends to a "Licensing Inquiries" sheet in the existing
// GOOGLE_SHEET_ID workbook (mirrors save-email.js / submit-review.js).
// The sheet must have headers: Timestamp | Name | Work Email | Company |
// Role | Team Size | Timeline | Use Case | Notes | IP | User-Agent.
//
// If Google Sheets credentials are missing or the call fails, the lead is
// still logged to the server console so it isn't lost — this lets us
// deploy the page before the sheet is provisioned.

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
]);

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clean(str, max = 2000) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, workEmail, company, role, teamSize, timeline, useCase, notes } = req.body || {};

  const lead = {
    name: clean(name, 200),
    workEmail: clean(workEmail, 200),
    company: clean(company, 300),
    role: clean(role, 200),
    teamSize: clean(teamSize, 50),
    timeline: clean(timeline, 50),
    useCase: clean(useCase, 4000),
    notes: clean(notes, 4000),
  };

  if (!lead.name) return res.status(400).json({ error: 'Name is required' });
  if (!isValidEmail(lead.workEmail))
    return res.status(400).json({ error: 'Valid work email is required' });
  if (!lead.company) return res.status(400).json({ error: 'Company is required' });
  if (!lead.teamSize) return res.status(400).json({ error: 'Team size is required' });
  if (!lead.useCase) return res.status(400).json({ error: 'Use case is required' });

  const domain = lead.workEmail.split('@')[1]?.toLowerCase() || '';
  const isFreeDomain = FREE_EMAIL_DOMAINS.has(domain);

  const ip =
    (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    '';
  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 500);

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Always log server-side so the lead is captured even if Sheets is down.
  console.log('[licensing-inquiry]', {
    timestamp,
    ...lead,
    isFreeDomain,
    domain,
    ip,
  });

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const serviceEmail = process.env.GOOGLE_SERVICE_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !serviceEmail || !rawKey) {
    // Sheet not provisioned — return success so the form completes; the lead
    // is still in server logs and the user gets the success state.
    return res.status(200).json({ success: true, persisted: 'log-only' });
  }

  try {
    let privateKey = rawKey;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: serviceEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Licensing Inquiries!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [
            timestamp,
            lead.name,
            lead.workEmail,
            lead.company,
            lead.role,
            lead.teamSize,
            lead.timeline,
            lead.useCase,
            lead.notes,
            ip,
            userAgent,
          ],
        ],
      },
    });

    return res.status(200).json({ success: true, persisted: 'sheets' });
  } catch (error) {
    // Sheet doesn't exist yet, or auth failed — still treat as success
    // because we have the lead in console logs. The studio can scrape
    // logs until the sheet tab is provisioned.
    console.error('[licensing-inquiry] sheets append failed:', error.message);
    return res.status(200).json({ success: true, persisted: 'log-fallback' });
  }
}
