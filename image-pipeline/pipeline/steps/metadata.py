"""
STEP 5 — METADATA GENERATION

For each asset that has vision data and a cluster assignment, calls the LLM
to generate SEO-optimized, factually grounded metadata.

The LLM receives:
  - Full vision JSON (ground truth)
  - Cluster label (contextual similarity hint)
  - Base filename (sanitized)
  - Available variant types

It MUST NOT invent objects or scenes not present in the vision data.
Metadata is consistent within clusters because they share the cluster label context.
"""
from __future__ import annotations

import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from rich.console import Console
from tqdm import tqdm

from pipeline.config import Config
from pipeline.db import Database
from pipeline.utils.llm import LLMClient

log = logging.getLogger(__name__)
console = Console()

_DEFAULT_WORKERS = 8  # gpt-4o-mini has higher rate limits than gpt-4o


def _build_payload(row) -> dict:
    """Build the LLM input payload from a joined DB row."""
    return {
        "asset_id": row["asset_id"],
        "base_name": row["base_name"],
        "variants": {
            "web": bool(row["web_url"] if "web_url" in row.keys() else None),
            "free": bool(row["free_url"] if "free_url" in row.keys() else None),
            "hd": bool(row["hd_url"] if "hd_url" in row.keys() else None),
        },
        "cluster_id": row["cluster_id"] or "unknown",
        "vision": {
            "scene_type": row["scene_type"] or "",
            "style": row["style"] or "",
            "objects": json.loads(row["objects"] or "[]"),
            "colors": json.loads(row["colors"] or "[]"),
            "lighting": row["lighting"] or "",
            "composition": row["composition"] or "",
            "mood": row["mood"] or "",
        },
    }


def _generate_one(row, llm: LLMClient) -> tuple[str, dict | Exception]:
    asset_id = row["asset_id"]
    try:
        payload = _build_payload(row)
        result = llm.generate_metadata(payload)
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
    Execute Step 5 — Metadata Generation.

    Returns number of assets with metadata generated this run.
    """
    console.rule("[bold cyan]Step 5 — Metadata Generation")
    db.log_step("generate_metadata", "started")

    if force:
        # Re-generate everything that has vision data
        pending = db.execute(
            "SELECT a.*, ac.cluster_id, v.scene_type, v.style, v.objects, v.colors, "
            "v.lighting, v.composition, v.mood "
            "FROM assets a "
            "JOIN vision_analysis v ON v.asset_id = a.asset_id "
            "LEFT JOIN asset_clusters ac ON ac.asset_id = a.asset_id"
        ).fetchall()
    else:
        pending = db.get_assets_without_metadata()

    if not pending:
        console.print("  [green]All assets already have metadata. Use --force to regenerate.[/]")
        db.log_step("generate_metadata", "completed", message="nothing to do")
        return 0

    # Check prerequisite: are assets clustered?
    n_unclustered = sum(1 for r in pending if not r["cluster_id"])
    if n_unclustered > 0:
        console.print(
            f"  [yellow]Warning: {n_unclustered} assets have no cluster assignment. "
            "Run 'cluster' step first for best results.[/]"
        )

    console.print(
        f"  [bold]{len(pending)}[/] assets to process with {config.metadata_model}"
    )

    llm = LLMClient(config)
    generated = 0
    failed = 0

    with tqdm(total=len(pending), desc="  Generating metadata", unit="asset") as pbar:
        with ThreadPoolExecutor(max_workers=workers) as pool:
            futures = {
                pool.submit(_generate_one, row, llm): row["asset_id"]
                for row in pending
            }
            for future in as_completed(futures):
                asset_id, result = future.result()
                if isinstance(result, Exception):
                    log.error(f"Metadata failed for {asset_id}: {result}")
                    failed += 1
                else:
                    meta = {
                        "asset_id": asset_id,
                        "title": result.get("title", ""),
                        "description": result.get("description", ""),
                        "alt": result.get("alt", ""),
                        "keywords": result.get("keywords", []),
                        "seo_slug": result.get("seo_slug", ""),
                        "category": result.get("category", "other"),
                        "embedding_text": result.get("embedding_text", ""),
                    }
                    db.upsert_metadata(meta)
                    generated += 1
                pbar.update(1)

    console.print(f"  [green]Generated: {generated}[/]  [red]Failed: {failed}[/]")
    db.log_step(
        "generate_metadata",
        "completed" if failed == 0 else "partial",
        message=f"generated={generated} failed={failed}",
        asset_count=generated,
    )
    return generated
