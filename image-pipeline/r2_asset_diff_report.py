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
# LOAD SOURCE OF TRUTH
# -----------------------------
with open("live_assets.txt") as f:
    live_assets = sorted(set(line.strip().lower() for line in f if line.strip()))

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
# NORMALIZER
# -----------------------------
def normalize(name: str) -> str:
    name = name.lower()
    name = os.path.basename(name)
    name = name.replace(".png", "").replace(".webp", "")
    name = name.replace("-hd", "").replace("_hd", "")
    return name

# -----------------------------
# BUILD INDEX
# -----------------------------
png_index = defaultdict(list)
webp_index = defaultdict(list)

for key in keys:
    base = normalize(key)

    if key.lower().endswith(".png"):
        png_index[base].append(key)
    elif key.lower().endswith(".webp"):
        webp_index[base].append(key)

# -----------------------------
# BUILD EXACT DIFFS
# -----------------------------
missing_png = []
missing_webp = []
complete = []

details = []

for asset in live_assets:
    base = normalize(asset)

    pngs = png_index.get(base, [])
    webps = webp_index.get(base, [])

    if len(pngs) == 0:
        missing_png.append(asset)

    if len(webps) == 0:
        missing_webp.append(asset)

    if pngs and webps:
        complete.append(asset)

    details.append({
        "asset": asset,
        "png_count": len(pngs),
        "webp_count": len(webps),
        "png": pngs,
        "webp": webps
    })

# -----------------------------
# REPORT
# -----------------------------
print("\n==============================")
print("ASSET-BY-ASSET DIFF REPORT")
print("==============================")

print(f"Total live assets: {len(live_assets)}")
print(f"Complete pairs: {len(complete)}")
print(f"Missing PNG: {len(missing_png)}")
print(f"Missing WEBP: {len(missing_webp)}")

print("\n--- MISSING PNG (exact assets) ---")
for a in missing_png:
    print(a)

print("\n--- MISSING WEBP (exact assets) ---")
for a in missing_webp:
    print(a)

# -----------------------------
# SAVE FULL DETAIL FILE
# -----------------------------
with open("asset_diff_full_report.txt", "w") as f:
    for d in details:
        f.write(str(d) + "\n")

with open("missing_png.txt", "w") as f:
    f.write("\n".join(missing_png))

with open("missing_webp.txt", "w") as f:
    f.write("\n".join(missing_webp))