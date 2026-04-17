import json
from pathlib import Path

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"
OUTPUT_PATH = BASE_DIR / "seo_manifest.json"


# -------------------------
# LOAD LIVE WEBPs (source of truth)
# -------------------------
def load_live_assets():
    with open(LIVE_ASSETS_PATH, "r") as f:
        return [line.strip() for line in f if line.strip()]


# -------------------------
# LOAD METADATA JSON
# -------------------------
def load_json():
    with open(JSON_PATH, "r") as f:
        return json.load(f)


# -------------------------
# NORMALIZE BASE NAME
# -------------------------
def normalize(name: str) -> str:
    return (
        name.lower()
        .replace(".png", "")
        .replace(".webp", "")
        .strip()
    )


# -------------------------
# ENSURE PNG SUFFIX
# -------------------------
def ensure_png(name: str) -> str:
    if not name:
        return name
    return name if name.lower().endswith(".png") else f"{name}.png"


# -------------------------
# ENSURE WEBP SUFFIX
# -------------------------
def ensure_webp(name: str) -> str:
    if not name:
        return name
    return name if name.lower().endswith(".webp") else f"{name}.webp"


# -------------------------
# BUILD LOOKUP TABLE (STRICT 1:1)
# -------------------------
def build_lookup(data):
    lookup = {}

    for item in data:
        webp = item.get("filename")
        png = item.get("downloadName")

        if not webp or not png:
            continue

        asset_id = normalize(webp)

        # ENFORCE FILE FORMATS
        webp = ensure_webp(webp)
        png = ensure_png(png)

        # FIRST VALID ENTRY WINS
        if asset_id not in lookup:
            lookup[asset_id] = {
                "asset_id": asset_id,
                "webp": webp,
                "png": png,
                "category": item.get("category", "uncategorized"),
                "title": item.get("title", asset_id),
                "description": item.get("description", ""),
                "tags": item.get("tags", []),
            }

    return lookup


# -------------------------
# BUILD SEO SLUG
# -------------------------
def make_slug(asset_id: str, category: str):
    return f"{category}/{asset_id}"


# -------------------------
# MAIN BUILD
# -------------------------
def main():
    live_assets = set(load_live_assets())
    data = load_json()

    lookup = build_lookup(data)

    manifest = []
    missing = []

    for asset_id in live_assets:
        item = lookup.get(asset_id)

        if not item:
            missing.append(asset_id)
            continue

        manifest.append({
            "asset_id": asset_id,
            "slug": make_slug(asset_id, item["category"]),
            "title": item["title"],
            "description": item["description"],
            "category": item["category"],

            # GUARANTEED FIXED PAIRS
            "image_webp": item["webp"],
            "download_png": item["png"],

            "tags": item["tags"],
        })

    with open(OUTPUT_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print("\n==============================")
    print("SEO MANIFEST BUILT (STRICT 1:1 FIXED)")
    print("==============================")
    print("Assets processed:", len(live_assets))
    print("Manifest items:", len(manifest))
    print("Missing mappings:", len(missing))

    if missing:
        print("\nMissing asset IDs:")
        for x in missing[:20]:
            print(" -", x)

    print(f"\nWrote: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()