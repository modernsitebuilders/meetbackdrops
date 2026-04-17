"""
STEP 1 — INVENTORY

Lists all R2 objects, groups them into logical assets (one asset = one scene,
multiple format variants), assigns stable UUIDs, and persists to SQLite.

Variant detection strategy (in priority order):
  1. Folder prefix  (hd/, free/, web/)
  2. Filename suffix (-hd, -free, etc.)
  3. File extension  (.webp → web, .png without suffix → free)
"""
from __future__ import annotations

import logging
import re
import uuid
from collections import defaultdict
from pathlib import Path, PurePosixPath
from typing import Optional

from rich.console import Console
from rich.table import Table
from tqdm import tqdm

from pipeline.config import Config
from pipeline.db import Database
from pipeline.utils.r2 import R2Client

log = logging.getLogger(__name__)
console = Console()


def _strip_extension(key: str) -> str:
    """Remove last extension: 'foo/bar-hd.png' → 'foo/bar-hd'"""
    p = PurePosixPath(key)
    return str(p.with_suffix(""))


def _detect_variant(key: str, ext: str, config: Config) -> Optional[str]:
    """
    Returns 'hd', 'free', 'web', or None (skip/unknown).
    """
    key_lower = key.lower()

    # 1. Folder prefix
    for pfx in config.variant_hd_prefixes:
        if key_lower.startswith(pfx) or f"/{pfx.rstrip('/')}" in key_lower:
            return "hd"
    for pfx in config.variant_free_prefixes:
        if key_lower.startswith(pfx) or f"/{pfx.rstrip('/')}" in key_lower:
            return "free"
    for pfx in config.variant_web_prefixes:
        if key_lower.startswith(pfx) or f"/{pfx.rstrip('/')}" in key_lower:
            return "web"

    # 2. Filename suffix (on the stem, before extension)
    stem = PurePosixPath(key).stem.lower()
    for sfx in config.variant_hd_suffixes:
        if stem.endswith(sfx):
            return "hd"
    for sfx in config.variant_free_suffixes:
        if stem.endswith(sfx):
            return "free"

    # 3. Extension fallback
    if ext == ".webp":
        return "web"
    if ext == ".png":
        return "free"

    return None


def _base_name_from_key(key: str, config: Config) -> str:
    """
    Strip variant suffix and folder prefix to get the canonical base name.

    Examples:
      'hd/sunset-beach-hd.png'  → 'sunset-beach'
      'web/sunset-beach.webp'   → 'sunset-beach'
      'sunset-beach-free.png'   → 'sunset-beach'
    """
    stem = PurePosixPath(key).stem

    # Strip variant suffixes
    for sfx in (
        config.variant_hd_suffixes
        + config.variant_free_suffixes
        + ["-web", "_web"]
    ):
        if stem.lower().endswith(sfx.lower()):
            stem = stem[: -len(sfx)]
            break

    # Normalize: lowercase, replace runs of non-alphanumeric with hyphen
    base = re.sub(r"[^a-zA-Z0-9]+", "-", stem).strip("-").lower()
    return base


def _group_keys_into_assets(
    all_keys: list[str], config: Config
) -> dict[str, dict]:
    """
    Group R2 object keys into logical assets keyed by base_name.

    Returns: {base_name: {web_key, free_key, hd_key}}
    """
    groups: dict[str, dict] = defaultdict(lambda: {"web_key": None, "free_key": None, "hd_key": None})

    for key in all_keys:
        ext = PurePosixPath(key).suffix.lower()
        if ext not in (".webp", ".png", ".jpg", ".jpeg"):
            continue  # skip non-image files

        variant = _detect_variant(key, ext, config)
        if variant is None:
            log.debug(f"Could not classify variant for key: {key} — skipping")
            continue

        base = _base_name_from_key(key, config)
        field = f"{variant}_key"
        existing = groups[base].get(field)
        if existing is None:
            groups[base][field] = key
        else:
            # Keep whichever came first (already set); log collision
            log.debug(f"Variant collision for '{base}' ({variant}): {existing} vs {key}")

    return dict(groups)


def run(config: Config, db: Database, prefix: str = "") -> int:
    """
    Execute Step 1 — Inventory.

    Returns number of new assets discovered.
    """
    console.rule("[bold cyan]Step 1 — Inventory")
    db.log_step("ingest", "started")

    r2 = R2Client(config)

    # ── Load allowlist from live_assets.txt ──────────────────────────────────
    live_assets_path = Path(__file__).parents[2] / "live_assets.txt"
    allowed: set[str] = set()
    if live_assets_path.exists():
        with open(live_assets_path) as f:
            allowed = set(line.strip() for line in f)
        console.print(f"  Loaded allowlist from [bold]live_assets.txt[/] ({len(allowed)} entries)")
    else:
        console.print("  [yellow]live_assets.txt not found — ingesting all objects[/]")

    # ── Collect all keys ──────────────────────────────────────────────────────
    console.print(f"  Listing objects in bucket [bold]{config.r2_bucket}[/]...")
    all_keys: list[str] = []
    with tqdm(desc="  Listing R2 objects", unit="obj") as pbar:
        for obj in r2.list_objects(prefix=prefix):
            filename = obj["Key"].split("/")[-1]

            if allowed and filename not in allowed:
                pbar.update(1)
                continue

            if not filename.endswith(".webp"):
                pbar.update(1)
                continue

            all_keys.append(obj["Key"])
            pbar.update(1)

    console.print(f"  Found [bold]{len(all_keys)}[/] total objects")

    # ── Group into assets ─────────────────────────────────────────────────────
    console.print("  Grouping into logical assets...")
    groups = _group_keys_into_assets(all_keys, config)
    console.print(f"  Resolved [bold]{len(groups)}[/] logical assets")

    # ── Persist to DB ─────────────────────────────────────────────────────────
    new_count = 0
    with tqdm(total=len(groups), desc="  Saving assets", unit="asset") as pbar:
        for base_name, keys in groups.items():
            # Generate deterministic UUID from base_name so re-runs are stable
            asset_id = str(uuid.uuid5(uuid.NAMESPACE_URL, f"{config.r2_bucket}/{base_name}"))

            def make_url(key: Optional[str]) -> Optional[str]:
                return r2.public_url(key) if key else None

            asset = {
                "asset_id": asset_id,
                "base_name": base_name,
                "web_url": make_url(keys["web_key"]),
                "free_url": make_url(keys["free_key"]),
                "hd_url": make_url(keys["hd_key"]),
                "web_key": keys["web_key"],
                "free_key": keys["free_key"],
                "hd_key": keys["hd_key"],
            }
            if not db.asset_exists(asset_id):
                new_count += 1
            db.upsert_asset(asset)
            pbar.update(1)

    # ── Summary ───────────────────────────────────────────────────────────────
    total = db.count("assets")
    t = Table(title="Inventory Summary")
    t.add_column("Metric", style="cyan")
    t.add_column("Value", style="bold")
    t.add_row("Total R2 objects", str(len(all_keys)))
    t.add_row("Logical assets (total)", str(total))
    t.add_row("New assets this run", str(new_count))
    console.print(t)

    db.log_step("ingest", "completed", asset_count=total)
    return new_count
