import os
import boto3
from dotenv import load_dotenv

# -------------------------
# ENV
# -------------------------
load_dotenv()

BUCKET = os.getenv("R2_BUCKET")

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

# -------------------------
# LOAD CANDIDATES
# -------------------------
def load_delete_candidates():
    with open("DELETE_CANDIDATES.txt", "r") as f:
        return [line.strip() for line in f if line.strip()]

# -------------------------
# DELETE IN BATCHES (S3 LIMIT = 1000)
# -------------------------
def chunk(lst, size=1000):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]

def delete_objects(keys):
    total = len(keys)

    print("\n==============================")
    print("R2 DELETE EXECUTION")
    print("==============================")
    print(f"Bucket: {BUCKET}")
    print(f"Objects to delete: {total}\n")

    confirm = input("Type DELETE to proceed: ")
    if confirm != "DELETE":
        print("Aborted.")
        return

    deleted = 0

    for batch in chunk(keys, 1000):
        response = s3.delete_objects(
            Bucket=BUCKET,
            Delete={
                "Objects": [{"Key": k} for k in batch],
                "Quiet": False
            }
        )

        deleted += len(batch)

        print(f"Deleted batch: {len(batch)} | Total deleted: {deleted}/{total}")

        # optional: print errors if any
        if "Errors" in response and response["Errors"]:
            print("⚠️ Errors:")
            for e in response["Errors"]:
                print(e)

    print("\nDONE. Deletion complete.")

# -------------------------
# MAIN
# -------------------------
def main():
    keys = load_delete_candidates()

    print("Found candidates:", len(keys))
    print("Sample:")
    for k in keys[:10]:
        print(" -", k)

    delete_objects(keys)

if __name__ == "__main__":
    main()