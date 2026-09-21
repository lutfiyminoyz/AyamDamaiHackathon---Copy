from __future__ import annotations
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY      = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL        = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

SUPABASE_URL        = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY        = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

INBOX_DIR           = Path(os.getenv("INBOX_DIR", "./data/inbox"))
ATTACHMENTS_DIR     = Path(os.getenv("ATTACHMENTS_DIR", "./data/attachments"))