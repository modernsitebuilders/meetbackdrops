import {
  verifyWebhookSignature,
  buildUrlValidationResponse,
} from '../../../lib/zoom/oauth';

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const rawBody = await readRawBody(req);
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  // Zoom URL validation handshake — must respond before the endpoint goes live.
  if (event.event === 'endpoint.url_validation') {
    const plainToken = event.payload?.plainToken;
    if (!plainToken) return res.status(400).json({ error: 'missing_plain_token' });
    return res.status(200).json(buildUrlValidationResponse(plainToken));
  }

  const signature = req.headers['x-zm-signature'];
  const timestamp = req.headers['x-zm-request-timestamp'];
  if (!verifyWebhookSignature({ signature, timestamp, rawBody })) {
    return res.status(401).json({ error: 'invalid_signature' });
  }

  console.log('[zoom-webhook]', event.event, event.payload?.account_id || '');

  // Zoom requires this event to be handled for marketplace approval.
  // MeetBackdrops stores no PII — the only user-side state is a session cookie
  // that lives in the user's browser and expires naturally. Nothing to delete
  // server-side; we acknowledge immediately to satisfy the requirement.
  if (event.event === 'app_deauthorized') {
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
