#!/usr/bin/env python3
"""
process_new_images.py
---------------------
One-shot processor for a batch of new Midjourney PNG files.

Steps per image:
  1. Convert PNG → WebP (1456×816, quality 82)
  2. SHA-256 the WebP bytes → take first 8 hex chars (hash8)
  3. Build descriptive slug from Midjourney prompt text in filename
  4. Upload PNG  → R2 root key: {slug}.png
  5. Upload WebP → R2 key:      webp/{folder}/{slug}.webp
  6. Rename source PNG in-place to {slug}.png
  7. Write manifest stubs to process_new_images_output.json

Run from image-pipeline/:
  cd image-pipeline && python3 process_new_images.py

Or dry-run (no uploads, no renames):
  cd image-pipeline && python3 process_new_images.py --dry-run
"""

import hashlib
import json
import os
import re
import sys
from datetime import datetime
from glob import glob
from io import BytesIO
from pathlib import Path

import boto3
from dotenv import load_dotenv
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

R2_ACCESS_KEY    = os.environ["R2_ACCESS_KEY"]
R2_SECRET_KEY    = os.environ["R2_SECRET_KEY"]
R2_ENDPOINT      = os.environ["R2_ENDPOINT"]
R2_BUCKET        = os.environ["R2_BUCKET"]

WEBP_WIDTH   = 1456
WEBP_HEIGHT  = 816
WEBP_QUALITY = 82
HASH_LEN     = 8
DESC_MAX     = 60

DRY_RUN = "--dry-run" in sys.argv

DOWNLOADS = Path("/Users/davidmiles/Downloads")

# Only files from this batch (downloaded 2026-06-08, 16:50 onward). A uuid can
# also match older un-renamed variants of the same Midjourney job sitting in
# Downloads, so we constrain by modification time to this batch's window.
BATCH_START_MTIME = datetime(2026, 6, 8, 16, 50, 0).timestamp()

# ── Source batch: 2026-06-08 16:50 expansion batch ────────────────────────────
# Files are matched by their Midjourney job-id (uuid prefix) so we never have to
# transcribe the full prompt-laden filenames. Category is the INITIAL bucket;
# the vision + recategorize pass refines later. Plain-wall images go to the new
# neutral-backgrounds category. Categories were assigned after viewing the
# ambiguous wall/minimalist/empty images.

