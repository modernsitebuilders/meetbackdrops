#!/usr/bin/env python3
"""
Merge seed manifest + AI metadata + HD-only list into final_manifest.json.

Adds deterministic ordering and hard validation gates so bad metadata
(duplicate titles, ambiguous folder overrides, wrong category prefixes)
fails the build instead of silently passing.
"""

import json
import re
import sys
from collections import Counter, defaultdict

SEED_FILE = "seo_manifest_PROD.json"
AI_FILE = "ai_metadata.json"
HD_ONLY_FILE = "hd_only_list.json"
OUTPUT_FILE = "final_manifest.json"

# Per-category duplicate-rate ceiling (fraction of category items).
DUP_RATE_LIMIT = 0.05
# Global title repeat ceiling (a single title may appear at most this many times).
GLOBAL_TITLE_REPEAT_LIMIT = 3

# For merged categories, images live in their original R2 subfolder.
# Map category → folder using filename prefix where possible, with
# an explicit override table for edge cases.
FOLDER_OVERRIDES = {
    # slug-prefix → original R2 folder
    "bookshelves-bright": "bookshelves-bright",
    "bookshelves-dark":   "bookshelves-dark",
    "wall-shelves-bright":"wall-shelves-bright",
    "wall-shelves-dark":  "wall-shelves-dark",
}


def infer_folder(category, image_webp):
    # Derive folder from filename prefix for merged categories
    for prefix, folder in FOLDER_OVERRIDES.items():
        if image_webp.startswith(prefix):
            return folder
    return category


def extract_prefix(filename: str) -> str:
    name = filename.replace(".webp", "")
    return re.sub(r"-\d+$", "", name)


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def normalize_key(filename):
    return filename.strip()


# =========================
# VALIDATION
# =========================

def validate(final):
    """Return list of error strings. Empty list = clean."""
    errors = []

    # 1. Folder-override ambiguity: overlapping prefixes or colliding folder targets.
    prefixes = list(FOLDER_OVERRIDES.keys())
    for i, a in enumerate(prefixes):
        for b in prefixes[i + 1:]:
            if a.startswith(b) or b.startswith(a):
                errors.append(
                    f"FOLDER_OVERRIDES prefixes overlap and are ambiguous: "
                    f"'{a}' vs '{b}'"
                )
    folder_targets = Counter(FOLDER_OVERRIDES.values())
    for folder, count in folder_targets.items():
        if count > 1:
            errors.append(
                f"FOLDER_OVERRIDES has duplicate folder target '{folder}' "
                f"(mapped from {count} prefixes)"
            )

    # 2. Filename-prefix → category mapping must be 1:1.
    prefix_to_cats = defaultdict(set)
    for m in final:
        prefix = extract_prefix(m["image_webp"])
        prefix_to_cats[prefix].add(m["category"])
    for prefix, cats in prefix_to_cats.items():
        if len(cats) > 1:
            errors.append(
                f"Filename prefix '{prefix}' maps to multiple categories: "
                f"{sorted(cats)}"
            )

    # 3. Per-category duplicate title / description rate.
    by_cat = defaultdict(list)
    for m in final:
        by_cat[m["category"]].append(m)

    for cat, items in by_cat.items():
        n = len(items)
        if n == 0:
            continue

        titles = [i["title"] for i in items if i.get("title")]
        descs = [i["description"] for i in items if i.get("description")]

        title_counts = Counter(titles)
        desc_counts = Counter(descs)

        dup_titles = sum(c for c in title_counts.values() if c > 1)
        dup_descs = sum(c for c in desc_counts.values() if c > 1)

        if dup_titles / n > DUP_RATE_LIMIT:
            worst = title_counts.most_common(3)
            errors.append(
                f"Category '{cat}': duplicate title rate "
                f"{dup_titles}/{n} ({dup_titles/n:.1%}) exceeds "
                f"{DUP_RATE_LIMIT:.0%}. Top: {worst}"
            )

        if dup_descs / n > DUP_RATE_LIMIT:
            worst = desc_counts.most_common(3)
            errors.append(
                f"Category '{cat}': duplicate description rate "
                f"{dup_descs}/{n} ({dup_descs/n:.1%}) exceeds "
                f"{DUP_RATE_LIMIT:.0%}. Top: {worst}"
            )

    # 4. Global title repeated more than N times.
    global_title_counts = Counter(
        m["title"] for m in final if m.get("title")
    )
    for title, count in global_title_counts.items():
        if count > GLOBAL_TITLE_REPEAT_LIMIT:
            errors.append(
                f"Global title repeated {count} times "
                f"(limit {GLOBAL_TITLE_REPEAT_LIMIT}): {title!r}"
            )

    return errors


# =========================
# MAIN
# =========================

def main():

    seed = load_json(SEED_FILE)
    ai = load_json(AI_FILE)
    hd_only_set = set(load_json(HD_ONLY_FILE).get("filenames", []))

    # Deterministic input ordering so rerun output is byte-stable.
    seed_sorted = sorted(seed, key=lambda x: normalize_key(x.get("image_webp", "")))

    final = []

    missing_ai = 0
    hd_flagged = 0

    for item in seed_sorted:

        image_webp = normalize_key(item.get("image_webp", ""))
        slug = image_webp.replace(".webp", "") if image_webp else item.get("asset_id", "")

        ai_data = ai.get(image_webp)

        if not ai_data:
            missing_ai += 1
            ai_data = {
                "title": "",
                "description": "",
                "alt": "",
                "tags": []
            }

        category = item.get("category")
        folder = infer_folder(category, image_webp)
        hd_only = image_webp in hd_only_set
        if hd_only:
            hd_flagged += 1

        tags = ai_data.get("tags", []) or []

        merged = {
            "id": item.get("asset_id"),
            "slug": slug,
            "category": category,
            "folder": folder,
            "image_webp": image_webp,
            "download_png": item.get("download_png"),

            "title": ai_data.get("title", ""),
            "description": ai_data.get("description", ""),
            "alt": ai_data.get("alt", ""),
            "tags": sorted(tags),

            "hdOnly": hd_only
        }

        final.append(merged)

    # Sanity check: every filename in hd_only_list.json must exist in the manifest.
    manifest_filenames = {m["image_webp"] for m in final}
    orphans = sorted(hd_only_set - manifest_filenames)
    if orphans:
        print(f"\n⚠️  {len(orphans)} hd_only_list entries not found in manifest:")
        for o in orphans:
            print(f"   - {o}")

    # Hard validation gate — must pass before writing output.
    errors = validate(final)
    if errors:
        print("\n❌ MERGE VALIDATION FAILED")
        for e in errors:
            print(f"   - {e}")
        print(f"\n{len(errors)} validation error(s). final_manifest.json NOT written.")
        sys.exit(1)

    # Deterministic JSON serialization: sorted keys, stable list order.
    with open(OUTPUT_FILE, "w") as f:
        json.dump(final, f, indent=2, sort_keys=True)

    print("\n✅ FINAL MANIFEST CREATED")
    print(f"Total items: {len(final)}")
    print(f"Missing AI entries: {missing_ai}")
    print(f"HD-only flagged: {hd_flagged} (list size: {len(hd_only_set)})")


if __name__ == "__main__":
    main()
