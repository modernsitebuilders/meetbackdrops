import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Block bots
  const userAgent = req.headers['user-agent'] || '';
  if (!userAgent ||
      userAgent.includes('bot') ||
      userAgent.includes('Bot') ||
      userAgent.includes('crawler') ||
      userAgent.includes('spider') ||
      userAgent.includes('Spider') ||
      userAgent.includes('Prerender') ||
      userAgent.includes('HeadlessChrome') ||
      userAgent.includes('YisouSpider')) {
    return res.status(200).json({ success: true, skipped: 'bot' });
  }

  const {
    page,
    category,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    sessionId,
    originalReferrer,
    originalUtmSource,
    originalUtmMedium,
    originalUtmCampaign,
    landingPage,
    pageViewsInSession,
    downloadsInSession,
    visitorId,
    visitorType
  } = req.body;

  let currentSource = 'direct';
  if (utm_source) {
    currentSource = utm_source;
    if (utm_medium) currentSource += `/${utm_medium}`;
    if (utm_campaign) currentSource += `/${utm_campaign}`;
  } else if (referrer && referrer !== 'direct') {
    currentSource = referrer;
  }

  let originalSource = originalReferrer || 'direct';
  if (originalUtmSource) {
    originalSource = originalUtmSource;
    if (originalUtmMedium) originalSource += `/${originalUtmMedium}`;
    if (originalUtmCampaign) originalSource += `/${originalUtmCampaign}`;
  }

  // pageType: derive from URL shape so the sheet can be filtered without parsing paths.
  const pageType = (() => {
    if (!page || page === '/') return 'home';
    const segments = page.split('?')[0].split('#')[0].split('/').filter(Boolean);
    const [first, second, third] = segments;
    if (first === 'category' && second && third) return 'image_page';
    if (first === 'category' && second) return 'category';
    if (first === 'blog' && second) return 'blog_post';
    if (first === 'blog') return 'blog_index';
    if (first === 'hd') return 'hd';
    if (first === 'hd-download') return 'hd_download';
    if (first === 'branded-backgrounds') return 'branded';
    if (first === 'bundles') return 'bundles';
    if (first === 'browse') return 'browse';
    if (first === 'most-popular') return 'popular';
    if (first === 'contact') return 'contact';
    if (first === 'privacy' || first === 'terms' || first === 'license') return 'legal';
    return 'other';
  })();

  // entrySource: only meaningful on the landing hit of a session.
  // Mid-session hits are tagged 'internal' so the sheet can isolate true entry points.
  const entrySource = (() => {
    const isLanding = (pageViewsInSession || 1) <= 1;
    if (!isLanding) return 'internal';
    const ref = (referrer || '').toLowerCase();
    if (utm_source) return `utm:${utm_source}`;
    if (ref.includes('google.')) return pageType === 'image_page' ? 'google_images' : 'google_search';
    if (ref.includes('bing.')) return 'bing';
    if (ref.includes('duckduckgo.')) return 'duckduckgo';
    if (ref.includes('yahoo.')) return 'yahoo';
    if (ref.includes('facebook.') || ref.includes('fb.com') || ref.includes('m.facebook.')) return 'social_facebook';
    if (ref.includes('t.co') || ref.includes('twitter.') || ref.includes('x.com')) return 'social_twitter';
    if (ref.includes('linkedin.')) return 'social_linkedin';
    if (ref.includes('reddit.')) return 'social_reddit';
    if (ref.includes('pinterest.')) return 'social_pinterest';
    if (ref.includes('instagram.')) return 'social_instagram';
    if (ref.includes('youtube.')) return 'social_youtube';
    if (ref.includes('chatgpt.com') || ref.includes('openai.com')) return 'chatgpt';
    if (ref.includes('perplexity.')) return 'perplexity';
    if (ref.includes('claude.ai') || ref.includes('anthropic.')) return 'claude';
    if (ref.includes('meetbackdrops.') || ref.includes('streambackdrops.')) return 'internal';
    if (ref && ref !== 'direct') return `referral:${ref.replace(/^https?:\/\//, '').split('/')[0]}`;
    // No referrer + new visitor + deep page = almost certainly stripped search referrer.
    if (visitorType === 'new' && pageType === 'image_page') return 'google_images_inferred';
    if (visitorType === 'new' && (pageType === 'category' || pageType === 'blog_post')) return 'organic_inferred';
    return 'direct';
  })();

  const now = new Date();
  const row = [
    now.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    'page_view',
    originalSource,
    page,
    category || 'n/a',
    pageViewsInSession || 1,
    downloadsInSession || 0,
    visitorType || 'new',
    landingPage || '',
    sessionId || '',
    visitorId || 'unknown',
    now.toLocaleDateString('en-US', { timeZone: 'America/New_York' }),
    now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    req.headers['user-agent'] || 'unknown',
    currentSource,
    '',           // P: hashedIP (only filled by track-download)
    pageType,     // Q
    entrySource,  // R
  ];

  try {
    await redis.rpush('analytics:queue', JSON.stringify(row));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Page view queueing failed:', error.message);
    res.status(200).json({ success: false, error: error.message });
  }
}
