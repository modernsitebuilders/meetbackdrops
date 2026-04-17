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
# LOAD TRUTH (JSON / LIVE ASSETS)
# -----------------------------
with open("live_assets.txt") as f:
    live_assets = sorted(set(line.strip() for line in f if line.strip()))

# -----------------------------
# LOAD R2 KEYS
# -----------------------------
print("Loading R2 objects...")

r2_keys = []
paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        r2_keys.append(obj["Key"])

print(f"Total R2 objects: {len(r2_keys)}")

# -----------------------------
# NORMALIZATION (CRITICAL)
# -----------------------------
def normalize(name: str) -> str:
    """
    Convert everything into a comparable base identity:
    - remove folders
    - remove extensions
    - remove hd suffix
    - remove padding differences
    """
    import re

    name = os.path.basename(name)
    name = name.lower()

    # remove extensions
    name = name.replace(".png", "").replace(".webp", "")

    # remove hd tags
    name = name.replace("-hd", "").replace("_hd", "")

    # normalize double separators
    name = re.sub(r"[_]+", "-", name)

    return name

# -----------------------------
# BUILD R2 INDEX
# -----------------------------
r2_index = defaultdict(list)

for key in r2_keys:
    base = normalize(key)
    r2_index[base].append(key)

# -----------------------------
# RESOLVE FUNCTION (CORE LOGIC)
# -----------------------------
def resolve(asset):
    """
    For each JSON asset:
    find ALL possible R2 matches (png/webp/variants)
    """
    base = normalize(asset)

    matches = r2_index.get(base, [])

    # also try loose fallback matching (handles 1 vs 01 edge cases)
    if not matches:
        for k, v in r2_index.items():
            if base in k or k in base:
                matches.extend(v)

    pngs = [m for m in matches if m.endswith(".png")]
    webps = [m for m in matches if m.endswith(".webp")]

    return {
        "asset": asset,
        "base": base,
        "png": pngs,
        "webp": webps,
        "ok": len(pngs) > 0 and len(webps) > 0
    }

# -----------------------------
# RUN RESOLUTION
# -----------------------------
print("\nRunning JSON-driven resolution...\n")

results = []

missing_png = []
missing_webp = []
complete = []

for asset in live_assets:
    r = resolve(asset)
    results.append(r)

    if not r["png"]:
        missing_png.append(asset)

    if not r["webp"]:
        missing_webp.append(asset)

    if r["ok"]:
        complete.append(asset)

# -----------------------------
# REPORT
# -----------------------------
print("\n==============================")
print("JSON-DRIVEN R2 RESOLUTION REPORT")
print("==============================")

print(f"Live assets: {len(live_assets)}")
print(f"Complete pairs: {len(complete)}")
print(f"Missing PNG: {len(missing_png)}")
print(f"Missing WEBP: {len(missing_webp)}")

print("\n--- MISSING PNG (true missing from storage) ---")
for a in missing_png:
    print(a)

print("\n--- MISSING WEBP (true missing from storage) ---")
for a in missing_webp:
    print(a)

# -----------------------------
# SAVE OUTPUTS
# -----------------------------
with open("resolved_mapping.json", "w") as f:
    import json
    json.dump(results, f, indent=2)

with open("missing_png.txt", "w") as f:
    f.write("\n".join(missing_png))

with open("missing_webp.txt", "w") as f:
    f.write("\n".join(missing_webp))

print("\nSaved:")
print("- resolved_mapping.json")
print("- missing_png.txt")
print("- missing_webp.txt")