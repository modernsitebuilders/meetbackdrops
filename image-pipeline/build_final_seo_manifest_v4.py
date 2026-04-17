import json
import re
from pathlib import Path

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"
OUTPUT_PATH = BASE_DIR / "seo_manifest.json"


# -------------------------
# LOAD LIVE WEBPs
# -------------------------
def load_live_assets():
    with open(LIVE_ASSETS_PATH, "r") as f:
        return [line.strip() for line in f if line.strip()]


# -------------------------
# LOAD JSON
# -------------------------
def load_json():
    with open(JSON_PATH, "r") as f:
        return json.load(f)


# -------------------------
# CANONICAL NORMALIZER (CRITICAL FIX)
# -------------------------
def asset_id(name: str) -> str:
    """
    Fixes ALL matching issues:
    - removes extension
    - removes path
    - normalizes lowercase
    - removes leading zeros in numeric parts
    """

    base = Path(name).stem.lower().strip()

    # split into segments (letters / numbers)
    parts = re.split(r'(\d+)', base)

    normalized = []
    for p in parts:
        if p.isdigit():
            # remove leading zeros safely
            normalized.append(str(int(p)))
        else:
            normalized.append(p)

    return "".join(normalized)


# -------------------------
# BUILD LOOKUP
# -------------------------
def build_lookup(data):
    lookup = {}

    for item in data:
        webp = item.get("filename")
        png = item.get("downloadName")

        if not webp or not png:
            continue

        key = asset_id(webp)

        if key not in lookup:
            lookup[key] = {
                "asset_id": key,
                "webp": webp,
                "png": png,
                "category": item.get("category", "uncategorized"),
                "title": item.get("title", key),
                "description": item.get("description", ""),
                "tags": item.get("tags", []),
            }

    return lookup


# -------------------------
# SLUG
# -------------------------
def make_slug(category, asset_id):
    return f"{category}/{asset_id}"


# -------------------------
# MAIN
# -------------------------
def main():
    live_assets = load_live_assets()
    data = load_json()

    lookup = build_lookup(data)

    manifest = []
    missing = []

    for webp in live_assets:
        key = asset_id(webp)

        item = lookup.get(key)

        if not item:
            missing.append(webp)
            continue

        manifest.append({
            "asset_id": key,
            "slug": make_slug(item["category"], key),
            "title": item["title"],
            "description": item["description"],
            "category": item["category"],
            "image_webp": item["webp"],
            "download_png": item["png"],
            "tags": item["tags"],
        })

    with open(OUTPUT_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n==============================")
    print("SEO MANIFEST BUILT (v4 - numeric-safe)")
    print("==============================")
    print("Live assets:", len(live_assets))
    print("Manifest items:", len(manifest))
    print("Missing mappings:", len(missing))

    if missing:
        print("\nSample missing:")
        for x in missing[:20]:
            print(" -", x)

    print(f"\nWrote: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()