import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.app.classifier import apply_attachment_rule, classify_emails


DATA_DIR = Path("../data/sdoc-hackathon-bundle")
SAMPLE_SUBMISSION = DATA_DIR / "sample_submission.json"
OUTPUT_FILE = Path("../submission/classifier_submission.json")

BATCH_SIZE = 50


def load_json(path: Path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def main():
    # Load organizer's original submission structure
    submission = load_json(SAMPLE_SUBMISSION)

    inbox_dir = DATA_DIR / "inbox"

    emails = []

    for email_file in sorted(inbox_dir.glob("email_*.json")):
        email = load_json(email_file)
        emails.append(email)

    total_emails = len(emails)

    print(f"Total emails: {total_emails}")
    print(f"Batch size: {BATCH_SIZE}")
    print()

    # Process emails in batches
    for start in range(0, total_emails, BATCH_SIZE):

        end = min(start + BATCH_SIZE, total_emails)

        batch = emails[start:end]

        print(
            f"Classifying emails {start + 1}-{end} "
            f"of {total_emails}..."
        )

        classifications = classify_emails(batch)

        classifications = apply_attachment_rule(
        batch,
        classifications,
        )

        # Update ONLY category
        for email_id, category in classifications.items():
            submission[email_id]["category"] = category

            print(f"  {email_id}: {category}")

        print()

    # Save submission
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(submission, file, indent=2)

    print(f"Submission written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()