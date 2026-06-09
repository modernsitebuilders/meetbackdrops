#!/usr/bin/env bash
#
# run-batch.sh — the standard routine for adding a batch of new images.
#
# The PIPELINE decides category, metadata, and filename from each image. The
# operator never hand-assigns a category or writes copy. You drop the raw
# Midjourney PNGs in ~/Downloads, then run this.
#
#   ./image-pipeline/run-batch.sh                 # process today's batch
#   ./image-pipeline/run-batch.sh --date 2026-06-09   # a specific day's batch
#
# Deterministic steps:
#   1. number      raw streambackdrops_*.png  →  mj-<date>-NNN.png  (strips prompt)
#   2. pipeline    vision classifies category + writes title/desc/alt/tags;
#                  slug = vision-alt + content-hash; uploads webp+png to R2;
#                  renames the numbered file to its slug
#   3. merge       routes each into its category's array + manifest (carries copy)
#   4. counts      categories-config counts + TOTAL_IMAGES recomputed from manifest
#   5. sitemaps    regenerated from the manifest
#   6. build       full validator + Next.js build (gate before you deploy)
#
# After it passes: review `git diff`, then commit + push (Vercel auto-deploys).
set -euo pipefail

PIPE_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$PIPE_DIR/.." && pwd)"
cd "$PIPE_DIR"

echo "▶ 1/6  numbering raw files (neutralize Midjourney prompt names)"
python3 process_new_images.py --number "$@"

echo "▶ 2/6  vision pipeline — classify + metadata + slug + upload"
python3 process_new_images.py "$@"

echo "▶ 3/6  merge into final_manifest.json + data/categoryData.js"
node merge-batch.js

echo "▶ 4/6  sync counts from manifest"
node sync-counts.js

echo "▶ 5/6  regenerate sitemaps"
cd "$ROOT" && npm run generate:sitemaps

echo "▶ 6/6  validate production build"
if npm run build >/tmp/run-batch-build.log 2>&1; then
  echo "   build OK"
else
  echo "   BUILD FAILED — see /tmp/run-batch-build.log"; exit 1
fi

echo
echo "✓ Batch integrated deterministically. Categories were chosen by the pipeline."
echo "  Review:  git status  &&  git diff --stat"
echo "  Deploy:  git add -A && git commit -m '...' && git push origin main"
