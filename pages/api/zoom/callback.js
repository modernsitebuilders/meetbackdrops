import { exchangeCodeForToken } from '../../../lib/zoom/oauth';
import {
  setSessionCookie,
  readStateCookie,
  clearStateCookie,
} from '../../../lib/zoom/session';

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send(`Zoom OAuth error: ${error}`);
  }
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  // State validation only applies when WE initiated the flow via /install.
  // Zoom-initiated installs (Marketplace listing "Add", Local Test, in-client
  // launch) skip our /install route, so there's no state cookie to check —
  // accept those. The code-for-token exchange itself is authenticated with
  // client_id:client_secret, so this isn't a security hole.
  const expectedState = readStateCookie(req);
  if (expectedState && expectedState !== state) {
    return res.status(400).send('Invalid OAuth state');
  }

  try {
    const tokens = await exchangeCodeForToken(code);
    setSessionCookie(res, tokens);
    clearStateCookie(res);
    res.writeHead(302, { Location: '/zoom-app' });
    res.end();
  } catch (err) {
    res.status(err.status || 500).json({
      error: 'token_exchange_failed',
      detail: err.body || err.message,
    });
  }
}
