from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]

CACHE_FILE = PROJECT_ROOT / "submission" / "document_extractions.json"
FINAL_FILE = PROJECT_ROOT / "submission" / "final_submission.json"
ATTACHMENTS_DIR = (
    PROJECT_ROOT
    / "data"
    / "sdoc-hackathon-bundle"
    / "attachments"
)


def get_email_id(filename):
    match = re.match(r"^(email_\d+)_(SI|BL)\.", filename, re.IGNORECASE)
    return match.group(1) if match else None


def main():

    with open(CACHE_FILE, "r", encoding="utf-8") as file:
        cache = json.load(file)

    with open(FINAL_FILE, "r", encoding="utf-8") as file:
        final = json.load(file)

    review_emails = [
        email_id
        for email_id, result in final.items()
        if result.get("category") == "BL_COMPARISON"
        and result.get("status") == "NEEDS_REVIEW"
    ]

    # Group cache entries by email
    grouped = {}

    for filename, result in cache.items():

        email_id = get_email_id(filename)

        if email_id is None:
            continue

        if email_id not in grouped:
            grouped[email_id] = {}

        grouped[email_id][filename] = result

    print("=" * 80)
    print("SDOC REVIEW DIAGNOSTIC")
    print("=" * 80)

    print(f"\nBL_COMPARISON needing review: {len(review_emails)}")

    categories = {}

    for email_id in review_emails:

        documents = grouped.get(email_id, {})

        errors = []
        successful = []
        skipped = []

        for filename, result in documents.items():

            status = result.get("status")

            if status == "ERROR":
                errors.append(result.get("error", "Unknown error"))

            elif status == "SKIPPED":
                skipped.append(result.get("document_type"))

            else:
                successful.append(result.get("document_type"))

        # Check actual attachment files
        actual_files = sorted(
            p.name
            for p in ATTACHMENTS_DIR.glob(f"{email_id}_*")
        )

        if errors:
            reason = "GEMINI/PARSER_ERROR"

        elif successful:
            reason = "PARTIAL_DOCUMENT_DATA"

        elif skipped:
            reason = "DOCUMENT_SKIPPED"

        else:
            reason = "NO_CACHE_RESULT"

        categories[reason] = categories.get(reason, 0) + 1

        print("\n" + "-" * 80)
        print(email_id)
        print(f"  Actual attachments : {actual_files}")
        print(f"  Successful cache   : {successful}")
        print(f"  Skipped             : {skipped}")

        if errors:
            print("  Errors:")
            for error in errors[:2]:
                print(f"    {error}")

        print(f"  ==> {reason}")

    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    for reason, count in sorted(categories.items()):
        print(f"{reason}: {count}")


if __name__ == "__main__":
    main()
    