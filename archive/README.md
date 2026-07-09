# archive/

Retired working files moved out of the repo root to keep it legible. **Nothing
here is referenced by live code** (`pages/`, `lib/`, `components/`, active
`scripts/`, `image-pipeline/`, `data/`) or by `package.json` — verified by
basename grep across the tree before moving. Everything is preserved in git
history and is fully restorable; this was a relocation, not a deletion.

## legacy-root/
One-off operational scripts and their data outputs that used to litter the repo
root — image-batch processors, filename generators, metadata/blog/sitemap
updaters, HD upload scripts, bundle builders, and their `*.json` / `*.csv`
outputs. Kept as a flat directory so any internal relative `require()` between a
script and its sibling data file still resolves if one is ever re-run for
reference. Also holds `temp` and `_app.js.broken` (a stale broken copy of
`pages/_app.js`).

**Kept at root on purpose** (do not move these here):
- `cloudinary-urls.json` — legacy, but still read by 8 live pages/components.
- `generate-category-counts.js` — wired to `npm run update-counts`.

## kitchen-staging/
~24 MB of local "kitchen" category staging PNG/WebP from March 2026. Never
referenced by any route — the live kitchens category is served from R2.

If a future cleanup confirms none of this is needed, `git rm -r archive/` removes
it in one step.
