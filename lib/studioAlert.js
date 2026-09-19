// lib/studioAlert.js
//
// Server-only. Emails the studio inbox whenever someone spends money or asks to:
// branded-backgrounds inquiries, HD purchases, HD subscriptions, and commercial
// licenses. One helper so every money path notifies the same way and none of
// them can go silent.
//
// Sends via MailerSend's HTTP API — the same account/method the branded inquiry
// form has used in production since launch. Env:
//   MAILERSEND_API_KEY — required; without it the alert is skipped (and logged)
//   LICENSING_INBOX    — defaults to info@meetbackdrops.com (forwards to Gmail)
//   LICENSING_FROM     — defaults to "MeetBackdrops Studio <notifications@meetbackdrops.com>"
//
// Never throws: returns { ok, reason } so a mail hiccup can't break the caller
// (a Stripe webhook must still answer 200; an inquiry must still be saved).

function escapeHtml(s) {
  return String(s ?? '')
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

// subject  — email subject line
// eyebrow  — small caps label above the heading (e.g. "New sale · $49.00")
// heading  — large title (company, product, …)
// rows     — [[label, value], …]; empty/null values render as "—"
// blocks   — optional [[label, longText], …] shown full-width below the table
// replyTo  — optional customer email so hitting Reply answers them directly
// footer   — optional one-line note under the table
export async function sendStudioAlert({ subject, eyebrow, heading, rows = [], blocks = [], replyTo, footer }) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    console.error('[studio-alert] MAILERSEND_API_KEY missing — alert NOT sent:', subject);
    return { ok: false, reason: 'no-api-key' };
  }
  const to = process.env.LICENSING_INBOX || 'info@meetbackdrops.com';
  const from = parseSender(process.env.LICENSING_FROM || 'MeetBackdrops Studio <notifications@meetbackdrops.com>');

  const val = (v) => (v == null || v === '' ? '—' : String(v));
  const text = [
    eyebrow, heading, '',
    ...rows.map(([k, v]) => `${k}: ${val(v)}`),
    ...blocks.flatMap(([k, v]) => ['', `${k}:`, val(v)]),
    ...(footer ? ['', footer] : []),
  ].join('\n');

  const html = `
<div style="font-family:Georgia,serif;color:#111827;max-width:640px;line-height:1.55">
  <p style="font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;color:#9a6a3a;font-weight:600;margin:0 0 .75rem">
    ${escapeHtml(eyebrow)}
  </p>
  <h2 style="font-family:'Fraunces',Georgia,serif;font-weight:600;letter-spacing:-.01em;font-size:1.5rem;margin:0 0 1.25rem">
    ${escapeHtml(heading)}
  </h2>
  <table cellpadding="6" style="border-collapse:collapse;font-size:.95rem">
    ${rows.map(([k, v]) => `<tr><td style="color:#6b7280;vertical-align:top">${escapeHtml(k)}</td><td>${escapeHtml(val(v))}</td></tr>`).join('\n    ')}
  </table>
  ${blocks.map(([k, v]) => `
  <p style="color:#6b7280;margin:1.25rem 0 .25rem">${escapeHtml(k)}</p>
  <div style="white-space:pre-wrap">${escapeHtml(val(v))}</div>`).join('')}
  ${footer ? `<p style="margin-top:1.5rem;color:#6b7280;font-size:.85rem">${escapeHtml(footer)}</p>` : ''}
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
        ...(replyTo ? { reply_to: { email: replyTo } } : {}),
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[studio-alert] MailerSend rejected alert:', res.status, body, '—', subject);
      return { ok: false, reason: 'mailersend-error', status: res.status, body };
    }
    return { ok: true, id: res.headers.get('x-message-id') || null };
  } catch (err) {
    console.error('[studio-alert] network error sending alert:', err.message, '—', subject);
    return { ok: false, reason: 'network-error', message: err.message };
  }
}

export function formatMoney(amountCents, currency = 'usd') {
  if (amountCents == null) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() })
    .format(amountCents / 100);
}
