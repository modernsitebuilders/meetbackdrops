// lib/botFilter.js
// Shared bot / automated-traffic filter for the analytics endpoints
// (analytics, track-page-view, track-preview, track-video-play, track-download).
// Keeping one gate means the endpoints can't drift apart — each used to carry
// its own weaker, hand-rolled check and logged traffic the others dropped.
//
// Two layers:
//   1. isBotUserAgent — UAs that SELF-IDENTIFY as bots/tools (token match).
//   2. isSpoofedChromium — UAs that CLAIM to be Chrome but lack the headers a
//      real Chromium browser always sends. Catches the datacenter scrapers that
//      spoof a browser UA (the version-pinned, zero-engagement "direct" traffic
//      that inflated session counts — see the direct-traffic UA audit).
// shouldSkipAnalytics(req) combines both.
//
// Matching is lowercased, so 'bot' covers Googlebot/bingbot/GPTBot/etc. and
// 'spider' covers YisouSpider/Bytespider/etc.
export const BOT_UA_TOKENS = [
  // crawlers / headless browsers
  'bot', 'crawler', 'spider', 'crawl', 'slurp', 'prerender',
  'headless', 'phantomjs', 'puppeteer', 'playwright', 'selenium',
  // synthetic monitoring & perf tools — incl. our own Lighthouse + WebPageTest runs
  'lighthouse', 'pagespeed', 'gtmetrix', 'pingdom', 'uptimerobot',
  'webpagetest', 'ptst',
  // HTTP libraries / scrapers
  'python-requests', 'python-urllib', 'urllib', 'aiohttp', 'httpx',
  'go-http-client', 'java/', 'okhttp', 'curl/', 'wget', 'libwww',
  'scrapy', 'axios', 'node-fetch', 'undici', 'guzzle', 'httpclient',
  'dataprovider', 'embedly',
  // SEO / marketing crawlers & social fetchers whose brand string lacks a
  // 'bot'/'spider' token
  'facebookexternalhit', 'ahrefs', 'semrush', 'dataforseo',
  'mediapartners', // Mediapartners-Google (AdSense crawler)
];

// Returns true for a missing UA or any UA containing a known bot/automation token.
export function isBotUserAgent(userAgent) {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return BOT_UA_TOKENS.some((token) => ua.includes(token));
}

// Heuristic for a UA that claims to be Chromium but is almost certainly an HTTP
// client faking it. Real Chromium (Chrome/Edge/Brave/Opera/Samsung) sends the
// low-entropy `sec-ch-ua` client hint on every request in a secure context
// (HTTPS / localhost), plus `accept-language` and `sec-fetch-*` on the fetch/
// beacon calls these endpoints receive. Non-Chromium browsers (Safari, Firefox)
// never put "chrome/" in their UA, so they're never scrutinized here.
//
// We flag ONLY when `sec-ch-ua` is absent AND a second modern-browser header is
// also missing — one alone (e.g. a proxy stripping client hints) is not enough,
// which keeps false positives on real users near zero. The endpoints only skip
// LOGGING on a match; the user's request/response is never blocked.
export function isSpoofedChromium(headers = {}) {
  const ua = (headers['user-agent'] || '').toLowerCase();
  if (!ua.includes('chrome/')) return false;      // only Chromium-claiming UAs
  if (headers['sec-ch-ua']) return false;          // real Chromium sends this
  const hasLang = !!headers['accept-language'];
  const hasFetchMeta = !!(headers['sec-fetch-site'] || headers['sec-fetch-mode']);
  return !hasLang || !hasFetchMeta;                // needs a corroborating signal
}

// Single gate for the analytics/tracking endpoints. Pass the Next.js request.
export function shouldSkipAnalytics(req) {
  const headers = (req && req.headers) || {};
  return isBotUserAgent(headers['user-agent'] || '') || isSpoofedChromium(headers);
}

