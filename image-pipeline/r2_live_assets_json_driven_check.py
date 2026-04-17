import os
import json
import boto3
from dotenv import load_dotenv
from pathlib import Path

# -------------------------
# ENV
# -------------------------
load_dotenv()

BUCKET = os.getenv("R2_BUCKET")
ENDPOINT = os.getenv("R2_ENDPOINT")
ACCESS_KEY = os.getenv("R2_ACCESS_KEY_ID")
SECRET_KEY = os.getenv("R2_SECRET_ACCESS_KEY")

s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="auto",
)

# -------------------------
# PATHS
# -------------------------
BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()
LIVE_ASSETS_PATH = BASE_DIR / "live_assets.txt"


# -------------------------
# NORMALIZER (FIXED FOR SCHEMA DRIFT)
# -------------------------
def normalize(name: str) -> str:
    if not name:
        return ""

    return (
        name.strip()
        .lower()
        .replace(".png", "")
        .replace(".webp", "")
        # 🔥 FIX: handle known schema drift
        .replace("rooms", "room")
        .replace("landscapes", "landscape")
    )


# -------------------------
# LOAD LIVE ASSETS (WEBP TRUTH)
# -------------------------
def load_live_assets():
    if not LIVE_ASSETS_PATH.exists():
        raise FileNotFoundError(f"live_assets.txt not found at: {LIVE_ASSETS_PATH}")

    with open(LIVE_ASSETS_PATH, "r") as f:
        return [normalize(line) for line in f if line.strip()]


# -------------------------
# LOAD JSON MAP (AUTHORITATIVE PNG SOURCE)
# -------------------------
def load_json_map():
    if not JSON_PATH.exists():
        raise FileNotFoundError(f"image metadata JSON not found at: {JSON_PATH}")

    with open(JSON_PATH, "r") as f:
        data = json.load(f)

    mapping = {}

    for item in data:
        webp = item.get("filename")        # e.g. nature-landscapes-93.webp
        png = item.get("downloadName")     # e.g. nature-landscape-93.png

        if not webp or not png:
            continue

        webp_id = normalize(webp)
        png_id = normalize(png)

        mapping[webp_id] = png_id

    return mapping


# -------------------------
# LOAD R2 OBJECTS
# -------------------------
def load_r2():
    paginator = s3.get_paginator("list_objects_v2")
    keys = set()

    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            keys.add(normalize(obj["Key"].split("/")[-1]))

    return keys


# -------------------------
# CORE LOGIC
# -------------------------
def resolve():
    live_assets = load_live_assets()
    json_map = load_json_map()
    r2 = load_r2()

    missing_png = []
    missing_webp = []

    for webp_id in live_assets:

        # WEBP must exist in R2
        webp_exists = webp_id in r2

        # PNG comes from JSON mapping
        png_id = json_map.get(webp_id)
        png_exists = png_id in r2 if png_id else False

        # LOGIC
        if webp_exists and not png_exists:
            missing_png.append(webp_id)

        if not webp_exists:
            missing_webp.append(webp_id)

    print("\n==============================")
    print("JSON-DRIVEN R2 CHECK (FINAL FIX)")
    print("==============================")

    print(f"Live assets: {len(live_assets)}")
    print(f"Missing PNG: {len(missing_png)}")
    print(f"Missing WEBP: {len(missing_webp)}\n")

    print("---- WEBPs missing PNG ----")
    for item in missing_png:
        print(item + ".webp")

    with open("missing_png_final.txt", "w") as f:
        f.write("\n".join([x + ".webp" for x in missing_png]))

    with open("missing_webp_final.txt", "w") as f:
        f.write("\n".join([x + ".webp" for x in missing_webp]))


if __name__ == "__main__":
    resolve()