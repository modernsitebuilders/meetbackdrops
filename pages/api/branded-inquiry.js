import { google } from 'googleapis';

// Validates and stores B2B branded-backgrounds inquiries, and sends an email
// notification to the studio inbox.
//
// Storage: appends to a "Branded Inquiries" sheet in the existing
// GOOGLE_SHEET_ID workbook. Headers: Timestamp | Name | Work Email | Company |
// Role | Team Size | Timeline | Use Case | Notes | IP | User-Agent.
// (If the sheet tab doesn't exist yet, create one named "Branded Inquiries"
// with those headers, or rename the existing "Licensing Inquiries" tab.)
//
// Email: sends via MailerSend's HTTP API. Requires:
//   MAILERSEND_API_KEY        — from https://mailersend.com (free tier 3K/mo)
//   LICENSING_INBOX           — defaults to info@streambackdrops.com
//   LICENSING_FROM            — defaults to "StreamBackdrops Studio <notifications@streambackdrops.com>"
//
// If env vars are missing or the call fails, the lead is still logged to the
// server console + Sheets so it isn't lost.

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

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseSender(raw) {
  const m = String(raw || '').match(/^\s*(.+?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: m[1], email: m[2] };
  return { email: String(raw || '').trim() };
}

async function sendStudioNotification({ lead, isFreeDomain, ip, timestamp }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const to = process.env.LICENSING_INBOX || 'info@streambackdrops.com';
  const fromRaw = process.env.LICENSING_FROM || 'StreamBackdrops Studio <notifications@streambackdrops.com>';
  const from = parseSender(fromRaw);

  if (!apiKey) {
    return { ok: false, reason: 'no-api-key' };
  }

  const subject = `New branded backgrounds inquiry — ${lead.company || lead.name}`;
  const lines = [
    `Submitted: ${timestamp} ET`,
    `Name:      ${lead.name}`,
    `Email:     ${lead.workEmail}${isFreeDomain ? '  (free-domain)' : ''}`,
    `Company:   ${lead.company}`,
    `Role:      ${lead.role || '—'}`,
    `Set size:  ${lead.teamSize}`,
    `Timeline:  ${lead.timeline || '—'}`,
    `IP:        ${ip || '—'}`,
    '',
    'Brand & set brief:',
    lead.useCase,
    '',
    'Notes:',
    lead.notes || '—',
  ];
  const text = lines.join('\n');
  const html = `
<div style="font-family:Georgia,serif;color:#111827;max-width:640px;line-height:1.55">
  <p style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#9a6a3a;font-weight:600;margin:0 0 .75rem">
    StreamBackdrops Studio · New Branded Backgrounds Inquiry
  </p>
  <h2 style="font-family:'Fraunces',Georgia,serif;font-weight:600;letter-spacing:-.01em;font-size:1.5rem;margin:0 0 1.25rem">
    ${escapeHtml(lead.company || lead.name)}
  </h2>
  <table cellpadding="6" style="border-collapse:collapse;font-size:.95rem">
    <tr><td style="color:#6b7280">Submitted</td><td>${escapeHtml(timestamp)} ET</td></tr>
    <tr><td style="color:#6b7280">Name</td><td>${escapeHtml(lead.name)}</td></tr>
    <tr><td style="color:#6b7280">Email</td><td><a href="mailto:${escapeHtml(lead.workEmail)}">${escapeHtml(lead.workEmail)}</a>${isFreeDomain ? ' <span style="color:#9a6a3a;font-size:.8rem">(free-domain)</span>' : ''}</td></tr>
    <tr><td style="color:#6b7280">Company</td><td>${escapeHtml(lead.company)}</td></tr>
    <tr><td style="color:#6b7280">Role</td><td>${escapeHtml(lead.role || '—')}</td></tr>
    <tr><td style="color:#6b7280">Set size</td><td>${escapeHtml(lead.teamSize)}</td></tr>
    <tr><td style="color:#6b7280">Timeline</td><td>${escapeHtml(lead.timeline || '—')}</td></tr>
    <tr><td style="color:#6b7280;vertical-align:top">Brand &amp; set brief</td><td style="white-space:pre-wrap">${escapeHtml(lead.useCase)}</td></tr>
    <tr><td style="color:#6b7280;vertical-align:top">Notes</td><td style="white-space:pre-wrap">${escapeHtml(lead.notes || '—')}</td></tr>
    <tr><td style="color:#6b7280">IP</td><td style="font-family:monospace;font-size:.85rem">${escapeHtml(ip || '—')}</td></tr>
  </table>
  <p style="margin-top:1.5rem;color:#6b7280;font-size:.85rem">
    Reply directly to this email to respond to the prospect — the Reply-To header is set to their work email.
  </p>
</div>`.trim();

  try {
    const res = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [{ email: to }],
        reply_to: { email: lead.workEmail },
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, reason: 'mailersend-error', status: res.status, body };
    }
    const messageId = res.headers.get('x-message-id') || null;
    return { ok: true, id: messageId };
  } catch (err) {
    return { ok: false, reason: 'network-error', message: err.message };
  }
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
    sendStudioNotification({ lead, isFreeDomain, ip, timestamp }),
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
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Branded Inquiries!A:K',
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
