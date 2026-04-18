#!/usr/bin/env python3
"""
StreamBackdrops AI Metadata Pipeline — Phase 6 + Phase 7

Architecture:
    Identity   : asset_id = sha256(filename). The sole identity anchor.
    Ordering   : sorted by asset_id. Incidental — never influences content.
    Styling    : STYLE_BUCKETS[ int(sha256(asset_id), 16) % N ]. Deterministic.
    Semantics  : strict enum profile keyed off category + asset_id hash.
                 Conditioning-only; never persisted to output.
    Content    : must be globally unique. Enforced via dedup + retries.

Determinism guarantees:
    - temperature = 0
    - per-request seed derived only from asset_id
    - traversal order driven only by asset_id
    - semantic profile is a pure function of (category_phrase, asset_id)
    - no runtime randomness in any content-shaping path
    - identical inputs -> identical ai_metadata.json

Output schema (unchanged):
    { title, description, alt, tags }  (+ internal _prompt_version, filename)

Phase 7 note:
    The semantic profile is injected into the prompt as a compact
    enum-valued block (<=40 tokens). It is NOT written to the output and
    has no free-form fields. It is purely a conditioning signal.

Input:
    live_assets.txt

Output:
    ai_metadata.json (incremental, resumable, atomic writes)
"""

import hashlib
import json
import os
import re
import time
from collections import deque
from typing import Deque, Dict, List, Optional, Set

from dotenv import load_dotenv
from openai import OpenAI


# =========================
# ENV
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
MAX_API_RETRIES = 5
MAX_DEDUP_RETRIES = 3

# Bump whenever prompt, bucket list, or schema changes so cached entries
# at a prior version are regenerated on the next run.
PROMPT_VERSION = 8


# =========================
# STYLE BUCKETS (flat, category-agnostic)
#
# Each bucket is a generic aesthetic / compositional lens that can be applied
# to any scene. Assignment is driven by sha256(asset_id) % len(buckets) so
# selection is:
#   - independent of category
#   - independent of filename shape
#   - independent of traversal index
#   - stable across dataset growth and reorderings
# =========================

STYLE_BUCKETS: List[str] = [
    "bright natural daylight with airy minimal composition",
    "warm amber ambient glow with layered cozy textures",
    "dramatic directional lighting with deep shadows and strong contrast",
    "soft overcast diffused light with a muted neutral palette",
    "golden hour warmth with long gentle shadows and amber highlights",
    "editorial clean aesthetic with structured negative space",
    "moody low-key atmosphere with rich tonal depth",
    "pale Scandinavian minimalism with cool neutral tones",
    "intimate close framing with focused task-style illumination",
    "wide open composition with layered depth and balanced geometry",
    "crisp morning brightness with cool clean highlights",
    "warm evening glow with soft ambient light sources",
    "cinematic composition with painterly tonal falloff",
    "refined editorial styling with saturated, considered color",
    "quiet contemplative mood with soft fall-off and gentle contrast",
    "sunlit high-key scene with bright airy whites and pale shadows",
]


# =========================
# PHASE 7 — SEMANTIC CONSTRAINT LAYER
#
# A deterministic semantic bias vector keyed off (category_phrase, asset_id).
# This is a CONDITIONING signal only — never persisted to ai_metadata.json,
# never surfaced as free text, never expanded into lists. Its sole job is
# to give the LLM a compact structural anchor so metadata for visually
# similar images diverges along stable visual dimensions instead of
# drifting into interchangeable adjective-swap templates.
#
# Four axes, each encoding a DISTINCT dimension (no overlap):
#   scene_type         → domain         (enum)
#   dominant_subject   → visual anchor  (1–3 word noun phrase, or "none")
#   visual_emphasis    → visual physics (enum)
#   atmosphere         → emotional tone (enum)
#
# Design rules (hard):
#   - scene_type / visual_emphasis / atmosphere draw ONLY from their enums.
#   - dominant_subject is a visually-grounded noun phrase (1–3 words,
#     lowercase, no stacked adjectives, no sentences). "none" is the only
#     permitted null when no clear anchor exists (e.g. abstract scenes).
#   - Category maps are primary. When a category does not determine an
#     axis, the value is drawn deterministically from the asset_id hash
#     across a small category-appropriate pool (enum for enum axes,
#     constrained noun-phrase pool for dominant_subject). This is
#     asset_id-hash selection (same mechanism as STYLE_BUCKETS), NOT
#     index-based logic.
#   - No filename-dependent heuristics beyond the category phrase.
#   - No free-form vision inference, no multi-label outputs.
# =========================

