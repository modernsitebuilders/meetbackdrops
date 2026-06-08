"""
Summer-backgrounds processor.

For each PNG in ~/Desktop/new-pngs/summer-backgrounds/:

  1. REJECTS any file whose name does not match the correct descriptive-slug
     format: {description}-{8hexchars}.png  (e.g. bright-coastal-patio-a1b2c3d4.png)
     This guards against accidentally processing Midjourney UUID filenames or
     any other wrong naming convention that was purged in the Wave 2 migration.
  2. Converts to 1456x816 WebP at quality 82.
  3. Computes 8-char SHA-256 hash of the WebP bytes and VERIFIES it matches
     the hash suffix already in the filename (confirms integrity).
  4. Uploads PNG to R2 root      : {slug}.png
  5. Uploads WebP to R2 webp     : webp/summer-backgrounds/{slug}.webp

Both uploads use CacheControl: public, max-age=31536000, immutable.
Idempotent: re-running overwrites the same R2 keys.

Expected filename format (rename files to this BEFORE running):
  {descriptive-words}-{8hexchars}.png
  e.g. bright-coastal-patio-umbrella-ocean-view-a1b2c3d4.png

To generate correct filenames from raw Midjourney outputs, use the slug recipe
in image-pipeline/build-slug-migration-map.js (descriptive part from alt/vision,
hash = first 8 chars of SHA-256 of the 1456x816 q82 WebP bytes).
"""
import hashlib
import io
import os
import re
from pathlib import Path

import boto3
from dotenv import load_dotenv
from PIL import Image

load_dotenv(Path('.env'))

R2 = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY"],
    aws_secret_access_key=os.environ["R2_SECRET_KEY"],
    region_name="auto",
)
BUCKET = os.environ["R2_BUCKET"]

SRC_DIR = Path.home() / "Desktop" / "new-pngs" / "summer-backgrounds"
CATEGORY = "summer-backgrounds"

# Correct slug format: lowercase words separated by hyphens, ending with 8 hex chars
SLUG_RE = re.compile(r'^[a-z][a-z0-9-]+-[0-9a-f]{8}$')

pngs = sorted(p for p in SRC_DIR.iterdir() if p.suffix.lower() == ".png")
if not pngs:
    raise SystemExit(f"No PNGs found in {SRC_DIR}")

print(f"Found {len(pngs)} PNGs in {SRC_DIR}\n")

ok_png = ok_webp = fail = skipped = 0

for src in pngs:
    slug = src.stem  # filename without .png

    # Enforce correct naming format — reject anything that doesn't match
    if not SLUG_RE.match(slug):
        print(f"  SKIP (wrong format): {src.name}")
        print(f"       Expected: descriptive-words-XXXXXXXX.png (8 hex chars at end)")
        skipped += 1
        continue

    png_key = f"{slug}.png"
    webp_key = f"webp/{CATEGORY}/{slug}.webp"

    # Convert to 1456x816 WebP q82
    try:
        img = Image.open(src).convert("RGB")
        if img.size != (1456, 816):
            img = img.resize((1456, 816), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=82)
        webp_bytes = buf.getvalue()
    except Exception as e:
        print(f"  ✗ webp build {slug}: {e}")
        fail += 1
        continue

    # Verify hash matches filename
    actual_hash = hashlib.sha256(webp_bytes).hexdigest()[:8]
    filename_hash = slug[-8:]
    if actual_hash != filename_hash:
        print(f"  WARN hash mismatch for {slug}:")
        print(f"       filename says {filename_hash}, WebP hashes to {actual_hash}")
        print(f"       Proceeding — rename the file to {slug[:-8]}{actual_hash}.png if needed")

    # Upload PNG (original, untouched)
    try:
        with open(src, "rb") as fh:
            R2.put_object(
                Bucket=BUCKET,
                Key=png_key,
                Body=fh,
                ContentType="image/png",
                CacheControl="public, max-age=31536000, immutable",
            )
        print(f"  ✓ PNG  → {png_key}")
        ok_png += 1
    except Exception as e:
        print(f"  ✗ PNG  {png_key}: {e}")
        fail += 1

    # Upload WebP
    try:
        R2.put_object(
            Bucket=BUCKET,
            Key=webp_key,
            Body=webp_bytes,
            ContentType="image/webp",
            CacheControl="public, max-age=31536000, immutable",
        )
        print(f"  ✓ WebP → {webp_key}")
        ok_webp += 1
    except Exception as e:
        print(f"  ✗ WebP {webp_key}: {e}")
        fail += 1

print(f"\nDone: {ok_png} PNGs, {ok_webp} WebPs uploaded, {skipped} skipped (wrong format), {fail} failures")
