from __future__ import annotations


def correct_category(category: str, subject: str = "", body: str = "") -> str:
    text = f"{subject} {body}".lower()

    # Explicit request to send the draft BL for checking
    if "please assist to send the draft bl" in text:
        return "BL_COMPARISON"

    # General documentation reminder / outstanding shipment summary
    if (
        "update summary" in text
        and "submit si & aed" in text
        and "pending shipments" in text
    ):
        return "GENERAL"

    return category