import os
import boto3
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

# -----------------------------
# CONFIG
# -----------------------------
BUCKET = os.getenv("R2_BUCKET")

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
)

# -----------------------------
# LOAD LIVE ASSETS (SOURCE OF TRUTH)
# -----------------------------
with open("live_assets.txt") as f:
    live_assets = set(line.strip() for line in f if line.strip())

# -----------------------------
# LOAD ALL R2 OBJECTS
# -----------------------------
print("Loading R2 objects...")

keys = []
paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        keys.append(obj["Key"])

print(f"Total R2 objects: {len(keys)}")

# -----------------------------
# INDEX R2 BY BASE NAME
# -----------------------------
png_map = defaultdict(list)
webp_map = defaultdict(list)

def normalize(key):
    filename = os.path.basename(key)
    name, ext = os.path.splitext(filename)
    return name.lower(), ext.lower()

for key in keys:
    name, ext = normalize(key)

    # strip common suffix noise
    base = name.replace("-hd", "").replace("_hd", "")

    if ext == ".png":
        png_map[base].append(key)
    elif ext == ".webp":
        webp_map[base].append(key)

# -----------------------------
# VALIDATION
# -----------------------------
missing_png = []
missing_webp = []
duplicates = []
extra = []

for asset in live_assets:
    base = asset.lower()

    pngs = png_map.get(base, [])
    webps = webp_map.get(base, [])

    if len(pngs) == 0:
        missing_png.append(asset)

    if len(webps) == 0:
        missing_webp.append(asset)

    if len(pngs) > 1 or len(webps) > 1:
        duplicates.append((asset, pngs, webps))

# find true orphans (not in live assets at all)
for base in set(list(png_map.keys()) + list(webp_map.keys())):
    if base not in live_assets:
        extra.append(base)

# -----------------------------
# REPORT
# -----------------------------
print("\n==============================")
print("STRICT PAIR VALIDATION REPORT")
print("==============================")

print(f"Live assets: {len(live_assets)}")

print(f"\nMissing PNG: {len(missing_png)}")
print(f"Missing WEBP: {len(missing_webp)}")
print(f"Duplicates: {len(duplicates)}")
print(f"Orphans in R2: {len(extra)}")

print("\n--- SAMPLE MISSING PNG ---")
print("\n".join(missing_png[:20]))

print("\n--- SAMPLE MISSING WEBP ---")
print("\n".join(missing_webp[:20]))

print("\n--- SAMPLE DUPLICATES ---")
for item in duplicates[:10]:
    print(item)

print("\n--- SAMPLE ORPHANS ---")
print("\n".join(extra[:20]))

# save outputs
with open("missing_png.txt", "w") as f:
    f.write("\n".join(missing_png))

with open("missing_webp.txt", "w") as f:
    f.write("\n".join(missing_webp))

with open("orphan_assets.txt", "w") as f:
    f.write("\n".join(extra))