UUID_CATEGORY = {
    # neutral / plain walls (NEW category — "Neutral & Plain Walls")
    "00eb831e": "neutral-backgrounds",  # plain warm-cream plaster wall
    "046e4bed": "neutral-backgrounds",  # blank white wall, single minimal table
    "3e0c267e": "neutral-backgrounds",  # charcoal matte wall, two spotlights
    "43fbff9c": "neutral-backgrounds",  # soft sage plaster wall
    "6b36b9b4": "neutral-backgrounds",  # empty room, blank white wall dominant
    "7b59fa8c": "neutral-backgrounds",  # white textured plaster, full frame
    "812abcb5": "neutral-backgrounds",  # light greige concrete wall
    "88822c80": "neutral-backgrounds",  # ribbed white minimal wall
    "d2c9f816": "neutral-backgrounds",  # blue seamless wall
    "d7873ac8": "neutral-backgrounds",  # warm-white wall, bare desk to side
    "daa3bb16": "neutral-backgrounds",  # empty cream-walled minimalist room
    # wall-shelves (has floating wood shelves → bright subfolder)
    "11ca5842": "wall-shelves",
    # home-office (therapy / counseling / telehealth / wellness / home studies)
    "0ad457a8": "home-office",  # art deco home office
    "0facadbd": "home-office",  # minimalist home office, furnished desk
    "21e661d4": "home-office",  # contemporary executive home office
    "2f2b640f": "home-office",  # calming online consultation
    "33ef428c": "home-office",  # calming therapy office
    "42ded55f": "home-office",  # DSLR modern home office
    "468eda8d": "home-office",  # contemporary executive home office
    "56588ab4": "home-office",  # telehealth, mental-health pro
    "5e90b0c8": "home-office",  # therapist private office
    "72058675": "home-office",  # professional home office, clean desk
    "7b1b1d04": "home-office",  # Mediterranean villa home office
    "a09f45c8": "home-office",  # serene telehealth, soft focus
    "b926b6a8": "home-office",  # architect private studio
    "b9e61640": "home-office",  # professional counselors office
    "e2d497fe": "home-office",  # serene counseling office
    "f8c0d774": "home-office",  # wellness practitioner private office (2 variants)
    "f96d8880": "home-office",  # real home office, single warm
    # office-spaces (corporate / medical / executive / conference / lobby / open office)
    "01056bd1": "office-spaces",  # lean modern open office
    "0a6e6175": "office-spaces",  # modern clean tech-company office
    "0be7d783": "office-spaces",  # international executive office
    "16722c21": "office-spaces",  # modern tech-company conference room
    "16b1f0a8": "office-spaces",  # bright luxury corporate meeting room
    "226d2511": "office-spaces",  # lean modern open office
    "3596e74c": "office-spaces",  # modern glass conference room
    "36df5811": "office-spaces",  # empty minimalist executive boardroom
    "4e495534": "office-spaces",  # real glass lobby
    "52802bec": "office-spaces",  # modern corporate office backdrop
    "5f84a872": "office-spaces",  # professional medical office
    "7cc6d22e": "office-spaces",  # law firm lobby, reception
    "84e2ac18": "office-spaces",  # modern dental / medical clinic
    "901b9fd7": "office-spaces",  # modern engineering office
    "94715fff": "office-spaces",  # high-end clinical telemedicine
    "9a98d19d": "office-spaces",  # university lobby, information desk
    "9b4f972a": "office-spaces",  # corporate executive office, wooden
    "9fc3044f": "office-spaces",  # real conference room
    "a744d789": "office-spaces",  # architectural empty open office, cubicles
    "a8408b71": "office-spaces",  # financial executive office, marble
    "b1ab0ca7": "office-spaces",  # upscale real estate office
    "c2bb59aa": "office-spaces",  # aspirational corporate office
    "cadac7f0": "office-spaces",  # sleek corporate meeting space
    "ce17feb7": "office-spaces",  # executive interview backdrop
    "d24690f8": "office-spaces",  # media company open workspace (2 variants)
    "dea0e9bd": "office-spaces",  # high-end executive corner office
    "e4455d89": "office-spaces",  # tech startup conference room
    "e7cf8287": "office-spaces",  # medical executive office
    "ea35bd79": "office-spaces",  # modern open office workspace
    "f2ad0478": "office-spaces",  # bright airy professional office
}

# Per-uuid R2 folder override. Merged categories (wall-shelves) store webps in
# *-bright/-dark subfolders, not under the bare category name.
FOLDER_OVERRIDE = {
    "11ca5842": "wall-shelves-bright",
}


def build_source_files():
    """(path, category, folder) tuples, matched from Downloads by uuid prefix.

    Only un-renamed Midjourney files (streambackdrops_*) are matched, so files
    already renamed by a prior run are skipped.
    """
    out, seen = [], set()
    for uuid, category in UUID_CATEGORY.items():
        matches = sorted(glob(str(DOWNLOADS / f"streambackdrops_*{uuid}*.png")))
        if not matches:
            print(f"  ⚠ no source file for uuid {uuid} ({category})")
            continue
        for mpath in matches:
            if mpath in seen:
                continue
            if os.path.getmtime(mpath) < BATCH_START_MTIME:
                continue  # older variant of same job, not this batch
            seen.add(mpath)
            out.append((mpath, category, FOLDER_OVERRIDE.get(uuid, category)))
    return out


SOURCE_FILES = build_source_files()

