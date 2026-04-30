# StreamBackdrops — Codebase Guide for Claude

## ⚠️ BRAND VOICE — READ FIRST, DO NOT IGNORE

**StreamBackdrops is a virtual set design studio for corporate / executive video presence. It is NOT, and has NEVER BEEN, a gaming, streamer, Twitch, esports, or livestreamer brand.** The literal word "Stream" in the brand name is a legacy relic of the company name only — it does **not** signal Twitch/livestream context. The audience is corporate professionals on Zoom, Microsoft Teams, and Google Meet.

### Strict prohibitions for any copy, alt-text, schema, meta tags, JSON-LD, blog content, comments in code, image metadata, or any user-visible string:

- ❌ **NEVER** use: `gamer`, `gamers`, `gaming`, `Twitch`, `streamer`, `streamers`, `livestreamer`, `esports`, `OBS overlay`, `stream overlay`, `gaming stream`, `Discord stream`, or any equivalent framing.
- ❌ **NEVER** describe images, the studio, the audience, or the use case in terms of gamers, streamers, or live broadcasting as a primary use case. (A factual mention of OBS Studio or "livestreams" as one item among many in a *legal/license use-case list* is acceptable; framing the **brand** that way is not.)
- ❌ **NEVER** add `gaming`, `streamer`, `twitch`, `esports`, etc. to JSON-LD `keywords`, schema `audience`, `knowsAbout`, OG tags, or `<meta name="keywords">`.

### Required brand vocabulary (use these instead):

| Use this | Not this |
|---|---|
| Virtual backgrounds / virtual sets / designed interiors / virtual environments *(secondary)* | "virtual environments" as a primary product term — reads as VR/metaverse |
| Corporate video calls / executive video calls / professional video calls | "streaming" / "for streamers" / "executive video presence" *(too jargony)* |
| Studio-designed, 4K-upscaled, designed as sets, composed for camera, engineered for codec compression | "AI-architected" / "architected" *(business-speak — use "designed")*; "stock photos" or "free downloads" as headline framing |
| Studio / Virtual Set Design Studio / StreamBackdrops Studio | "background site", "image library" |
| Zoom, Microsoft Teams, Google Meet, Webex | "Twitch", "OBS-first", "Discord" |
| Webinars, livestreams, broadcast productions *(in license use-case lists only)* | "Gaming streams", "🎮 streaming" |

**Verb of choice**: `designed` (plain English, universally understood). Avoid `architected` as a default verb — it's business-speak. `engineered` is OK only when paired with a specific technical claim (e.g. "engineered for codec compression"). `composed` is OK in the phrase "composed for camera". `produced` is OK for studio-output framing.

### Why this matters

The site went through a brand pivot in April 2026 from a generic free-virtual-background framing to a B2B Studio positioning targeting corporate buyers, executive teams, and licensing customers. Any AI-generated content that drifts back toward gamer/streamer language undoes that work and damages SEO, conversion, and brand authority. This file is your primary source — if a piece of legacy copy in the codebase still uses old framing, fix it; do not propagate it.

If you're regenerating image manifests, alt-text, schema, meta tags, or any structured copy, run [image-pipeline/rewrite-manifest-copy.js](image-pipeline/rewrite-manifest-copy.js) — the templates there encode the approved voice.

---

## What this site is

StreamBackdrops is a virtual set design studio producing AI-architected, 4K-upscaled environments for executive video presence on Zoom, Microsoft Teams, and Google Meet. Free sample environments are available without signup; HD Editions (2912×1632) are sold individually or in bundles at `/hd`. Brands integrate their logo into studio environments through the Branded Backgrounds offer at `/branded-backgrounds` (per-customer composites — base library images stay in the catalog; only the logo placement is exclusive to the buyer).

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
