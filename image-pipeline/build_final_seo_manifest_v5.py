import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_PATH = BASE_DIR / "live_assets.txt"
OUTPUT_PATH = BASE_DIR / "seo_manifest.json"


# -------------------------
# LOADS
# -------------------------
def load_json():
    with open(JSON_PATH) as f:
        return json.load(f)


def load_live():
    with open(LIVE_PATH) as f:
        return [line.strip() for line in f if line.strip()]


# -------------------------
# EXTRACT SAFE KEY (CRITICAL FIX)
# -------------------------
def asset_key(filename: str, category: str = "") -> str:
    """
    FIXES:
    - plural vs singular category drift
    - folder noise
    - extension noise
    - ensures numeric stability
    """

    base = Path(filename).stem.lower()

    # extract number
    match = re.search(r'(\d+)$', base)
    if not match:
        return base

    num = str(int(match.group(1)))  # removes leading zeros
    prefix = base[:match.start(1)]

    # normalize category drift lightly (ONLY for known plural s issues)
    category = category.lower().rstrip("s")

    return f"{category}:{prefix}{num}"


# -------------------------
# BUILD LOOKUP
# -------------------------
def build_lookup(data):
    lookup = {}

    for item in data:
        webp = item.get("filename")
        png = item.get("downloadName")
        category = item.get("category", "")

        if not webp or not png:
            continue

        key = asset_key(webp, category)

        if key not in lookup:
            lookup[key] = {
                "key": key,
                "webp": webp,
                "png": png,
                "category": category,
                "title": item.get("title", key),
                "description": item.get("description", ""),
                "tags": item.get("tags", []),
            }

    return lookup


# -------------------------
# SLUG
# -------------------------
def slug(category, key):
    return f"{category}/{key.split(':')[1]}"


# -------------------------
# MAIN
# -------------------------
def main():
    data = load_json()
    live = load_live()

    lookup = build_lookup(data)

    manifest = []
    missing = []

    for webp in live:
        # we DON'T trust category here → we recompute via lookup scan
        matched = None

        for item in data:
            if item.get("filename") == webp:
                matched = item
                break

        if not matched:
            missing.append(webp)
            continue

        key = asset_key(matched["filename"], matched.get("category", ""))

        manifest.append({
            "asset_key": key,
            "slug": slug(matched["category"], key),
            "title": matched["title"],
            "description": matched["description"],
            "category": matched["category"],
            "image_webp": matched["filename"],
            "download_png": matched["downloadName"],
            "tags": matched.get("keywords", []),
        })

    with open(OUTPUT_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n==============================")
    print("SEO MANIFEST BUILT (v5 - category-safe system)")
    print("==============================")
    print("Live assets:", len(live))
    print("Manifest items:", len(manifest))
    print("Missing:", len(missing))

    if missing:
        print("\nSample missing:")
        for x in missing[:20]:
            print(" -", x)

    print(f"\nWrote: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()