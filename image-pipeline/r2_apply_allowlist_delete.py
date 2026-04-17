import os
import boto3
from dotenv import load_dotenv

load_dotenv()

BUCKET = os.getenv("R2_BUCKET")

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("R2_ENDPOINT"),
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    region_name="auto",
)

ALLOWLIST_FILE = "r2_allowlist.txt"


def load_allowlist():
    with open(ALLOWLIST_FILE, "r") as f:
        return set(line.strip() for line in f if line.strip())


def list_r2_objects():
    paginator = s3.get_paginator("list_objects_v2")

    objects = []

    for page in paginator.paginate(Bucket=BUCKET):
        for obj in page.get("Contents", []):
            objects.append(obj["Key"])

    return objects


def main():
    allow = load_allowlist()
    all_objects = list_r2_objects()

    to_delete = []

    for key in all_objects:
        filename = key.split("/")[-1]

        if filename not in allow:
            to_delete.append({"Key": key})

    print("\n==============================")
    print("R2 FINAL DELETE RUN")
    print("==============================")
    print("Total objects:", len(all_objects))
    print("Allowed:", len(allow))
    print("To delete:", len(to_delete))

    print("\nSample deletions:")
    for x in to_delete[:25]:
        print(" -", x["Key"])

    confirm = input("\nType DELETE to execute: ")

    if confirm != "DELETE":
        print("Aborted.")
        return

    # batch delete (max 1000 per request)
    for i in range(0, len(to_delete), 1000):
        batch = to_delete[i:i + 1000]

        s3.delete_objects(
            Bucket=BUCKET,
            Delete={"Objects": batch}
        )

    print("\nDELETE COMPLETE")


if __name__ == "__main__":
    main()