import json
import hashlib
from pathlib import Path

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_PATH = BASE_DIR / "live_assets.txt"
OUTPUT_PATH = BASE_DIR / "uuid_seo_manifest.json"


# -------------------------
# LOAD DATA
# -------------------------
def load_json():
    with open(JSON_PATH) as f:
        return json.load(f)


def load_live():
    with open(LIVE_PATH) as f:
        return [line.strip() for line in f if line.strip()]


# -------------------------
# DETERMINSITIC UUID (IMPORTANT)
# -------------------------
def make_uuid(asset_key: str) -> str:
    """
    Stable UUID-like ID derived from asset_key.
    Same input ALWAYS produces same output.
    """
    return hashlib.md5(asset_key.encode("utf-8")).hexdigest()[:12]


# -------------------------
# NORMALIZE KEY (CRITICAL STABILITY LAYER)
# -------------------------
def asset_key(filename: str) -> str:
    """
    Canonical identity:
    - ignores .webp / .png
    - removes extension noise
    - normalizes numeric suffix
    """

    name = Path(filename).stem.lower()

    # split prefix + number
    import re
    match = re.search(r"(\d+)$", name)

    if not match:
        return name

    num = str(int(match.group(1)))  # removes leading zeros
    prefix = name[:match.start(1)]

    return f"{prefix}{num}"


# -------------------------
# BUILD LOOKUP
# -------------------------
def build_lookup(data):
    lookup = {}

    for item in data:
        webp = item.get("filename")
        if not webp:
            continue

        key = asset_key(webp)

        # FIRST WINS (prevents duplicates)
        if key not in lookup:
            lookup[key] = item

    return lookup


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
        key = asset_key(webp)

        item = lookup.get(key)

        if not item:
            missing.append(webp)
            continue

        uuid = make_uuid(key)

        manifest.append({
            "uuid": uuid,
            "asset_key": key,

            # SEO identity layer
            "slug": f"{item.get('category', 'uncategorized')}/{key}",

            # display layer
            "title": item.get("title"),
            "description": item.get("description"),
            "category": item.get("category"),

            # storage layer
            "webp": item.get("filename"),
            "png": item.get("downloadName"),

            # SEO enrichment
            "keywords": item.get("keywords", []),
        })

    # write output
    with open(OUTPUT_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n==============================")
    print("UUID MANIFEST BUILT (STABLE ID SYSTEM)")
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