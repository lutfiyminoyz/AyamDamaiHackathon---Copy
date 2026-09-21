from __future__ import annotations
import re

COMPARISON_FIELDS = [
    "shipper", "consignee", "notify_party",
    "port_of_loading", "port_of_discharge",
    "container_count", "gross_weight_kg",
]

def normalize_text(value):
    if value is None: return None
    value = str(value).upper().strip()
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[.,]", "", value)
    return value

def normalize_entity(value):
    if value is None: return None
    value = normalize_text(value)
    value = value.split(" T. ")[0]
    value = value.split(" TEL ")[0]
    value = value.split(" PHONE ")[0]
    return value.strip()

def normalize_port(value):
    if value is None: return None
    value = normalize_text(value)
    value = re.sub(r"\s*\([A-Z0-9]{5}\)\s*$", "", value)
    return value.strip()

def normalize_container_count(value):
    if value is None: return None
    m = re.search(r"(\d+)", str(value).replace(",", ""))
    return int(m.group(1)) if m else None

def normalize_weight_kg(value):
    if value is None: return None
    s = str(value).upper().replace(",", "").strip()
    if not re.search(r"\d", s): return None
    m = re.search(r"(\d+(?:\.\d+)?)\s*(KG|KGS|MT|TONS?|LB|LBS)?", s)
    if not m: return None
    number = float(m.group(1))
    unit = m.group(2) or "KG"
    if unit in {"MT", "TON", "TONS"}: number *= 1000
    elif unit in {"LB", "LBS"}: number *= 0.45359237
    return round(number, 6)

def normalize_fields(fields):
    return {
        "shipper":            normalize_entity(fields.get("shipper")),
        "consignee":          normalize_entity(fields.get("consignee")),
        "notify_party":       normalize_entity(fields.get("notify_party")),
        "port_of_loading":    normalize_port(fields.get("port_of_loading")),
        "port_of_discharge":  normalize_port(fields.get("port_of_discharge")),
        "container_count":    normalize_container_count(fields.get("container_count")),
        "gross_weight_kg":    normalize_weight_kg(fields.get("gross_weight_kg")),
    }