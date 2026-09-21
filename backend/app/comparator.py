from __future__ import annotations
from .normalizer import COMPARISON_FIELDS

def compare_documents(si: dict, bl: dict) -> dict:
    defects, review_fields = [], []

    for field in COMPARISON_FIELDS:
        si_value = si.get(field)
        bl_value = bl.get(field)

        if si_value is None and bl_value is None:
            review_fields.append(field); continue
        if si_value is None or bl_value is None:
            review_fields.append(field); continue
        if si_value != bl_value:
            defects.append(field)

    if defects:       status = "MISMATCH"
    elif review_fields: status = "NEEDS_REVIEW"
    else:              status = "OK"

    return {
        "status": status,
        "defect_fields": defects,
        "review_fields": review_fields,
    }