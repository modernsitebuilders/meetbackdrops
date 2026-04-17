"""
STEP 6 — FINAL MANIFEST BUILDER

Joins all pipeline tables into a complete asset manifest.

Output formats:
  - manifest.json  — full nested structure per asset
  - manifest.csv   — flattened for CMS bulk import

Manifest schema per asset:
{
  asset_id, cluster_id, cluster_label,
  variants: {web, free, hd},
  r2_keys:  {web, free, hd},
  vision:   { ... raw vision fields ... },
  metadata: { title, description, alt, keywords, seo_slug, category, embedding_text }
}
"""
from __future__ import annotations

import csv
import json
import logging
from pathlib import Path

from rich.console import Console
from rich.table import Table

from pipeline.config import Config
from pipeline.db import Database

log = logging.getLogger(__name__)
console = Console()


_MANIFEST_QUERY = """
SELECT
    a.asset_id,
    a.base_name,
    a.web_url,
    a.free_url,
    a.hd_url,
    a.web_key,
    a.free_key,
    a.hd_key,

    ac.cluster_id,
    c.label AS cluster_label,
    ac.distance_to_centroid,

    v.scene_type,
    v.style,
    v.objects,
    v.colors,
    v.lighting,
    v.composition,
    v.mood,
    v.confidence,

    m.title,
    m.description,
    m.alt,
    m.keywords,
    m.seo_slug,
    m.category,
    m.embedding_text

FROM assets a
LEFT JOIN asset_clusters ac ON ac.asset_id = a.asset_id
LEFT JOIN clusters c        ON c.cluster_id = ac.cluster_id
LEFT JOIN vision_analysis v ON v.asset_id = a.asset_id
LEFT JOIN metadata m        ON m.asset_id = a.asset_id
ORDER BY a.base_name
"""


def _row_to_manifest_entry(row) -> dict:
    return {
        "asset_id": row["asset_id"],
        "base_name": row["base_name"],
        "cluster_id": row["cluster_id"],
        "cluster_label": row["cluster_label"],
        "variants": {
            "web": row["web_url"],
            "free": row["free_url"],
            "hd": row["hd_url"],
        },
        "r2_keys": {
            "web": row["web_key"],
            "free": row["free_key"],
            "hd": row["hd_key"],
        },
        "vision": {
            "scene_type": row["scene_type"],
            "style": row["style"],
            "objects": json.loads(row["objects"] or "[]"),
            "colors": json.loads(row["colors"] or "[]"),
            "lighting": row["lighting"],
            "composition": row["composition"],
            "mood": row["mood"],
            "confidence": row["confidence"],
        },
        "metadata": {
            "title": row["title"],
            "description": row["description"],
            "alt": row["alt"],
            "keywords": json.loads(row["keywords"] or "[]"),
            "seo_slug": row["seo_slug"],
            "category": row["category"],
            "embedding_text": row["embedding_text"],
        },
    }


_CSV_FIELDS = [
    "asset_id", "base_name", "cluster_id", "cluster_label",
    "web_url", "free_url", "hd_url",
    "web_key", "free_key", "hd_key",
    "title", "description", "alt", "keywords",
    "seo_slug", "category", "embedding_text",
    "scene_type", "style", "lighting", "composition", "mood",
]


def _row_to_csv_entry(row) -> dict:
    return {
        "asset_id": row["asset_id"],
        "base_name": row["base_name"],
        "cluster_id": row["cluster_id"] or "",
        "cluster_label": row["cluster_label"] or "",
        "web_url": row["web_url"] or "",
        "free_url": row["free_url"] or "",
        "hd_url": row["hd_url"] or "",
        "web_key": row["web_key"] or "",
        "free_key": row["free_key"] or "",
        "hd_key": row["hd_key"] or "",
        "title": row["title"] or "",
        "description": row["description"] or "",
        "alt": row["alt"] or "",
        "keywords": "|".join(json.loads(row["keywords"] or "[]")),
        "seo_slug": row["seo_slug"] or "",
        "category": row["category"] or "",
        "embedding_text": row["embedding_text"] or "",
        "scene_type": row["scene_type"] or "",
        "style": row["style"] or "",
        "lighting": row["lighting"] or "",
        "composition": row["composition"] or "",
        "mood": row["mood"] or "",
    }


def run(config: Config, db: Database) -> dict:
    """
    Execute Step 6 — Export.

    Returns a dict with output file paths and counts.
    """
    console.rule("[bold cyan]Step 6 — Export Manifest")
    db.log_step("export", "started")

    output_dir = config.output_path
    output_dir.mkdir(parents=True, exist_ok=True)

    rows = db.execute(_MANIFEST_QUERY).fetchall()
    if not rows:
        console.print("  [yellow]No data to export. Run earlier pipeline steps first.[/]")
        return {}

    console.print(f"  Exporting [bold]{len(rows)}[/] assets...")

    # ── JSON manifest ─────────────────────────────────────────────────────────
    manifest = [_row_to_manifest_entry(row) for row in rows]
    json_path = output_dir / "manifest.json"
    json_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    console.print(f"  JSON  → [bold]{json_path}[/]")

    # ── CSV for CMS upload ────────────────────────────────────────────────────
    csv_path = output_dir / "manifest.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=_CSV_FIELDS)
        writer.writeheader()
        for row in rows:
            writer.writerow(_row_to_csv_entry(row))
    console.print(f"  CSV   → [bold]{csv_path}[/]")

    # ── Per-cluster JSON files ────────────────────────────────────────────────
    clusters_dir = output_dir / "clusters"
    clusters_dir.mkdir(exist_ok=True)
    by_cluster: dict[str, list] = {}
    for entry in manifest:
        cid = entry.get("cluster_label") or "noise"
        by_cluster.setdefault(cid, []).append(entry)
    for label, entries in by_cluster.items():
        safe_label = label.replace("/", "_")
        cluster_file = clusters_dir / f"{safe_label}.json"
        cluster_file.write_text(
            json.dumps(entries, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
    console.print(f"  Cluster files → [bold]{clusters_dir}/[/] ({len(by_cluster)} files)")

    # ── Stats table ───────────────────────────────────────────────────────────
    n_with_vision = sum(1 for r in rows if r["scene_type"])
    n_with_metadata = sum(1 for r in rows if r["title"])
    n_clustered = sum(1 for r in rows if r["cluster_id"])

    t = Table(title="Export Summary")
    t.add_column("Metric", style="cyan")
    t.add_column("Count", style="bold")
    t.add_row("Total assets", str(len(rows)))
    t.add_row("With vision analysis", str(n_with_vision))
    t.add_row("With metadata", str(n_with_metadata))
    t.add_row("Clustered", str(n_clustered))
    t.add_row("Clusters", str(len(by_cluster)))
    console.print(t)

    result = {
        "json_path": str(json_path),
        "csv_path": str(csv_path),
        "clusters_dir": str(clusters_dir),
        "total": len(rows),
        "n_clusters": len(by_cluster),
    }

    db.log_step("export", "completed", asset_count=len(rows))
    return result
