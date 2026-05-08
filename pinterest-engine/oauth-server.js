#!/usr/bin/env node
/*
 * Pinterest OAuth 2.0 authorization-code flow.
 *
 * Endpoints:
 *   GET /                 — landing page with "Authorize with Pinterest" button
 *   GET /auth/pinterest   — 302 redirect to Pinterest's authorize URL
 *   GET /auth/callback    — exchanges ?code=... for an access_token + refresh_token,
 *                           updates .env.local in place, and renders a success page
 *
 * Pinterest API references:
 *   Authorize:  https://www.pinterest.com/oauth/
 *   Token exchange:  POST https://api.pinterest.com/v5/oauth/token  (Basic auth)
 *
 * Required env (in .env.local at the repo root):
 *   PINTEREST_CLIENT_ID
 *   PINTEREST_CLIENT_SECRET
 *   PINTEREST_REDIRECT_URI   (must match the URI registered on the Pinterest app)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env.local');

require('dotenv').config({ path: ENV_PATH });

const PORT = Number(process.env.PINTEREST_OAUTH_PORT || 8080);
const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI =
  process.env.PINTEREST_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
const SCOPE = 'boards:read,pins:read,pins:write,user_accounts:read';

const PINTEREST_AUTHORIZE_URL = 'https://www.pinterest.com/oauth/';
const PINTEREST_TOKEN_URL = 'https://api.pinterest.com/v5/oauth/token';

const sessionState = new Map();

function assertConfig() {
  const missing = [];
  if (!CLIENT_ID) missing.push('PINTEREST_CLIENT_ID');
  if (!CLIENT_SECRET) missing.push('PINTEREST_CLIENT_SECRET');
  if (missing.length) {
    console.error(`\n[oauth] missing env vars in ${ENV_PATH}:`);
    for (const k of missing) console.error(`  - ${k}`);
    console.error('\nAdd them to .env.local, then re-run.\n');
    process.exit(1);
  }
}

function htmlPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
           background: #f5f5f5; color: #111827; margin: 0; padding: 48px 24px;
           display: flex; justify-content: center; }
    .card { background: white; border-radius: 12px; padding: 40px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06); max-width: 640px; width: 100%; }
    h1 { margin-top: 0; color: #111827; }
    .accent { color: #E0A82E; }
    .btn { display: inline-block; background: #E60023; color: white; padding: 14px 28px;
           border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 16px; }
    .btn:hover { background: #ad081b; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px;
           font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 13px; }
    pre { background: #111827; color: #d1d5db; padding: 16px; border-radius: 8px;
          overflow-x: auto; font-size: 13px; }
    .meta { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
}

function renderIndex() {
  const authorizeHref = '/auth/pinterest';
  return htmlPage(
    'MeetBackdrops — Pinterest OAuth',
    `
      <h1>MeetBackdrops <span class="accent">Pinterest Engine</span></h1>
      <p>Click below to begin the Pinterest OAuth 2.0 authorization-code flow.
         You will be redirected to Pinterest, asked to grant access to your account,
         then redirected back here with an authorization code that this server will
         exchange for an access token.</p>
      <p><strong>Scopes requested:</strong> <code>${SCOPE}</code></p>
      <p><strong>Redirect URI:</strong> <code>${REDIRECT_URI}</code></p>
      <p style="margin-top: 32px;"><a class="btn" href="${authorizeHref}">Authorize with Pinterest</a></p>
    `,
  );
}

function renderSuccess({ tokenPreview, scope, expiresIn, refreshTokenPreview }) {
  return htmlPage(
    'Authorization successful',
    `
      <h1>Authorization <span class="accent">successful</span></h1>
      <p>Pinterest returned an access token. The token has been written to
         <code>.env.local</code> as <code>PINTEREST_ACCESS_TOKEN</code>.</p>
      <pre>access_token:  ${tokenPreview}
refresh_token: ${refreshTokenPreview}
scope:         ${scope}
expires_in:    ${expiresIn} seconds</pre>
      <p class="meta">You can now close this tab and run
         <code>node pinterest-engine/cli.js publish-one &lt;slug&gt;</code> to publish a real pin.</p>
    `,
  );
}

function renderError(message) {
  return htmlPage(
    'Authorization failed',
    `<h1>Authorization failed</h1><p>${message}</p>`,
  );
}

function buildAuthorizeUrl(state) {
  const u = new URL(PINTEREST_AUTHORIZE_URL);
  u.searchParams.set('client_id', CLIENT_ID);
  u.searchParams.set('redirect_uri', REDIRECT_URI);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', SCOPE);
  u.searchParams.set('state', state);
  return u.toString();
}

async function exchangeCodeForToken(code) {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  }).toString();

  const response = await fetch(PINTEREST_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_err) {
    payload = { raw: text };
  }

  if (!response.ok) {
    const reason =
      (payload && (payload.message || payload.error_description || payload.error)) ||
      `HTTP ${response.status}`;
    throw new Error(`Token exchange failed: ${reason}`);
  }

  if (!payload || !payload.access_token) {
    throw new Error('Token exchange returned no access_token');
  }
  return payload;
}

function upsertEnvVar(envText, key, value) {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(envText)) return envText.replace(re, line);
  const sep = envText.length === 0 || envText.endsWith('\n') ? '' : '\n';
  return `${envText}${sep}${line}\n`;
}

function persistTokens(tokens) {
  let envText = '';
  try {
    envText = fs.readFileSync(ENV_PATH, 'utf8');
  } catch (_err) {
    envText = '';
  }
  envText = upsertEnvVar(envText, 'PINTEREST_ACCESS_TOKEN', tokens.access_token);
  if (tokens.refresh_token) {
    envText = upsertEnvVar(envText, 'PINTEREST_REFRESH_TOKEN', tokens.refresh_token);
  }
  fs.writeFileSync(ENV_PATH, envText);
}

function preview(token) {
  if (!token) return '(none)';
  if (token.length <= 12) return token;
  return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function send(res, status, contentType, body) {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
}

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    return send(res, 200, 'text/html; charset=utf-8', renderIndex());
  }

  if (url.pathname === '/auth/pinterest') {
    const state = crypto.randomBytes(16).toString('hex');
    sessionState.set(state, Date.now());
    const authorizeUrl = buildAuthorizeUrl(state);
    console.log(`[oauth] redirecting to authorize URL (state=${state.slice(0, 8)}…)`);
    res.writeHead(302, { Location: authorizeUrl });
    return res.end();
  }

  if (url.pathname === '/auth/callback') {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error(`[oauth] authorize returned error: ${error}`);
      return send(res, 400, 'text/html; charset=utf-8', renderError(`Pinterest returned: ${error}`));
    }
    if (!code) {
      return send(res, 400, 'text/html; charset=utf-8', renderError('Missing ?code in callback'));
    }
    if (!state || !sessionState.has(state)) {
      return send(res, 400, 'text/html; charset=utf-8', renderError('Invalid or missing state'));
    }
    sessionState.delete(state);

    try {
      console.log('[oauth] exchanging authorization code for access token…');
      const tokens = await exchangeCodeForToken(code);
      persistTokens(tokens);
      console.log(`[oauth] access_token received: ${preview(tokens.access_token)}`);
      console.log(`[oauth] scope: ${tokens.scope}`);
      console.log(`[oauth] expires_in: ${tokens.expires_in}s`);
      console.log(`[oauth] tokens written to ${ENV_PATH}`);

      return send(
        res,
        200,
        'text/html; charset=utf-8',
        renderSuccess({
          tokenPreview: preview(tokens.access_token),
          refreshTokenPreview: preview(tokens.refresh_token),
          scope: tokens.scope,
          expiresIn: tokens.expires_in,
        }),
      );
    } catch (err) {
      const msg = err && err.message ? err.message : String(err);
      console.error(`[oauth] ${msg}`);
      return send(res, 500, 'text/html; charset=utf-8', renderError(msg));
    }
  }

  send(res, 404, 'text/plain', 'Not found');
}

function start() {
  assertConfig();
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error('[oauth] unhandled:', err);
      try { send(res, 500, 'text/plain', 'Internal server error'); } catch (_) {}
    });
  });
  server.listen(PORT, () => {
    console.log('\n[oauth] Pinterest OAuth server running');
    console.log(`[oauth] open http://localhost:${PORT} in your browser`);
    console.log(`[oauth] redirect_uri: ${REDIRECT_URI}`);
    console.log(`[oauth] scopes: ${SCOPE}\n`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { start, buildAuthorizeUrl, exchangeCodeForToken, upsertEnvVar };
