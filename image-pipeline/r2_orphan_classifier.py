import boto3
import re
from collections import defaultdict
from r2_client import get_r2_client, get_bucket

s3 = get_r2_client()
bucket = get_bucket()

# ----------------------------
# LOAD R2 OBJECTS
# ----------------------------
print("Loading R2 objects...")

all_keys = []

paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=bucket):
    for obj in page.get("Contents", []):
        all_keys.append(obj["Key"])

print(f"Total R2 objects: {len(all_keys)}")


# ----------------------------
# CLASSIFICATION RULES
# ----------------------------
def classify(key: str):
    k = key.lower()

    # keep core structured assets
    if any(x in k for x in [
        "kitchen",
        "art-gallery",
        "art-galleries",
        "nature-landscape",
        "bokeh",
        "libraries",
        "urban-loft",
        "historic-space",
        "garden-patio",
        "office-space",
        "living-room"
    ]):
        if k.endswith(".png") or k.endswith(".webp"):
            return "KEEP_CORE_ASSET"

    # system folders (likely derived / legacy / duplicates)
    if any(x in k for x in [
        "webp/",
        "streambackdrops/",
        "premium/",
        "-hd",
        "_hd"
    ]):
        return "SYSTEM_OR_DERIVED"

    # raw loose files
    if re.match(r"^[a-z0-9\-]+(\.png|\.webp)$", k):
        return "POTENTIAL_ORPHAN"

    return "UNKNOWN"


# ----------------------------
# BUCKET GROUPING
# ----------------------------
groups = defaultdict(list)

for key in all_keys:
    group = classify(key)
    groups[group].append(key)


# ----------------------------
# REPORT
# ----------------------------
print("\n==============================")
print("R2 ORPHAN CLASSIFICATION REPORT")
print("==============================")

for group, items in groups.items():
    print(f"\n--- {group}: {len(items)} ---")

    for item in items[:50]:  # sample only
        print(item)

# ----------------------------
# SAVE OUTPUTS
# ----------------------------
with open("r2_keep_core.txt", "w") as f:
    for x in groups["KEEP_CORE_ASSET"]:
        f.write(x + "\n")

with open("r2_system_or_derived.txt", "w") as f:
    for x in groups["SYSTEM_OR_DERIVED"]:
        f.write(x + "\n")

with open("r2_potential_orphans.txt", "w") as f:
    for x in groups["POTENTIAL_ORPHAN"]:
        f.write(x + "\n")

with open("r2_unknown.txt", "w") as f:
    for x in groups["UNKNOWN"]:
        f.write(x + "\n")


print("\nSaved:")
print("- r2_keep_core.txt")
print("- r2_system_or_derived.txt")
print("- r2_potential_orphans.txt")
print("- r2_unknown.txt")