SCENE_TYPE_ENUM = (
    "office", "home_interior", "outdoor_nature",
    "urban", "architecture", "abstract", "lifestyle",
)
VISUAL_EMPHASIS_ENUM = (
    "soft light", "natural light", "shadow contrast", "symmetry",
    "depth of field", "minimal composition", "wide framing", "close focus",
)
ATMOSPHERE_ENUM = (
    "calm", "professional", "cozy", "cinematic",
    "airy", "moody", "energetic", "minimal",
)


# Category-phrase → axis value. A missing entry means "defer to the
# asset_id fallback pool for that axis".
_SCENE_TYPE_BY_CATEGORY: Dict[str, str] = {
    "art gallery": "architecture",
    "bokeh": "abstract",
    "bookshelves bright": "home_interior",
    "bookshelves dark": "home_interior",
    "christmas background": "lifestyle",
    "coffee shop": "lifestyle",
    "conference room": "office",
    "easter background": "lifestyle",
    "garden patio": "outdoor_nature",
    "halloween background": "lifestyle",
    "historic space": "architecture",
    "home offices": "home_interior",
    "kitchen": "home_interior",
    "libraries": "home_interior",
    "library": "home_interior",
    "living room": "home_interior",
    "nature landscape": "outdoor_nature",
    "office spaces": "office",
    "spring background": "lifestyle",
    "urban loft": "home_interior",
    "valentines background": "lifestyle",
    "wall shelves bright": "home_interior",
    "wall shelves dark": "home_interior",
}

# dominant_subject: a small, deterministic pool of 1–3 word noun phrases
# per category. Asset_id-hash selects one, so same-category assets diverge
# on their visual anchor while staying stable per asset. "none" is used
# only where no concrete anchor can be asserted without speculation
# (e.g. abstract/bokeh).
_DOMINANT_SUBJECT_BY_CATEGORY: Dict[str, tuple] = {
    "art gallery": ("gallery wall", "framed artworks", "exhibition hall"),
    "bokeh": ("none",),
    "bookshelves bright": ("book shelves", "book stack", "reading nook"),
    "bookshelves dark": ("book shelves", "library shelves", "book stack"),
    "christmas background": ("christmas tree", "holiday decor", "festive decor"),
    "coffee shop": ("coffee counter", "cafe table", "espresso bar"),
    "conference room": ("conference table", "meeting table", "boardroom table"),
    "easter background": ("easter decor", "spring flowers", "pastel decor"),
    "garden patio": ("garden patio", "outdoor seating", "potted plants"),
    "halloween background": ("pumpkin display", "halloween decor", "spooky decor"),
    "historic space": ("stone archway", "vaulted ceiling", "columned hall"),
    "home offices": ("desk setup", "work desk", "home office"),
    "kitchen": ("kitchen counter", "island counter", "kitchen space"),
    "libraries": ("library shelves", "reading room", "study desk"),
    "library": ("library shelves", "reading room", "study desk"),
    "living room": ("modern sofa", "sitting area", "coffee table"),
    "nature landscape": ("forest trees", "mountain view", "open landscape"),
    "office spaces": ("office desk", "open office", "workspace"),
    "spring background": ("spring flowers", "fresh blooms", "floral decor"),
    "urban loft": ("loft window", "exposed brick", "loft interior"),
    "valentines background": ("heart decor", "romantic decor", "valentine decor"),
    "wall shelves bright": ("wall shelves", "display shelves", "decorated shelves"),
    "wall shelves dark": ("wall shelves", "display shelves", "decorated shelves"),
}

