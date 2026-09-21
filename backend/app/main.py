from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .pipeline import process_email
from .db import next_email_id, download_attachment
from .config import INBOX_DIR, ATTACHMENTS_DIR


app = FastAPI(title="SDOC AI Pipeline", version="1.1.0")

# ── CORS ────────────────────────────────────────────────────
# In dev, allow everything. In prod, restrict to your Next.js origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # "https://your-frontend.vercel.app",   # add production here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# ─────────────────────────────────────────────────────────────
#  EXISTING ENDPOINT — direct multipart upload
# ─────────────────────────────────────────────────────────────
@app.post("/api/process")
async def process_endpoint(
    from_address: str = Form(""),
    subject: str = Form(""),
    body: str = Form(""),
    received_at: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
):
    email_id = next_email_id()

    attachments = [(f.filename or "attachment", await f.read()) for f in files]
    email = {
        "email_id":     email_id,
        "from_address": from_address,
        "subject":      subject,
        "body":         body,
        "received_at":  received_at,
    }
    try:
        result = process_email(email, attachments)
        return JSONResponse(result)
    except Exception as exc:
        return JSONResponse(
            {"error": f"{type(exc).__name__}: {exc}"}, status_code=500
        )


# ─────────────────────────────────────────────────────────────
#  NEW ENDPOINT — files already in Supabase Storage
# ─────────────────────────────────────────────────────────────
class StorageProcessRequest(BaseModel):
    from_address: Optional[str] = None
    subject: str = ""
    body: str = ""
    received_at: Optional[str] = None
    # Each item: {"path": "batch_x/test_SI.pdf", "filename": "test_SI.pdf"}
    attachments: List[dict] = []


@app.post("/api/process-from-storage")
async def process_from_storage(req: StorageProcessRequest):
    """
    Frontend already uploaded files to the `attachments` bucket.
    We download each by its storage path, run the pipeline,
    then write to `emails` + `document_comparisons`.
    """
    email_id = next_email_id()

    # Download every attachment
    downloaded: list[tuple[str, bytes]] = []
    for item in req.attachments:
        path = item.get("path")
        filename = item.get("filename") or Path(path).name
        if not path:
            continue
        try:
            data = download_attachment(path)
            downloaded.append((filename, data))
        except Exception as exc:
            return JSONResponse(
                {"error": f"Failed to download {path}: {exc}"},
                status_code=500,
            )

    email = {
        "email_id":     email_id,
        "from_address": req.from_address,
        "subject":      req.subject,
        "body":         req.body,
        "received_at":  req.received_at,
    }

    try:
        result = process_email(email, downloaded, persist=True)
        return JSONResponse(result)
    except Exception as exc:
        return JSONResponse(
            {"error": f"{type(exc).__name__}: {exc}"}, status_code=500
        )


# ─────────────────────────────────────────────────────────────
#  CLI batch mode — unchanged
# ─────────────────────────────────────────────────────────────
def _run_batch():
    if not INBOX_DIR.exists():
        print(f"Inbox dir not found: {INBOX_DIR}")
        return
    files = sorted(p for p in INBOX_DIR.iterdir() if p.suffix == ".json")
    print(f"Found {len(files)} emails in {INBOX_DIR}")
    for i, email_file in enumerate(files, 1):
        email = json.loads(email_file.read_text(encoding="utf-8"))
        email_id = email["email_id"]
        att_names = email.get("attachments", []) or []
        att_pairs = []
        for name in att_names:
            path = ATTACHMENTS_DIR / name
            if path.exists():
                att_pairs.append((name, path.read_bytes()))
        print(f"[{i}/{len(files)}] {email_id} → {len(att_pairs)} attachment(s)")
        try:
            result = process_email(email, att_pairs)
            print(f"   category={result['email']['category']} "
                  f"status={result['email']['status']}")
        except Exception as exc:
            print(f"   ERROR: {type(exc).__name__}: {exc}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "batch":
        _run_batch()