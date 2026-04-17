import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
JSON_PATH = (BASE_DIR / "../public/data/image-metadata-complete.json").resolve()


def load_json():
    with open(JSON_PATH, "r") as f:
        return json.load(f)


def save_json(data):
    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=2)


def existing_ids(data):
    return {
        item["filename"].replace(".webp", "")
        for item in data
        if "filename" in item
    }


def make_entry(i: int):
    id_str = f"conference-room-{i:02d}"

    return {
        "filename": f"{id_str}.webp",
        "downloadName": f"{id_str}.png",
        "category": "conference-rooms",
        "title": f"Conference Room Background {i:02d}",
        "description": "Conference room virtual background for video calls",
        "alt": "modern office conference room professional meeting table chairs glass walls corporate workspace clean minimal",
        "keywords": [
            "virtual background",
            "zoom background",
            "video call",
            "conference room",
            "office",
            "meeting",
            "corporate"
        ],
        "width": 1920,
        "height": 1080
    }


def main():
    data = load_json()
    existing = existing_ids(data)

    added = []

    # based on your R2 listing (01–48 range seen)
    for i in range(1, 49):
        cid = f"conference-room-{i:02d}"

        if cid not in existing:
            data.append(make_entry(i))
            added.append(cid)

    save_json(data)

    print("\n==============================")
    print("CONFERENCE ROOM FIX")
    print("==============================")
    print(f"Added: {len(added)} entries")
    for a in added:
        print(a)


if __name__ == "__main__":
    main()