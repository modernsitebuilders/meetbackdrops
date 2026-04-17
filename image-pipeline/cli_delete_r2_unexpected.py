import os
import boto3
import argparse
from botocore.config import Config

BUCKET = "streambackdrops-images"
BATCH_SIZE = 100

# ---------- R2 CLIENT ----------
s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    config=Config(signature_version="s3v4"),
)

# ---------- LOAD UNEXPECTED FILES ----------
def load_unexpected(file_path="unexpected_r2.txt"):
    with open(file_path, "r") as f:
        return [line.strip() for line in f if line.strip()]

# ---------- FETCH ALL KEYS ----------
def fetch_all_keys():
    keys = []
    paginator = s3.get_paginator("list_objects_v2")

    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            keys.append(obj["Key"])

    return keys

# ---------- BATCH DELETE ----------
def delete_batch(keys):
    response = s3.delete_objects(
        Bucket=BUCKET,
        Delete={
            "Objects": [{"Key": k} for k in keys],
            "Quiet": False
        }
    )
    return response

# ---------- MAIN ----------
def main(dry_run=True, confirm=False):
    unexpected = load_unexpected()

    print(f"\nLoaded unexpected files: {len(unexpected)}")

    all_keys = fetch_all_keys()

    # map filename -> full key
    key_map = {}
    for k in all_keys:
        filename = k.split("/")[-1]
        key_map[filename] = k

    to_delete = []
    missing = []

    for f in unexpected:
        if f in key_map:
            to_delete.append(key_map[f])
        else:
            missing.append(f)

    print(f"\nMatched for deletion: {len(to_delete)}")
    print(f"Missing (not in R2): {len(missing)}")

    if missing:
        print("\n--- Missing sample ---")
        for m in missing[:20]:
            print(m)

    print("\n--- First 20 deletions ---")
    for k in to_delete[:20]:
        print(k)

    if dry_run:
        print("\n🟡 DRY RUN MODE - no deletions performed")
        return

    if not confirm:
        print("\n❌ SAFETY STOP: --confirm flag required to delete")
        return

    # final human confirmation
    print("\n⚠️ FINAL WARNING")
    print(f"You are about to delete {len(to_delete)} objects from R2.")
    check = input("Type DELETE to continue: ")

    if check != "DELETE":
        print("Aborted.")
        return

    # batch deletion
    deleted_log = []
    for i in range(0, len(to_delete), BATCH_SIZE):
        batch = to_delete[i:i+BATCH_SIZE]
        print(f"\nDeleting batch {i//BATCH_SIZE + 1} ({len(batch)} items)...")

        resp = delete_batch(batch)
        deleted = resp.get("Deleted", [])

        for d in deleted:
            deleted_log.append(d["Key"])

    # save log
    with open("deleted_log.txt", "w") as f:
        for d in deleted_log:
            f.write(d + "\n")

    print(f"\n✅ Done. Deleted: {len(deleted_log)}")
    print("Log saved to deleted_log.txt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--confirm", action="store_true")

    args = parser.parse_args()

    main(dry_run=args.dry_run, confirm=args.confirm)