import crypto from 'crypto';

// v0 session storage: encrypted httpOnly cookie carrying the Zoom OAuth
// tokens for the signed-in user. Good enough for the first iteration; the
// upgrade path is to move to Upstash Redis (already a dep) keyed by an
// opaque session id and only keep the session id in the cookie.

const COOKIE_NAME = 'mb_zoom';
const STATE_COOKIE = 'mb_zoom_state';
const ALGO = 'aes-256-gcm';

function getKey() {
  const raw = process.env.ZOOM_SESSION_SECRET || process.env.ZOOM_CLIENT_SECRET;
  if (!raw) throw new Error('Missing ZOOM_SESSION_SECRET (or ZOOM_CLIENT_SECRET fallback)');
  return crypto.createHash('sha256').update(raw).digest();
}

function encrypt(payload) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

function decrypt(token) {
  try {
    const buf = Buffer.from(token, 'base64url');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString('utf8'));
  } catch {
    return null;
  }
}

function parseCookies(header) {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((c) => {
      const idx = c.indexOf('=');
      if (idx < 0) return [c.trim(), ''];
      return [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())];
    })
  );
}

function serializeCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly'];
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.secure !== false) parts.push('Secure');
  parts.push(`SameSite=${opts.sameSite || 'None'}`);
  return parts.join('; ');
}

export function setSessionCookie(res, session) {
  const value = encrypt({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Date.now() + (session.expires_in || 3600) * 1000,
    scope: session.scope,
  });
  res.setHeader('Set-Cookie', appendCookie(res, serializeCookie(COOKIE_NAME, value, {
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'None',
  })));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', appendCookie(res, serializeCookie(COOKIE_NAME, '', { maxAge: 0, sameSite: 'None' })));
}

export function readSession(req) {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return null;
  return decrypt(raw);
}

export function setStateCookie(res, state) {
  res.setHeader('Set-Cookie', appendCookie(res, serializeCookie(STATE_COOKIE, state, {
    maxAge: 600,
    sameSite: 'Lax',
  })));
}

export function readStateCookie(req) {
  return parseCookies(req.headers.cookie)[STATE_COOKIE] || null;
}

export function clearStateCookie(res) {
  res.setHeader('Set-Cookie', appendCookie(res, serializeCookie(STATE_COOKIE, '', { maxAge: 0, sameSite: 'Lax' })));
}

function appendCookie(res, cookie) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) return cookie;
  return Array.isArray(existing) ? [...existing, cookie] : [existing, cookie];
}
