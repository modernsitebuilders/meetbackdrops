"""
STEP 0 — MANIFEST VALIDATION

Compares R2 bucket contents against live_assets.txt before ingest.
Surfaces three drift categories:

  MISSING   — in manifest, not in R2  (pipeline will silently skip these)
  UNEXPECTED — in R2, not in manifest (would be ingested without this check)
  MATCHED   — present on both sides

Exits with code 1 if --strict is passed and any drift is found.
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

from rich.console import Console
from rich.table import Table
from tqdm import tqdm

from pipeline.config import Config
from pipeline.utils.r2 import R2Client

log = logging.getLogger(__name__)
console = Console()

LIVE_ASSETS_PATH = Path(__file__).parents[2] / "live_assets.txt"


def _load_manifest(path: Path) -> set[str]:
    """
    Parse live_assets.txt — returns set of webp filenames.
    Lines starting with # are comments (category headers), empty lines skipped.
    """
    if not path.exists():
        raise FileNotFoundError(f"live_assets.txt not found at {path}")

    filenames: set[str] = set()
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            filenames.add(line)
    return filenames


def _fetch_r2_webps(config: Config) -> set[str]:
    """List all .webp filenames currently in R2."""
    r2 = R2Client(config)
    webps: set[str] = set()
    with tqdm(desc="  Scanning R2 objects", unit="obj") as pbar:
        for obj in r2.list_objects():
            key = obj["Key"]
            filename = key.split("/")[-1]
            if filename.endswith(".webp"):
                webps.add(filename)
            pbar.update(1)
    return webps


def run(config: Config, strict: bool = False) -> dict:
    """
    Execute Step 0 — Manifest Validation.

    Returns a dict with keys: matched, missing, unexpected.
    Raises SystemExit(1) if strict=True and any drift is found.
    """
    console.rule("[bold cyan]Step 0 — Manifest Validation")

    # Load manifest
    try:
        manifest = _load_manifest(LIVE_ASSETS_PATH)
    except FileNotFoundError as e:
        console.print(f"  [red]✗ {e}[/]")
        sys.exit(1)

    console.print(f"  Manifest: [bold]{len(manifest)}[/] webp filenames from live_assets.txt")

    # Fetch R2
    console.print(f"  Scanning bucket [bold]{config.r2_bucket}[/] for .webp files...")
    r2_webps = _fetch_r2_webps(config)
    console.print(f"  R2: [bold]{len(r2_webps)}[/] .webp files found")

    # Diff
    matched    = manifest & r2_webps
    missing    = manifest - r2_webps      # in manifest, absent from R2
    unexpected = r2_webps - manifest      # in R2, not in manifest

    # ── Summary table ─────────────────────────────────────────────────────────
    t = Table(title="Drift Report")
    t.add_column("Category",   style="cyan")
    t.add_column("Count",      style="bold")
    t.add_column("Meaning")

    t.add_row(
        "[green]Matched[/]",
        str(len(matched)),
        "In manifest AND in R2 — will be ingested",
    )
    t.add_row(
        "[red]Missing[/]",
        str(len(missing)),
        "In manifest but NOT in R2 — ingest will skip silently",
    )
    t.add_row(
        "[yellow]Unexpected[/]",
        str(len(unexpected)),
        "In R2 but NOT in manifest — blocked by allowlist",
    )
    console.print(t)

    # ── Detail listings ────────────────────────────────────────────────────────
    if missing:
        console.print(f"\n[red]Missing from R2[/] ({len(missing)} files):")
        for f in sorted(missing):
            console.print(f"  [dim]✗[/] {f}")

    if unexpected:
        console.print(f"\n[yellow]Unexpected in R2[/] ({len(unexpected)} files):")
        for f in sorted(unexpected):
            console.print(f"  [dim]?[/] {f}")

    if not missing and not unexpected:
        console.print("\n[green]✓ R2 and manifest are in perfect sync.[/]")

    result = {
        "matched":    len(matched),
        "missing":    sorted(missing),
        "unexpected": sorted(unexpected),
    }

    if strict and (missing or unexpected):
        console.print("\n[red]Strict mode: aborting due to drift.[/]")
        sys.exit(1)

    return result
