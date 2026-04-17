import boto3
import os

BUCKET = "streambackdrops-images"

# -------------------------
# R2 CLIENT
# -------------------------
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
)

# -------------------------
# LOAD MANIFEST (WEBPs ONLY)
# -------------------------
with open("live_assets.txt", "r") as f:
    webps = [
        line.strip()
        for line in f
        if line.strip() and not line.startswith("#")
    ]

# -------------------------
# LOAD R2 INDEX (PNG ONLY)
# -------------------------
print("Loading R2 index...")

png_set = set()

for page in s3.get_paginator("list_objects_v2").paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        key = obj["Key"]
        if key.endswith(".png"):
            png_set.add(key.split("/")[-1])

print("R2 PNG count:", len(png_set))

# -------------------------
# HELPERS
# -------------------------
def de_pad(num):
    try:
        return str(int(num))
    except:
        return num

def parse_name(filename):
    """
    art-gallery-01.webp -> (art-gallery, 01)
    """
    base = filename.replace(".webp", "")
    parts = base.rsplit("-", 1)

    if len(parts) != 2:
        return base, None

    return parts[0], parts[1]

def pluralize(cat):
    """
    simple plural/singular toggle
    """
    if cat.endswith("s"):
        return cat[:-1]
    return cat + "s"

# -------------------------
# CORE LOGIC
# -------------------------
resolved = []
missing = []

for w in webps:
    base = w.replace(".webp", "")
    category, num = parse_name(w)

    candidates = set()

    # 1. exact match
    candidates.add(f"{base}.png")

    if num:
        # 2. same category + number
        candidates.add(f"{category}-{num}.png")

        # 3. de-padded number
        candidates.add(f"{category}-{de_pad(num)}.png")

        # 4. plural category variants
        plural_cat = pluralize(category)

        candidates.add(f"{plural_cat}-{num}.png")
        candidates.add(f"{plural_cat}-{de_pad(num)}.png")

    # -------------------------
    # MATCH CHECK
    # -------------------------
    match = None

    for c in candidates:
        if c in png_set:
            match = c
            break

    if match:
        resolved.append((w, match))
    else:
        missing.append((w, sorted(candidates)))

# -------------------------
# OUTPUT REPORT
# -------------------------
print("\n========================")
print("PAIRING REPORT")
print("========================")

print("TOTAL WEBPs:", len(webps))
print("MATCHED:", len(resolved))
print("TRUE MISSING:", len(missing))

# -------------------------
# SAVE FILES
# -------------------------
with open("resolved_pairs.txt", "w") as f:
    for w, p in resolved:
        f.write(f"{w} -> {p}\n")

with open("true_missing_pngs.txt", "w") as f:
    for w, cands in missing:
        f.write(f"{w} | tried: {','.join(cands)}\n")

with open("true_missing_clean.txt", "w") as f:
    for w, _ in missing:
        f.write(f"{w}\n")

print("\nSaved:")
print("- resolved_pairs.txt")
print("- true_missing_pngs.txt")
print("- true_missing_clean.txt")