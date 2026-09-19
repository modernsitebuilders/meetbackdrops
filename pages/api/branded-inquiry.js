import { google } from 'googleapis';
import { sendStudioAlert } from '../../lib/studioAlert';

// Validates and stores B2B branded-backgrounds inquiries, and emails the studio
// inbox (lib/studioAlert.js, MailerSend — LICENSING_INBOX, default
// info@meetbackdrops.com).
//
// Storage: appends to the "Branded Inquiries" tab of the GOOGLE_SHEET_ID workbook
// (mirrored to Neon `branded_inquiries` by the sheet sync). The tab is created
// with its header row on first use if it doesn't exist — until Sept 2026 it
// didn't, so every append failed silently. Columns: Timestamp | Name | Work Email |
// Company | Role | Team Size | Timeline | Use Case | Notes | IP | User-Agent.
//
// A lead is only lost if BOTH the email and the sheet fail — then the endpoint
// returns 500 so the form shows the "email us directly" fallback instead of a
// false success. Either one succeeding is a 200.

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

function studioNotification({ lead, isFreeDomain, ip, timestamp }) {
  return sendStudioAlert({
    subject: `New branded backgrounds inquiry — ${lead.company || lead.name}`,
    eyebrow: 'MeetBackdrops Studio · New Branded Backgrounds Inquiry',
    heading: lead.company || lead.name,
    rows: [
      ['Submitted', `${timestamp} ET`],
      ['Name', lead.name],
      ['Email', `${lead.workEmail}${isFreeDomain ? '  (free-domain)' : ''}`],
      ['Company', lead.company],
      ['Role', lead.role],
      ['Set size', lead.teamSize],
      ['Timeline', lead.timeline],
      ['IP', ip],
    ],
    blocks: [
      ['Brand & set brief', lead.useCase],
      ['Notes', lead.notes],
    ],
    replyTo: lead.workEmail,
    footer: 'Reply directly to this email to respond to the prospect — the Reply-To header is set to their work email.',
  });
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
  if (!lead.teamSize) return res.status(400).json({ error: 'Set size is required' });
  if (!lead.useCase) return res.status(400).json({ error: 'Brand & set brief is required' });

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

  console.log('[branded-inquiry]', {
    timestamp,
    ...lead,
    isFreeDomain,
    domain,
    ip,
  });

  const [emailResult, sheetsResult] = await Promise.allSettled([
    studioNotification({ lead, isFreeDomain, ip, timestamp }),
    appendToSheet({ lead, ip, userAgent, timestamp }),
  ]);

  const emailStatus = emailResult.status === 'fulfilled' ? emailResult.value : { ok: false, reason: 'threw', message: String(emailResult.reason) };
  const sheetsStatus = sheetsResult.status === 'fulfilled' ? sheetsResult.value : { ok: false, reason: 'threw', message: String(sheetsResult.reason) };

  if (!emailStatus.ok) {
    console.error('[branded-inquiry] email notification failed:', emailStatus);
  } else {
    console.log('[branded-inquiry] email sent, id:', emailStatus.id);
  }
  if (!sheetsStatus.ok) {
    console.error('[branded-inquiry] sheets append failed:', sheetsStatus.message || sheetsStatus.reason);
  }

  if (!emailStatus.ok && !sheetsStatus.ok) {
    // Nothing reached the studio — say so, so the form offers the direct-email
    // fallback rather than a false "we'll be in touch".
    console.error('[branded-inquiry] LEAD NOT DELIVERED (email + sheet both failed):', lead.workEmail);
    return res.status(500).json({
      error: "We couldn't send your inquiry. Please email info@meetbackdrops.com directly.",
    });
  }

  return res.status(200).json({
    success: true,
    persisted: {
      email: emailStatus.ok ? 'sent' : `skipped:${emailStatus.reason}`,
      sheets: sheetsStatus.ok ? 'sent' : `skipped:${sheetsStatus.reason}`,
    },
  });
}

async function appendToSheet({ lead, ip, userAgent, timestamp }) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const serviceEmail = process.env.GOOGLE_SERVICE_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!spreadsheetId || !serviceEmail || !rawKey) {
    return { ok: false, reason: 'no-credentials' };
  }
  try {
    let privateKey = rawKey;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: serviceEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    await ensureTab(sheets, spreadsheetId);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `'${TAB}'!A:K`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp, lead.name, lead.workEmail, lead.company, lead.role,
          lead.teamSize, lead.timeline, lead.useCase, lead.notes, ip, userAgent,
        ]],
      },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: 'sheets-error', message: err.message };
  }
}

const TAB = 'Branded Inquiries';
const HEADERS = [
  'Timestamp', 'Name', 'Work Email', 'Company', 'Role', 'Team Size',
  'Timeline', 'Use Case', 'Notes', 'IP', 'User-Agent',
];

// Create the tab (with its header row) if the workbook doesn't have it yet.
async function ensureTab(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
  const exists = (meta.data.sheets || []).some((sh) => sh.properties?.title === TAB);
  if (exists) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: [{ addSheet: { properties: { title: TAB } } }] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${TAB}'!A1:K1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  });
}
