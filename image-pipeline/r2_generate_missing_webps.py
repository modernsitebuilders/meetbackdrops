import os
from PIL import Image
import boto3
from io import BytesIO

from r2_client import get_r2_client, get_bucket

s3 = get_r2_client()
bucket = get_bucket()

OUTPUT_BUCKET_PREFIX = ""  # root

def convert_png_to_webp(key):
    obj = s3.get_object(Bucket=bucket, Key=key)
    img = Image.open(obj["Body"]).convert("RGB")

    buffer = BytesIO()
    img.save(buffer, "WEBP", quality=85)
    buffer.seek(0)

    new_key = key.replace(".png", ".webp")

    s3.put_object(
        Bucket=bucket,
        Key=new_key,
        Body=buffer,
        ContentType="image/webp"
    )

    print(f"Created WEBP: {new_key}")


# load missing PNG-only list from your audit
with open("png_only_candidates.txt") as f:
    png_only = [line.strip() for line in f if line.strip()]

for item in png_only:
    if item.endswith(".png"):
        convert_png_to_webp(item)