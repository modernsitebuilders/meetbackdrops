#!/usr/bin/env python3
"""
apply-review-corrections.py — fold the manual review-tool corrections back
into the batch before merge-batch.js runs.

Reads:
  review-tool/data.json          the 92-entry batch as originally classified
  review-tool/corrections.json   { slug, category, originalCategory, rejected }

For every entry whose category changed, moves its webp on R2 from the old
category folder to the new one (copy + delete — nothing in this batch is
merged/published yet, so there's no old URL worth preserving). Rejected
entries are dropped entirely (their R2 objects are deleted, not left orphaned).

Writes the corrected list to process_new_images_output.json, ready for
`node merge-batch.js`.
"""
import json
import os
from pathlib import Path

import boto3
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

R2_ACCESS_KEY = os.environ["R2_ACCESS_KEY"]
R2_SECRET_KEY = os.environ["R2_SECRET_KEY"]
R2_ENDPOINT = os.environ["R2_ENDPOINT"]
R2_BUCKET = os.environ["R2_BUCKET"]

CATEGORY_FOLDER = {"bookshelves": "bookshelves-bright", "wall-shelves": "wall-shelves-bright"}

def folder_for(category):
    return CATEGORY_FOLDER.get(category, category)

combined = json.loads(Path("/tmp/combined-batch.json").read_text())
corrections = {c["slug"]: c for c in json.loads((BASE_DIR / "review-tool" / "corrections.json").read_text())}

by_slug = {e["slug"]: e for e in combined}
assert set(by_slug) == set(corrections), "slug sets differ between data.json and corrections.json"

r2 = boto3.client("s3", endpoint_url=R2_ENDPOINT, aws_access_key_id=R2_ACCESS_KEY,
                   aws_secret_access_key=R2_SECRET_KEY, region_name="auto")

kept, dropped, moved = [], [], []

for slug, entry in by_slug.items():
    corr = corrections[slug]
    if corr.get("rejected"):
        old_key = f"webp/{entry['folder']}/{entry['image_webp']}"
        r2.delete_object(Bucket=R2_BUCKET, Key=old_key)
        r2.delete_object(Bucket=R2_BUCKET, Key=entry["download_png"])
        dropped.append(slug)
        continue

    new_cat = corr["category"]
    if new_cat != entry["category"]:
        new_folder = folder_for(new_cat)
        old_key = f"webp/{entry['folder']}/{entry['image_webp']}"
        new_key = f"webp/{new_folder}/{entry['image_webp']}"
        r2.copy_object(Bucket=R2_BUCKET, CopySource={"Bucket": R2_BUCKET, "Key": old_key}, Key=new_key)
        r2.delete_object(Bucket=R2_BUCKET, Key=old_key)
        entry["category"] = new_cat
        entry["folder"] = new_folder
        entry["id"] = f"{new_cat}:{slug}"
        moved.append((slug, corr["originalCategory"], new_cat))

    kept.append(entry)

out_path = BASE_DIR / "process_new_images_output.json"
out_path.write_text(json.dumps(kept, indent=2))

print(f"✓ {len(kept)} kept, {len(dropped)} rejected+deleted, {len(moved)} moved on R2")
for slug, old, new in moved:
    print(f"  {old} -> {new}  {slug[:55]}")
if dropped:
    print("Dropped:", dropped)
print(f"\nWrote {out_path}")
