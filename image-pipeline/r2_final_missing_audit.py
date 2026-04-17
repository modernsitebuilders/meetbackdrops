import boto3
import os

bucket = "streambackdrops-images"
missing_file = "true_missing_clean.txt"

s3 = boto3.client("s3")

# ----------------------------
# LOAD TRUE MISSING LIST
# ----------------------------
with open(missing_file, "r") as f:
    missing = [line.strip() for line in f if line.strip()]

# normalize base names
def base(name):
    # remove extension if present
    name = name.replace(".png", "").replace(".webp", "")
    # remove suffix hashes like _abc123
    if "_" in name:
        parts = name.split("_")
        # keep first part if second looks like hash/random
        if len(parts[-1]) <= 8:
            name = "_".join(parts[:-1])
    return name

missing_base = {m: base(m) for m in missing}

print("TRUE MISSING:", len(missing_base))

# ----------------------------
# LOAD R2 PNG INDEX
# ----------------------------
print("Loading R2 index...")

r2_keys = set()

for page in s3.get_paginator("list_objects_v2").paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        k = obj["Key"]
        if k.endswith(".png"):
            r2_keys.add(k.split("/")[-1])

print("R2 PNG COUNT:", len(r2_keys))

# build normalized lookup map
r2_base_map = {}
for k in r2_keys:
    r2_base_map.setdefault(base(k), []).append(k)

# ----------------------------
# LOOSE MATCHING
# ----------------------------
matched = {}
unmatched = []

for original, b in missing_base.items():
    if b in r2_base_map:
        matched[original] = r2_base_map[b]
    else:
        unmatched.append(original)

# ----------------------------
# RESULTS
# ----------------------------
print("\n==============================")
print("LOOSE MATCH AUDIT")
print("==============================")

print("TOTAL TRUE MISSING:", len(missing_base))
print("MATCHED (loose):", len(matched))
print("STILL UNMATCHED:", len(unmatched))

print("\n--- STILL UNMATCHED ---")
for u in unmatched:
    print(u)

# save outputs
with open("final_unmatched_still_missing.txt", "w") as f:
    for u in unmatched:
        f.write(u + "\n")

with open("final_matched_loose.txt", "w") as f:
    for k, v in matched.items():
        f.write(f"{k} -> {v}\n")

print("\nSaved:")
print(" - final_unmatched_still_missing.txt")
print(" - final_matched_loose.txt")