import json
import boto3
from collections import defaultdict
from r2_client import get_r2_client, get_bucket

metadata_file = "../public/data/image-metadata-complete.json"

s3 = get_r2_client()
bucket = get_bucket()

# ----------------------------
# LOAD METADATA
# ----------------------------
with open(metadata_file, "r") as f:
    data = json.load(f)

download_names = set()
for item in data:
    dn = item.get("downloadName")
    if dn:
        download_names.add(dn)

print("Metadata items:", len(download_names))

# ----------------------------
# LOAD R2 OBJECTS
# ----------------------------
print("Loading R2 objects...")

r2_png = set()
r2_webp = set()

for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        key = obj["Key"].split("/")[-1]
        if key.endswith(".png"):
            r2_png.add(key)
        elif key.endswith(".webp"):
            r2_webp.add(key)

print("R2 PNGs:", len(r2_png))
print("R2 WEBPs:", len(r2_webp))

# ----------------------------
# PAIRING LOGIC
# ----------------------------
def base_name(name):
    return name.replace(".png", "").replace(".webp", "")

paired = []
missing_png = []
missing_webp = []

all_bases = set()

for name in download_names:
    all_bases.add(base_name(name))

# ----------------------------
# ANALYSIS
# ----------------------------
png_map = defaultdict(list)
webp_map = defaultdict(list)

for p in r2_png:
    png_map[base_name(p)].append(p)

for w in r2_webp:
    webp_map[base_name(w)].append(w)

# ----------------------------
# CHECKS
# ----------------------------
orphan_png = []
orphan_webp = []
matched = []

for base in all_bases:
    pngs = png_map.get(base, [])
    webps = webp_map.get(base, [])

    if pngs and webps:
        matched.append(base)
    elif pngs and not webps:
        orphan_png.append(base)
    elif webps and not pngs:
        orphan_webp.append(base)

# ----------------------------
# RESULTS
# ----------------------------
print("\n==============================")
print("CONSOLIDATION REPORT")
print("==============================")
print("TOTAL BASE ASSETS:", len(all_bases))
print("MATCHED PAIRS:", len(matched))
print("PNG ONLY:", len(orphan_png))
print("WEBP ONLY:", len(orphan_webp))

print("\n--- PNG ONLY (potential cleanup or missing webp) ---")
for x in orphan_png[:50]:
    print(x)

print("\n--- WEBP ONLY (potential cleanup or missing png) ---")
for x in orphan_webp[:50]:
    print(x)

with open("png_only_candidates.txt", "w") as f:
    for x in orphan_png:
        f.write(x + "\n")

with open("webp_only_candidates.txt", "w") as f:
    for x in orphan_webp:
        f.write(x + "\n")

print("\nSaved:")
print("- png_only_candidates.txt")
print("- webp_only_candidates.txt")