_VISUAL_EMPHASIS_BY_CATEGORY: Dict[str, str] = {
    "art gallery": "symmetry",
    "bokeh": "depth of field",
    "bookshelves bright": "natural light",
    "bookshelves dark": "shadow contrast",
    "christmas background": "close focus",
    "coffee shop": "soft light",
    "conference room": "symmetry",
    "easter background": "close focus",
    "garden patio": "natural light",
    "halloween background": "shadow contrast",
    "historic space": "symmetry",
    "home offices": "close focus",
    "kitchen": "natural light",
    "libraries": "soft light",
    "library": "soft light",
    "living room": "soft light",
    "nature landscape": "natural light",
    "office spaces": "wide framing",
    "spring background": "natural light",
    "urban loft": "natural light",
    "valentines background": "close focus",
    "wall shelves bright": "natural light",
    "wall shelves dark": "shadow contrast",
}

_ATMOSPHERE_BY_CATEGORY: Dict[str, str] = {
    "art gallery": "minimal",
    "bokeh": "cinematic",
    "bookshelves bright": "calm",
    "bookshelves dark": "moody",
    "christmas background": "cozy",
    "coffee shop": "cozy",
    "conference room": "professional",
    "easter background": "airy",
    "garden patio": "airy",
    "halloween background": "moody",
    "historic space": "cinematic",
    "home offices": "professional",
    "kitchen": "airy",
    "libraries": "calm",
    "library": "calm",
    "living room": "cozy",
    "nature landscape": "calm",
    "office spaces": "professional",
    "spring background": "airy",
    "urban loft": "minimal",
    "valentines background": "cozy",
    "wall shelves bright": "calm",
    "wall shelves dark": "moody",
}

# Fallback pools for axes when the category does not determine them.
# Selection is asset_id-hash-modulo — stable per asset, independent of
# filename shape and traversal index.
_VISUAL_EMPHASIS_FALLBACK = (
    "soft light", "natural light", "minimal composition", "close focus",
)
_ATMOSPHERE_FALLBACK = ("calm", "minimal", "airy")
_DOMINANT_SUBJECT_FALLBACK = ("none",)


def _axis_hash(asset_id: str, axis: str) -> int:
    """Asset_id-derived hash, namespaced per axis so axes vary independently."""
    return int(
        hashlib.sha256(f"{axis}:{asset_id}".encode("utf-8")).hexdigest(),
        16,
    )


def _pick(asset_id: str, axis: str, pool) -> str:
    return pool[_axis_hash(asset_id, axis) % len(pool)]


def compute_semantic_profile(asset_id: str, category_phrase: str) -> Dict[str, str]:
    """
    Deterministic semantic bias vector. Pure function of (asset_id, category).
    Never stored in output; used solely to condition the prompt.
    """
    cat = category_phrase.strip().lower()

    scene_type = _SCENE_TYPE_BY_CATEGORY.get(cat) or _pick(
        asset_id, "scene_type",
        ("lifestyle", "home_interior", "architecture"),
    )
    dominant_subject_pool = _DOMINANT_SUBJECT_BY_CATEGORY.get(
        cat, _DOMINANT_SUBJECT_FALLBACK,
    )
    dominant_subject = _pick(asset_id, "dominant_subject", dominant_subject_pool)
    visual_emphasis = _VISUAL_EMPHASIS_BY_CATEGORY.get(cat) or _pick(
        asset_id, "visual_emphasis", _VISUAL_EMPHASIS_FALLBACK,
    )
    atmosphere = _ATMOSPHERE_BY_CATEGORY.get(cat) or _pick(
        asset_id, "atmosphere", _ATMOSPHERE_FALLBACK,
    )

    profile = {
        "scene_type": scene_type,
        "dominant_subject": dominant_subject,
        "visual_emphasis": visual_emphasis,
        "atmosphere": atmosphere,
    }

    # Hard guards — enum axes must stay in-enum; dominant_subject must be
    # 1–3 lowercase words with no punctuation. Any drift is a bug.
    assert profile["scene_type"] in SCENE_TYPE_ENUM
    assert profile["visual_emphasis"] in VISUAL_EMPHASIS_ENUM
    assert profile["atmosphere"] in ATMOSPHERE_ENUM
    ds = profile["dominant_subject"]
    assert ds == ds.lower() and 1 <= len(ds.split()) <= 3
    return profile


