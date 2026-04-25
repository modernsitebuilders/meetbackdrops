"""
Summer-backgrounds processor.

Mirrors the Spring/Easter rename-first workflow but uploads directly to R2
(no Cloudinary). For each PNG in ~/Desktop/new-pngs/summer-backgrounds/:

  1. Sequential rename → summer-background-NN.png  (NN = 01..38)
  2. Save renamed PNG to ~/Desktop/summer-pngs/ (staging)
  3. Convert to 1920x1080 WebP (q85) in memory
  4. Upload PNG to R2 root  : summer-background-NN.png
  5. Upload WebP to R2 webp : webp/summer-backgrounds/summer-background-NN.webp

Idempotent: re-running overwrites the same R2 keys.
"""
import io
import os
import shutil
from pathlib import Path

import boto3
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

R2 = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY"],
    aws_secret_access_key=os.environ["R2_SECRET_KEY"],
    region_name="auto",
)
BUCKET = os.environ["R2_BUCKET"]

SRC_DIR = Path.home() / "Desktop" / "new-pngs" / "summer-backgrounds"
STAGE_DIR = Path.home() / "Desktop" / "summer-pngs"
CATEGORY = "summer-backgrounds"

STAGE_DIR.mkdir(parents=True, exist_ok=True)

pngs = sorted(p for p in SRC_DIR.iterdir() if p.suffix.lower() == ".png")
if not pngs:
    raise SystemExit(f"No PNGs found in {SRC_DIR}")

print(f"Processing {len(pngs)} PNGs from {SRC_DIR}\n")

ok_png = ok_webp = fail = 0

for i, src in enumerate(pngs, start=1):
    base = f"summer-background-{i:02d}"
    staged_png = STAGE_DIR / f"{base}.png"
    png_key = f"{base}.png"
    webp_key = f"webp/{CATEGORY}/{base}.webp"

    # 1. Stage renamed PNG
    shutil.copyfile(src, staged_png)

    # 2. Build resized WebP in memory
    try:
        img = Image.open(src).convert("RGB")
        if img.size != (1920, 1080):
            img = img.resize((1920, 1080), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=85)
        buf.seek(0)
    except Exception as e:
        print(f"  ✗ webp build {base}: {e}")
        fail += 1
        continue

    # 3. Upload PNG (full size, untouched)
    try:
        with open(src, "rb") as fh:
            R2.put_object(
                Bucket=BUCKET,
                Key=png_key,
                Body=fh,
                ContentType="image/png",
            )
        print(f"  ✓ PNG  → {png_key}")
        ok_png += 1
    except Exception as e:
        print(f"  ✗ PNG  {png_key}: {e}")
        fail += 1

    # 4. Upload WebP
    try:
        R2.put_object(
            Bucket=BUCKET,
            Key=webp_key,
            Body=buf,
            ContentType="image/webp",
        )
        print(f"  ✓ WebP → {webp_key}")
        ok_webp += 1
    except Exception as e:
        print(f"  ✗ WebP {webp_key}: {e}")
        fail += 1

print(f"\nDone: {ok_png} PNGs, {ok_webp} WebPs uploaded, {fail} failures")
print(f"Staged renamed PNGs: {STAGE_DIR}")
