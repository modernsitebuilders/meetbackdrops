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
# EXTRACT CANONICAL ID
# -------------------------
def extract_id(filename: str):
    """
    Turns:
        nature-landscapes-95.webp
    Into:
        nature-landscape:95
    """

    name = Path(filename).stem.lower()

    match = re.search(r"(\d+)$", name)
    if not match:
        return None

    num = str(int(match.group(1)))  # removes leading zeros
    prefix = name[:match.start(1)]

    # normalize plural drift ONLY for known cases
    prefix = prefix.replace("landscapes", "landscape")

    category = prefix.split("-")[0]

    return f"{prefix}:{num}"


# -------------------------
# BUILD LOOKUP FROM JSON
# -------------------------
def build_lookup(data):
    lookup = {}

    for item in data:
        webp = item.get("filename")
        png = item.get("downloadName")
        if not webp or not png:
            continue

        key = extract_id(webp)
        if not key:
            continue

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
        key = extract_id(webp)

        if not key or key not in lookup:
            missing.append(webp)
            continue

        item = lookup[key]

        manifest.append({
            "asset_id": key,
            "title": item.get("title"),
            "description": item.get("description"),
            "category": item.get("category"),

            "image_webp": item.get("filename"),
            "download_png": item.get("downloadName"),

            "tags": item.get("keywords", [])
        })

    with open(OUTPUT_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n==============================")
    print("SEO MANIFEST BUILT (v6 - CANONICAL ID SYSTEM)")
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