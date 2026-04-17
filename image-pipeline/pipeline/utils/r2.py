"""
R2 / S3-compatible client wrapper.

Handles pagination, URL generation, and presigned URLs.
boto3 talks to R2 identically to S3 — only the endpoint differs.
"""
from __future__ import annotations

from typing import Iterator

import boto3
from botocore.config import Config as BotoConfig

from pipeline.config import Config


class R2Client:
    def __init__(self, config: Config):
        self.cfg = config
        self._s3 = boto3.client(
            "s3",
            endpoint_url=config.r2_endpoint,
            aws_access_key_id=config.r2_access_key,
            aws_secret_access_key=config.r2_secret_key,
            region_name="auto",
            config=BotoConfig(
                retries={"max_attempts": 5, "mode": "adaptive"},
                signature_version="s3v4",
            ),
        )
        self.bucket = config.r2_bucket

    def list_objects(self, prefix: str = "") -> Iterator[dict]:
        """
        Yield every object dict from the bucket (handles pagination automatically).

        Each dict has keys: Key, Size, LastModified, ETag.
        """
        paginator = self._s3.get_paginator("list_objects_v2")
        kwargs: dict = {"Bucket": self.bucket}
        if prefix:
            kwargs["Prefix"] = prefix

        for page in paginator.paginate(**kwargs):
            for obj in page.get("Contents", []):
                yield obj

    def public_url(self, key: str) -> str:
        """
        Build the public URL for a given object key.
        Uses R2_PUBLIC_BASE_URL — either the r2.dev URL or a custom domain.
        """
        return f"{self.cfg.r2_public_base_url}/{key}"

    def presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generate a time-limited presigned URL (useful for private buckets).
        """
        return self._s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def head_object(self, key: str) -> dict | None:
        try:
            return self._s3.head_object(Bucket=self.bucket, Key=key)
        except self._s3.exceptions.ClientError:
            return None
