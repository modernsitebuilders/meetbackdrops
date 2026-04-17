import json
import re
from collections import defaultdict

metadata_file = "../public/data/image-metadata-complete.json"

# ----------------------------
# LOAD METADATA
# ----------------------------
with open(metadata_file, "r") as f:
    data = json.load(f)

# ----------------------------
# NORMALIZER
# ----------------------------
def normalize_base(name):
    """
    Turns:
    art-gallery-18.png
    art-galleries-18.png

    into:
    art-gallery
    """
    name = name.replace(".png", "").replace(".webp", "")

    # split number suffix
    match = re.match(r"([a-z\-]+)-\d+", name)
    if match:
        base = match.group(1)
    else:
        base = name

    # canonical rule: force singular form internally
    if base.startswith("art-galleries"):
        base = base.replace("art-galleries", "art-gallery")

    return base

# ----------------------------
# BUILD GROUPS
# ----------------------------
groups = defaultdict(list)

for item in data:
    dn = item.get("downloadName")
    if not dn:
        continue

    base = normalize_base(dn)
    groups[base].append(dn)

# ----------------------------
# BUILD CANONICAL MAP
# ----------------------------
canonical_map = {}

for base, files in groups.items():
    # pick shortest/cleanest filename as canonical
    canonical = sorted(files, key=len)[0]

    for f in files:
        canonical_map[f] = canonical

# ----------------------------
# OUTPUT
# ----------------------------
with open("canonical_map.json", "w") as f:
    json.dump(canonical_map, f, indent=2)

print("DONE")
print("Total entries:", len(canonical_map))

# show gallery-related only
print("\n--- ART GALLERY GROUP ---")
for k, v in canonical_map.items():
    if "art-gallery" in k or "art-galleries" in k:
        print(k, "→", v)