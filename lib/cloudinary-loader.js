/**
 * Custom Next.js image loader that delegates to Cloudinary.
 * Inserts a width transformation into the Cloudinary URL so Next.js
 * can generate a proper srcset — without routing images through Vercel's
 * optimization pipeline (which consumes Fast Origin Transfer bandwidth).
 *
 * URL shape (raw WebP, no transformation prefix):
 *   https://res.cloudinary.com/{cloud}/image/upload/webp/{path}
 * Becomes:
 *   https://res.cloudinary.com/{cloud}/image/upload/w_{width}/webp/{path}
 *
 * Uses "/" separator (separate transformation step) rather than "," so that
 * "webp" is correctly parsed as the folder prefix, not a transformation param.
 */
export default function cloudinaryLoader({ src, width }) {
  if (src.startsWith('https://res.cloudinary.com')) {
    return src.replace('/image/upload/', `/image/upload/w_${width}/`);
  }
  // Non-Cloudinary images: return as-is
  return src;
}
