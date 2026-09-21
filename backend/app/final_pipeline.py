from __future__ import annotations

import json
from pathlib import Path
from .category_correction import correct_category


PROJECT_ROOT = Path(__file__).resolve().parents[2]
INBOX_DIR = PROJECT_ROOT / "data" / "sdoc-hackathon-bundle" / "inbox"

CLASSIFIER_FILE = (
    PROJECT_ROOT
    / "submission"
    / "classifier_submission.json"
)

COMPARISON_FILE = (
    PROJECT_ROOT
    / "submission"
    / "document_comparisons.json"
)

OUTPUT_FILE = (
    PROJECT_ROOT
    / "submission"
    / "final_submission.json"
)


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def apply_category_corrections(classifier):
    corrected = {}

    for email_id, classification in classifier.items():

        email_file = INBOX_DIR / f"{email_id}.json"

        if email_file.exists():
            email = load_json(email_file)

            category = correct_category(
                classification.get("category", "GENERAL"),
                email.get("subject", ""),
                email.get("body", ""),
            )

            corrected[email_id] = {
                **classification,
                "category": category,
            }

        else:
            corrected[email_id] = classification

    return corrected

def build_final_submission():
    print("=" * 70)
    print("SDOC AI - FINAL PIPELINE")
    print("=" * 70)

    classifier = load_json(CLASSIFIER_FILE)
    classifier = apply_category_corrections(classifier)

    comparisons = load_json(COMPARISON_FILE)

    print(f"\nClassifier emails : {len(classifier)}")
    print(f"Comparison emails : {len(comparisons)}")

    final_submission = {}

    for email_id, classification in classifier.items():

        category = classification.get("category", "GENERAL")

        # Start with the classifier result.
        result = {
            "category": category,
            "status": "OK",
            "review_reason": None,
            "defect_fields": [],
            "has_defect": False,
        }

        # Only BL_COMPARISON emails require SI vs BL reconciliation.
        if category == "BL_COMPARISON":

            comparison = comparisons.get(email_id)

            if comparison is None:
                result["status"] = "NEEDS_REVIEW"
                result["review_reason"] = (
                    "No document comparison result available."
                )

            else:
                result["status"] = comparison.get(
                    "status",
                    "NEEDS_REVIEW",
                )

                result["defect_fields"] = comparison.get(
                    "defect_fields",
                    [],
                )

                result["review_reason"] = comparison.get(
                    "review_reason"
                )

                result["has_defect"] = (
                    result["status"] == "MISMATCH"
                    and len(result["defect_fields"]) > 0
                )

        final_submission[email_id] = result

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(
            final_submission,
            file,
            indent=2,
            ensure_ascii=False,
        )

    # Statistics
    category_counts = {}
    status_counts = {}
    defect_count = 0

    for result in final_submission.values():

        category = result["category"]
        status = result["status"]

        category_counts[category] = (
            category_counts.get(category, 0) + 1
        )

        status_counts[status] = (
            status_counts.get(status, 0) + 1
        )

        if result["has_defect"]:
            defect_count += 1

    print("\n" + "=" * 70)
    print("FINAL SUBMISSION CREATED")
    print("=" * 70)

    print(f"\nTotal emails: {len(final_submission)}")

    print("\nCategories:")
    for category, count in sorted(category_counts.items()):
        print(f"  {category}: {count}")

    print("\nStatuses:")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    print(f"\nEmails with defects: {defect_count}")

    print(f"\nOutput:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    build_final_submission()