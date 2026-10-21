// "Add your logo" product — shared config for the editor, checkout and render.
//
// Only images David has approved in /admin/logo-review are sellable. Each
// approval stores the default logo spot as fractions of the frame (x, y = the
// logo's centre), picked by hand so it lands on open wall rather than behind
// the caller's head, plus where the render finds the base image: `png` (free
// file at the R2 root) and, when an HD master exists, `hdKey` in the private
// streambackdrops-premium bucket.
import logoReady from '../data/logoReady.json';

export const LOGO_PRICE_CENTS = 1900;
export const LOGO_PRICE_LABEL = '$19';

// Delivered size: Teams/Zoom/Meet all recommend 1920×1080.
export const OUTPUT_WIDTH = 1920;
export const OUTPUT_HEIGHT = 1080;

export function getLogoSpot(slug) {
  const entry = logoReady.approved[slug];
  return entry ? { x: entry.x, y: entry.y } : null;
}

export function getLogoBase(slug) {
  const entry = logoReady.approved[slug];
  return entry ? { png: entry.png, hdKey: entry.hdKey || null } : null;
}

export function isLogoReady(slug) {
  return Boolean(logoReady.approved[slug]);
}

export function logoReadySlugs() {
  return Object.keys(logoReady.approved);
}
