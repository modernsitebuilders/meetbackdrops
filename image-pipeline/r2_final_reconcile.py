import boto3
import os
import re
from collections import defaultdict

BUCKET = "streambackdrops-images"

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
)


# -----------------------------
# LOAD MANIFEST (SOURCE OF TRUTH)
# -----------------------------
with open("live_assets.txt", "r") as f:
    manifest = [
        line.strip().split("/")[-1]
        for line in f
        if line.strip() and not line.startswith("#")
    ]

print(f"Manifest WEBPs: {len(manifest)}")


# -----------------------------
# LOAD R2 STATE
# -----------------------------
print("Loading R2...")

png_set = set()
webp_set = set()

paginator = s3.get_paginator("list_objects_v2")

for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        key = obj["Key"]
        fname = key.split("/")[-1]

        if fname.endswith(".png"):
            png_set.add(fname)
        elif fname.endswith(".webp"):
            webp_set.add(fname)


print(f"R2 PNGs: {len(png_set)}")
print(f"R2 WEBPs: {len(webp_set)}")


# -----------------------------
# RULE ENGINE (HARD CUTOFF LOGIC)
# -----------------------------
def expected_png(webp):
    base = webp.replace(".webp", "")
    match = re.search(r"(\d+)$", base)

    if not match:
        return base + ".png"

    num = int(match.group(1))

    # -------------------------
    # wall-shelves-bright
    # -------------------------
    if webp.startswith("wall-shelves-bright"):
        if num <= 46:
            return f"well-lit-{num:02d}.png"
        else:
            return f"wall-shelves-bright-{num}.png"

    # -------------------------
    # wall-shelves-dark
    # -------------------------
    if webp.startswith("wall-shelves-dark"):
        if num <= 41:
            return f"ambient-{num:02d}.png"
        else:
            return f"wall-shelves-dark-{num}.png"

    # -------------------------
    # DEFAULT RULE
    # -------------------------
    return base + ".png"


# -----------------------------
# VALIDATION
# -----------------------------
expected_pngs = set()
missing = []

for webp in manifest:
    png = expected_png(webp)
    expected_pngs.add(png)

    if png not in png_set:
        missing.append((webp, png))


# -----------------------------
# EXTRA PNGS (TRASH CANDIDATES)
# -----------------------------
extra_pngs = sorted(list(png_set - expected_pngs))


# -----------------------------
# REPORT
# -----------------------------
print("\n==============================")
print("FINAL R2 RECONCILIATION")
print("==============================")

print(f"Manifest WEBPs: {len(manifest)}")
print(f"Expected PNGs: {len(expected_pngs)}")
print(f"Missing PNGs: {len(missing)}")
print(f"Extra PNGs (DELETE): {len(extra_pngs)}")


print("\n--- SAMPLE MISSING PNGS ---")
for w, p in missing[:20]:
    print(f"{w} -> {p}")

print("\n--- SAMPLE EXTRA PNGS (SAFE DELETE) ---")
for x in extra_pngs[:40]:
    print(x)


# -----------------------------
# OUTPUT FILES
# -----------------------------
with open("missing_pngs.txt", "w") as f:
    for w, p in missing:
        f.write(f"{w} -> {p}\n")

with open("delete_r2_pngs.txt", "w") as f:
    for x in extra_pngs:
        f.write(x + "\n")

print("\nSaved:")
print(" - missing_pngs.txt")
print(" - delete_r2_pngs.txt")