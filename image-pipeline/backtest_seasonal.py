#!/usr/bin/env python3
"""
Backtest the seasonal GATE in process_new_images.py against a labeled eval set
drawn from the live library — WITHOUT uploading or mutating anything. Imports the
REAL classifier (build_vision_prompt / resolve_category / classify), so it always
tests the shipping prompt: re-run it after any edit to ROOM_GUIDE / SEASON_GATE.

Fetches webp bytes from R2, runs classify(), and prints a confusion matrix. The
metric that matters is the seasonal FALSE-POSITIVE rate on non-seasonal
professional rooms (the thing the gate must not break).

Usage:  python3 image-pipeline/backtest_seasonal.py
Last known-good (2026-07-04): 29/30 rooms stay non-seasonal, 16/16 fall recall.
"""
import importlib.util, json, urllib.request, random
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
R2_BASE = "https://assets.streambackdrops.com/webp"

# Import the production classifier (reads image-pipeline/.env at import time).
spec = importlib.util.spec_from_file_location("pni", HERE / "process_new_images.py")
pni = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pni)
SEASON_SLUGS = pni.SEASON_SLUGS

manifest = json.loads((HERE / "final_manifest.json").read_text())
by_slug = {e["slug"]: e for e in manifest}
today = {e["slug"]: e["category"] for e in json.loads((HERE / "process_new_images_output.json").read_text())}
today_slugs = set(today)

random.seed(42)
def sample(cat, n, exclude=today_slugs):
    pool = [e for e in manifest if e["category"] == cat and e["slug"] not in exclude]
    random.shuffle(pool)
    return pool[:n]

def fetch_webp(folder, name):
    req = urllib.request.Request(f"{R2_BASE}/{folder}/{name}", headers={"User-Agent": "Mozilla/5.0 (backtest)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

# ── eval set: (slug, folder, webp, truth, seasonal_truth, group) ──────────────
eval_set = []
for slug, cat in today.items():  # hand-verified gold labels
    e = by_slug[slug]
    eval_set.append((slug, e["folder"], e["image_webp"], cat, cat in SEASON_SLUGS, "today-gold"))
for cat, n in [("office-spaces",8),("home-office",8),("neutral-backgrounds",5),
               ("living-rooms",3),("gardens-patios",3),("nature-landscapes",3)]:
    for e in sample(cat, n):  # must STAY non-seasonal (precision)
        eval_set.append((e["slug"], e["folder"], e["image_webp"], cat, False, "existing-room"))
for cat, n in [("christmas-backgrounds",4),("summer-backgrounds",4),("spring-backgrounds",3),
               ("easter-backgrounds",3),("halloween-backgrounds",3),("valentines-backgrounds",3),
               ("fall-backgrounds",4)]:
    for e in sample(cat, n):  # existing seasonals (recall — note: old labels are noisy)
        eval_set.append((e["slug"], e["folder"], e["image_webp"], cat, True, "existing-season"))

print(f"Eval set: {len(eval_set)} images (classifier = live process_new_images.py)\n")

rows = []
for i, (slug, folder, name, truth, seasonal_truth, group) in enumerate(eval_set, 1):
    try:
        m = pni.classify(fetch_webp(folder, name), "backtest")
        final = m.get("category")
    except Exception as ex:
        print(f"  ! {slug[:40]}: {ex}"); continue
    pred_seasonal = final in SEASON_SLUGS
    flag = ""
    if group == "existing-room" and pred_seasonal: flag = "  <-- FALSE-POS SEASON"
    elif group != "existing-room" and final != truth: flag = "  <-- MISS"
    rows.append((group, slug, truth, final, seasonal_truth, pred_seasonal))
    print(f"[{i:2}/{len(eval_set)}] {group:15} truth={truth:22} -> {final:22} (room={m.get('room_category')}, season={m.get('season')}){flag}")

print("\n" + "=" * 70 + "\nMETRICS")
pred_season = [r for r in rows if r[5]]
tp = sum(1 for r in pred_season if r[4]); fp = len(pred_season) - tp
print(f"  Predicted seasonal: {len(pred_season)} (true {tp}, false-pos {fp})")
room_rows = [r for r in rows if r[0] == "existing-room"]
room_fp = [r for r in room_rows if r[5]]
print(f"  Non-seasonal rooms wrongly seasonalized: {len(room_fp)}/{len(room_rows)}")
for r in room_fp: print(f"      FP: {r[1][:45]}  {r[2]} -> {r[3]}")
fall_gold = [r for r in rows if r[0] == "today-gold" and r[2] == "fall-backgrounds"]
print(f"  Fall recall (today's gold): {sum(1 for r in fall_gold if r[3]=='fall-backgrounds')}/{len(fall_gold)}")
es = [r for r in rows if r[0] == "existing-season"]
print(f"  Existing seasonal — exact: {sum(1 for r in es if r[3]==r[2])}/{len(es)}; any-season: {sum(1 for r in es if r[5])}/{len(es)}")
print("=" * 70)
