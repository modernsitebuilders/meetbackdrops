# MeetBackdrops — Codebase Guide for Claude

## ⚠️ BRAND VOICE — READ FIRST, DO NOT IGNORE

**MeetBackdrops is a virtual set design studio for corporate / executive video presence. It is NOT, and has NEVER BEEN, a gaming, streamer, Twitch, esports, or livestreamer brand.** The audience is corporate professionals on Zoom, Microsoft Teams, and Google Meet.

> **Brand history (read once, internalize):** This site was originally **StreamBackdrops**. It rebranded to **MeetBackdrops** in May 2026 to remove the misleading "Stream" prefix that suggested Twitch / livestreaming context and to align the domain with the actual buyer surface (Zoom, Teams, Google **Meet**). The brand pivot to B2B Studio positioning happened earlier, in April 2026 — the rename completed it.
>
> **Storage identifiers intentionally retain the old name** (do not rename them — they are not brand surfaces, and renaming breaks live URLs):
> - `assets.streambackdrops.com` — Cloudflare R2 public CDN for image webps (~1,000 URLs in production)
> - `streambackdrops-premium` — private S3 bucket for HD PNG downloads
> - `stream-backdrops-videos` — S3 bucket for video assets (referenced in vercel.json CSP)
>
> If you encounter `StreamBackdrops` in commit history, old worktrees, manifest backup files, or `Header-BACKUP.js`, that is the prior brand — do not propagate it into any new content. If you find it in *current* user-facing copy, treat that as a rebrand miss and fix it.

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
| Studio / Virtual Set Design Studio / MeetBackdrops Studio | "background site", "image library" |
| Zoom, Microsoft Teams, Google Meet, Webex | "Twitch", "OBS-first", "Discord" |
| Webinars, livestreams, broadcast productions *(in license use-case lists only)* | "Gaming streams", "🎮 streaming" |

**Verb of choice**: `designed` (plain English, universally understood). Avoid `architected` as a default verb — it's business-speak. `engineered` is OK only when paired with a specific technical claim (e.g. "engineered for codec compression"). `composed` is OK in the phrase "composed for camera". `produced` is OK for studio-output framing.

**Brand identity colors (locked)**:
- Wordmark dark: `#111827`
- Gold accent (Studio tag, lockup): `#E0A82E`
- Page neutral: `#F5F5F5`
- Header copper-bronze accent (active nav, wishlist heart, wishlist badge): `#9a6a3a` — kept from the prior identity, not yet unified with the new gold; if a future task unifies the header palette, change those references too.

### Why this matters

The April 2026 brand pivot moved the site from a generic free-virtual-background framing to a B2B Studio positioning targeting corporate buyers, executive teams, and licensing customers. The May 2026 domain rename to MeetBackdrops.com completed that pivot by removing the gamer-adjacent "Stream" prefix from the brand surface. Any AI-generated content that drifts back toward gamer/streamer language — or back toward the StreamBackdrops name in user-facing copy — undoes that work and damages SEO, conversion, and brand authority. This file is your primary source.

If you're regenerating image manifests, alt-text, schema, meta tags, or any structured copy, run [image-pipeline/rewrite-manifest-copy.js](image-pipeline/rewrite-manifest-copy.js) — the templates there encode the approved voice and the MeetBackdrops brand suffix.

---

## What this site is

MeetBackdrops is a virtual set design studio producing studio-designed, 4K-upscaled environments for executive video presence on Zoom, Microsoft Teams, and Google Meet. Free sample environments are available without signup; HD Editions (2912×1632) are sold individually or in bundles at `/hd`. Brands integrate their logo into studio environments through the Branded Backgrounds offer at `/branded-backgrounds` (per-customer composites — base library images stay in the catalog; only the logo placement is exclusive to the buyer).

---

## Image Storage — R2 (NOT Cloudinary)

All images are stored on **Cloudflare R2**, served via `https://assets.streambackdrops.com`. **This subdomain intentionally retains the pre-rebrand name** — see the brand history note above. Do not migrate it without a coordinated re-upload of all ~1,000 image URLs and an update of every reference in code.

