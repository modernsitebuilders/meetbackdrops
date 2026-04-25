const SLACK_WEBHOOK_ENV = 'SLACK_WEBHOOK_URL';

function buildPayload(summary) {
  const lines = [
    '*Pinterest engine — failures detected*',
    `• timestamp: \`${summary.timestamp || 'n/a'}\``,
    `• total:     ${summary.total != null ? summary.total : 'n/a'}`,
    `• succeeded: ${summary.succeeded != null ? summary.succeeded : 'n/a'}`,
    `• failed:    ${summary.failed != null ? summary.failed : 'n/a'}`,
  ];
  return {
    text: `Pinterest engine: ${summary.failed} failed of ${summary.total} at ${summary.timestamp}`,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: lines.join('\n') },
      },
    ],
  };
}

async function alertFailure(summary) {
  const webhook = process.env[SLACK_WEBHOOK_ENV];
  if (!webhook) return { sent: false, reason: 'no_webhook' };

  if (!summary || typeof summary !== 'object') {
    return { sent: false, reason: 'invalid_summary' };
  }

  const payload = buildPayload(summary);

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[alert] slack webhook returned status ${res.status}`);
      return { sent: false, reason: `status_${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error(`[alert] slack webhook request failed: ${msg}`);
    return { sent: false, reason: 'network_error' };
  }
}

module.exports = { alertFailure };