// --- Behavioral-crawler PRE-tag (header level) ----------------------------
// The Aug-2026 spike crawler drives what looks like a real Chromium engine on
// desktop Linux (`X11; Linux x86_64` + a current `Chrome/NNN`), lands one
// page_view per fresh session, and spoofs a bare search-engine referer
// (`https://www.google.com/`) to pass as organic. At the header level that is
// INDISTINGUISHABLE from a genuine Linux Chrome visitor arriving from Google —
// so this must NOT hard-drop the event (that would silently erase real Linux
// users). Instead it's a soft PRE-tag: ingest writes is_bot on the Neon row and
// the authoritative, session-aware classifier (flag-bots.mjs) confirms/extends
// it. The single-event-session part of the fingerprint isn't knowable here (one
// request has no session history), which is exactly why the pre-tag is soft and
// the aggregate classifier is the source of truth.
//
// Kept deliberately narrow (desktop-Linux X11 + Chrome + bare Google/Bing search
// root as referer) so the only real users it can touch are Linux-desktop
// bouncers arriving from search — the lowest-value, fully recoverable segment.
// The spoofed search referer arrives as the client-reported `document.referrer`
// (the endpoints put it in the row's referer field / `original_source`), NOT as
// the beacon's same-origin HTTP `Referer` header — so callers pass that value in
// explicitly. flag-bots.mjs applies the identical predicate to the stored
// `referer` column, so ingest and the classifier agree.
const SEARCH_ROOT_REFERERS = [
  'https://www.google.com/', 'https://google.com/',
  'https://www.bing.com/', 'https://bing.com/',
];
export function isSuspectedBehavioralBot({ userAgent = '', referer = '' } = {}) {
  const ua = (userAgent || '').toLowerCase();
  if (!ua.includes('x11; linux x86_64')) return false; // desktop-Linux signature
  if (!ua.includes('chrome/')) return false;           // Chromium-engine claim
  return SEARCH_ROOT_REFERERS.includes((referer || '').toLowerCase());
}

// --- Layer 3: behavioral velocity (Redis-backed) --------------------------
// The header layers above can't catch a bot driving a REAL Chromium engine
// (headless Chrome / an automation framework sends legitimate `sec-ch-ua` +
// client hints, so it looks exactly like a browser at the header level). The
// only thing that separates that traffic from a genuine visitor is behavior:
// one client hammering the SAME url far past any human rate. This layer flags
// exactly that. It needs the endpoint's Redis; it's a safe no-op when Redis is
// missing or the client IP can't be determined, and it NEVER throws.
//
// Concretely this stops the version-pinned single-URL flood (e.g. hundreds of
// one-page "new" sessions to a single blog post from a spoofed google referrer)
// that gets past the header layers.

// Best-effort client IP behind Vercel's proxy. x-forwarded-for is a comma list
// with the real client first; x-real-ip is the fallback.
export function clientIp(headers = {}) {
  const xff = headers['x-forwarded-for'];
  if (xff && typeof xff === 'string') return xff.split(',')[0].trim();
  return headers['x-real-ip'] || null;
}

// Per (IP, path) cap. No human views one page 20+ times in an hour, so a match
// is automation with near-zero false-positive risk — and only the *overflow*
// hits to that one page are dropped, never the client's other activity.
export const VELOCITY_WINDOW_SECONDS = 3600; // 1 hour rolling bucket
export const VELOCITY_MAX_PER_PATH = 20;

// Returns true when this (IP, path) has already exceeded the per-window cap —
// i.e. the caller should skip logging this event. Increments the counter as a
// side effect (first hit in a window sets the TTL). `path` should be the URL
// path the event is about (page for a page_view, landing/category otherwise).
export async function isFloodingClient(redis, req, path) {
  try {
    if (!redis) return false;
    const ip = clientIp((req && req.headers) || {});
    if (!ip || !path) return false;
    const key = `analytics:vel:${ip}:${path}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, VELOCITY_WINDOW_SECONDS);
    return count > VELOCITY_MAX_PER_PATH;
  } catch {
    return false; // never block logging on a velocity-check hiccup
  }
}
