import json
from pathlib import Path

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()


# -------------------------
# LOAD WEBP LIST (SOURCE OF TRUTH)
# -------------------------
def load_webps():
    with open(LIVE_ASSETS_PATH, "r") as f:
        return [line.strip() for line in f if line.strip()]


# -------------------------
# LOAD JSON (WEBP → PNG mapping ONLY)
# -------------------------
def load_json_map():
    with open(JSON_PATH, "r") as f:
        data = json.load(f)

    mapping = {}

    for item in data:
        webp = item.get("filename")
        png = item.get("downloadName")

        if not webp or not png:
            continue

        # normalize pairing key
        key = webp.replace(".webp", "").strip().lower()
        val = png.replace(".png", "").strip().lower()

        mapping[key] = val

    return mapping


# -------------------------
# MAIN PIPELINE DRIVER
# -------------------------
def main():
    webps = load_webps()
    json_map = load_json_map()

    print("\n==============================")
    print("WEBP PIPELINE START")
    print("==============================")
    print("WEBPs to process:", len(webps))

    for webp in webps:
        key = webp.replace(".webp", "").strip().lower()

        png = json_map.get(key)

        print("\n---")
        print("WEBP:", webp)
        print("PNG :", png if png else "NO JSON MATCH")

        # 👇 THIS is where future pipeline logic goes:
        # process_webp(webp, png)

    print("\nDONE")


if __name__ == "__main__":
    main()