STOP_WORDS = {
    "a","an","the","and","or","but","of","in","on","at","by","with","to","for",
    "from","as","is","are","was","were","be","been","being","this","that","these",
    "those","it","its","has","have","had","do","does","did","will","would","can",
    "could","should","may","might","must","also","featuring","ideal","perfect",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def extract_prompt(filename: str) -> str:
    """Extract the prompt text portion from a Midjourney filename."""
    name = Path(filename).stem  # drop .png
    # Format: streambackdrops_{PROMPT}_{UUID}_{VARIANT}
    # UUID looks like 8hex-4hex-4hex-4hex-12hex
    uuid_re = r'_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}_\d+$'
    name = re.sub(uuid_re, '', name)
    name = re.sub(r'^streambackdrops_', '', name)
    return name


def build_descriptive(prompt_text: str) -> str:
    """Tokenize, stop-word filter, lowercase hyphenate, max DESC_MAX chars."""
    text = prompt_text.lower()
    text = re.sub(r'[^a-z0-9\s]+', ' ', text)
    tokens = [t for t in text.split() if t and t not in STOP_WORDS]
    picked, length = [], 0
    for tok in tokens:
        next_len = len(tok) if not picked else length + 1 + len(tok)
        if next_len > DESC_MAX:
            break
        picked.append(tok)
        length = next_len
    return '-'.join(picked) if picked else 'image'


def convert_to_webp(src_path: str) -> bytes:
    """Open PNG, resize to 1456×816 (crop-fill to preserve aspect), save as WebP q82."""
    img = Image.open(src_path).convert("RGB")
    target_ratio = WEBP_WIDTH / WEBP_HEIGHT
    src_ratio = img.width / img.height

    if src_ratio > target_ratio:
        # wider than target — crop sides
        new_w = int(img.height * target_ratio)
        left = (img.width - new_w) // 2
        img = img.crop((left, 0, left + new_w, img.height))
    elif src_ratio < target_ratio:
        # taller than target — crop top/bottom
        new_h = int(img.width / target_ratio)
        top = (img.height - new_h) // 2
        img = img.crop((0, top, img.width, top + new_h))

    img = img.resize((WEBP_WIDTH, WEBP_HEIGHT), Image.LANCZOS)
    buf = BytesIO()
    img.save(buf, format="WEBP", quality=WEBP_QUALITY, method=6)
    return buf.getvalue()


def hash8(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:HASH_LEN]


def upload_to_r2(client, bucket, key, data: bytes, content_type: str):
    client.put_object(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        CacheControl="public, max-age=31536000, immutable",
    )


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if DRY_RUN:
        print("=== DRY RUN — no uploads, no renames ===\n")

    print(f"Source batch: {len(SOURCE_FILES)} files\n")

    r2 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    ) if not DRY_RUN else None

    results = []
    errors  = []

    for src_path, category, folder in SOURCE_FILES:
        p = Path(src_path)
        if not p.exists():
            errors.append(f"MISSING: {src_path}")
            print(f"  ✗ MISSING: {p.name}")
            continue

        print(f"\n→ {p.name}")

        try:
            # 1. Convert to WebP
            webp_bytes = convert_to_webp(src_path)

            # 2. Hash
            h8 = hash8(webp_bytes)

            # 3. Slug
            prompt = extract_prompt(str(p))
            desc   = build_descriptive(prompt)
            slug   = f"{desc}-{h8}"
            webp_filename = f"{slug}.webp"
            png_filename  = f"{slug}.png"

            r2_webp_key = f"webp/{folder}/{webp_filename}"
            r2_png_key  = png_filename

            print(f"  slug:     {slug}")
            print(f"  category: {category}")
            print(f"  folder:   {folder}")
            print(f"  R2 webp:  {r2_webp_key}")
            print(f"  R2 png:   {r2_png_key}")

            if not DRY_RUN:
                # 4. Upload WebP
                upload_to_r2(r2, R2_BUCKET, r2_webp_key, webp_bytes, "image/webp")
                print(f"  ✓ uploaded webp")

                # 5. Upload original PNG
                png_bytes = p.read_bytes()
                upload_to_r2(r2, R2_BUCKET, r2_png_key, png_bytes, "image/png")
                print(f"  ✓ uploaded png")

                # 6. Rename source file
                new_path = p.parent / png_filename
                p.rename(new_path)
                print(f"  ✓ renamed → {png_filename}")

            results.append({
                "slug":          slug,
                "category":      category,
                "folder":        folder,
                "image_webp":    webp_filename,
                "download_png":  png_filename,
                "r2_webp_key":   r2_webp_key,
                "r2_png_key":    r2_png_key,
                "source_prompt": prompt,
            })

        except Exception as e:
            errors.append(f"{p.name}: {e}")
            print(f"  ✗ ERROR: {e}")

    # Write output JSON
    output_path = BASE_DIR / "process_new_images_output.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n\n=== Done. {len(results)} processed, {len(errors)} errors ===")
    print(f"Output written to: {output_path}")

    # Per-category tally
    by_cat = {}
    for r in results:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
    print("By category:", json.dumps(by_cat))

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  {e}")


if __name__ == "__main__":
    main()