def format_semantic_block(profile: Dict[str, str]) -> str:
    """Compact bias block (<=40 tokens). No adjectives or values outside
    the declared axis vocabularies."""
    return (
        f"Scene Type: {profile['scene_type']}\n"
        f"Dominant Subject: {profile['dominant_subject']}\n"
        f"Visual Emphasis: {profile['visual_emphasis']}\n"
        f"Atmosphere: {profile['atmosphere']}"
    )


# =========================
# PHASE 7.5 — DIVERSITY PRESSURE (MINIMAL)
#
# Lightweight, in-memory-only structural-repetition signal. Tracks the
# last N titles produced in THIS run and, if they share a dominant
# structural pattern, injects a single "structure variation required"
# hint into the next prompt.
#
# Intentionally NOT implemented (Phase 8):
#   - rarity scoring, semantic bias vectors, multi-axis adjustment,
#     per-field tuning, tuple frequency tracking.
#
# Determinism: order is already fixed by asset_id sort, and prompt
# already varies with prior in-memory state via forbidden_titles.
# Same inputs in same order -> same hint sequence -> same outputs.
# =========================

DIVERSITY_WINDOW = 10


def detect_title_pattern_repetition(recent_titles: List[str]) -> bool:
    """
    Simple string heuristics over the last ~10 titles. Returns True if
    any one of these dominant-pattern signals trips:
      - >=4 titles use a " with " connector
      - >=3 titles share the same first word
      - >=3 titles share the same last two words
    """
    if len(recent_titles) < 4:
        return False

    lowered = [t.lower() for t in recent_titles if t]

    if sum(1 for t in lowered if " with " in t) >= 4:
        return True

    first_words = [t.split()[0] for t in lowered if t.split()]
    if first_words and max(first_words.count(w) for w in set(first_words)) >= 3:
        return True

    last_phrases = [
        " ".join(t.split()[-2:]) for t in lowered if len(t.split()) >= 2
    ]
    if last_phrases and max(
        last_phrases.count(p) for p in set(last_phrases)
    ) >= 3:
        return True

    return False


DIVERSITY_HINT = (
    "DIVERSITY PRESSURE — structure variation required: recent titles in "
    "this batch share a dominant structural pattern (same opener, same "
    '" with X" connector, or same trailing phrase). Break the pattern: '
    "change the sentence architecture (different opener, different "
    "connector, different cadence) — not just a swapped adjective."
)


# =========================
# IDENTITY / STYLING PRIMITIVES
# =========================

def compute_asset_id(filename: str) -> str:
    """
    sha256 of the filename. This is the ONLY identity anchor.
    Filename is used ONLY here — every downstream decision keys off asset_id.
    Under a future UUID migration, this function becomes a UUID lookup;
    no other call-site needs to change.
    """
    return hashlib.sha256(filename.encode("utf-8")).hexdigest()


def assign_style_bucket(asset_id: str) -> str:
    """
    Deterministic bucket selection from asset_id alone.
    No index, no prefix, no filename involved. Stable across dataset growth.
    """
    digest_int = int(hashlib.sha256(asset_id.encode("utf-8")).hexdigest(), 16)
    return STYLE_BUCKETS[digest_int % len(STYLE_BUCKETS)]


def deterministic_seed(asset_id: str) -> int:
    """
    Stable per-asset seed for the OpenAI call. Derived ONLY from asset_id,
    bounded to a 31-bit positive int for API safety.
    """
    return int(asset_id[:8], 16) & 0x7FFFFFFF


# =========================
# PROMPT CONTEXT
#
# The prompt receives the image id and a category phrase as *semantic
# content* so the LLM can describe the scene meaningfully. These are not
# identity or styling signals — they are what the scene is about.
# =========================

def extract_context(filename: str) -> dict:
    image_id = filename.replace(".webp", "")
    category_phrase = re.sub(r"-\d+$", "", image_id).replace("-", " ")
    return {
        "filename": filename,
        "image_id": image_id,
        "category_phrase": category_phrase,
    }


# =========================
# IO
# =========================

