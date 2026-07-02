#!/usr/bin/env python3
"""
process_new_images.py — deterministic, vision-driven batch processor.
=====================================================================

The operator does NOT choose categories or filenames. Given a folder of raw
Midjourney PNGs, the pipeline decides everything from the image content:

  Phase 1 (--number):  rename the batch's raw `streambackdrops_*.png` files to
                       neutral sequential numbers (mj-<date>-NNN.png). This
                       strips the Midjourney prompt text so nothing about it can
                       leak into the category or the final filename.

  Phase 2 (default):   for each numbered file —
     1. convert PNG → WebP (1456x816, q82); SHA-256 → hash8 (fully deterministic)
     2. OpenAI vision (gpt-4o-mini, temp 0, seed 42) on the local WebP bytes →
        {category, title, description, alt, tags}. The CATEGORY is chosen by the
        model from the fixed canonical list — not by the operator.
     3. slug = descriptive-words-from-ALT (stop-word filtered, <=60c) + hash8
     4. upload WebP → webp/{folder}/{slug}.webp ; PNG → {slug}.png  (R2)
     5. rename numbered source → {slug}.png
     6. emit a COMPLETE manifest entry (category + folder + slug + copy + tags)

  Output: process_new_images_output.json — full manifest entries, ready for
  merge-batch.js (which routes each into its category's array + syncs counts).

Usage (from image-pipeline/):
  python3 process_new_images.py --number          # phase 1: neutralize names
  python3 process_new_images.py --classify-only   # phase 2 vision only, no upload
  python3 process_new_images.py                    # phase 2: full (uploads + renames)
"""

import base64
import hashlib
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime
from glob import glob
from io import BytesIO
from pathlib import Path

import boto3
from dotenv import load_dotenv
from PIL import Image

# ── Config ────────────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

