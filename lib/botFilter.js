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
