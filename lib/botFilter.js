// lib/botFilter.js
// Shared bot / automated-traffic filter for the analytics endpoints
// (pages/api/analytics.js and pages/api/track-page-view.js). Keeping one list
// means the two endpoints can't drift apart — the page-view endpoint used to
// have a much weaker, hand-rolled check and was logging traffic the event
// endpoint already dropped.
//
// Matching is lowercased, so 'bot' covers Googlebot/bingbot/GPTBot/etc. and
// 'spider' covers YisouSpider/etc. This only stops UAs that self-identify;
// datacenter scrapers that spoof a real browser UA still slip through. Catching
// those is intentionally out of scope — judge conversion by traffic source
// instead (referred sources convert; anonymous deep-page sweeps don't).
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
];

// Returns true for a missing UA or any UA containing a known bot/automation token.
export function isBotUserAgent(userAgent) {
  if (!userAgent) return true;
  const ua = userAgent.toLowerCase();
  return BOT_UA_TOKENS.some((token) => ua.includes(token));
}