R2_ACCESS_KEY  = os.environ["R2_ACCESS_KEY"]
R2_SECRET_KEY  = os.environ["R2_SECRET_KEY"]
R2_ENDPOINT    = os.environ["R2_ENDPOINT"]
R2_BUCKET      = os.environ["R2_BUCKET"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

WEBP_WIDTH, WEBP_HEIGHT, WEBP_QUALITY = 1456, 816, 82
HASH_LEN, DESC_MAX = 8, 60

MODEL = "gpt-4o-mini"
DScMIN, DScMAX = 110, 160      # description
TtlMIN, TtlMAX = 30, 95        # title (incl " | MeetBackdrops")
AltMIN, AltMAX = 50, 180       # alt
TagMIN, TagMAX = 8, 12

DOWNLOADS = Path("/Users/davidmiles/Downloads")

# ── Batch identity ────────────────────────────────────────────────────────────
# A "batch" is every raw Midjourney file in Downloads modified on BATCH_DATE
# (defaults to today; override with `--date YYYY-MM-DD`). Phase 1 renumbers them
# to BATCH_PREFIX-NNN.png; phase 2 operates on the numbered files only. The
# mtime window keeps older un-renamed files out of the batch automatically.
def _batch_date():
    for i, a in enumerate(sys.argv):
        if a == "--date" and i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    return datetime.now().strftime("%Y-%m-%d")

BATCH_DATE = _batch_date()
BATCH_PREFIX = f"mj-{BATCH_DATE}"
BATCH_START_MTIME = datetime.strptime(BATCH_DATE, "%Y-%m-%d").timestamp()

# ── Canonical categories the model may choose from ────────────────────────────
# The model picks exactly one slug. Descriptions are the only steering — no
# operator override. Merged categories store webps in a *-bright subfolder.
CATEGORY_GUIDE = {
    "neutral-backgrounds": "A plain WALL is essentially the entire subject — no shelves, furniture, or room features, just the wall surface filling the frame. ANY wall color is valid, across the full spectrum: light neutrals (off-white, greige, gray, taupe, sage) through warmer and deeper tones (clay, sand, olive, blue-gray, mushroom, charcoal) and any other solid hue. Solid or subtly-textured (plaster, limewash, matte paint, fine linen, panelling). A soft directional shadow gradient falls across many but is not required. The wall itself is the product.",
    "office-spaces":       "Corporate/business interiors: executive or corporate offices, boardrooms, conference/meeting rooms, medical or clinical/dental offices, open-plan workspaces, glass lobbies, reception areas.",
    "home-office":         "A home work setting: a desk or study at home, work-from-home room, cozy home office, or a therapy/counseling/telehealth home consulting room.",
    "living-rooms":        "Residential living rooms or lounges — sofas, armchairs, coffee tables, soft home seating.",
    "kitchens":            "Kitchens — counters, cabinets, islands, cooking spaces.",
    "coffee-shops":        "Cafes / coffee shops — counters, espresso machines, casual cafe seating.",
    "art-galleries":       "Gallery or museum interiors — framed art / artwork on clean exhibition walls.",
    "urban-lofts":         "Industrial loft spaces — exposed brick, raw concrete, large factory-style windows.",
    "gardens-patios":      "Outdoor gardens, patios, terraces, or courtyards with greenery and outdoor seating.",
    "historic-spaces":     "Grand historic or period interiors — ballrooms, columns, vaulted ceilings, Art Deco, ornate architecture.",
    "nature-landscapes":   "Outdoor natural scenery — mountains, forests, water, fields, open horizons.",
    "libraries":           "Library reading rooms with floor-to-ceiling shelves of books.",
    "bookshelves":         "A bookshelf or bookcase filled with books is the dominant feature behind the speaker.",
    "wall-shelves":        "Floating wall shelves or display shelves holding a few styled objects (not full packed bookcases).",
    "bokeh-backgrounds":   "Abstract soft-focus blurred lights / bokeh, not a real room.",
    "christmas-backgrounds": "Christmas decor — trees, wreaths, garlands, ornaments, stockings.",
    "halloween-backgrounds": "Halloween decor — jack-o-lanterns, cobwebs, bats, gothic/eerie night styling. Spooky specifically; warm non-spooky autumn/harvest belongs in fall-backgrounds.",
    "valentines-backgrounds": "Valentine's decor — hearts, roses, romantic pinks/reds.",
    "easter-backgrounds":  "Easter / spring pastel decor — eggs, bunnies, tulips, lilies.",
    "spring-backgrounds":  "Spring scenes — fresh blooms, cherry blossom, daffodils, sunrooms.",
    "summer-backgrounds":  "Summer scenes — beach, poolside, tropical, coastal, sun-drenched patios.",
    "fall-backgrounds":    "Fall / autumn & Thanksgiving — warm rust/amber/ochre palette, autumn foliage, cozy harvest styling (subtle pumpkins/gourds/wheat), fireside warmth. Warm seasonal offices, home offices, or cozy cabins. Not spooky (that's halloween-backgrounds).",
}
ALLOWED = set(CATEGORY_GUIDE)
CATEGORY_FOLDER = {"bookshelves": "bookshelves-bright", "wall-shelves": "wall-shelves-bright"}

USE_CASES = ["professional video calls", "executive video calls", "remote work",
             "online presentations", "team standups", "virtual meetings"]
FORBIDDEN_RE = re.compile(r"\b(gamer|gamers|gaming|twitch|streamer|streamers|livestreamer|esports|obs|stunning|amazing|premium|ultimate|stock)\b", re.I)

STOP_WORDS = {
    "a","an","the","and","or","but","of","in","on","at","by","with","to","for",
    "from","as","is","are","was","were","be","been","being","this","that","these",
    "those","it","its","has","have","had","do","does","did","will","would","can",
    "could","should","may","might","must","also","featuring","ideal","perfect",
}

DRY = "--classify-only" in sys.argv
NUMBER_ONLY = "--number" in sys.argv


# ── Phase 1: neutralize filenames to numbers ──────────────────────────────────

def phase_number():
    raw = sorted(
        p for p in DOWNLOADS.glob("streambackdrops_*.png")
        if p.stat().st_mtime >= BATCH_START_MTIME
    )
    if not raw:
        print("No raw streambackdrops_*.png in the batch window — already numbered?")
        return
    print(f"Phase 1: numbering {len(raw)} raw files → {BATCH_PREFIX}-NNN.png\n")
    for i, p in enumerate(raw, 1):
        dst = DOWNLOADS / f"{BATCH_PREFIX}-{i:03d}.png"
        print(f"  {p.name[:60]}…  →  {dst.name}")
        p.rename(dst)
    print(f"\n✓ numbered {len(raw)} files. Now run the pipeline (no args / --classify-only).")


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_descriptive(text: str) -> str:
    text = re.sub(r"[^a-z0-9\s]+", " ", (text or "").lower())
    tokens = [t for t in text.split() if t and t not in STOP_WORDS]
    picked, length = [], 0
    for tok in tokens:
        nxt = len(tok) if not picked else length + 1 + len(tok)
        if nxt > DESC_MAX:
            break
        picked.append(tok); length = nxt
    return "-".join(picked) if picked else "image"


def convert_to_webp(src_path: str) -> bytes:
    img = Image.open(src_path).convert("RGB")
    tr = WEBP_WIDTH / WEBP_HEIGHT
    sr = img.width / img.height
    if sr > tr:
        nw = int(img.height * tr); left = (img.width - nw) // 2
        img = img.crop((left, 0, left + nw, img.height))
    elif sr < tr:
        nh = int(img.width / tr); top = (img.height - nh) // 2
        img = img.crop((0, top, img.width, top + nh))
    img = img.resize((WEBP_WIDTH, WEBP_HEIGHT), Image.LANCZOS)
    buf = BytesIO(); img.save(buf, format="WEBP", quality=WEBP_QUALITY, method=6)
    return buf.getvalue()


def hash8(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:HASH_LEN]


def pick_use_case(seed_str: str) -> str:
    h = 5381
    for ch in seed_str:
        h = ((h << 5) + h + ord(ch)) & 0xFFFFFFFF
    return USE_CASES[h % len(USE_CASES)]


def build_vision_prompt(use_case: str, retry_hint: str = "") -> str:
    cats = "\n".join(f"- {slug}: {desc}" for slug, desc in CATEGORY_GUIDE.items())
    return f"""You are classifying and writing SEO metadata for ONE image sold as a virtual background for corporate / executive video calls on Zoom, Microsoft Teams, and Google Meet. No people are in the image.

BRAND: MeetBackdrops — a virtual set design studio for corporate / executive professionals. NOT gaming/streaming/Twitch. NEVER use: gamer, gaming, Twitch, streamer, OBS, esports, livestream, stunning, amazing, perfect, premium, ultimate, stock. Approved: designed, studio-designed, 4K-upscaled, composed for camera, virtual background, virtual set, high-fidelity, corporate, executive, boardroom.

STEP 1 — CATEGORY. Look at the image and choose EXACTLY ONE category slug from this list whose description best matches what is actually shown:
{cats}

STEP 2 — metadata. Then output strict JSON with EXACTLY these keys: category, title, description, alt, tags.

=== category === one slug from the list above, verbatim.
=== title ({TtlMIN}-{TtlMAX} chars incl " | MeetBackdrops") === concrete image-grounded subject; Title Case; ends with " | MeetBackdrops"; no "background"/"backdrop"/"wallpaper"; no emojis.
=== description ({DScMIN}-{DScMAX} chars — HARD) === visual specifics unique to THIS image; weave the phrase "{use_case}" mid-sentence; don't start with A/An/This/The; count characters.
=== alt ({AltMIN}-{AltMAX} chars) === factual visual description for screen readers; don't start with "Image of"/"A picture of"; don't mention Zoom/virtual/background/MeetBackdrops.
=== tags ({TagMIN}-{TagMAX} lowercase strings) === span >=5 of environment/object/mood/lighting/style/color/composition/use-case; include exactly ONE use-case tag "{use_case}"; 1-3 words each; no punctuation.

{retry_hint}OUTPUT: strict JSON only. No markdown, no code fences."""


def vision_call(webp_bytes: bytes, use_case: str, retry_hint: str = "") -> dict:
    data_url = "data:image/webp;base64," + base64.b64encode(webp_bytes).decode()
    body = json.dumps({
        "model": MODEL, "temperature": 0, "seed": 42,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": build_vision_prompt(use_case, retry_hint)},
            {"type": "image_url", "image_url": {"url": data_url, "detail": "low"}},
        ]}],
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions", data=body,
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        payload = json.loads(resp.read())
    return json.loads(payload["choices"][0]["message"]["content"])


