import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# R2 CLIENT
# -------------------------
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

bucket = os.getenv("R2_BUCKET")

# -------------------------
# LOAD INPUTS
# -------------------------
with open("live_assets.txt", "r") as f:
    live_assets = [line.strip() for line in f if line.strip()]

with open("../public/data/image-metadata-complete.json", "r") as f:
    json_data = json.load(f)

# -------------------------
# BUILD KEEP SET
# -------------------------
keep = set()

# keep WEBPs from live assets
for a in live_assets:
    keep.add(f"{a}.webp")

# keep PNGs from JSON
for item in json_data:
    keep.add(item["downloadName"].lower().strip())

# -------------------------
# LOAD R2 OBJECTS
# -------------------------
paginator = s3.get_paginator("list_objects_v2")

all_keys = []

for page in paginator.paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        all_keys.append(obj["Key"])

# -------------------------
# BUILD DELETE LIST
# -------------------------
delete_candidates = []

for key in all_keys:
    k = key.lower()

    # HARD DELETE RULES
    if "hd" in k or "premium/" in k:
        delete_candidates.append(key)
        continue

    filename = k.split("/")[-1]

    if filename not in keep:
        delete_candidates.append(key)

# -------------------------
# REPORT ONLY (NO DELETE YET)
# -------------------------
print("\n==============================")
print("R2 CLEANUP DRY RUN")
print("==============================")

print(f"Total objects: {len(all_keys)}")
print(f"Keep set size: {len(keep)}")
print(f"DELETE candidates: {len(delete_candidates)}")

print("\n--- SAMPLE DELETES (FIRST 100) ---")
for k in delete_candidates[:100]:
    print(k)

# write file for review
with open("DELETE_CANDIDATES.txt", "w") as f:
    f.write("\n".join(delete_candidates))

print("\nWrote DELETE_CANDIDATES.txt (SAFE - NO DELETION EXECUTED)")