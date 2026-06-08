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

# ── Source files (absolute paths) ─────────────────────────────────────────────

SOURCE_FILES = [
    # (path, category)
    ("/Users/davidmiles/Downloads/streambackdrops_A_Japanese_Kissaten-style_coffee_house_interi_52ddd74c-829c-46cd-b939-49d2f617b5b8_2.png",       "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_Midcentury_Modern_cafe_interior_featuring_a_3104c851-c7e9-41ed-a11e-dbf9a5a43d34_1.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_Scandinavian-inspired_minimalist_cafe._Inte_8c67022c-4a88-4759-8667-648938d57a54_0.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_bookshop_cafe_hybrid_distinct_from_a_standa_93d87fb4-3c20-4e39-ae79-13dd6cbd5244_1.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_bright_Mediterranean_cafe_interior._Feature_a297641f-2c72-4362-86f7-32e66d227acf_2.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_bright_airy_space_built_with_sustainable_ma_2bde8289-2a61-4d79-b14e-74b703055427_2.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_lush_plant-filled_conservatory_cafe_interio_ecdd402d-a4db-45eb-896b-4f33281fb780_2.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_minimalist_white-walled_gallery_space_featu_ebe12e8e-ccac-4e81-8fd0-4abe81d5c8c9_1.png",     "art-galleries"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_quiet_after-hours_cafe_interior._Ambient_pe_093b7b50-9eeb-4d6e-8891-c91f92f6aa70_3.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_space_rich_with_colorful_geometric_zellige__faf9dad0-cb0e-45b2-99ce-d2291c863ebd_3.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_stark_ultra-modern_minimalist_interior_feat_931138b1-55cb-428f-89d1-bd7818bdbb21_0.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_tailored_formality_luxury_cafe_closer_to_a__90509d02-ea0b-4b71-9661-033e6d9326b7_1.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_A_warm_wood-heavy_interior_viewed_from_a_seat_cd115b85-b068-4125-908b-f812b6aa73e3_2.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_architectural_photograph_from_a_seated_per_cfeb89c4-0a8a-4a6b-a0d9-10a8efc4bc16_2.png",     "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_interior_focusing_on_natural_imperfection._5c77114c-4e5b-480e-b8ef-730ad9de409f_2.png",      "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_interior_with_a_distinct_old-world_feel._D_930de8e3-abbd-4794-94d0-def3f8afb677_1.png",      "historic-spaces"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_intimate_Parisian_bistro_interior._Foregro_14ea81c6-5fca-49c5-b4a6-739f0b3cec37_3.png",     "coffee-shops"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_opulent_Art_Deco_interior_featuring_geomet_023edf11-802f-44bc-b2a3-98d59dd4940a_0.png",     "historic-spaces"),
    ("/Users/davidmiles/Downloads/streambackdrops_An_outdoor_cafe_patio_from_a_seated_table_per_1c535bcd-bea0-43ff-9aa7-8b3a166304e4_0.png",      "gardens-patios"),
    ("/Users/davidmiles/Downloads/streambackdrops_Interior_perspective_from_a_seated_viewpoint__62ef7d54-ed04-4161-b1ad-16b1366df190_2.png",      "coffee-shops"),
]

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

    r2 = boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    ) if not DRY_RUN else None

    results = []
    errors  = []

    for src_path, category in SOURCE_FILES:
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

            # folder = category (straight mapping for all categories here)
            folder = category

            r2_webp_key = f"webp/{folder}/{webp_filename}"
            r2_png_key  = png_filename

            print(f"  slug:     {slug}")
            print(f"  category: {category}")
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
    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  {e}")


if __name__ == "__main__":
    main()
