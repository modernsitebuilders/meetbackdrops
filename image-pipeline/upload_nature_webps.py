"""
Upload missing nature-landscape WebP thumbnails to R2.
Converts source PNGs from Desktop/new-pngs/nature-landscapes/ to WebP, then uploads.
"""
import os
import io
import tempfile
from pathlib import Path
from dotenv import load_dotenv
import boto3
from PIL import Image

load_dotenv()

R2_CLIENT = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY"],
    aws_secret_access_key=os.environ["R2_SECRET_KEY"],
    region_name="auto",
)
BUCKET = os.environ["R2_BUCKET"]

SRC_DIR = Path.home() / "Desktop" / "new-pngs" / "nature-landscapes"

# (source_png, target_r2_key)
UPLOADS = [
    ("nature-landscape-01.png",  "webp/nature-landscapes/nature-landscape-1.webp"),
    ("nature-landscape-02.png",  "webp/nature-landscapes/nature-landscape-2.webp"),
    ("nature-landscape-03.png",  "webp/nature-landscapes/nature-landscape-3.webp"),
    ("nature-landscape-04.png",  "webp/nature-landscapes/nature-landscape-4.webp"),
    ("nature-landscape-06.png",  "webp/nature-landscapes/nature-landscape-6.webp"),
    ("nature-landscape-08.png",  "webp/nature-landscapes/nature-landscape-8.webp"),
    ("nature-landscape-11.png",  "webp/nature-landscapes/nature-landscape-11.webp"),
    ("nature-landscape-14.png",  "webp/nature-landscapes/nature-landscape-14.webp"),
    ("nature-landscape-19.png",  "webp/nature-landscapes/nature-landscape-19.webp"),
    ("nature-landscape-20.png",  "webp/nature-landscapes/nature-landscape-20.webp"),
    ("nature-landscape-30.png",  "webp/nature-landscapes/nature-landscape-30.webp"),
    ("nature-landscapes-98.png", "webp/nature-landscapes/nature-landscape-98.webp"),
    ("nature-landscapes-99.png", "webp/nature-landscapes/nature-landscape-99.webp"),
]

ok = 0
fail = 0

for src_name, r2_key in UPLOADS:
    src_path = SRC_DIR / src_name
    if not src_path.exists():
        print(f"✗ Source not found: {src_name}")
        fail += 1
        continue
    try:
        img = Image.open(src_path).convert("RGB")
        img = img.resize((1920, 1080), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=85)
        buf.seek(0)
        R2_CLIENT.put_object(
            Bucket=BUCKET,
            Key=r2_key,
            Body=buf,
            ContentType="image/webp",
        )
        print(f"✓ {r2_key}")
        ok += 1
    except Exception as e:
        print(f"✗ {r2_key}: {e}")
        fail += 1

print(f"\nDone: {ok} uploaded, {fail} failed")
