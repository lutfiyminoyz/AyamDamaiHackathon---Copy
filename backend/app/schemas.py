from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

FIELDS = [
    "shipper", "consignee", "notify_party",
    "port_of_loading", "port_of_discharge",
    "container_count", "gross_weight_kg",
]

class IncomingEmail(BaseModel):
    email_id: str
    from_address: Optional[str] = None
    subject: str = ""
    body: str = ""
    received_at: Optional[str] = None

class EmailRow(BaseModel):
    email_id: str
    from_address: Optional[str]
    subject: str
    body: str
    received_at: Optional[str]
    attachments: List[str]
    category: str
    status: str
    review_reason: Optional[str]
    defect_fields: List[str]
    has_defect: bool
    updated_at: str

class ComparisonRow(BaseModel):
    email_id: str
    si_file: Optional[str]
    bl_file: Optional[str]
    status: str
    review_reason: Optional[str]
    defect_fields: List[str]
    review_fields: List[str]
    si_fields: Optional[Dict[str, Any]]
    bl_fields: Optional[Dict[str, Any]]
    updated_at: str