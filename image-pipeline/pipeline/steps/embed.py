"""
STEP 3 — EMBEDDING GENERATION

Generates CLIP image embeddings for each asset using sentence-transformers.
CLIP runs locally — no API cost, ~0.1s/image on CPU, ~10ms on GPU.

Embeddings are stored in SQLite as raw float32 bytes.
A FAISS index is also built and saved to disk for fast similarity search.

Batch processing: images are fetched over HTTP and processed in mini-batches
to keep memory usage constant regardless of dataset size.
"""
from __future__ import annotations

import io
import logging
import os
from pathlib import Path
from typing import Optional

import numpy as np
import requests
from PIL import Image
from rich.console import Console
from tqdm import tqdm

from pipeline.config import Config
from pipeline.db import Database

log = logging.getLogger(__name__)
console = Console()

_FETCH_TIMEOUT = 15  # seconds
_BATCH_SIZE = 32     # images per CLIP forward pass


def _load_model(model_name: str):
    """Lazy-load the CLIP model (downloads on first run, cached after)."""
    from sentence_transformers import SentenceTransformer
    console.print(f"  Loading CLIP model [bold]{model_name}[/] (downloads once, cached)...")
    return SentenceTransformer(model_name)


def _fetch_image(url: str) -> Optional[Image.Image]:
    """Fetch image from URL, return PIL Image or None on error."""
    try:
        resp = requests.get(url, timeout=_FETCH_TIMEOUT, stream=True)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        log.warning(f"Failed to fetch image {url}: {e}")
        return None


def _best_url(row) -> Optional[str]:
    return row["web_url"] or row["free_url"] or row["hd_url"]


def build_faiss_index(db: Database, output_dir: Path) -> None:
    """
    Build a FAISS flat L2 index from all stored embeddings and save to disk.
    Call this after embed step completes (or standalone).
    """
    try:
        import faiss
    except ImportError:
        console.print("  [yellow]faiss-cpu not installed — skipping FAISS index build.[/]")
        return

    rows = db.get_all_embeddings()
    if not rows:
        return

    asset_ids = [r[0] for r in rows]
    vectors = np.array([
        np.frombuffer(r[1], dtype=np.float32) for r in rows
    ], dtype=np.float32)

    dim = vectors.shape[1]
    index = faiss.IndexFlatL2(dim)
    # Wrap with IDMap so we can search by integer ID
    index_with_ids = faiss.IndexIDMap(index)
    ids = np.arange(len(asset_ids), dtype=np.int64)
    index_with_ids.add_with_ids(vectors, ids)

    output_dir.mkdir(parents=True, exist_ok=True)
    index_path = output_dir / "embeddings.faiss"
    id_map_path = output_dir / "embeddings_ids.npy"

    faiss.write_index(index_with_ids, str(index_path))
    np.save(str(id_map_path), np.array(asset_ids))

    console.print(f"  FAISS index saved → [bold]{index_path}[/] ({len(asset_ids)} vectors, dim={dim})")


def run(config: Config, db: Database, force: bool = False) -> int:
    """
    Execute Step 3 — Embedding Generation.

    Returns number of embeddings generated this run.
    """
    console.rule("[bold cyan]Step 3 — Embedding Generation")
    db.log_step("embed", "started")

    if force:
        pending = db.get_assets()
    else:
        pending = db.get_assets_without_embedding()

    if not pending:
        console.print("  [green]All assets already embedded. Use --force to re-run.[/]")
        db.log_step("embed", "completed", message="nothing to do")
        return 0

    console.print(f"  [bold]{len(pending)}[/] assets to embed with {config.clip_model}")

    model = _load_model(config.clip_model)

    embedded = 0
    failed = 0

    # Process in batches to control memory
    for batch_start in tqdm(
        range(0, len(pending), _BATCH_SIZE),
        desc="  Embedding batches",
        unit="batch",
    ):
        batch = pending[batch_start : batch_start + _BATCH_SIZE]

        images: list[Image.Image] = []
        asset_ids: list[str] = []

        for row in batch:
            url = _best_url(row)
            if not url:
                log.warning(f"No URL for asset {row['asset_id']} — skipping")
                failed += 1
                continue
            img = _fetch_image(url)
            if img is None:
                failed += 1
                continue
            images.append(img)
            asset_ids.append(row["asset_id"])

        if not images:
            continue

        try:
            vectors = model.encode(
                images,
                batch_size=len(images),
                show_progress_bar=False,
                convert_to_numpy=True,
                normalize_embeddings=True,  # L2-normalize for cosine similarity via dot product
            ).astype(np.float32)

            for asset_id, vec in zip(asset_ids, vectors):
                db.upsert_embedding(
                    asset_id=asset_id,
                    embedding_bytes=vec.tobytes(),
                    model=config.clip_model,
                    dim=len(vec),
                )
            embedded += len(images)

        except Exception as e:
            log.error(f"Embedding batch failed: {e}")
            failed += len(images)

    # Build FAISS index after embedding is complete
    console.print("  Building FAISS similarity index...")
    build_faiss_index(db, config.output_path)

    console.print(f"  [green]Embedded: {embedded}[/]  [red]Failed: {failed}[/]")
    db.log_step(
        "embed",
        "completed" if failed == 0 else "partial",
        message=f"embedded={embedded} failed={failed}",
        asset_count=embedded,
    )
    return embedded
