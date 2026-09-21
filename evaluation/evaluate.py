import json
from pathlib import Path
from collections import Counter

from sklearn.metrics import accuracy_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report


# --------------------------------------------------
# File locations
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

GROUND_TRUTH_PATH = BASE_DIR / "evaluation" / "ground_truth.json"
SUBMISSION_PATH = BASE_DIR / "submission" / "final_submission.json"

# --------------------------------------------------
# Load JSON files
# --------------------------------------------------

with open(GROUND_TRUTH_PATH, "r", encoding="utf-8") as f:
    ground_truth = json.load(f)

with open(SUBMISSION_PATH, "r", encoding="utf-8") as f:
    submission = json.load(f)


# --------------------------------------------------
# Check email IDs
# --------------------------------------------------

ground_truth_ids = set(ground_truth.keys())
submission_ids = set(submission.keys())

print(f"Ground truth emails : {len(ground_truth_ids)}")
print(f"Submission emails   : {len(submission_ids)}")

missing = ground_truth_ids - submission_ids
extra = submission_ids - ground_truth_ids

if missing:
    print(f"Missing predictions : {len(missing)}")

if extra:
    print(f"Extra predictions   : {len(extra)}")


# --------------------------------------------------
# Prepare data
# --------------------------------------------------

common_ids = sorted(ground_truth_ids & submission_ids)

true_categories = []
pred_categories = []

true_statuses = []
pred_statuses = []

true_defects = []
pred_defects = []


for email_id in common_ids:

    truth = ground_truth[email_id]
    pred = submission[email_id]

    true_categories.append(truth["category"])
    pred_categories.append(pred["category"])

    true_statuses.append(truth["status"])
    pred_statuses.append(pred["status"])

    true_defects.append(truth["has_defect"])
    pred_defects.append(pred["has_defect"])


# --------------------------------------------------
# Category performance
# --------------------------------------------------

category_accuracy = accuracy_score(
    true_categories,
    pred_categories
)

category_macro_f1 = f1_score(
    true_categories,
    pred_categories,
    average="macro"
)


# --------------------------------------------------
# Status performance
# --------------------------------------------------

status_accuracy = accuracy_score(
    true_statuses,
    pred_statuses
)

status_macro_f1 = f1_score(
    true_statuses,
    pred_statuses,
    average="macro"
)


# --------------------------------------------------
# Defect performance
# --------------------------------------------------

defect_f1 = f1_score(
    true_defects,
    pred_defects,
    average="binary"
)


# --------------------------------------------------
# Print results
# --------------------------------------------------

print()
print("=" * 50)
print("SDOC BASELINE EVALUATION")
print("=" * 50)

print(f"Category Accuracy : {category_accuracy:.4f}")
print(f"Category Macro-F1 : {category_macro_f1:.4f}")

print(f"Status Accuracy   : {status_accuracy:.4f}")
print(f"Status Macro-F1   : {status_macro_f1:.4f}")

print(f"Defect F1         : {defect_f1:.4f}")

print("=" * 50)


# --------------------------------------------------
# Distribution comparison
# --------------------------------------------------

print()
print("Category distribution")
print("-" * 30)

print("Ground truth:")
print(Counter(true_categories))

print()
print("Prediction:")
print(Counter(pred_categories))


print()
print("Status distribution")
print("-" * 30)

print("Ground truth:")
print(Counter(true_statuses))

print()
print("Prediction:")
print(Counter(pred_statuses))

print()
print("=" * 50)
print("CATEGORY CLASSIFICATION REPORT")
print("=" * 50)

labels = [
    "BL_COMPARISON",
    "SI_REQUEST",
    "INVOICE_QUERY",
    "GENERAL",
    "SPAM"
]

print(
    classification_report(
        true_categories,
        pred_categories,
        labels=labels,
        zero_division=0
    )
)


print()
print("=" * 50)
print("CATEGORY CONFUSION MATRIX")
print("=" * 50)

matrix = confusion_matrix(
    true_categories,
    pred_categories,
    labels=labels
)

print("Rows = Actual")
print("Columns = Predicted")
print()

print(f"{'':20}", end="")

for label in labels:
    print(f"{label[:12]:>14}", end="")

print()

for label, row in zip(labels, matrix):
    print(f"{label:20}", end="")

    for value in row:
        print(f"{value:>14}", end="")

    print()