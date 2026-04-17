// Images are served from Cloudflare R2 via assets.streambackdrops.com.
// Upload new WebPs using image-pipeline/upload_nature_webps.py (boto3 → R2).
const BASE = 'https://assets.streambackdrops.com';

export function webpUrl(category, filename) {
  return `${BASE}/webp/${category}/${filename}`;
}

export function webpUrlAbsolute(category, filename) {
  return `${BASE}/webp/${category}/${filename}`;
}