URL pattern for free webp thumbnails:
```
https://assets.streambackdrops.com/webp/{category}/{filename}.webp
```

Example: `https://assets.streambackdrops.com/webp/easter-backgrounds/easter-background-03.webp`

> **Note:** `cloudinary-urls.json` is a legacy file from a previous Cloudinary setup. It is still referenced in `pages/hd.js` as a lookup step but is effectively empty for newer categories (Easter, Spring, etc.). The fallback URL construction is what actually works. Do not add new Cloudinary logic.

Premium HD PNG files (full resolution) are in a **separate private S3 bucket** (`streambackdrops-premium`), accessed via signed URLs from `/api/hd-preview-url` and `/api/hd-s3-download`. Upload new HD PNGs with [scripts/upload-hd-to-s3.js](scripts/upload-hd-to-s3.js).

---

## Metadata — Primary Source of Truth

```
image-pipeline/final_manifest.json   ← PRIMARY (use this)
data/categoryData.js                  ← UI layer (must align with manifest)
public/data/image-metadata-complete.json  ← LEGACY (phase out)
```

**`final_manifest.json`** — Array of ~1,029 image objects:
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

**`data/categoryData.js`** — Frontend-optimized arrays per category. Powers the `/category/[slug]` pages and `ImageGrid`. If an image is in the manifest but not here, it won't appear on the category page. Keep these in sync — both should report the same per-category counts and the same total (currently 1,073 entries in each).

**`public/data/image-metadata-complete.json`** — Old system. Still used by `pages/hd.js` (`isHdOnly` function) to determine which images are HD-exclusive (no free version). Eventually should be replaced by an `isHD`/`hdOnly` field in the manifest.

### Adding new images

#### Storage layout (free tier)

Both webp and PNG live on R2, at different paths:

- **WebP (site grid)** → `https://assets.streambackdrops.com/webp/{folder}/{filename}.webp`
- **PNG (free download)** → `https://assets.streambackdrops.com/{filename}.png` (root level — see [lib/useImageDownload.js](lib/useImageDownload.js))

R2 credentials live in `image-pipeline/.env` (`R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_ENDPOINT`, `R2_BUCKET`). The HD/4K PNG pipeline (uploads to `streambackdrops-premium` S3) is separate and only runs when you're producing HD editions — skip it for normal free-tier additions.

#### Filename format — critical, read first

**All image filenames use the descriptive-slug + 8-char SHA-256 hash format:**

```
{descriptive-words}-{8hexchars}.webp / .png
```

Examples: `bright-coastal-patio-umbrella-ocean-view-a1b2c3d4.webp`, `shaded-stone-5128a46e.webp`

The hash is the first 8 hex characters of the SHA-256 of the **1456×816 q82 WebP bytes**. The descriptive part comes from the image's alt text (stop-word filtered, max ~60 chars) — see `image-pipeline/build-slug-migration-map.js` for the exact recipe.

**This format was fully migrated in Wave 2 (June 2026). The old `{category}-NN` sequential format (e.g. `summer-background-39.png`) was purged from R2 and all data files. Never use it again.**

Raw Midjourney output filenames (e.g. `streambackdrops_Architectural_photography_of_a_..._{uuid}_0.png`) must be renamed to this format before or immediately after upload. They must never be used as R2 keys.

#### Workflow — the standard routine (deterministic; the pipeline decides)

**The pipeline determines category, metadata, and filename from each image. Do NOT hand-assign categories or write copy — that decision belongs to the model, from the image content.** Drop the raw Midjourney PNGs in `~/Downloads`, then run ONE command:

```bash
npm run add-images                                    # process today's batch
# or:  ./image-pipeline/run-batch.sh --date 2026-06-09   # a specific day's batch
```

That is [image-pipeline/run-batch.sh](image-pipeline/run-batch.sh), which chains these deterministic steps (each re-runnable; nothing requires editing a script per batch):