def validate(m: dict) -> list:
    issues = []
    c = m.get("category")
    if c not in ALLOWED:
        issues.append(f"category '{c}' not in allowed list")
    for k, lo, hi in (("title", TtlMIN, TtlMAX), ("description", DScMIN, DScMAX), ("alt", AltMIN, AltMAX)):
        v = m.get(k)
        if not isinstance(v, str):
            issues.append(f"{k} missing")
        elif not (lo <= len(v) <= hi):
            issues.append(f"{k} {len(v)}c out of {lo}-{hi}")
    if "| MeetBackdrops" not in (m.get("title") or ""):
        issues.append("title missing brand suffix")
    tags = m.get("tags")
    if not isinstance(tags, list) or not (TagMIN <= len(tags) <= TagMAX):
        issues.append("tags count out of range")
    fw = FORBIDDEN_RE.search(" ".join(str(m.get(k, "")) for k in ("title", "description", "alt")))
    if fw:
        issues.append(f'contains forbidden word "{fw.group(0)}" — rewrite that sentence without it and without "perfect for" boilerplate')
    return issues


def classify(webp_bytes: bytes, handle: str) -> dict:
    use_case = pick_use_case(hash8(webp_bytes))
    hint = ""
    for attempt in range(3):
        try:
            m = vision_call(webp_bytes, use_case, hint)
            issues = validate(m)
            if not issues:
                return m
            hint = "RETRY — fix: " + "; ".join(issues) + ".\n\n"
            if attempt == 2:
                return m  # accept best-effort with warnings
        except Exception as e:
            if attempt == 2:
                raise
            time.sleep(1.5 * (attempt + 1))
    return m


