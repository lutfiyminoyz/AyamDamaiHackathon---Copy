from __future__ import annotations

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from .classifier import classify_emails, apply_attachment_rule
from .document_parser import read_attachment
from .document_ai import extract_document_with_ai, extract_pdf_with_ai
from .normalizer import normalize_fields
from .comparator import compare_documents
from .db import upsert_email, upsert_comparison


# Valid values for the `review_reason` enum in Supabase.
# Keep in sync with:  select enumlabel from pg_enum ...
VALID_REVIEW_REASONS = {
    "MISSING_SI",
    "MISSING_BL",
    "INVALID_FORMAT",
    "MISSING_DATA",
    None,
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# ─────────────────────────────────────────────────────────────
#  EXTRACTION OF ONE ATTACHMENT
# ─────────────────────────────────────────────────────────────
def _extract_one(filename: str, data: bytes) -> dict:
    """
    Run one attachment through extraction.

    Returns the raw Gemini dict (flat, your document_ai.py shape):
      {"document_type": "SI", "shipper": ..., ...}
    or an UNREADABLE marker dict.
    """
    print(f"    → extracting {filename} ({len(data)} bytes)")

    try:
        text = read_attachment(data, filename)
        print(f"    → text extracted: {len(text)} chars")

        result = extract_document_with_ai(
            document_text=text,
            document_type="UNREADABLE",
        )

        print(f"    → Gemini said document_type = {result.get('document_type')!r}")
        return result

    except Exception as exc:
        err = f"{type(exc).__name__}: {exc}"
        print(f"    → text extraction FAILED: {err}")

        # Non-PDF → no visual fallback possible
        if not filename.lower().endswith(".pdf"):
            return {
                "document_type": "UNREADABLE",
                "status": "UNREADABLE",
                "error": err,
            }

        # Corrupted PDF → don't waste quota
        if any(k in err for k in (
            "EOF marker not found",
            "Stream has ended unexpectedly",
            "PdfStreamError",
        )):
            print("    → PDF appears corrupted, skipping Gemini fallback")
            return {
                "document_type": "UNREADABLE",
                "status": "UNREADABLE",
                "error": err,
            }

        # Scanned / image PDF → send bytes to Gemini visually
        print("    → trying Gemini PDF visual extraction")
        tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        try:
            tmp.write(data)
            tmp.close()
            result = extract_pdf_with_ai(
                pdf_path=Path(tmp.name),
                document_type="UNREADABLE",
            )
            print(f"    → Gemini said document_type = {result.get('document_type')!r}")
            return result
        finally:
            Path(tmp.name).unlink(missing_ok=True)


# ─────────────────────────────────────────────────────────────
#  MAIN PIPELINE
# ─────────────────────────────────────────────────────────────
def process_email(
    email: dict,
    attachments: list[tuple[str, bytes]],
    *,
    persist: bool = True,
    category: str | None = None,
) -> dict:
    """
    email:       {email_id, from_address, subject, body, received_at}
    attachments: [(filename, bytes), ...]
    category:    optional pre-computed category (skips the classifier call)
    returns:     {email: {...}, comparison: {...} | None}
    """
    email_id = email["email_id"]
    attachment_names = [n for n, _ in attachments]

    print("=" * 70)
    print(f"PROCESSING {email_id}")
    print(f"  attachments received: {len(attachments)}")
    for n, d in attachments:
        print(f"    - {n} ({len(d)} bytes)")
    print("=" * 70)

    # ── 1) CLASSIFY ───────────────────────────────────────
    if category is None:
        print("  [1/4] classifying...")
        classification = classify_emails([{
            "email_id":    email_id,
            "subject":     email.get("subject", ""),
            "body":        email.get("body", ""),
            "attachments": attachment_names,
        }])
        classification = apply_attachment_rule(
            [{"email_id": email_id, "attachments": attachment_names}],
            classification,
        )
        category = classification[email_id]

    print(f"  [1/4] category = {category}")

    # ── 2) EXTRACT + 3) NORMALIZE + 4) COMPARE ───────────
    comparison = None

    if category == "BL_COMPARISON":
        si_doc = None
        bl_doc = None
        si_file = None
        bl_file = None

        print("  [2/4] extracting attachments...")
        for name, data in attachments:
            result = _extract_one(name, data)
            dt = result.get("document_type")

            if dt == "SI" and si_doc is None:
                si_doc, si_file = result, name
            elif dt == "BL" and bl_doc is None:
                bl_doc, bl_file = result, name

        print("  [2/4] extraction results:")
        print(f"        SI: {si_file or '(none detected)'}")
        print(f"        BL: {bl_file or '(none detected)'}")

        # If neither SI nor BL was identified, this email is not something
        # we can compare. Fail loudly in development; swap to a NEEDS_REVIEW
        # row before shipping.
        if si_doc is None and bl_doc is None:
            raise ValueError(
                f"{email_id}: no SI or BL document detected in attachments "
                f"{attachment_names}. Check the Gemini output above to see "
                f"what document_type it returned for each file."
            )

        # Pick review_reason from the enum
        if si_doc is None:
            reason = "MISSING_SI"
        elif bl_doc is None:
            reason = "MISSING_BL"
        else:
            reason = None

        if si_doc and bl_doc:
            print("  [3/4] normalizing...")
            si_norm = normalize_fields(si_doc)
            bl_norm = normalize_fields(bl_doc)

            print("  [4/4] comparing...")
            cmp_result = compare_documents(si_norm, bl_norm)
            print(f"        status        = {cmp_result['status']}")
            print(f"        defect_fields = {cmp_result['defect_fields']}")
            print(f"        review_fields = {cmp_result['review_fields']}")

            comparison = {
                "email_id":      email_id,
                "si_file":       si_file,
                "bl_file":       bl_file,
                "status":        cmp_result["status"],
                "review_reason": None,
                "defect_fields": cmp_result["defect_fields"],
                "review_fields": cmp_result["review_fields"],
                "si_fields":     si_norm,
                "bl_fields":     bl_norm,
                "updated_at":    _now(),
            }
        else:
            # Only one side present — record what we have, mark NEEDS_REVIEW
            print(f"  [3/4] skipping compare: {reason}")

            comparison = {
                "email_id":      email_id,
                "si_file":       si_file,
                "bl_file":       bl_file,
                "status":        "NEEDS_REVIEW",
                "review_reason": reason,
                "defect_fields": [],
                "review_fields": [],
                "si_fields":     normalize_fields(si_doc) if si_doc else None,
                "bl_fields":     normalize_fields(bl_doc) if bl_doc else None,
                "updated_at":    _now(),
            }
    else:
        print("  [2-4/4] skipped (not BL_COMPARISON)")

    # ── 5) BUILD EMAIL ROW ────────────────────────────────
    email_row = {
        "email_id":      email_id,
        "from_address":  email.get("from_address"),
        "subject":       email.get("subject", ""),
        "body":          email.get("body", ""),
        "received_at":   email.get("received_at"),
        "attachments":   attachment_names,
        "category":      category,
        "status":        "OK",
        "review_reason": None,
        "defect_fields": [],
        "has_defect":    False,
        "updated_at":    _now(),
    }

    if comparison is not None:
        email_row["status"]        = comparison["status"]
        email_row["defect_fields"] = comparison["defect_fields"]
        email_row["has_defect"]    = (
            comparison["status"] == "MISMATCH"
            and len(comparison["defect_fields"]) > 0
        )
        email_row["review_reason"] = comparison.get("review_reason")

    # Safety check before hitting Supabase
    if email_row["review_reason"] not in VALID_REVIEW_REASONS:
        raise ValueError(
            f"Invalid review_reason {email_row['review_reason']!r}. "
            f"Valid: {sorted(r for r in VALID_REVIEW_REASONS if r)}"
        )

    # ── 6) PERSIST ────────────────────────────────────────
    if persist:
        print("  [persist] writing to Supabase...")
        upsert_email(email_row)
        if comparison is not None:
            upsert_comparison(comparison)
        print("  [persist] done.")
    else:
        print("  [persist] skipped (persist=False)")
        print("  email_row  =", json.dumps(email_row, indent=2, default=str))
        if comparison:
            print("  comparison =", json.dumps(comparison, indent=2, default=str))

    print("=" * 70)
    print()

    return {"email": email_row, "comparison": comparison}