1. **Number** — `process_new_images.py --number` renames the batch's raw `streambackdrops_*.png` (selected by mtime = the batch date) to `mj-<date>-NNN.png`, stripping the Midjourney prompt text so it can't bias the category or the final name.
2. **Pipeline** — `process_new_images.py` for each numbered file: WebP-converts (1456×816 q82) + computes `hash8`; calls OpenAI vision (gpt-4o-mini, temp 0, seed 42) which **chooses the category** from the canonical list AND writes title/description/alt/tags (brand-voice validated, retried on violation); derives `slug = {descriptive-from-alt}-{hash8}`; uploads `webp/{folder}/{slug}.webp` + `{slug}.png` to R2; renames the numbered file to `{slug}.png`. Writes complete manifest entries → `process_new_images_output.json`.
3. **Merge** — `merge-batch.js` routes each entry into its category's `IMAGES_*` array in `data/categoryData.js` and appends the full manifest entry (category + copy + tags) to `final_manifest.json`. Covers every category, incl. the merged bookshelves/wall-shelves bright/dark folders.
4. **Counts** — `sync-counts.js` recomputes every `CATEGORIES[*].count` and `TOTAL_IMAGES` in `lib/categories-config.js` from the manifest (authoritative — never bump counts by hand).
5. **Sitemaps** — `npm run generate:sitemaps` rebuilds the image sitemaps from the manifest.
6. **Build** — full `npm run build` (all validators) as the gate.

When it passes: review `git diff --stat` and the run's "By category" split, then commit + push (Vercel auto-deploys `main`). **If a category call looks wrong, raise it with the human — the model's classification is the source of truth; do not silently re-bucket it.**

Notes:
- `OPENAI_API_KEY` must be in `image-pipeline/.env` (~$0.001/image).
- The mtime window keeps older un-renamed Downloads files out of the batch automatically — you never run against the whole folder.
- The pipeline can only classify into **existing** categories (the canonical list lives in `CATEGORY_GUIDE` in `process_new_images.py`). Creating a NEW category (new `IMAGES_*` array + `categoryInfo`/`folderMap` in categoryData, config entry, `getStaticPaths`, homepage/nav/footer/related, `analyticsNormalize` `CANONICAL_CATEGORIES`, sitemap-pages) is a separate manual scaffolding task; afterward, add the new slug + a one-line description to `CATEGORY_GUIDE` so the pipeline can route to it.

#### Sitemaps regenerate automatically

Three of the four sitemaps are generated by [scripts/generate-sitemaps.js](scripts/generate-sitemaps.js) from `final_manifest.json` and run as part of `npm run prebuild`:

- `public/sitemap.xml` (sitemap index)
- `public/sitemap-images.xml` (one `<url>` per category, all images nested)
- `public/sitemap-image-pages.xml` (one `<url>` per individual image page)

You don't need to touch these when adding images. To regenerate locally without a full build: `npm run generate:sitemaps`.

The fourth, **`public/sitemap-pages.xml`**, is hand-maintained — it holds priorities and lastmods for top-level pages, blog posts, category landing pages, and utility pages. Edit it directly when adding a new category, blog post, or top-level page. When adding new images to an existing category, optionally bump that category's `<lastmod>` to today.

### IndexNow — ping Bing about new pages (automated)

Sitemaps let Bing *eventually* find new pages; **IndexNow tells it immediately.** Bing Webmaster Tools flags "recently published pages were not submitted via IndexNow" if you skip this.

