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
# NORMALIZATION (SINGLE SOURCE OF TRUTH)
# -------------------------
def norm(name: str) -> str:
    if not name:
        return ""
    return (
        name.strip()
        .lower()
        .replace(".png", "")
        .replace(".webp", "")
    )


# -------------------------
# LOAD LIVE ASSETS (WEBP TRUTH)
# -------------------------
def load_live():
    if not LIVE_ASSETS_PATH.exists():
        raise FileNotFoundError(f"Missing: {LIVE_ASSETS_PATH}")

    with open(LIVE_ASSETS_PATH, "r") as f:
        return set(norm(x) for x in f if x.strip())


# -------------------------
# LOAD JSON MAP (WEBP → PNG)
# -------------------------
def load_json():
    if not JSON_PATH.exists():
        raise FileNotFoundError(f"Missing: {JSON_PATH}")

    with open(JSON_PATH, "r") as f:
        data = json.load(f)

    mapping = {}

    for item in data:
        webp = norm(item.get("filename"))
        png = norm(item.get("downloadName"))

        if webp and png:
            mapping[webp] = png

    return mapping


# -------------------------
# LOAD R2 KEYS
# -------------------------
def load_r2():
    paginator = s3.get_paginator("list_objects_v2")
    keys = set()

    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            keys.add(norm(obj["Key"].split("/")[-1]))

    return keys


# -------------------------
# CORE CHECK (STRICT MODE)
# -------------------------
def main():
    live = load_live()
    json_map = load_json()
    r2 = load_r2()

    missing_webp = []
    missing_png = []

    # WEBP must exist in R2
    for asset in live:
        if asset not in r2:
            missing_webp.append(asset)

    # PNG must exist in R2 via JSON mapping
    for asset in live:
        png = json_map.get(asset)
        if not png or png not in r2:
            missing_png.append(asset)

    print("\n==============================")
    print("FINAL TRUTH REPORT (STRICT MODE)")
    print("==============================")
    print("Live assets:", len(live))
    print("Missing WEBP:", len(missing_webp))
    print("Missing PNG:", len(missing_png))

    print("\n--- Missing WEBPs ---")
    for x in missing_webp:
        print(x + ".webp")

    print("\n--- Missing PNGs ---")
    for x in missing_png:
        print(x + ".png")


if __name__ == "__main__":
    main()