import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()


# -------------------------
# LOAD WEBPS (canonical truth)
# -------------------------
def load_live_assets():
    with open(LIVE_ASSETS_PATH, "r") as f:
        return {line.strip() for line in f if line.strip()}


# -------------------------
# LOAD JSON → build WEBP → PNG map
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

        webp = webp.strip()
        png = png.strip()

        # normalize PNG consistency
        if not png.endswith(".png"):
            png = png + ".png"

        # 1:1 mapping only (first win wins, prevents duplicates)
        base = webp.replace(".webp", "")
        if base not in mapping:
            mapping[base] = png

    return mapping


# -------------------------
# BUILD STRICT 1:1 ALLOWLIST
# -------------------------
def main():
    webps = load_live_assets()
    json_map = load_json_map()

    allow = set()

    missing_png = []

    for webp in webps:
        allow.add(webp)

        base = webp.replace(".webp", "")

        png = json_map.get(base)

        if png:
            allow.add(png)
        else:
            missing_png.append(webp)

    print("\n==============================")
    print("ALLOWLIST BUILT (STRICT 1:1 MODEL)")
    print("==============================")
    print("WEBPs:", len(webps))
    print("Mapped PNGs:", len(allow) - len(webps))
    print("TOTAL allowlist:", len(allow))
    print("Missing PNG mappings:", len(missing_png))

    with open("r2_allowlist.txt", "w") as f:
        for item in sorted(allow):
            f.write(item + "\n")

    with open("missing_png_map.txt", "w") as f:
        for item in missing_png:
            f.write(item + "\n")

    print("\nWrote: r2_allowlist.txt")
    print("Wrote: missing_png_map.txt")


if __name__ == "__main__":
    main()