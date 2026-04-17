import os
import boto3
from dotenv import load_dotenv

load_dotenv()


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=_require_env("R2_ENDPOINT"),
        aws_access_key_id=_require_env("R2_ACCESS_KEY_ID"),
        aws_secret_access_key=_require_env("R2_SECRET_ACCESS_KEY"),
        region_name="auto",
    )


def get_bucket():
    return _require_env("R2_BUCKET")