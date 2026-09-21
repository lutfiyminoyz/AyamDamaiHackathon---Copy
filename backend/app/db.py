from __future__ import annotations
from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

_client: Client | None = None

def get_supabase() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise RuntimeError("Supabase env vars not configured.")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client

def upsert_email(row: dict) -> None:
    get_supabase().table("emails").upsert(
        row, on_conflict="email_id"
    ).execute()

def upsert_comparison(row: dict) -> None:
    get_supabase().table("document_comparisons").upsert(
        row, on_conflict="email_id"
    ).execute()


# ── NEW ─────────────────────────────────────────────────────
def next_email_id() -> str:
    """Atomic sequence-backed email id generator."""
    resp = get_supabase().rpc("next_email_id").execute()
    return resp.data

def download_attachment(path: str) -> bytes:
    """
    Download a file from the `attachments` bucket.
    `path` is the full key inside the bucket, e.g.
       "batch_9f2c.../test_SI.pdf"
    Returns raw bytes.
    """
    return get_supabase().storage.from_("attachments").download(path)