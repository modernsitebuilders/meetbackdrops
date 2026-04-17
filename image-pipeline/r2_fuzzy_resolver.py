import os
import json
import boto3
import re
from collections import defaultdict
from dotenv import load_dotenv

load_dotenv()

# ----------------------------
# CONFIG
# ----------------------------
BUCKET = os.getenv("R2_BUCKET", "streambackdrops-images")
METADATA_FILE = "../public/data/image-metadata-complete.json"

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

# ----------------------------
# NORMALIZATION HELPERS
# ----------------------------
def normalize(name: str) -> str:
    name = name.lower()
    name = name.replace(".png", "").replace(".webp", "")
    name = re.sub(r"_[a-z0-9]+$", "", name)  # strip suffix
    name = re.sub(r"[^a-z0-9\-]", "-", name)
    name = re.sub(r"-+", "-", name).strip("-")
    return name

def number_variants(name: str):
    """01 <-> 1 normalization"""
    variants = set()
    variants.add(name)
    variants.add(re.sub(r"-0+(\d)", r"-\1", name))
    variants.add(re.sub(r"-(\d)$", lambda m: f"-{int(m.group(1)):02d}", name))
    return variants

def plural_variants(name: str):
    """gallery <-> galleries"""
    variants = set()
    variants.add(name)
    if "gallery" in name:
        variants.add(name.replace("gallery", "galleries"))
    if "galleries" in name:
        variants.add(name.replace("galleries", "gallery"))
    return variants

def all_variants(name: str):
    out = set()
    base = normalize(name)
    for v in number_variants(base):
        for p in plural_variants(v):
            out.add(p)
    return out

# ----------------------------
# LOAD METADATA
# ----------------------------
with open(METADATA_FILE, "r") as f:
    metadata = json.load(f)

meta_items = []
for item in metadata:
    dn = item.get("downloadName")
    fn = item.get("filename")
    if dn:
        meta_items.append((dn, item))
    elif fn:
        meta_items.append((fn.replace(".webp", ".png"), item))

print(f"Metadata items: {len(meta_items)}")

# ----------------------------
# LOAD R2
# ----------------------------
print("Loading R2 index...")

r2_keys = []
for page in s3.get_paginator("list_objects_v2").paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        key = obj["Key"]
        if key.endswith(".png"):
            r2_keys.append(key)

r2_map = {}
r2_norm_map = {}

for k in r2_keys:
    base = k.split("/")[-1]
    norm = normalize(base)
    r2_map[base] = k
    r2_norm_map.setdefault(norm, []).append(k)

print(f"R2 PNGs: {len(r2_keys)}")

# ----------------------------
# MATCHING ENGINE
# ----------------------------
matched = {}
unmatched = []

def score(meta, r2_name):
    m = normalize(meta)
    r = normalize(r2_name)

    if m == r:
        return 100
    if m in r or r in m:
        return 80
    if any(v == r for v in all_variants(meta)):
        return 95
    return 0

for meta_name, item in meta_items:
    candidates = all_variants(meta_name)

    best_match = None
    best_score = 0

    for c in candidates:
        if c in r2_norm_map:
            for r2_full in r2_norm_map[c]:
                s = score(meta_name, r2_full)
                if s > best_score:
                    best_score = s
                    best_match = r2_full

    if best_match:
        matched[meta_name] = best_match
    else:
        unmatched.append(meta_name)

# ----------------------------
# OUTPUT
# ----------------------------
print("\n==============================")
print("R2 FUZZY RESOLUTION REPORT")
print("==============================")

print(f"TOTAL METADATA: {len(meta_items)}")
print(f"MATCHED: {len(matched)}")
print(f"UNMATCHED: {len(unmatched)}")

coverage = len(matched) / len(meta_items) * 100
print(f"COVERAGE: {coverage:.2f}%")

print("\n--- SAMPLE MATCHES ---")
for i, (m, r) in enumerate(matched.items()):
    if i > 20:
        break
    print(f"{m}  →  {r}")

print("\n--- UNMATCHED ---")
for u in unmatched[:50]:
    print(u)

with open("resolved_pairs.txt", "w") as f:
    for m, r in matched.items():
        f.write(f"{m} -> {r}\n")

with open("unmatched.txt", "w") as f:
    for u in unmatched:
        f.write(u + "\n")

print("\nSaved:")
print("- resolved_pairs.txt")
print("- unmatched.txt")