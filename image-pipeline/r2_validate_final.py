import os
import boto3
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

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
    live_assets = set(line.strip().lower() for line in f if line.strip())

# -----------------------------
# LOAD R2 OBJECTS
# -----------------------------
print("Loading R2 objects...")

keys = []
paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        keys.append(obj["Key"])

print(f"Total R2 objects: {len(keys)}")

# -----------------------------
# NORMALIZATION FUNCTION (CRITICAL FIX)
# -----------------------------
def normalize(name: str) -> str:
    name = name.lower()

    # remove folder paths
    name = os.path.basename(name)

    # remove extensions
    name = name.replace(".png", "").replace(".webp", "")

    # remove hd / variants
    name = name.replace("-hd", "").replace("_hd", "")

    return name

# -----------------------------
# BUILD INDEX
# -----------------------------
png_map = defaultdict(list)
webp_map = defaultdict(list)

for key in keys:
    base = normalize(key)

    if key.lower().endswith(".png"):
        png_map[base].append(key)
    elif key.lower().endswith(".webp"):
        webp_map[base].append(key)

# -----------------------------
# VALIDATION
# -----------------------------
missing_png = []
missing_webp = []
ok = []
orphans = []

for asset in live_assets:
    base = normalize(asset)

    pngs = png_map.get(base, [])
    webps = webp_map.get(base, [])

    if len(pngs) == 0:
        missing_png.append(asset)

    if len(webps) == 0:
        missing_webp.append(asset)

    if len(pngs) > 0 and len(webps) > 0:
        ok.append(asset)

# true orphans (not in live_assets)
for base in set(list(png_map.keys()) + list(webp_map.keys())):
    if base not in live_assets:
        orphans.append(base)

# -----------------------------
# REPORT
# -----------------------------
print("\n==============================")
print("FINAL STRICT PAIR REPORT")
print("==============================")

print(f"Live assets: {len(live_assets)}")
print(f"OK pairs: {len(ok)}")
print(f"Missing PNG: {len(missing_png)}")
print(f"Missing WEBP: {len(missing_webp)}")
print(f"Orphans: {len(orphans)}")

print("\n--- SAMPLE MISSING PNG ---")
print("\n".join(missing_png[:20]))

print("\n--- SAMPLE MISSING WEBP ---")
print("\n".join(missing_webp[:20]))

print("\n--- SAMPLE ORPHANS ---")
print("\n".join(orphans[:30]))

# save outputs
with open("missing_png.txt", "w") as f:
    f.write("\n".join(missing_png))

with open("missing_webp.txt", "w") as f:
    f.write("\n".join(missing_webp))

with open("orphans.txt", "w") as f:
    f.write("\n".join(orphans))