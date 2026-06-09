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

  const expectedState = readStateCookie(req);
  if (!expectedState || expectedState !== state) {
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
