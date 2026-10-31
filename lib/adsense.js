// AdSense config. The publisher ID is public (it's also in public/ads.txt).
export const ADSENSE_CLIENT = 'ca-pub-8364914545820320';

// Manual ad-unit slot IDs, created in the AdSense dashboard after approval.
// An unset slot renders nothing, so placements can ship before the units exist.
export const AD_SLOTS = {
  categoryAfterGrid: process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY,
  imagePage: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IMAGE,
  blogPost: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BLOG,
};

// Routes that never load the ad script: purchase/checkout flows (ads there
// pull buyers off the page), admin tools, and the Zoom/Meet in-app iframes
// (their CSPs don't allow AdSense, and platform review would reject ads).
const NO_AD_PREFIXES = [
  '/admin',
  '/analytics',
  '/zoom-app',
  '/meet-addon',
  '/hd',
  '/hd-download',
  '/add-logo',
  '/logo-success',
  '/license-success',
  '/license-certificate',
  '/commercial-license',
  '/branded-backgrounds',
  '/indexnow-test',
  '/image-lookup',
];

export function adsAllowedOn(pathname = '') {
  return !NO_AD_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
