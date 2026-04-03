/**
 * Custom Next.js image loader that delegates to Cloudinary.
 * Inserts a width transformation into the Cloudinary URL so Next.js
 * can generate a proper srcset — without routing images through Vercel's
 * optimization pipeline (which consumes Fast Origin Transfer bandwidth).
 *
 * URL shape Cloudinary produces:
 *   https://res.cloudinary.com/{cloud}/image/upload/f_auto,q_auto/webp/{path}
 * Becomes:
 *   https://res.cloudinary.com/{cloud}/image/upload/w_{width},f_auto,q_auto/webp/{path}
 */
export default function cloudinaryLoader({ src, width }) {
  if (src.startsWith('https://res.cloudinary.com')) {
    return src.replace('/image/upload/', `/image/upload/w_${width},`);
  }
  // Non-Cloudinary images: return as-is
  return src;
}
