from __future__ import annotations

import json
import time
import warnings
from pathlib import Path

from google import genai

from .config import GEMINI_API_KEY, GEMINI_MODEL

# Silence the AFC deprecation warning — we don't use function calling.
warnings.filterwarnings("ignore", message=".*automatic function calling.*")

client = genai.Client(api_key=GEMINI_API_KEY)


DOCUMENT_EXTRACTION_PROMPT = """
You are a document extraction AI for a shipping documentation
operations system.

Extract structured information from the provided shipping document.

The document may be:
- Shipping Instruction (SI)
- Bill of Lading (BL)
- Invoice
- Packing List
- Certificate
- Other shipping document

IMPORTANT:
The document may be a scanned PDF or an image-based document.
Carefully inspect the visual content of the document.

Extract ONLY information that is actually present.

Do NOT guess or invent missing values.

Return ONLY valid JSON using exactly this structure:

{{
  "document_type": null,
  "shipper": null,
  "consignee": null,
  "notify_party": null,
  "port_of_loading": null,
  "port_of_discharge": null,
  "container_count": null,
  "gross_weight_kg": null,
  "vessel": null,
  "voyage": null,
  "container_numbers": [],
  "seal_numbers": [],
  "commodity": null
}}

Rules:

- document_type must be one of:
  "SI", "BL", "INVOICE", "PACKING_LIST",
  "CERTIFICATE", "OTHER", or "UNREADABLE".

- gross_weight_kg must be a number in kilograms.
- If weight is given in MT or tons, convert it to kilograms.
- If weight is given in LB or LBS, convert it to kilograms.
- container_count must be a number when available.
- container_numbers must always be an array.
- seal_numbers must always be an array.
- Missing values must be null.
- Never guess missing information.

- For shipper, consignee, and notify_party:
  extract the company/person name only.
  Do not include street addresses, phone numbers,
  email addresses, or other contact details.

- For port_of_loading and port_of_discharge:
  preserve the port name and location code if present.

- Preserve actual business names and locations as written.

- Carefully distinguish visually similar characters such as:
  O/0, I/1, S/5, B/8.

- If a value is unclear and cannot be reliably determined,
  return null rather than guessing.

DOCUMENT TYPE DETECTED BY THE SYSTEM:
{document_type}

DOCUMENT CONTENT:
{document_text}
"""


# ─────────────────────────────────────────────────────────────
#  RETRY HELPER
# ─────────────────────────────────────────────────────────────
RETRYABLE_KEYWORDS = (
    "503", "UNAVAILABLE",
    "429", "RESOURCE_EXHAUSTED",
    "500", "INTERNAL",
    "502", "504",
    "overloaded", "high demand",
)


def _is_retryable(err: Exception) -> bool:
    s = str(err)
    return any(k.lower() in s.lower() for k in RETRYABLE_KEYWORDS)


def _call_with_retry(fn, *args, max_attempts: int = 4, **kwargs):
    """
    Run a Gemini call with exponential backoff on transient errors.
    Attempt delays: 1s, 2s, 4s, 8s.
    """
    last_exc = None
    for attempt in range(1, max_attempts + 1):
        try:
            return fn(*args, **kwargs)
        except Exception as exc:
            last_exc = exc
            if not _is_retryable(exc) or attempt == max_attempts:
                raise
            delay = 2 ** (attempt - 1)
            print(f"    [retry] attempt {attempt} failed "
                  f"({type(exc).__name__}), sleeping {delay}s...")
            time.sleep(delay)
    raise last_exc


# ─────────────────────────────────────────────────────────────
#  TEXT MODE
# ─────────────────────────────────────────────────────────────
def extract_document_with_ai(
    document_text: str,
    document_type: str,
) -> dict:
    if not document_text or not document_text.strip():
        raise ValueError("Document text is empty")

    prompt = DOCUMENT_EXTRACTION_PROMPT.format(
        document_type=document_type,
        document_text=document_text,
    )

    print("    ┌─── GEMINI TEXT-MODE REQUEST ───")
    print(f"    │ model              : {GEMINI_MODEL}")
    print(f"    │ document_type hint : {document_type!r}")
    print(f"    │ text length sent   : {len(document_text)} chars")
    print(f"    │ first 200 chars    : {document_text[:200]!r}")
    print("    └────────────────────────────────")

    def _do_call():
        return client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )

    response = _call_with_retry(_do_call)

    print("    ┌─── GEMINI TEXT-MODE RAW RESPONSE ───")
    print(f"    │ {response.text!r}")
    print("    └─────────────────────────────────────")

    return json.loads(response.text)


# ─────────────────────────────────────────────────────────────
#  PDF VISUAL MODE
# ─────────────────────────────────────────────────────────────
def extract_pdf_with_ai(
    pdf_path: str | Path,
    document_type: str = "UNREADABLE",
) -> dict:
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    print(f"    Uploading PDF to Gemini: {pdf_path.name}")

    def _do_upload():
        return client.files.upload(file=str(pdf_path))

    uploaded_file = _call_with_retry(_do_upload)
    print(f"    Gemini file uploaded: {uploaded_file.name}")

    prompt = DOCUMENT_EXTRACTION_PROMPT.format(
        document_type=document_type,
        document_text=(
            "The document is provided as a PDF file. "
            "Inspect the PDF visually, including scanned pages. "
            "Extract the requested fields directly from the document. "
            "Do not rely on an OCR text layer."
        ),
    )

    def _do_interact():
        return client.interactions.create(
            model=GEMINI_MODEL,
            input=[
                {
                    "type": "document",
                    "uri": uploaded_file.uri,
                    "mime_type": uploaded_file.mime_type,
                },
                {"type": "text", "text": prompt},
            ],
        )

    interaction = _call_with_retry(_do_interact)

    print("    ┌─── GEMINI PDF-MODE RAW RESPONSE ───")
    print(f"    │ {interaction.output_text!r}")
    print("    └────────────────────────────────────")

    raw_output = interaction.output_text.strip()

    if raw_output.startswith("```"):
        raw_output = raw_output.replace("```json", "", 1)
        raw_output = raw_output.replace("```", "", 1)
        raw_output = raw_output.strip()

    result = json.loads(raw_output)
    print("    Gemini PDF extraction successful.")
    return result