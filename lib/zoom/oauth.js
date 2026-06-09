import crypto from 'crypto';

const ZOOM_OAUTH_BASE = 'https://zoom.us/oauth';
const ZOOM_API_BASE = 'https://api.zoom.us/v2';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function getAuthorizeUrl({ state }) {
  const clientId = requireEnv('ZOOM_CLIENT_ID');
  const redirectUri = requireEnv('ZOOM_REDIRECT_URI');
  const u = new URL(`${ZOOM_OAUTH_BASE}/authorize`);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  if (state) u.searchParams.set('state', state);
  return u.toString();
}

async function tokenRequest(params) {
  const clientId = requireEnv('ZOOM_CLIENT_ID');
  const clientSecret = requireEnv('ZOOM_CLIENT_SECRET');
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${ZOOM_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(`Zoom token request failed: ${res.status} ${body?.reason || body?.error || 'unknown'}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function exchangeCodeForToken(code) {
  return tokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: requireEnv('ZOOM_REDIRECT_URI'),
  });
}

export function refreshAccessToken(refreshToken) {
  return tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
}

export async function zoomApi(path, accessToken, init = {}) {
  const res = await fetch(`${ZOOM_API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': init.body ? 'application/json' : undefined,
    },
  });
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) {
    const err = new Error(`Zoom API ${path} failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// Verifies a Zoom webhook signature against the secret token.
// Zoom signs every event with `v0:{timestamp}:{rawBody}` using HMAC-SHA256.
export function verifyWebhookSignature({ signature, timestamp, rawBody }) {
  const secret = requireEnv('ZOOM_SECRET_TOKEN');
  if (!signature || !timestamp || !rawBody) return false;
  const message = `v0:${timestamp}:${rawBody}`;
  const expected = `v0=${crypto.createHmac('sha256', secret).update(message).digest('hex')}`;
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Used to respond to Zoom's `endpoint.url_validation` event.
export function buildUrlValidationResponse(plainToken) {
  const secret = requireEnv('ZOOM_SECRET_TOKEN');
  const encryptedToken = crypto.createHmac('sha256', secret).update(plainToken).digest('hex');
  return { plainToken, encryptedToken };
}
