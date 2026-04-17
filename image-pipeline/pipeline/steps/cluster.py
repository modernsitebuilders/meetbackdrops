"""
STEP 4 — CLUSTERING

Loads all embeddings from SQLite, reduces dimensionality with UMAP,
then clusters with HDBSCAN.

Why UMAP first?
  HDBSCAN operates on Euclidean distances. High-dimensional CLIP vectors (512d)
  suffer from the curse of dimensionality. UMAP to ~20d preserves cluster
  structure while making distances meaningful again.

Cluster naming:
  After HDBSCAN, we pick the 6 most-central images per cluster and ask the LLM
  to generate a descriptive snake_case label using their vision metadata.

Noise handling:
  HDBSCAN assigns -1 to noise points. These get cluster_id = 'noise'.
"""
from __future__ import annotations

import json
import logging
import uuid
from collections import defaultdict

import numpy as np
from rich.console import Console
from rich.table import Table
from tqdm import tqdm

from pipeline.config import Config
from pipeline.db import Database
from pipeline.utils.llm import LLMClient

log = logging.getLogger(__name__)
console = Console()

_UMAP_N_COMPONENTS = 20
_UMAP_N_NEIGHBORS = 15
_UMAP_MIN_DIST = 0.1
_CLUSTER_LABEL_SAMPLE = 6  # images to sample per cluster for LLM naming


def _load_matrix(db: Database) -> tuple[list[str], np.ndarray]:
    """Load all embeddings from DB into an asset_id list and float32 matrix."""
    rows = db.get_all_embeddings()
    if not rows:
        raise ValueError("No embeddings found. Run 'embed' step first.")

    asset_ids = [r[0] for r in rows]
    matrix = np.array(
        [np.frombuffer(r[1], dtype=np.float32) for r in rows],
        dtype=np.float32,
    )
    return asset_ids, matrix


def _reduce_dimensions(matrix: np.ndarray, n_components: int) -> np.ndarray:
    """UMAP dimensionality reduction."""
    try:
        import umap
        console.print(f"  Running UMAP: {matrix.shape[1]}d → {n_components}d ...")
        reducer = umap.UMAP(
            n_components=n_components,
            n_neighbors=_UMAP_N_NEIGHBORS,
            min_dist=_UMAP_MIN_DIST,
            metric="cosine",
            random_state=42,
            verbose=False,
        )
        return reducer.fit_transform(matrix).astype(np.float32)
    except ImportError:
        log.warning("umap-learn not installed — skipping UMAP, clustering on full vectors")
        return matrix


