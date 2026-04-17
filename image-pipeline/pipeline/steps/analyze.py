"""
STEP 2 — IMAGE VISION ANALYSIS

For each asset, sends the best available image URL to GPT-4o vision and stores
the structured visual description. Only raw perception — no SEO, no marketing.

Uses the web (webp) variant first since it's smallest and fastest to transfer.
Falls back to free PNG if web is unavailable.

Processing is concurrent via ThreadPoolExecutor to stay within API rate limits.
"""
from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

from rich.console import Console
from tqdm import tqdm

from pipeline.config import Config
from pipeline.db import Database
from pipeline.utils.llm import LLMClient

log = logging.getLogger(__name__)
console = Console()

# GPT-4o vision rate limit: ~100 RPM on Tier 1 — keep concurrency conservative
_DEFAULT_WORKERS = 5


def _best_url(row) -> Optional[str]:
    """Pick the best image URL for vision analysis (smallest → fastest)."""
    return row["web_url"] or row["free_url"] or row["hd_url"]


def _analyze_one(row, llm: LLMClient) -> tuple[str, dict | Exception]:
    """Analyze a single asset. Returns (asset_id, result_or_exception)."""
    asset_id = row["asset_id"]
    url = _best_url(row)
    if not url:
        return asset_id, ValueError(f"No image URL available for asset {asset_id}")
    try:
        result = llm.vision_analyze(url, asset_id)
        return asset_id, result
    except Exception as e:
        return asset_id, e


def run(
    config: Config,
    db: Database,
    workers: int = _DEFAULT_WORKERS,
    force: bool = False,
) -> int:
    """
    Execute Step 2 — Vision Analysis.

    Args:
        force: Re-analyze assets that already have vision data.

    Returns number of assets analyzed this run.
    """
    console.rule("[bold cyan]Step 2 — Vision Analysis")
    db.log_step("analyze", "started")

    if force:
        pending = db.get_assets()
    else:
        pending = db.get_assets(without_vision=True)

    if not pending:
        console.print("  [green]All assets already analyzed. Use --force to re-run.[/]")
        db.log_step("analyze", "completed", message="nothing to do")
        return 0

    console.print(f"  [bold]{len(pending)}[/] assets to analyze with {config.vision_model}")

    llm = LLMClient(config)
    analyzed = 0
    failed = 0

    with tqdm(total=len(pending), desc="  Analyzing", unit="img") as pbar:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(_analyze_one, row, llm): row["asset_id"]
                for row in pending
            }
            for future in as_completed(futures):
                asset_id, result = future.result()
                if isinstance(result, Exception):
                    log.error(f"Vision failed for {asset_id}: {result}")
                    failed += 1
                else:
                    # Ensure required fields exist with sensible defaults
                    vision = {
                        "asset_id": asset_id,
                        "scene_type": result.get("scene_type", ""),
                        "style": result.get("style", ""),
                        "objects": result.get("objects", []),
                        "colors": result.get("colors", []),
                        "lighting": result.get("lighting", ""),
                        "composition": result.get("composition", ""),
                        "mood": result.get("mood", ""),
                        "confidence": float(result.get("confidence", 0.0)),
                        "raw_response": result.get("raw_response", ""),
                    }
                    db.upsert_vision(vision)
                    analyzed += 1
                pbar.update(1)

    console.print(
        f"  [green]Analyzed: {analyzed}[/]  [red]Failed: {failed}[/]"
    )
    if failed > 0:
        console.print(
            "  [yellow]Re-run 'analyze' to retry failed assets (they will be picked up automatically).[/]"
        )

    db.log_step(
        "analyze",
        "completed" if failed == 0 else "partial",
        message=f"analyzed={analyzed} failed={failed}",
        asset_count=analyzed,
    )
    return analyzed
