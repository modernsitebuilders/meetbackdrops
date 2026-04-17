#!/usr/bin/env python3
"""
Image Pipeline CLI

Usage:
  python cli.py validate        # step 0 — drift report (R2 vs live_assets.txt)
  python cli.py ingest
  python cli.py analyze
  python cli.py embed
  python cli.py cluster
  python cli.py generate-metadata
  python cli.py export
  python cli.py run-all         # full pipeline end-to-end
  python cli.py status          # show current pipeline state
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from pipeline.config import Config
from pipeline.db import Database

console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
# Reduce noise from third-party libs
for noisy in ("boto3", "botocore", "urllib3", "sentence_transformers", "PIL"):
    logging.getLogger(noisy).setLevel(logging.WARNING)


def _get_db(config: Config) -> Database:
    db = Database(config.db_path)
    db.connect()
    return db


# ── CLI group ─────────────────────────────────────────────────────────────────

@click.group()
@click.option("--env-file", default=".env", help="Path to .env file")
@click.pass_context
def cli(ctx, env_file):
    """
    \b
    Image metadata pipeline for R2-hosted asset libraries.
    Steps: ingest → analyze → embed → cluster → generate-metadata → export
    """
    ctx.ensure_object(dict)
    # Load env file if specified
    if env_file != ".env":
        from dotenv import load_dotenv
        load_dotenv(env_file, override=True)
    try:
        ctx.obj["config"] = Config.from_env()
    except EnvironmentError as e:
        console.print(f"[red]Configuration error:[/] {e}")
        sys.exit(1)


# ── Step commands ─────────────────────────────────────────────────────────────

@cli.command()
@click.option("--strict", is_flag=True, help="Exit with error if any drift found")
@click.pass_context
def validate(ctx, strict):
    """Step 0 — Compare R2 against live_assets.txt and report drift."""
    config = ctx.obj["config"]
    from pipeline.steps import validate as step
    step.run(config, strict=strict)


@cli.command()
@click.option("--prefix", default="", help="Only ingest objects with this R2 key prefix")
@click.pass_context
def ingest(ctx, prefix):
    """Step 1 — List R2 bucket and build asset inventory."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import ingest as step
    try:
        count = step.run(config, db, prefix=prefix)
        console.print(f"\n[green]✓ Ingest complete:[/] {count} new assets")
    finally:
        db.close()


@cli.command()
@click.option("--workers", default=5, show_default=True, help="Concurrent API calls")
@click.option("--force", is_flag=True, help="Re-analyze all assets, even if already done")
@click.pass_context
def analyze(ctx, workers, force):
    """Step 2 — Vision analysis via GPT-4o."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import analyze as step
    try:
        count = step.run(config, db, workers=workers, force=force)
        console.print(f"\n[green]✓ Analyze complete:[/] {count} assets analyzed")
    finally:
        db.close()


@cli.command()
@click.option("--force", is_flag=True, help="Re-embed all assets")
@click.pass_context
def embed(ctx, force):
    """Step 3 — Generate CLIP embeddings (runs locally, no API cost)."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import embed as step
    try:
        count = step.run(config, db, force=force)
        console.print(f"\n[green]✓ Embed complete:[/] {count} assets embedded")
    finally:
        db.close()


@cli.command()
@click.option("--no-llm-names", is_flag=True, help="Skip LLM cluster naming (faster)")
@click.pass_context
def cluster(ctx, no_llm_names):
    """Step 4 — HDBSCAN clustering on embeddings."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import cluster as step
    try:
        count = step.run(config, db, name_with_llm=not no_llm_names)
        console.print(f"\n[green]✓ Cluster complete:[/] {count} clusters")
    finally:
        db.close()


@cli.command("generate-metadata")
@click.option("--workers", default=8, show_default=True, help="Concurrent API calls")
@click.option("--force", is_flag=True, help="Regenerate all metadata")
@click.pass_context
def generate_metadata(ctx, workers, force):
    """Step 5 — Generate SEO metadata via LLM."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import metadata as step
    try:
        count = step.run(config, db, workers=workers, force=force)
        console.print(f"\n[green]✓ Metadata complete:[/] {count} assets")
    finally:
        db.close()


@cli.command()
@click.pass_context
def export(ctx):
    """Step 6 — Build final manifest (JSON + CSV)."""
    config = ctx.obj["config"]
    db = _get_db(config)
    from pipeline.steps import export as step
    try:
        result = step.run(config, db)
        if result:
            console.print(f"\n[green]✓ Export complete:[/] {result['total']} assets in {result['n_clusters']} clusters")
            console.print(f"  JSON: {result['json_path']}")
            console.print(f"  CSV:  {result['csv_path']}")
    finally:
        db.close()


# ── Composite commands ────────────────────────────────────────────────────────

@cli.command("run-all")
@click.option("--prefix", default="", help="R2 key prefix filter")
@click.option("--vision-workers", default=5, show_default=True)
@click.option("--meta-workers", default=8, show_default=True)
@click.option("--no-llm-names", is_flag=True)
@click.pass_context
def run_all(ctx, prefix, vision_workers, meta_workers, no_llm_names):
    """Run all 6 pipeline steps end-to-end."""
    config = ctx.obj["config"]
    db = _get_db(config)

    from pipeline.steps import validate, ingest, analyze, embed, cluster, metadata, export

    try:
        console.rule("[bold]Running Full Pipeline[/]")
        validate.run(config, strict=False)
        ingest.run(config, db, prefix=prefix)
        analyze.run(config, db, workers=vision_workers)
        embed.run(config, db)
        cluster.run(config, db, name_with_llm=not no_llm_names)
        metadata.run(config, db, workers=meta_workers)
        result = export.run(config, db)
        console.rule("[bold green]Pipeline Complete[/]")
        if result:
            console.print(f"  {result['total']} assets → {result['json_path']}")
    finally:
        db.close()


@cli.command()
@click.pass_context
def status(ctx):
    """Show current state of each pipeline step."""
    config = ctx.obj["config"]
    db = _get_db(config)

    try:
        t = Table(title="Pipeline Status")
        t.add_column("Step", style="cyan")
        t.add_column("Table", style="dim")
        t.add_column("Count", style="bold")
        t.add_column("Coverage")

        total = db.count("assets")
        steps = [
            ("1 — Ingest",     "assets",          "assets",          total),
            ("2 — Analyze",    "vision_analysis",  "assets",          total),
            ("3 — Embed",      "embeddings",       "assets",          total),
            ("4 — Cluster",    "asset_clusters",   "assets",          total),
            ("5 — Metadata",   "metadata",         "assets",          total),
        ]

        for name, table, denom_table, denom in steps:
            count = db.count(table)
            pct = f"{count/denom*100:.0f}%" if denom > 0 else "—"
            t.add_row(name, table, str(count), pct)

        console.print(t)

        # Recent log
        rows = db.execute(
            "SELECT step, status, message, ts FROM pipeline_log ORDER BY id DESC LIMIT 10"
        ).fetchall()
        if rows:
            console.print("\n[dim]Recent log:[/]")
            for r in rows:
                color = "green" if r["status"] == "completed" else (
                    "red" if r["status"] == "failed" else "yellow"
                )
                console.print(f"  [{color}]{r['status']:10}[/] {r['step']:25} {r['ts']} {r['message'] or ''}")
    finally:
        db.close()


if __name__ == "__main__":
    cli()
