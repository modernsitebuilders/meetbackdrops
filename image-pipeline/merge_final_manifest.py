id="merge_final_manifest"
#!/usr/bin/env python3

import json

SEED_FILE = "seo_manifest_PROD.json"
AI_FILE = "ai_metadata.json"
OUTPUT_FILE = "final_manifest.json"

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


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def normalize_key(filename):
    return filename.strip()


def main():

    seed = load_json(SEED_FILE)
    ai = load_json(AI_FILE)

    final = []

    missing_ai = 0

    for item in seed:

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
            "tags": ai_data.get("tags", [])
        }

        final.append(merged)

    with open(OUTPUT_FILE, "w") as f:
        json.dump(final, f, indent=2)

    print("\n✅ FINAL MANIFEST CREATED")
    print(f"Total items: {len(final)}")
    print(f"Missing AI entries: {missing_ai}")


if __name__ == "__main__":
    main()