**This is automated via GitHub Actions** — [.github/workflows/submit-indexnow.yml](.github/workflows/submit-indexnow.yml) runs daily (`0 5 * * *`) and submits every page URL to IndexNow. Pages added by an `add-images` batch are picked up automatically within ~24h of being pushed — no manual step. IndexNow/Bing dedupe, so a full daily sweep is safe. (GitHub Actions, not Vercel cron — the site is on the Vercel **Hobby** plan, which caps cron jobs; don't add this to `vercel.json` `crons`.)

The workflow just runs the dependency-free CLI, which reads the **committed** sitemaps in `public/` (= what's deployed on `main`). To submit **immediately** instead of waiting for the daily run, either click **Run workflow** on the Action, or run it locally after a deploy:

```bash
npm run submit:indexnow            # sweeps all four leaf sitemaps, submits every page URL
```

This is [scripts/submit-indexnow.js](scripts/submit-indexnow.js). To submit just specific pages: `--urls-file new-pages.txt` (newline-delimited absolute URLs) or `--urls a,b,c`. Use `--dry-run` to preview, `--limit N` to cap.

> **Only submit pages that are live.** The CLI reads the committed sitemaps, so the scheduled run is always in sync with `main` (= deployed). If you run it locally, do so *after* pushing, not before. The IndexNow key file lives at `public/c558eb0813634eceb45913b9e7934dba.txt` — its filename and one-line body are both the key; never rename or edit it. There's also a manual one-URL endpoint (`/api/indexnow`) + test page (`/indexnow-test`) for spot submissions.

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
- `lib/categories-config.js` — category slugs, names, SEO descriptions, counts, and `TOTAL_IMAGES`. **Update counts here when adding images.**
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

## SEO meta budgets (enforced)

Every page that ships to the index MUST have:
- **Title** between 20 and 65 characters (Bing/Google truncate above ~65)
- **Meta description** between 110 and 160 characters

These are enforced by [scripts/check-seo-meta.js](scripts/check-seo-meta.js), which runs as part of `npm run prebuild` and can be invoked directly with `npm run check:seo`. The script covers:

- Top-level pages in `pages/*.js` (the `<Layout title=... description=...>` props)
- `pages/privacy.js`, `pages/license.js`, `pages/terms.js` (raw `<Head>`)
- `components/Layout.js` default props (the fallback when a page omits a prop)
- All categories in `data/categoryData.js` (rendered through the `[slug]` template — name + optional `seoDescription` override)
- All blog posts in `data/blogPosts.js`

When you add a new page, category, or blog post, the title/description will be validated automatically. If you add a new top-level page that uses `<Layout>`, also add its path to `LAYOUT_PAGES` in the script. If a page is intentionally `noindex` (utility/admin), add it to `SKIP_PAGES` or `NOINDEX_RAW_HEAD_PAGES` so the description isn't required.

**Do not add commentary to source files claiming a string is "intentionally too short/long for SEO."** Either it's within budget (and the comment is noise) or it's not (and the comment is wrong). The script is the source of truth.

---

## Common pitfalls

1. **Don't add entries to `cloudinary-urls.json`** — it's legacy. R2 images use direct URL construction.
2. **If an HD thumbnail is broken**, check if the webp exists in `final_manifest.json` AND `data/categoryData.js`. Missing from both = not on R2. Always confirm with a curl HEAD against `assets.streambackdrops.com/webp/{category}/{filename}.webp` before assuming the manifest is right — the manifest has been known to retain ghost entries pointing to deleted files.
3. **HD product sync** — `products` in `hd.js` and `HD_BASE_IDS` in `hdImages.js` must match. If a product is in one but not the other, upsell chips will be inconsistent.
4. **`folder` vs `category`** — For most images they're the same. For bookshelves/wall-shelves they differ (e.g. category=`bookshelves`, folder=`bookshelves-bright`). Always use `folder` for R2 paths on those categories.
5. **`image-metadata-complete.json` is legacy** — still used for `hdOnly` detection in `hd.js`. Don't rely on it for anything new; add fields to `final_manifest.json` instead.
6. **Manifest ↔ categoryData filename naming** — the two sources must use identical filenames. Past bugs: `nature-landscape-NN.webp` (singular, on R2) vs `nature-landscapes-NN.webp` (plural, in manifest). When adding a category or rewriting filenames, cross-check both sides with a Set diff.
7. **Don't rename `assets.streambackdrops.com`, `streambackdrops-premium`, or `stream-backdrops-videos`** — they're storage identifiers retained from the prior brand. See the brand history note at the top.
8. **Tags drive collection facets — the routine generates them; don't bypass it.** The standard `npm run add-images` routine writes tags as part of the vision step, so new images surface correctly in persona/industry **collections** (facets in [lib/collections/facets.js](lib/collections/facets.js) are tag-driven). If you ever sidestep the routine and add stubs manually, they ship with **empty `tags`** (`rewrite-manifest-copy.js` does NOT write tags) and must be back-filled with `vision-full.js --slugs-file` + `merge-vision-targeted.js`. Quick check after a batch: `node -e 'const fm=require("./image-pipeline/final_manifest.json");console.log(fm.filter(e=>!e.tags||!e.tags.length).length+" entries with empty tags")'`.
9. **New category not tracked in analytics rollups** — when you add a category, add its slug to `CANONICAL_CATEGORIES` in [lib/analyticsNormalize.js](lib/analyticsNormalize.js), or its page views normalize to `null` and drop out of category rollups. Collection/persona pages are tracked separately via the `collection:<slug>` category key set in [components/Analytics.js](components/Analytics.js).

---

## Platform apps — Zoom App & Google Meet Add-on

Two video-call integrations (both on-brand: Zoom / Google Meet). **Do not surface either on the marketing site until it is approved/published** — links to unpublished/unapproved apps mislead users.

**Current state (as of 2026-06-12):**
- **Zoom App** — `pages/zoom-app/`, `lib/zoom/*`, `/api/zoom/*`. Uses Zoom OAuth; **can** apply backgrounds in-client via `setVirtualBackground`. On-site promotion = the single **"Use in Zoom"** OAuth-install button in [components/ImagePreviewModal.js](components/ImagePreviewModal.js). **Submitted to the Zoom Marketplace — awaiting approval.**
- **Google Meet Add-on** — [pages/meet-addon/index.js](pages/meet-addon/index.js), HTTP deployment `meetbackdrops-prod` (GCP project number `151425915185`), CSP framing override in `vercel.json` (`/meet-addon` block). Reuses `/api/zoom/backgrounds` + `/api/zoom/img`. **Browse + download only — Meet's SDK has NO API to set the camera background** (and custom-bg upload is Chrome-hwaccel + Workspace-admin gated). **Not yet published** to the Google Workspace Marketplace.

**Publishing the Meet add-on (requires Google review for public listing):** Google Cloud Console → **Google Workspace Marketplace SDK** (same project) → **Store Listing** (fill out) + **App Configuration** visibility, then submit the **Meet add-on Review Request form**. Public listing → Google team reviews first. Private/internal listing (your own Workspace org only) → **no review**, appears under "Internal Apps." Store Listing **requires a privacy-policy URL that covers the add-on** — so the privacy.js update below is a *pre-submission* prerequisite, not post-approval.

**Pre-submission TODO (do before submitting for review):**
- `pages/privacy.js` — add an **"App Integrations"** section: Zoom App stores Zoom OAuth access/refresh tokens in an encrypted http-only cookie ([lib/zoom/session.js](lib/zoom/session.js)), accesses no meetings/contacts; Meet Add-on accesses no Google account data, only loads the catalog + logs anonymous `meet_download` events. (`license.js` already covers Zoom/Teams/Meet generically — no change needed.)

**Post-approval TODO (only after each app is live; parity for both):**
1. **Preview modal** — add a **"Use in Google Meet"** CTA next to "Use in Zoom" in `ImagePreviewModal.js`, linking to the published Workspace Marketplace listing (NOT `/meet-addon` — that's the in-Meet iframe). Frame it as "browse in Meet"; **do not imply one-click apply parity** with Zoom (Meet can't apply the background).
2. **Apps & Integrations page** — build one promoting *both* apps (neither is linked from the main site today) + a footer/nav link.
3. **Blog mentions** — add the apps as a tip in `data/blog-content/virtual-background-setup-by-platform.js`, `zoom-teams-google.js`, `how-to-change-zoom-background-pc.js` (and job-interview / etiquette posts where it fits). Brand voice still applies; analytics `meet_download` would need adding to `DOWNLOAD_EVENTS` to count toward popularity scoring.