# ── Phase 2: vision-driven processing ─────────────────────────────────────────

def main():
    if NUMBER_ONLY:
        phase_number()
        return

    files = sorted(DOWNLOADS.glob(f"{BATCH_PREFIX}-*.png"))
    if not files:
        print(f"No {BATCH_PREFIX}-*.png found. Run `--number` first to neutralize the raw files.")
        return

    print(("=== CLASSIFY-ONLY (no upload/rename) ===\n" if DRY else "") + f"Batch: {len(files)} numbered files\n")

    r2 = None if DRY else boto3.client(
        "s3", endpoint_url=R2_ENDPOINT, aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY, region_name="auto")

    results, errors = [], []
    for p in files:
        try:
            webp = convert_to_webp(str(p))
            h8 = hash8(webp)
            m = classify(webp, p.name)
            category = m["category"] if m.get("category") in ALLOWED else "office-spaces"
            folder = CATEGORY_FOLDER.get(category, category)
            slug = f"{build_descriptive(m.get('alt', ''))}-{h8}"
            webp_name, png_name = f"{slug}.webp", f"{slug}.png"
            webp_key, png_key = f"webp/{folder}/{webp_name}", png_name

            warn = validate(m)
            print(f"→ {p.name}  →  [{category}]  {slug}" + (f"  ⚠ {warn}" if warn else ""))

            if not DRY:
                r2.put_object(Bucket=R2_BUCKET, Key=webp_key, Body=webp,
                              ContentType="image/webp", CacheControl="public, max-age=31536000, immutable")
                r2.put_object(Bucket=R2_BUCKET, Key=png_key, Body=p.read_bytes(),
                              ContentType="image/png", CacheControl="public, max-age=31536000, immutable")
                p.rename(p.parent / png_name)

            results.append({
                "id": f"{category}:{slug}", "slug": slug, "category": category, "folder": folder,
                "image_webp": webp_name, "download_png": png_name,
                "title": m.get("title", ""), "description": m.get("description", ""),
                "alt": m.get("alt", ""), "tags": m.get("tags", []), "hdOnly": False,
            })
        except Exception as e:
            errors.append(f"{p.name}: {e}")
            print(f"  ✗ ERROR {p.name}: {e}")

    out = BASE_DIR / "process_new_images_output.json"
    out.write_text(json.dumps(results, indent=2))
    by_cat = {}
    for r in results:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
    print(f"\n=== {'classified' if DRY else 'processed'} {len(results)}, {len(errors)} errors ===")
    print("By category (decided by the pipeline):", json.dumps(by_cat, indent=0))
    print(f"Output: {out}")
    for e in errors:
        print("  " + e)


if __name__ == "__main__":
    main()