def _run_hdbscan(matrix: np.ndarray, min_cluster_size: int, min_samples: int) -> np.ndarray:
    """Run HDBSCAN and return integer label array (-1 = noise)."""
    try:
        import hdbscan
        console.print(
            f"  Running HDBSCAN (min_cluster_size={min_cluster_size}, "
            f"min_samples={min_samples}) on {matrix.shape[0]} points..."
        )
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=min_samples,
            metric="euclidean",
            cluster_selection_method="eom",
            prediction_data=True,
        )
        labels = clusterer.fit_predict(matrix)
        return labels
    except ImportError:
        # Fallback: KMeans
        console.print("  [yellow]hdbscan not installed — falling back to KMeans (k=auto)[/]")
        from sklearn.cluster import KMeans
        n_clusters = max(5, matrix.shape[0] // 50)
        console.print(f"  KMeans with k={n_clusters}")
        km = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
        return km.fit_predict(matrix)


def _compute_centroids(matrix: np.ndarray, labels: np.ndarray) -> dict[int, np.ndarray]:
    """Compute mean centroid per cluster label."""
    centroids: dict[int, np.ndarray] = {}
    for label in set(labels):
        if label == -1:
            continue
        mask = labels == label
        centroids[label] = matrix[mask].mean(axis=0)
    return centroids


def _centroid_distances(
    matrix: np.ndarray, labels: np.ndarray, centroids: dict[int, np.ndarray]
) -> np.ndarray:
    """For each point, compute distance to its cluster centroid."""
    distances = np.zeros(len(matrix), dtype=np.float32)
    for i, (vec, label) in enumerate(zip(matrix, labels)):
        if label in centroids:
            distances[i] = float(np.linalg.norm(vec - centroids[label]))
        else:
            distances[i] = 999.0  # noise
    return distances


def _name_clusters(
    numeric_labels: list[int],
    asset_ids: list[str],
    db: Database,
    llm: LLMClient,
) -> dict[int, str]:
    """
    For each cluster, pick the most central images and ask LLM to name it.
    Returns {numeric_label: snake_case_name}
    """
    # Group asset_ids by cluster
    cluster_members: dict[int, list[str]] = defaultdict(list)
    for asset_id, label in zip(asset_ids, numeric_labels):
        cluster_members[label].append(asset_id)

    cluster_names: dict[int, str] = {-1: "noise"}

    unique_labels = [l for l in cluster_members.keys() if l != -1]
    console.print(f"  Naming {len(unique_labels)} clusters via LLM...")

    for label in tqdm(unique_labels, desc="  Naming clusters", unit="cluster"):
        members = cluster_members[label][:_CLUSTER_LABEL_SAMPLE]
        # Fetch vision data for sample members
        vision_rows = []
        for asset_id in members:
            row = db.execute(
                "SELECT scene_type, style, objects, colors, mood FROM vision_analysis WHERE asset_id = ?",
                (asset_id,),
            ).fetchone()
            if row:
                vision_rows.append({
                    "scene_type": row["scene_type"] or "",
                    "style": row["style"] or "",
                    "objects": json.loads(row["objects"] or "[]"),
                    "colors": json.loads(row["colors"] or "[]"),
                    "mood": row["mood"] or "",
                })

        if not vision_rows:
            cluster_names[label] = f"cluster_{label}"
            continue

        try:
            name = llm.name_cluster(vision_rows)
            cluster_names[label] = name
        except Exception as e:
            log.warning(f"Failed to name cluster {label}: {e}")
            cluster_names[label] = f"cluster_{label}"

    return cluster_names


def run(config: Config, db: Database, name_with_llm: bool = True) -> int:
    """
    Execute Step 4 — Clustering.

    Returns number of clusters created.
    """
    console.rule("[bold cyan]Step 4 — Clustering")
    db.log_step("cluster", "started")

    asset_ids, matrix = _load_matrix(db)
    console.print(f"  Loaded [bold]{len(asset_ids)}[/] embeddings, dim={matrix.shape[1]}")

    # ── Dimensionality reduction ──────────────────────────────────────────────
    reduced = _reduce_dimensions(matrix, _UMAP_N_COMPONENTS)

    # ── Clustering ────────────────────────────────────────────────────────────
    labels = _run_hdbscan(
        reduced,
        config.hdbscan_min_cluster_size,
        config.hdbscan_min_samples,
    )

    unique_labels = set(labels)
    n_clusters = len(unique_labels - {-1})
    n_noise = int((labels == -1).sum())
    console.print(f"  Found [bold]{n_clusters}[/] clusters, {n_noise} noise points")

    # ── Centroids + distances ─────────────────────────────────────────────────
    centroids = _compute_centroids(reduced, labels)
    distances = _centroid_distances(reduced, labels, centroids)

    # ── Name clusters ─────────────────────────────────────────────────────────
    llm = LLMClient(config)
    if name_with_llm and n_clusters > 0:
        cluster_names = _name_clusters(labels.tolist(), asset_ids, db, llm)
    else:
        cluster_names = {int(l): f"cluster_{l}" for l in unique_labels}
        cluster_names[-1] = "noise"

    # ── Persist ───────────────────────────────────────────────────────────────
    # Deduplicate names (HDBSCAN can produce same-looking names)
    name_counts: dict[str, int] = defaultdict(int)
    final_names: dict[int, str] = {}
    for label, name in cluster_names.items():
        count = name_counts[name]
        final_names[label] = name if count == 0 else f"{name}_{count}"
        name_counts[name] += 1

    # Upsert cluster records
    for label in unique_labels:
        cluster_id = f"noise" if label == -1 else str(uuid.uuid5(
            uuid.NAMESPACE_URL,
            f"cluster/{config.r2_bucket}/{label}/{final_names.get(label, label)}",
        ))
        centroid_bytes = centroids[label].tobytes() if label in centroids else None
        size = int((labels == label).sum())
        db.upsert_cluster({
            "cluster_id": cluster_id,
            "numeric_id": int(label),
            "label": final_names.get(label, f"cluster_{label}"),
            "size": size,
            "centroid": centroid_bytes,
        })

    # Build label → cluster_id lookup
    label_to_cluster_id: dict[int, str] = {}
    for label in unique_labels:
        row = db.execute(
            "SELECT cluster_id FROM clusters WHERE numeric_id = ?", (int(label),)
        ).fetchone()
        if row:
            label_to_cluster_id[int(label)] = row["cluster_id"]

    # Upsert asset → cluster assignments
    for asset_id, label, dist in zip(asset_ids, labels.tolist(), distances.tolist()):
        cluster_id = label_to_cluster_id.get(int(label), "noise")
        db.upsert_asset_cluster(asset_id, cluster_id, dist)

    # ── Summary table ─────────────────────────────────────────────────────────
    t = Table(title="Cluster Summary (top 10)")
    t.add_column("Cluster ID", style="cyan")
    t.add_column("Label", style="bold")
    t.add_column("Size")
    rows = db.execute(
        "SELECT cluster_id, label, size FROM clusters ORDER BY size DESC LIMIT 10"
    ).fetchall()
    for row in rows:
        t.add_row(row["cluster_id"][:12] + "...", row["label"], str(row["size"]))
    console.print(t)

    db.log_step("cluster", "completed", asset_count=len(asset_ids))
    return n_clusters
