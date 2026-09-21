from __future__ import annotations

import json
from google import genai

from .config import GEMINI_API_KEY, GEMINI_MODEL

client = genai.Client(api_key=GEMINI_API_KEY)

CATEGORIES = [
    "BL_COMPARISON",
    "SI_REQUEST",
    "INVOICE_QUERY",
    "GENERAL",
    "SPAM",
]

CLASSIFIER_PROMPT = """
You are an email classifier for a shipping documentation operations team.

Classify EVERY email into EXACTLY ONE of these categories:

1. BL_COMPARISON
The email involves checking, comparing, verifying, reviewing, confirming,
or validating shipping documents.

This includes emails where:
- A Shipping Instruction (SI) and/or Bill of Lading (BL) is attached.
- The sender asks to check or confirm documents.
- The sender provides documents for review.
- The email asks whether the shipping document details are correct.
- The email asks for document verification before finalization.

If an email contains attachments that appear to be shipping/documentation
files, strongly consider BL_COMPARISON when the email is related to
shipping document processing.

2. SI_REQUEST
The email is specifically requesting, sending, asking for, or discussing
Shipping Instructions without an intent to review or compare shipping
documents.

An email should NOT be classified as SI_REQUEST if it is clearly asking
the recipient to check, verify, confirm, or review an attached shipping
document.

3. INVOICE_QUERY
The email is about invoices, billing, charges, payment, local charges,
THC, freight charges, or other financial/documentation charges.

4. GENERAL
General operational or shipping communication that does not belong
to the categories above.

5. SPAM
Clearly irrelevant, unsolicited, promotional, malicious, or suspicious email.

IMPORTANT CLASSIFICATION RULES:

- Focus on the meaning of the email, not only the subject.
- The subject may be misleading.
- Consider the email body AND attachment filenames.
- Shipping-document attachments are a strong signal that the email is
  part of a document verification workflow.
- If the email asks the recipient to check, verify, confirm, review,
  or validate attached shipping documents, classify it as BL_COMPARISON.
- Do not classify an email as SI_REQUEST when it is actually asking for
  document checking or confirmation.
- An attachment alone does not automatically prove BL_COMPARISON;
  use the email context as well.
- INVOICE_QUERY takes priority when the main purpose of the email is
  clearly an invoice or charge-related question.
- Return exactly one category for every email.

Return ONLY valid JSON.

The response must have this exact structure:

{
  "classifications": [
    {
      "email_id": "email_001",
      "category": "BL_COMPARISON"
    }
  ]
}

Include exactly one classification for every email provided.
"""


def classify_emails(emails: list[dict]) -> dict[str, str]:
    """
    Classify multiple emails in one Gemini request.
    Returns:
        {
            "email_001": "BL_COMPARISON",
            "email_002": "INVOICE_QUERY"
        }
    """

    email_blocks = []

    for email in emails:
        email_id = email.get("email_id", "")
        subject = email.get("subject", "")
        body = email.get("body", "")
        attachments = email.get("attachments", [])

        attachment_names = "\n".join(
            f"- {attachment}" for attachment in attachments
        )

        email_blocks.append(
            f"""
EMAIL ID: {email_id}

Subject:
{subject}

Body:
{body}

Attachments:
{attachment_names if attachment_names else "None"}

------------------------------
"""
        )

    prompt = CLASSIFIER_PROMPT + "\n".join(email_blocks)

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config={
            "response_mime_type": "application/json",
        },
    )

    result = json.loads(response.text)
    classifications = result.get("classifications", [])

    output = {}

    for item in classifications:
        email_id = item.get("email_id")
        category = item.get("category")

        if category not in CATEGORIES:
            raise ValueError(
                f"Invalid category for {email_id}: {category}"
            )

        output[email_id] = category

    expected_ids = {email["email_id"] for email in emails}
    returned_ids = set(output.keys())
    missing_ids = expected_ids - returned_ids

    if missing_ids:
        raise ValueError(
            f"Gemini did not classify these emails: {sorted(missing_ids)}"
        )

    return output


def apply_attachment_rule(
    emails: list[dict],
    classifications: dict[str, str],
) -> dict[str, str]:
    for email in emails:
        email_id = email["email_id"]
        category = classifications[email_id]
        attachments = email.get("attachments", [])

        # If Gemini predicted SI_REQUEST but the email
        # contains an attachment, treat it as BL_COMPARISON.
        if category == "SI_REQUEST" and attachments:
            classifications[email_id] = "BL_COMPARISON"

    return classifications