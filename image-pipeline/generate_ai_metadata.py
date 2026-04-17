
#!/usr/bin/env python3
"""
StreamBackdrops AI Metadata Pipeline

Input:
- live_assets.txt

Output:
- ai_metadata.json (incremental, resumable, safe)

Features:
- OpenAI API per image
- .env support (OPENAI_API_KEY)
- retry + exponential backoff
- rate limiting
- atomic writes (prevents corruption)
- resume-safe (skips completed images)
"""

import os
import json
import time
import random
from typing import Dict, List

from openai import OpenAI
from dotenv import load_dotenv


# =========================
# LOAD ENV
# =========================

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    raise ValueError("❌ OPENAI_API_KEY missing from environment or .env file")


client = OpenAI(api_key=API_KEY)


# =========================
# CONFIG
# =========================

INPUT_FILE = "live_assets.txt"
OUTPUT_FILE = "ai_metadata.json"

MODEL = "gpt-4o-mini"
REQUEST_DELAY = 0.8
MAX_RETRIES = 5


# =========================
# LOAD DATA
# =========================

def load_assets(file_path: str) -> List[str]:
    with open(file_path, "r") as f:
        return [line.strip() for line in f if line.strip()]


def load_existing(file_path: str) -> Dict[str, dict]:
    if not os.path.exists(file_path):
        return {}
    with open(file_path, "r") as f:
        return json.load(f)


# =========================
# SAFE SAVE (ATOMIC)
# =========================

def save_progress(data: Dict[str, dict], file_path: str):
    tmp = file_path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp, file_path)


# =========================
# CONTEXT EXTRACTION
# =========================

def extract_context(filename: str) -> str:
    """
    Convert:
    office-spaces-48.webp → "office spaces"
    """

    name = filename.replace(".webp", "")
    parts = name.split("-")

    # remove trailing numeric ID if present
    if parts and parts[-1].isdigit():
        parts = parts[:-1]

    return " ".join(parts)


# =========================
# OPENAI CALL
# =========================

def call_openai(context: str) -> dict:
    prompt = f"""
You generate SEO metadata for a virtual background image.

Context: "{context}"

Return STRICT JSON ONLY with:
- title (max 60 chars)
- description (max 160 chars)
- alt (1 clear sentence)
- tags (array of 5–10 lowercase keywords)

Rules:
- No markdown
- No extra text
- No explanations
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    text = response.choices[0].message.content.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON response:\n{text}")


# =========================
# RETRY WRAPPER
# =========================

def generate_metadata(context: str) -> dict:
    for attempt in range(MAX_RETRIES):
        try:
            return call_openai(context)

        except Exception as e:
            wait = (2 ** attempt) + random.uniform(0, 1)
            print(f"⚠️ Retry {attempt+1}/{MAX_RETRIES}: {e}")
            time.sleep(wait)

    raise RuntimeError("❌ Max retries exceeded")


# =========================
# MAIN PIPELINE
# =========================

def main():
    assets = load_assets(INPUT_FILE)
    existing = load_existing(OUTPUT_FILE)

    print(f"📦 Total assets: {len(assets)}")
    print(f"✅ Already processed: {len(existing)}")

    for i, filename in enumerate(assets, 1):

        if filename in existing:
            continue

        print(f"\n🔄 [{i}/{len(assets)}] {filename}")

        context = extract_context(filename)

        try:
            metadata = generate_metadata(context)

            # store result
            existing[filename] = {
                "filename": filename,
                "title": metadata["title"],
                "description": metadata["description"],
                "alt": metadata["alt"],
                "tags": metadata["tags"]
            }

            save_progress(existing, OUTPUT_FILE)

            print(f"✅ saved: {filename}")

            time.sleep(REQUEST_DELAY)

        except Exception as e:
            print(f"❌ failed: {filename} | {e}")


    print("\n🎉 COMPLETE")


if __name__ == "__main__":
    main()

