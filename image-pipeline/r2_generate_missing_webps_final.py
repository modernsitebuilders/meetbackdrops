import os
from PIL import Image
import boto3
from dotenv import load_dotenv
from io import BytesIO

load_dotenv()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

BUCKET = os.getenv("R2_BUCKET")

def normalize(name):
    name = name.split("/")[-1]
    name = name.replace(".png", "").replace(".webp", "")
    name = name.replace("-hd", "")
    return name

def load_r2_objects():
    paginator = s3.get_paginator("list_objects_v2")
    objects = []

    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            objects.append(obj["Key"])

    return objects

def find_png_for_asset(asset, r2_keys):
    for key in r2_keys:
        if key.endswith(".png") and normalize(key) == asset:
            return key
    return None

def generate_webp_from_png(png_key, asset):
    print(f"Fixing: {asset}")

    obj = s3.get_object(Bucket=BUCKET, Key=png_key)
    img = Image.open(BytesIO(obj["Body"].read())).convert("RGB")

    buffer = BytesIO()
    img.save(buffer, format="WEBP", quality=85)
    buffer.seek(0)

    webp_key = f"webp/{asset}.webp"

    s3.put_object(
        Bucket=BUCKET,
        Key=webp_key,
        Body=buffer,
        ContentType="image/webp"
    )

def main():
    with open("missing_webp_final.txt") as f:
        assets = [line.strip().replace(".webp", "") for line in f if line.strip()]

    r2_keys = load_r2_objects()

    for asset in assets:
        png_key = find_png_for_asset(asset, r2_keys)

        if png_key:
            generate_webp_from_png(png_key, asset)
        else:
            print(f"❌ NO PNG FOUND: {asset}")

if __name__ == "__main__":
    main()