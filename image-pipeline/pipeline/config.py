"""
Central config — loaded once, passed through the pipeline.
All values come from environment / .env file.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    # R2 / S3
    r2_endpoint: str
    r2_access_key: str
    r2_secret_key: str
    r2_bucket: str
    r2_public_base_url: str  # no trailing slash

    # OpenAI
    openai_api_key: str
    vision_model: str = "gpt-4o"
    metadata_model: str = "gpt-4o-mini"

    # Paths
    db_path: str = "outputs/pipeline.db"
    output_dir: str = "outputs"

    # Pipeline
    batch_size: int = 10
    max_retries: int = 3

    # Clustering
    hdbscan_min_cluster_size: int = 10
    hdbscan_min_samples: int = 5

    # Embedding
    clip_model: str = "clip-ViT-B-32"

    # Variant detection — file suffixes that indicate variant type.
    # Each value is a list of suffix patterns (lowercased, no extension).
    # The FIRST match wins.
    variant_hd_suffixes: list[str] = field(
        default_factory=lambda: ["-hd", "_hd", "-premium", "_premium", "-4k", "_4k"]
    )
    variant_free_suffixes: list[str] = field(
        default_factory=lambda: ["-free", "_free", "-standard", "_standard", "-png"]
    )
    # Folder-prefix-based detection (e.g. "hd/sunset.png" → hd variant)
    variant_hd_prefixes: list[str] = field(default_factory=lambda: ["hd/", "premium/"])
    variant_free_prefixes: list[str] = field(
        default_factory=lambda: ["free/", "standard/", "png/"]
    )
    variant_web_prefixes: list[str] = field(default_factory=lambda: ["web/", "webp/"])

    @classmethod
    def from_env(cls) -> "Config":
        missing = []
        required = [
            "R2_ENDPOINT",
            "R2_ACCESS_KEY",
            "R2_SECRET_KEY",
            "R2_BUCKET",
            "R2_PUBLIC_BASE_URL",
            "OPENAI_API_KEY",
        ]
        for key in required:
            if not os.getenv(key):
                missing.append(key)
        if missing:
            raise EnvironmentError(
                f"Missing required environment variables: {', '.join(missing)}\n"
                "Copy .env.example to .env and fill in the values."
            )

        return cls(
            r2_endpoint=os.environ["R2_ENDPOINT"],
            r2_access_key=os.environ["R2_ACCESS_KEY"],
            r2_secret_key=os.environ["R2_SECRET_KEY"],
            r2_bucket=os.environ["R2_BUCKET"],
            r2_public_base_url=os.environ["R2_PUBLIC_BASE_URL"].rstrip("/"),
            openai_api_key=os.environ["OPENAI_API_KEY"],
            vision_model=os.getenv("VISION_MODEL", "gpt-4o"),
            metadata_model=os.getenv("METADATA_MODEL", "gpt-4o-mini"),
            db_path=os.getenv("DB_PATH", "outputs/pipeline.db"),
            output_dir=os.getenv("OUTPUT_DIR", "outputs"),
            batch_size=int(os.getenv("BATCH_SIZE", "10")),
            max_retries=int(os.getenv("MAX_RETRIES", "3")),
            hdbscan_min_cluster_size=int(os.getenv("HDBSCAN_MIN_CLUSTER_SIZE", "10")),
            hdbscan_min_samples=int(os.getenv("HDBSCAN_MIN_SAMPLES", "5")),
            clip_model=os.getenv("CLIP_MODEL", "clip-ViT-B-32"),
        )

    @property
    def db_dir(self) -> Path:
        return Path(self.db_path).parent

    @property
    def output_path(self) -> Path:
        return Path(self.output_dir)
