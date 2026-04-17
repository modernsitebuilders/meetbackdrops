import os
import boto3
from dotenv import load_dotenv
from pathlib import Path

# -------------------------
# ENV LOADING (STRICT)
# -------------------------

BASE_DIR = Path(__file__).resolve().parent
env_path = BASE_DIR / ".env"

if not env_path.exists():
    raise FileNotFoundError(f".env not found at: {env_path}")

load_dotenv(dotenv_path=env_path, override=True)

def require_env(key: str) -> str:
    val = os.getenv(key)
    if val is None or val.strip() == "":
        raise Exception(f"Missing or empty env var: {key}")
    return val.strip()

BUCKET = require_env("R2_BUCKET")
ENDPOINT = require_env("R2_ENDPOINT")
ACCESS_KEY = require_env("R2_ACCESS_KEY_ID")
SECRET_KEY = require_env("R2_SECRET_ACCESS_KEY")

print("✅ ENV LOADED")

# -------------------------
# BOTO3 CLIENT (R2)
# -------------------------

s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="auto",
)

# -------------------------
# HARD CONNECTION TEST (IMPORTANT)
# -------------------------

def verify_r2_connection():
    try:
        s3.list_objects_v2(Bucket=BUCKET, MaxKeys=1)
        print("✅ R2 CONNECTION OK")
    except Exception as e:
        raise Exception(f"❌ R2 CONNECTION FAILED: {e}")

verify_r2_connection()