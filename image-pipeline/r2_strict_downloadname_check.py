import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()

# ----------------------------
# CONFIG
# ----------------------------
bucket = os.getenv("R2_BUCKET")
metadata_file = "../public/data/image-metadata-complete.json"

# ----------------------------
# R2 CLIENT (THIS FIXES YOUR ERROR)
# ----------------------------
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

# ----------------------------
# LOAD METADATA
# ----------------------------
with open(metadata_file, "r") as f:
    data = json.load(f)

download_names = set()

for item in data:
    if "downloadName" in item and item["downloadName"]:
        download_names.add(item["downloadName"])

print("TOTAL downloadNames:", len(download_names))

# ----------------------------
# LOAD R2 PNG INDEX
# ----------------------------
print("Loading R2 PNG index...")

r2_pngs = set()

for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        key = obj["Key"]

        if key.endswith(".png"):
            r2_pngs.add(key.split("/")[-1])

print("TOTAL R2 PNGs:", len(r2_pngs))

# ----------------------------
# STRICT MATCH (NO FUZZY LOGIC)
# ----------------------------
matched = []
missing = []

for name in sorted(download_names):
    if name in r2_pngs:
        matched.append(name)
    else:
        missing.append(name)

# ----------------------------
# RESULTS
# ----------------------------
print("\n==============================")
print("STRICT DOWNLOADNAME VALIDATION")
print("==============================")
print("TOTAL:", len(download_names))
print("MATCHED:", len(matched))
print("MISSING:", len(missing))

print("\n--- MISSING PNGs (REAL FAILURES) ---")
for m in missing:
    print(m)

with open("strict_missing_downloadnames.txt", "w") as f:
    for m in missing:
        f.write(m + "\n")

print("\nSaved → strict_missing_downloadnames.txt")