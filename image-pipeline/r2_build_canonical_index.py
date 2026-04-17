import json
import re
from dotenv import load_dotenv

from r2_client import get_r2_client, get_bucket

load_dotenv()

# ----------------------------
# CONFIG
# ----------------------------
metadata_file = "../public/data/image-metadata-complete.json"
live_assets_file = "live_assets.txt"

s3 = get_r2_client()
bucket = get_bucket()

# ----------------------------
# NORMALIZATION
# ----------------------------
def normalize(name: str) -> str:
    name = name.lower().strip()

    # remove extensions
    name = re.sub(r"\.(png|webp|jpg|jpeg)$", "", name)

    # unify separators
    name = name.replace("_", "-")

    # normalize numeric padding: -01 → -1
    def fix_num(match):
        return "-" + str(int(match.group(1)))

    name = re.sub(r"-(\d+)(?=$|[^0-9])", fix_num, name)

    return name


# ----------------------------
# LOAD METADATA
# ----------------------------
with open(metadata_file, "r") as f:
    metadata = json.load(f)

meta_map = {}
for item in metadata:
    if "downloadName" in item and item["downloadName"]:
        meta_map[normalize(item["downloadName"])] = item

print(f"Metadata loaded: {len(meta_map)}")


# ----------------------------
# LOAD LIVE ASSETS
# ----------------------------
with open(live_assets_file, "r") as f:
    live_assets = [x.strip() for x in f if x.strip()]

live_set = set(normalize(x) for x in live_assets)

print(f"Live assets loaded: {len(live_set)}")


# ----------------------------
# LOAD R2 OBJECTS
# ----------------------------
print("Loading R2 objects...")

r2_png = set()
r2_webp = set()

paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        key = obj["Key"].lower()

        if key.endswith(".png"):
            r2_png.add(normalize(key))
        elif key.endswith(".webp"):
            r2_webp.add(normalize(key))

print(f"R2 PNGs: {len(r2_png)}")
print(f"R2 WEBPs: {len(r2_webp)}")


# ----------------------------
# CANONICAL ANALYSIS
# ----------------------------
missing_from_r2 = []
orphan_r2 = []

canonical = {}

for key in meta_map.keys():
    has_png = key in r2_png
    has_webp = key in r2_webp
    in_live = key in live_set

    canonical[key] = {
        "png": has_png,
        "webp": has_webp,
        "in_live_assets": in_live
    }

    if not has_png and not has_webp:
        missing_from_r2.append(key)


for r in r2_png.union(r2_webp):
    if r not in meta_map:
        orphan_r2.append(r)


# ----------------------------
# REPORT
# ----------------------------
print("\n==============================")
print("CANONICAL R2 INDEX REPORT")
print("==============================")

print(f"Metadata: {len(meta_map)}")
print(f"Live assets: {len(live_set)}")
print(f"Missing from R2 (TRUE ISSUES): {len(missing_from_r2)}")
print(f"Orphan R2 assets: {len(orphan_r2)}")

print("\n--- TRUE MISSING ---")
for m in missing_from_r2:
    print(m)

print("\n--- ORPHAN R2 (sample 50) ---")
for o in orphan_r2[:50]:
    print(o)


# ----------------------------
# SAVE OUTPUTS
# ----------------------------
with open("canonical_index.json", "w") as f:
    json.dump(canonical, f, indent=2)

with open("missing_from_r2.txt", "w") as f:
    f.write("\n".join(missing_from_r2))

with open("orphan_r2_assets.txt", "w") as f:
    f.write("\n".join(orphan_r2))


print("\nSaved:")
print("- canonical_index.json")
print("- missing_from_r2.txt")
print("- orphan_r2_assets.txt")