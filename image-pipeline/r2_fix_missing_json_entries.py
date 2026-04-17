import json
from pathlib import Path

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"


# -------------------------
# LOAD LIVE ASSETS
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
# MAIN FIX
# -------------------------
def fix_json():
    live_assets = set(load_live_assets())
    data = load_json()

    existing = set(item["filename"].replace(".webp", "") for item in data)

    missing = live_assets - existing

    print("\n==============================")
    print("JSON REPAIR REPORT")
    print("==============================")
    print(f"Live assets: {len(live_assets)}")
    print(f"Already in JSON: {len(existing)}")
    print(f"Missing JSON entries: {len(missing)}\n")

    new_entries = []

    for asset in sorted(missing):

        entry = {
            "filename": f"{asset}.webp",
            "downloadName": f"{asset}.png",
            "category": asset.split("-")[0],
            "title": asset.replace("-", " ").title(),
            "description": "Virtual background for video calls",
            "alt": f"{asset.replace('-', ' ')} background",
            "keywords": [
                "virtual background",
                "video call",
                "streaming",
                asset.split("-")[0]
            ],
            "width": 1920,
            "height": 1080
        }

        new_entries.append(entry)

    data.extend(new_entries)

    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Added {len(new_entries)} missing JSON entries.")
    print("JSON file updated safely (no R2 changes).")


if __name__ == "__main__":
    fix_json()