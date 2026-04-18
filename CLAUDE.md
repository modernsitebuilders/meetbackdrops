# StreamBackdrops — Codebase Guide for Claude

## What this site is

StreamBackdrops is a Next.js site that offers free and premium (HD) virtual backgrounds for video calls. Users can browse by category, download free 1080p webp images, or purchase HD (2x resolution) versions.

---

## Image Storage — R2 (NOT Cloudinary)

All images are stored on **Cloudflare R2**, served via `https://assets.streambackdrops.com`.

URL pattern for free webp thumbnails:
```
https://assets.streambackdrops.com/webp/{category}/{filename}.webp
```

Example: `https://assets.streambackdrops.com/webp/easter-backgrounds/easter-background-03.webp`

> **Note:** `cloudinary-urls.json` is a legacy file from a previous Cloudinary setup. It is still referenced in `pages/hd.js` as a lookup step but is effectively empty for newer categories (Easter, Spring, etc.). The fallback URL construction is what actually works. Do not add new Cloudinary logic.

Premium HD PNG files (full resolution) are in a **separate private S3/R2 bucket** (`streambackdrops-premium`), accessed via signed URLs from `/api/hd-preview-url` and `/api/hd-s3-download`.

---

## Metadata — Primary Source of Truth

```
image-pipeline/final_manifest.json   ← PRIMARY (use this)
data/categoryData.js                  ← UI layer (derived from manifest)
public/data/image-metadata-complete.json  ← LEGACY (phase out)
```

**`final_manifest.json`** — Array of ~991 image objects:
```json
{
  "id": "art-gallery-:1",
  "slug": "art-gallery-01",
  "category": "art-galleries",
  "folder": "art-galleries",       // R2 subfolder path
  "image_webp": "art-gallery-01.webp",
  "download_png": "art-gallery-1.png",
  "title": "...",
  "description": "...",
  "alt": "...",
  "tags": [...]
}
```

> **`folder` field is the actual R2 path** — some merged categories (bookshelves, wall-shelves) split into bright/dark subfolders. Always use `folder` when constructing R2 URLs for those.

**`data/categoryData.js`** — Frontend-optimized arrays per category. Powers the `/category/[slug]` pages and `ImageGrid`. If an image is in the manifest but not here, it won't appear on the category page. Keep these in sync.

**`public/data/image-metadata-complete.json`** — Old system. Still used by `pages/hd.js` (`isHdOnly` function) to determine which images are HD-exclusive (no free version). Eventually should be replaced by an `isHD`/`hdOnly` field in the manifest.

---

## HD System

### Files involved
- `pages/hd.js` — the HD page (`/hd`). Contains the hardcoded `products` array and `CATEGORY_LABELS`.
- `lib/hdImages.js` — exports `HD_BASE_IDS` Set. Used by `ImagePreviewModal` and `HDComparisonHero` to show upsell prompts on category pages.
- `pages/api/hd-preview-url.js` — generates signed S3 URL for HD PNG preview.
- `pages/api/hd-s3-download.js` — serves HD PNG download.

### How HD products are defined (split across 3 places — fragile, needs future consolidation)
1. **`products` array in `pages/hd.js`** — the canonical list of what shows on the HD page. Each entry: `{ id, name, category }` where `id` is like `easter-background-03-hd`.
2. **`HD_BASE_IDS` in `lib/hdImages.js`** — the same base IDs (without `-hd`), used for upsell chips on category pages. Must stay in sync with `products`.
3. **`hdOnly` flag in `public/data/image-metadata-complete.json`** — marks images that have no free version (HD exclusive). Used by `isHdOnly()` in `hd.js` to show the "Exclusive" badge and change the preview behavior.

> **Sync rule:** If you add an HD product, add it to BOTH the `products` array in `hd.js` AND `HD_BASE_IDS` in `hdImages.js`. If it's HD-only (no free download), also set `hdOnly: true` in `image-metadata-complete.json`.

### HD thumbnail URL construction
```js
// In HdProductCard (pages/hd.js line ~452)
src={`https://assets.streambackdrops.com/webp/${product.category}/${product.id.replace('-hd', '')}.webp`}
```
The thumbnail webp must exist on R2 at that path. If the image doesn't exist in `data/categoryData.js` or `final_manifest.json`, the thumbnail is likely broken (image not on R2).

---

## Category System

### URL structure
- Category pages: `/category/{slug}` (e.g. `/category/easter-backgrounds`)
- Individual image pages: `/category/{slug}/{imageSlug}`

### Key config
- `lib/categories-config.js` — category slugs, names, SEO descriptions, counts. **Update counts here when adding images.**
- `data/categoryData.js` — image arrays per category. Update this when adding images to a category.
- `pages/category/[slug]/index.js` — dynamic category page template.

### Merged categories
Bookshelves and Wall Shelves are "merged" categories — they combine bright/dark sub-categories into one page, using the `folder` property on each image object to route to the correct R2 subfolder.

---

## Key pages
| Page | File | Notes |
|------|------|-------|
| Homepage | `pages/index.js` | Category grid, banners |
| Category | `pages/category/[slug]/index.js` | Dynamic, ISR |
| Individual image | `pages/category/[slug]/[imageSlug].js` | Dynamic |
| HD page | `pages/hd.js` | All HD logic is self-contained here |
| Browse | `pages/browse.js` | Search/filter across all images |
| Most popular | `pages/most-popular.js` | Scored rankings |
| Blog | `pages/blog/[slug].js` | Static blog posts |

---

## Scoring / Popularity
- `public/data/image-scores-static.json` — pre-computed popularity scores
- `lib/imageScoring.js` — scoring logic
- Used for featured images, "most popular" rankings, hub pages

---

## Common pitfalls after the R2 migration

1. **Don't add entries to `cloudinary-urls.json`** — it's legacy. R2 images use direct URL construction.
2. **If an HD thumbnail is broken**, check if the webp exists in `final_manifest.json` AND `data/categoryData.js`. Missing from both = not on R2.
3. **HD product sync** — `products` in `hd.js` and `HD_BASE_IDS` in `hdImages.js` must match. If a product is in one but not the other, upsell chips will be inconsistent.
4. **`folder` vs `category`** — For most images they're the same. For bookshelves/wall-shelves they differ (e.g. category=`bookshelves`, folder=`bookshelves-bright`). Always use `folder` for R2 paths on those categories.
5. **`image-metadata-complete.json` is legacy** — still used for `hdOnly` detection in `hd.js`. Don't rely on it for anything new; add fields to `final_manifest.json` instead.