def load_assets(path: str) -> List[str]:
    with open(path, "r") as f:
        return [line.strip() for line in f if line.strip()]


def load_existing(path: str) -> Dict[str, dict]:
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        return json.load(f)


def save_progress(data: Dict[str, dict], path: str):
    """Atomic write: tmp file + os.replace so a crash never corrupts the output."""
    tmp = path + ".tmp"
    with open(tmp, "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
    os.replace(tmp, path)


# =========================
# OPENAI CALL
# =========================

def call_openai(
    context: dict,
    seed: int,
    style_bucket: str,
    semantic_block: str,
    forbidden_titles: Optional[List[str]] = None,
    diversity_hint: Optional[str] = None,
) -> dict:

    forbidden_block = ""
    if forbidden_titles:
        lines = "\n".join(f'- "{t}"' for t in forbidden_titles[:8])
        forbidden_block = f"""
FORBIDDEN TITLES — must NOT reuse, rephrase, or produce a near-synonym of any:
{lines}

"""

    diversity_block = f"\n{diversity_hint}\n\n" if diversity_hint else ""

    prompt = f"""
You are writing SEO metadata for ONE specific still-scene image sold as a
virtual background for video calls (Zoom, Teams, Google Meet). No people
are in the image. The metadata must rank in Google image search and earn
clicks from real humans browsing virtual-background galleries.

Image ID: "{context['image_id']}"
Category phrase (semantic context only): "{context['category_phrase']}"

SEMANTIC PROFILE (structural grounding — treat as fixed facts about the
scene, not a checklist to restate):
{semantic_block}
{diversity_block}{forbidden_block}CREATIVE DIRECTION (MANDATORY):
"{style_bucket}"

This aesthetic lens must meaningfully shape composition, lighting, mood,
and word choice. Do not dilute it into a generic scene. Where the
Creative Direction and the Semantic Profile overlap (e.g. visual
emphasis or atmosphere), the Semantic Profile is authoritative on
WHICH visual dimension is present; the Creative Direction governs HOW
it is expressed.

This image sits inside a large dataset of visually similar scenes. Make
THIS entry read as a distinct, individually observed scene — not a
template with swapped adjectives. Google penalises near-duplicate metadata
across a site; uniqueness is a direct ranking signal.

=== TITLE (max 60 chars) ===

- Must weave TWO of these three dimensions naturally:
    1. environment / room type   (office, living room, café, library,
                                  kitchen, studio, garden, gallery, ...)
    2. mood or atmosphere        (cozy, calm, focused, airy, refined,
                                  serene, playful, contemplative, ...)
    3. lighting or time-of-day   (bright, natural light, warm, golden
                                  hour, soft daylight, overcast, dim, ...)
- Lead with the concrete subject of the scene, not the category slug.
- Vary the grammatical shape across images: noun phrase, descriptive
  fragment, mood-led opener, location-led opener, material-led opener.
  Never reuse the same template twice.
- Forbidden words inside the title: "background", "backdrop",
  "wallpaper", "zoom", "virtual", and stock marketing adjectives
  ("stunning", "amazing", "perfect", "premium", "ultimate").
- Title Case. No trailing punctuation. No ALL CAPS.

Examples of SHAPE variety (do NOT copy verbatim — learn the shape):
  "Bright Minimal Office with Natural Light"        (adjective + subject)
  "Cozy Reading Nook, Warm Afternoon Glow"          (noun + mood fragment)
  "Elegant Coffee Shop Interior at Dusk"            (subject + time)
  "Sunlit Kitchen Counter with Marble Finish"       (material-led)
  "Quiet Corner of a Sunlit Library"                (location-led)

=== DESCRIPTION (max 160 chars, 1–2 sentences) ===

Purpose: support image-search intent and drive clicks. Must contain:

- Visual specifics naming real things in the scene: objects, materials,
  light quality, palette, depth, or mood. The description should read
  like it could only describe THIS image, not the category at large.
- Exactly ONE use-case phrase, woven naturally mid-sentence (NOT tacked
  on at the end), chosen to fit the scene's tone:
      "remote work"
      "professional video calls"
      "virtual meetings"
      "online presentations"
      "home-office setup"
      "team standups"
      "webinar background"
      "Zoom background"
  A cozy home-ish scene pairs well with "remote work" or "home-office
  setup"; a sharper minimal scene pairs with "professional video calls"
  or "online presentations". Do NOT concatenate multiple of these
  phrases — pick ONE and integrate it naturally.

Style rules:
- Never restate the title. Never list tags.
- Never start with "A ...", "An ...", "This ...", "The perfect ...".
- Avoid boilerplate endings like "...perfect for Zoom meetings."

=== ALT TEXT (one clear factual sentence) ===

- Plain, factual visual description for screen readers.
- Describe what is visible: subject, layout, light, colour.
- Do NOT begin with "Image of" or "A picture of".
- No marketing. No SEO stuffing. No mention of "Zoom", "virtual",
  "background" — alt text is for accessibility, not ranking.

=== TAGS (array of 8–12 lowercase keywords) ===

Must span at least FIVE of these semantic axes, with no more than two
tags per axis:
    * environment / room type
    * subject / object
    * mood / tone
    * lighting
    * style / aesthetic
    * colour / palette cue
    * composition / depth
    * use-case (at least ONE use-case tag required)

Rules:
- Each tag: 1–3 words, lowercase, no punctuation, no hashtags.
- No near-synonym stacking ("office" + "modern office" + "office space"
  is a failure — pick ONE and diversify the remaining slots).
- No generic filler: "image", "picture", "photo", "hd", "wallpaper".
- Do not include the raw category slug verbatim as a tag.

=== UNIQUENESS / ANTI-TEMPLATE RULES ===

- Do NOT reuse structural templates across images.
- Do NOT produce titles that differ only by a swapped adjective
  (e.g. "Modern Office Space" vs "Sleek Office Space" — both fail).
- Lean into plausible visual specifics (a particular object, a specific
  light source, a specific palette) so the description fits THIS scene
  only.
- Pick a different angle of emphasis than a generic entry would:
  lighting, material, mood, composition, or use-case — never just
  "a nice [category]".

=== OUTPUT ===

Return STRICT JSON ONLY with exactly these keys:
  title, description, alt, tags

No markdown. No code fences. No commentary before or after.
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        seed=seed,
    )

    text = response.choices[0].message.content.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        raise ValueError(f"Invalid JSON response:\n{text}")


def generate_with_api_retry(
    context: dict,
    seed: int,
    style_bucket: str,
    semantic_block: str,
    forbidden_titles: Optional[List[str]] = None,
    diversity_hint: Optional[str] = None,
) -> dict:
    """Retry wrapper for API errors only. Uses deterministic exponential
    backoff — no randomness, so runs remain reproducible."""
    last_exc: Optional[Exception] = None
    for attempt in range(MAX_API_RETRIES):
        try:
            return call_openai(
                context, seed, style_bucket, semantic_block,
                forbidden_titles, diversity_hint,
            )
        except Exception as e:
            last_exc = e
            wait = 2 ** attempt
            print(f"   ⚠️ API retry {attempt + 1}/{MAX_API_RETRIES} in {wait}s: {e}")
            time.sleep(wait)
    raise RuntimeError(f"❌ Max API retries exceeded: {last_exc}")


# =========================
# MAIN
# =========================

def main():
    assets = load_assets(INPUT_FILE)
    # De-dupe any accidental repeats while preserving first-seen order (pre-sort).
    assets = list(dict.fromkeys(assets))

    # Compute asset_ids once. From here on, the filename is just a storage key
    # into ai_metadata.json; all decisions key off asset_id.
    asset_id_by_filename: Dict[str, str] = {fn: compute_asset_id(fn) for fn in assets}

    # Traversal order: sorted by asset_id. Position is incidental; it cannot
    # influence content because no downstream code reads the enumeration index.
    assets_sorted = sorted(assets, key=lambda fn: asset_id_by_filename[fn])

    existing = load_existing(OUTPUT_FILE)

    # === DEDUP LAYER A: global seen titles ===
    # Pre-populated from entries already cached at the current PROMPT_VERSION,
    # so incremental resumed runs keep system-wide uniqueness.
    seen_titles_global: Set[str] = set()
    for fn, entry in existing.items():
        if entry.get("_prompt_version") == PROMPT_VERSION:
            title = (entry.get("title") or "").lower().strip()
            if title:
                seen_titles_global.add(title)

    up_to_date = sum(
        1 for fn in assets_sorted
        if existing.get(fn, {}).get("_prompt_version") == PROMPT_VERSION
    )

    print(f"📦 Total assets: {len(assets_sorted)}")
    print(f"🎨 Style buckets: {len(STYLE_BUCKETS)}")
    print(f"✅ Cached at prompt v{PROMPT_VERSION}: {up_to_date}")
    print(f"🔁 Will regenerate: {len(assets_sorted) - up_to_date}")
    print(f"🧬 Globally seen titles (warm start): {len(seen_titles_global)}")

    for i, filename in enumerate(assets_sorted, 1):
        cached = existing.get(filename)
        if cached and cached.get("_prompt_version") == PROMPT_VERSION:
            continue

        asset_id = asset_id_by_filename[filename]
        context = extract_context(filename)
        seed = deterministic_seed(asset_id)
        style_bucket = assign_style_bucket(asset_id)
        semantic_profile = compute_semantic_profile(asset_id, context["category_phrase"])
        semantic_block = format_semantic_block(semantic_profile)

        print(f"\n🔄 [{i}/{len(assets_sorted)}] {filename}")
        print(f"   🆔 asset_id: {asset_id[:12]}…")
        print(f"   🎨 bucket  : {style_bucket}")
        print(
            "   🧭 profile : "
            f"{semantic_profile['scene_type']}/"
            f"{semantic_profile['dominant_subject']}/"
            f"{semantic_profile['visual_emphasis']}/"
            f"{semantic_profile['atmosphere']}"
        )

        # === DEDUP LAYER B: per-asset seen titles ===
        # Tracks titles this specific asset has already produced during retries,
        # so the retry loop cannot loop forever on the same output.
        seen_titles_by_asset: Set[str] = set()
        metadata: Optional[dict] = None

        try:
            for dedup_attempt in range(MAX_DEDUP_RETRIES + 1):
                # On retry, feed the model a merged forbidden list from both
                # dedup scopes. Priority: titles this asset just produced,
                # then the broader global set (capped to keep the prompt small).
                forbidden: Optional[List[str]] = None
                if dedup_attempt > 0:
                    local = list(seen_titles_by_asset)
                    extras = [t for t in seen_titles_global if t not in seen_titles_by_asset]
                    forbidden = (local + extras)[:8]

                metadata = generate_with_api_retry(
                    context, seed, style_bucket, semantic_block, forbidden
                )

                title = (metadata.get("title") or "").lower().strip()

                # A title is acceptable iff it is unique in BOTH scopes.
                if (
                    title
                    and title not in seen_titles_global
                    and title not in seen_titles_by_asset
                ):
                    break

                seen_titles_by_asset.add(title)
                if dedup_attempt < MAX_DEDUP_RETRIES:
                    print(
                        f"   ⚠️ Duplicate title '{metadata.get('title')}' — "
                        f"retry {dedup_attempt + 1}/{MAX_DEDUP_RETRIES}"
                    )
                else:
                    print(
                        f"   ⚠️ Duplicate title persisted after "
                        f"{MAX_DEDUP_RETRIES} retries; accepting result."
                    )

            assert metadata is not None

            final_title = (metadata.get("title") or "").lower().strip()
            if final_title:
                seen_titles_global.add(final_title)

            existing[filename] = {
                "filename": filename,
                "_prompt_version": PROMPT_VERSION,
                "_asset_id": asset_id,
                "title": metadata["title"],
                "description": metadata["description"],
                "alt": metadata["alt"],
                "tags": sorted([t.lower() for t in metadata["tags"]]),
            }

            save_progress(existing, OUTPUT_FILE)
            print(f"   ✅ saved | title: {metadata['title']}")
            time.sleep(REQUEST_DELAY)

        except Exception as e:
            print(f"❌ failed: {filename} | {e}")

    print("\n🎉 COMPLETE")


if __name__ == "__main__":
    main()
