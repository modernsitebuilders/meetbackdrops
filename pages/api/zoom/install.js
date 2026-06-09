import crypto from 'crypto';
import { getAuthorizeUrl } from '../../../lib/zoom/oauth';
import { setStateCookie } from '../../../lib/zoom/session';

export default function handler(req, res) {
  try {
    const state = crypto.randomBytes(16).toString('hex');
    setStateCookie(res, state);
    const url = getAuthorizeUrl({ state });
    res.writeHead(302, { Location: url });
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
