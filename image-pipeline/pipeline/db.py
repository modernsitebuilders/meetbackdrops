"""
SQLite persistence layer.

Single connection per process, WAL mode for concurrent reads during long runs.
Every write uses upsert so any step is safely re-runnable (idempotent).
"""
from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator, Optional


DDL = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ── Step 1: Inventory ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets (
    asset_id            TEXT PRIMARY KEY,
    base_name           TEXT NOT NULL,
    web_url             TEXT,
    free_url            TEXT,
    hd_url              TEXT,
    web_key             TEXT,   -- raw R2 object key
    free_key            TEXT,
    hd_key              TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Step 2: Vision analysis ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vision_analysis (
    asset_id            TEXT PRIMARY KEY REFERENCES assets(asset_id),
    scene_type          TEXT,
    style               TEXT,
    objects             TEXT,   -- JSON array
    colors              TEXT,   -- JSON array
    lighting            TEXT,
    composition         TEXT,
    mood                TEXT,
    confidence          REAL,
    raw_response        TEXT,   -- full JSON for debugging/replay
    analyzed_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Step 3: Embeddings ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS embeddings (
    asset_id            TEXT PRIMARY KEY REFERENCES assets(asset_id),
    embedding           BLOB NOT NULL,  -- float32 numpy array as raw bytes
    model               TEXT NOT NULL,
    dim                 INTEGER NOT NULL,
    embedded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Step 4: Clusters ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clusters (
    cluster_id          TEXT PRIMARY KEY,
    numeric_id          INTEGER NOT NULL,
    label               TEXT,   -- LLM-generated slug e.g. "bright_minimal_office"
    size                INTEGER DEFAULT 0,
    centroid            BLOB,   -- float32 numpy array
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS asset_clusters (
    asset_id            TEXT PRIMARY KEY REFERENCES assets(asset_id),
    cluster_id          TEXT REFERENCES clusters(cluster_id),
    distance_to_centroid REAL,
    assigned_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Step 5: Generated metadata ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS metadata (
    asset_id            TEXT PRIMARY KEY REFERENCES assets(asset_id),
    title               TEXT,
    description         TEXT,
    alt                 TEXT,
    keywords            TEXT,   -- JSON array
    seo_slug            TEXT,
    category            TEXT,
    embedding_text      TEXT,
    generated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── Pipeline run log ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_log (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    step                TEXT NOT NULL,
    status              TEXT NOT NULL,  -- started | completed | failed
    message             TEXT,
    asset_count         INTEGER,
    ts                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

INDEX_DDL = """
CREATE INDEX IF NOT EXISTS idx_assets_base_name ON assets(base_name);
CREATE INDEX IF NOT EXISTS idx_asset_clusters_cluster ON asset_clusters(cluster_id);
CREATE INDEX IF NOT EXISTS idx_metadata_category ON metadata(category);
CREATE INDEX IF NOT EXISTS idx_metadata_seo_slug ON metadata(seo_slug);
"""


class Database:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._conn: Optional[sqlite3.Connection] = None

    def connect(self) -> "Database":
        self._conn = sqlite3.connect(str(self.path), check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(DDL)
        self._conn.executescript(INDEX_DDL)
        self._conn.commit()
        return self

    def close(self):
        if self._conn:
            self._conn.close()
            self._conn = None

    @contextmanager
    def transaction(self) -> Generator[sqlite3.Connection, None, None]:
        assert self._conn, "Database not connected. Call .connect() first."
        try:
            yield self._conn
            self._conn.commit()
        except Exception:
            self._conn.rollback()
            raise

    def execute(self, sql: str, params: tuple = ()) -> sqlite3.Cursor:
        assert self._conn
        return self._conn.execute(sql, params)

    def executemany(self, sql: str, params: list[tuple]) -> sqlite3.Cursor:
        assert self._conn
        return self._conn.executemany(sql, params)

    # ── Convenience helpers ───────────────────────────────────────────────────

    def upsert_asset(self, asset: dict) -> None:
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO assets (asset_id, base_name, web_url, free_url, hd_url,
                                    web_key, free_key, hd_key)
                VALUES (:asset_id, :base_name, :web_url, :free_url, :hd_url,
                        :web_key, :free_key, :hd_key)
                ON CONFLICT(asset_id) DO UPDATE SET
                    base_name = excluded.base_name,
                    web_url   = excluded.web_url,
                    free_url  = excluded.free_url,
                    hd_url    = excluded.hd_url,
                    web_key   = excluded.web_key,
                    free_key  = excluded.free_key,
                    hd_key    = excluded.hd_key
                """,
                asset,
            )

    def upsert_vision(self, vision: dict) -> None:
        vision = {**vision}
        for field in ("objects", "colors"):
            if isinstance(vision.get(field), list):
                vision[field] = json.dumps(vision[field])
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO vision_analysis
                    (asset_id, scene_type, style, objects, colors, lighting,
                     composition, mood, confidence, raw_response)
                VALUES
                    (:asset_id, :scene_type, :style, :objects, :colors, :lighting,
                     :composition, :mood, :confidence, :raw_response)
                ON CONFLICT(asset_id) DO UPDATE SET
                    scene_type   = excluded.scene_type,
                    style        = excluded.style,
                    objects      = excluded.objects,
                    colors       = excluded.colors,
                    lighting     = excluded.lighting,
                    composition  = excluded.composition,
                    mood         = excluded.mood,
                    confidence   = excluded.confidence,
                    raw_response = excluded.raw_response,
                    analyzed_at  = CURRENT_TIMESTAMP
                """,
                vision,
            )

    def upsert_embedding(self, asset_id: str, embedding_bytes: bytes, model: str, dim: int) -> None:
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO embeddings (asset_id, embedding, model, dim)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(asset_id) DO UPDATE SET
                    embedding   = excluded.embedding,
                    model       = excluded.model,
                    dim         = excluded.dim,
                    embedded_at = CURRENT_TIMESTAMP
                """,
                (asset_id, embedding_bytes, model, dim),
            )

    def upsert_cluster(self, cluster: dict) -> None:
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO clusters (cluster_id, numeric_id, label, size, centroid)
                VALUES (:cluster_id, :numeric_id, :label, :size, :centroid)
                ON CONFLICT(cluster_id) DO UPDATE SET
                    label      = excluded.label,
                    size       = excluded.size,
                    centroid   = excluded.centroid
                """,
                cluster,
            )

    def upsert_asset_cluster(self, asset_id: str, cluster_id: str, distance: float) -> None:
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO asset_clusters (asset_id, cluster_id, distance_to_centroid)
                VALUES (?, ?, ?)
                ON CONFLICT(asset_id) DO UPDATE SET
                    cluster_id           = excluded.cluster_id,
                    distance_to_centroid = excluded.distance_to_centroid,
                    assigned_at          = CURRENT_TIMESTAMP
                """,
                (asset_id, cluster_id, distance),
            )

    def upsert_metadata(self, meta: dict) -> None:
        meta = {**meta}
        if isinstance(meta.get("keywords"), list):
            meta["keywords"] = json.dumps(meta["keywords"])
        with self.transaction() as conn:
            conn.execute(
                """
                INSERT INTO metadata
                    (asset_id, title, description, alt, keywords,
                     seo_slug, category, embedding_text)
                VALUES
                    (:asset_id, :title, :description, :alt, :keywords,
                     :seo_slug, :category, :embedding_text)
                ON CONFLICT(asset_id) DO UPDATE SET
                    title          = excluded.title,
                    description    = excluded.description,
                    alt            = excluded.alt,
                    keywords       = excluded.keywords,
                    seo_slug       = excluded.seo_slug,
                    category       = excluded.category,
                    embedding_text = excluded.embedding_text,
                    generated_at   = CURRENT_TIMESTAMP
                """,
                meta,
            )

    def log_step(self, step: str, status: str, message: str = "", asset_count: int = 0):
        with self.transaction() as conn:
            conn.execute(
                "INSERT INTO pipeline_log (step, status, message, asset_count) VALUES (?,?,?,?)",
                (step, status, message, asset_count),
            )

    # ── Read helpers ──────────────────────────────────────────────────────────

    def get_assets(self, without_vision: bool = False) -> list[sqlite3.Row]:
        if without_vision:
            return self.execute(
                "SELECT * FROM assets WHERE asset_id NOT IN (SELECT asset_id FROM vision_analysis)"
            ).fetchall()
        return self.execute("SELECT * FROM assets").fetchall()

    def get_assets_without_embedding(self) -> list[sqlite3.Row]:
        return self.execute(
            "SELECT * FROM assets WHERE asset_id NOT IN (SELECT asset_id FROM embeddings)"
        ).fetchall()

    def get_all_embeddings(self) -> list[tuple[str, bytes]]:
        rows = self.execute("SELECT asset_id, embedding FROM embeddings").fetchall()
        return [(r["asset_id"], r["embedding"]) for r in rows]

    def get_assets_without_metadata(self) -> list[sqlite3.Row]:
        return self.execute(
            "SELECT a.*, ac.cluster_id, v.scene_type, v.style, v.objects, v.colors, "
            "v.lighting, v.composition, v.mood "
            "FROM assets a "
            "JOIN vision_analysis v ON v.asset_id = a.asset_id "
            "LEFT JOIN asset_clusters ac ON ac.asset_id = a.asset_id "
            "WHERE a.asset_id NOT IN (SELECT asset_id FROM metadata)"
        ).fetchall()

    def count(self, table: str) -> int:
        return self.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]

    def asset_exists(self, asset_id: str) -> bool:
        row = self.execute(
            "SELECT 1 FROM assets WHERE asset_id = ?", (asset_id,)
        ).fetchone()
        return row is not None
