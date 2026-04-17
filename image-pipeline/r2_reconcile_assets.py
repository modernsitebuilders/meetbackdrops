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
# CATEGORY RULES
# -----------------------------
def get_download_name(webp_filename, category):
    """
    Map WEBP -> expected PNG download name
    """

    match = re.search(r'(\d+)', webp_filename)
    if not match:
        return None

    num = int(match.group(1))

    if category == "wall-shelves-bright":
        return f"well-lit-{num:02d}.png"

    if category == "wall-shelves-dark":
        return f"ambient-{num:02d}.png"

    return webp_filename.replace(".webp", ".png")


# -----------------------------
# LOAD R2
# -----------------------------
print("Loading R2 objects...")

response = s3.list_objects_v2(Bucket=BUCKET)
all_keys = []

paginator = s3.get_paginator("list_objects_v2")
for page in paginator.paginate(Bucket=BUCKET):
    for obj in page.get("Contents", []):
        all_keys.append(obj["Key"])

print(f"Total R2 objects: {len(all_keys)}")


# -----------------------------
# BUILD STATE
# -----------------------------
pngs = set()
webps = set()
expected_pngs = set()

for key in all_keys:
    fname = key.split("/")[-1]

    parts = key.split("/")

    # expects: streambackdrops/category/file.ext
    category = parts[1] if len(parts) > 2 else "unknown"

    if fname.endswith(".webp"):
        webps.add(fname.replace(".webp", ""))

        expected = get_download_name(fname, category)
        if expected:
            expected_pngs.add(expected.replace(".png", ""))

    elif fname.endswith(".png"):
        pngs.add(fname.replace(".png", ""))


# -----------------------------
# ANALYSIS
# -----------------------------
missing_png = sorted(expected_pngs - pngs)
extra_png = sorted(pngs - expected_pngs)

print("\n============================")
print("R2 CONSISTENCY REPORT")
print("============================")

print(f"WEBP COUNT: {len(webps)}")
print(f"PNG COUNT: {len(pngs)}")

print(f"\nEXPECTED PNGS: {len(expected_pngs)}")

print(f"\nMISSING PNGS: {len(missing_png)}")
print(f"EXTRA PNGS: {len(extra_png)}")


print("\n--- SAMPLE MISSING PNGS ---")
for x in missing_png[:25]:
    print(x + ".png")

print("\n--- SAMPLE EXTRA PNGS ---")
for x in extra_png[:25]:
    print(x + ".png")


# -----------------------------
# OPTIONAL: WRITE FILES
# -----------------------------
with open("missing_pngs.txt", "w") as f:
    for x in missing_png:
        f.write(x + ".png\n")

with open("extra_pngs.txt", "w") as f:
    for x in extra_png:
        f.write(x + ".png\n")

print("\nSaved:")
print(" - missing_pngs.txt")
print(" - extra_pngs.txt")