import json
import boto3
from dotenv import load_dotenv
import os

# -------------------------
# CONFIG
# -------------------------
BUCKET = "streambackdrops-images"

METADATA_FILE = "../public/data/image-metadata-complete.json"
LIVE_ASSETS_FILE = "live_assets.txt"

# -------------------------
# R2 CLIENT
# -------------------------

load_dotenv()


s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto",
)

# -------------------------
# LOAD LIVE WEBPs
# -------------------------
with open(LIVE_ASSETS_FILE, "r") as f:
    webps = set(line.strip() for line in f if line.strip() and not line.startswith("#"))

print(f"WEBPs in manifest: {len(webps)}")

# -------------------------
# LOAD METADATA
# -------------------------
with open(METADATA_FILE, "r") as f:
    metadata = json.load(f)

meta_map = {}
for item in metadata:
    meta_map[item["filename"]] = item

print(f"Metadata entries: {len(meta_map)}")

# -------------------------
# LOAD R2 OBJECTS
# -------------------------
print("\nLoading R2 index...")

r2_pngs = set()

paginator = s3.get_paginator("list_objects_v2")
for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        key = obj["Key"]
        fname = key.split("/")[-1]
        if fname.endswith(".png"):
            r2_pngs.add(fname)

print(f"R2 PNGs: {len(r2_pngs)}")

# -------------------------
# RECONCILIATION
# -------------------------
matched = []
missing = []
expected_pngs = set()

for webp in webps:
    if webp not in meta_map:
        print(f"[WARN] Missing metadata for {webp}")
        continue

    item = meta_map[webp]
    expected_png = item.get("downloadName")

    expected_pngs.add(expected_png)

    if expected_png in r2_pngs:
        matched.append((webp, expected_png))
    else:
        missing.append((webp, expected_png))

# -------------------------
# EXTRA PNGS (SAFE DELETE)
# -------------------------
extra_pngs = sorted(r2_pngs - expected_pngs)

# -------------------------
# OUTPUT
# -------------------------
print("\n==============================")
print("FINAL JSON-BASED RECONCILIATION")
print("==============================")
print(f"WEBPs: {len(webps)}")
print(f"Expected PNGs: {len(expected_pngs)}")
print(f"Matched: {len(matched)}")
print(f"Missing PNGs: {len(missing)}")
print(f"Extra PNGs (DELETE): {len(extra_pngs)}")

with open("matched_pairs.txt", "w") as f:
    for w, p in matched:
        f.write(f"{w} -> {p}\n")

with open("missing_pngs.txt", "w") as f:
    for w, p in missing:
        f.write(f"{w} -> {p}\n")

with open("delete_r2_pngs.txt", "w") as f:
    for p in extra_pngs:
        f.write(p + "\n")

print("\nSaved:")
print(" - matched_pairs.txt")
print(" - missing_pngs.txt")
print(" - delete_r2_pngs.txt")