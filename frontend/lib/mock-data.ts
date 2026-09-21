import type {
  Classification,
  ComparisonFieldKey,
  Email,
  EmailCategory,
  EmailRecord,
  ReviewReason,
  VerificationStatus,
} from "./types";

/* ------------------------------------------------------------------ */
/* Emails — a representative slice of the 520-message corpus.         */
/* email_001 and email_002 use the exact payloads you supplied.       */
/* ------------------------------------------------------------------ */

const EMAILS: Email[] = [
  {
    email_id: "email_001",
    from: "aziztz@safqa.co.ke",
    subject:
      "TO CONFIRM DOCS _ 5RSG-00133 _ CALLAO_PERU _ MOORIM SP CO., LTD _ MEDUUD104332",
    body: `Hi Najiha,

Attached are the SI and draft BL for OC 5RSG-00133 (PAPERONE DIGITAL COPIER PAPER). Please check the details and confirm.

Best Regards,
Willy Situmorang
Shipping Documentation
DID : +971 04 4938289
APRIL Fine Paper Trading (Middle East) Fze
#813, 4 EA, Dubai Airport Free Zone
P.O. Box : 293775, Dubai, United Arab Emirates
Website : www.aprilasia.com | www.paperone.com`,
    attachments: [
      "attachments/email_001_SI.txt",
      "attachments/email_001_BL.txt",
    ],
    received_at: "2026-03-12T09:41:00Z",
  },
  {
    email_id: "email_002",
    from: "nirmala@fujitogrp.com",
    subject:
      "RE_ LOCAL CHARGES FOB - KARGOSMAR - 5AKR-61849 - TELEX RELEASE CHARGES",
    body: `Hi,

Query on invoice 5250075931: is the THC / local charge included or billed separately? Please advise the breakdown.

Best Regards,
Najiha Nur Hanna
Shipping Documentation
DID : +971 04 4938281
APRIL Fine Paper Trading (Middle East) Fze
#813, 4 EA, Dubai Airport Free Zone
P.O. Box : 293775, Dubai, United Arab Emirates
Website : www.aprilasia.com | www.paperone.com

______________________________
From: Hari Mardianto <hari_mardianto@aprilasia.com>
Sent: Friday, December 15, 2026 7:50 AM
Subject: RE: 5AKR-61849

Please follow the previous instruction. Thank you.`,
    attachments: [],
    received_at: "2026-03-12T08:15:00Z",
  },
  {
    email_id: "email_003",
    from: "ops@novakopa.lv",
    subject: "DRAFT BL CHECK _ UAB NOVAKOPA _ 1x40HC _ CALLAO",
    body: `Hello,

Attached is the draft BL for the above shipment together with the SI we submitted last week.

Please run your check and let us know if anything needs correcting before we approve the draft.

Regards,
Operations
UAB Novakopa`,
    attachments: [
      "attachments/email_003_SI.txt",
      "attachments/email_003_BL.txt",
    ],
    received_at: "2026-03-12T07:52:00Z",
  },
  {
    email_id: "email_004",
    from: "docs@aprilfareast.com.my",
    subject: "BL DRAFT REVIEW _ MOORIM SP _ BUSAN _ 5AFE-20914",
    body: `Dear Najiha,

Please verify the attached draft BL against our SI for booking 5AFE-20914.

Cargo: paper products, 2 x 20'GP, Port Klang (Westport) to Busan.

We need confirmation before 17:00 today.

Thanks,
Documentation
April Far East (M) Sdn Bhd`,
    attachments: [
      "attachments/email_004_SI.txt",
      "attachments/email_004_BL.txt",
    ],
    received_at: "2026-03-12T06:30:00Z",
  },
  {
    email_id: "email_007",
    from: "docs@aprilfareast.com.my",
    subject: "REQUEST FOR SHIPPING INSTRUCTION _ BOOKING AFE-88213",
    body: `Dear Ops,

Please issue the Shipping Instruction for booking AFE-88213.

Cargo: 2 x 20'GP, Port Klang (Westport) to Busan, Korea.
Commodity: palm-based oleochemicals, non-hazardous.

We need the SI draft by Thursday so we can confirm the booking.

Thanks,
Documentation Team
April Far East (M) Sdn Bhd`,
    attachments: ["attachments/email_007_booking.pdf"],
    received_at: "2026-03-11T16:20:00Z",
  },
  {
    email_id: "email_013",
    from: "ops@kargosmar.com",
    subject: "BL DRAFT _ KARGOSMAR _ 5AKR-61849 _ CALLao",
    body: `Hi,

Draft BL attached. Please compare against SI before release.

Regards,
Kargosmar Ops`,
    attachments: [
      "attachments/email_013_SI.txt",
      "attachments/email_013_BL.txt",
    ],
    received_at: "2026-03-11T14:02:00Z",
  },
  {
    email_id: "email_031",
    from: "shipping@moorimsp.co.kr",
    subject: "DRAFT BL CONFIRMATION _ MOORIM SP _ 5MSP-11002",
    body: `Dear Team,

Please check the attached draft BL against our SI for shipment 5MSP-11002.

Kindly confirm weights and container count match.

Regards,
Moorim SP Shipping`,
    attachments: [
      "attachments/email_031_SI.txt",
      "attachments/email_031_BL.txt",
    ],
    received_at: "2026-03-11T11:48:00Z",
  },
  {
    email_id: "email_053",
    from: "admin@ayamdamai.com",
    subject: "Office closed 18-19 March (public holiday)",
    body: `Dear all,

Please note the office will be closed on 18 and 19 March for the public holiday. Document cut-off for that week moves to 17 March, 15:00.

Urgent BL releases should be flagged to the duty officer.

Admin`,
    attachments: [],
    received_at: "2026-03-11T09:10:00Z",
  },
  {
    email_id: "email_150",
    from: "promo@cheapfreightrates-now.biz",
    subject: "CHEAP SEA FREIGHT RATES!!! LIMITED TIME ONLY!!!",
    body: `Dear Sir/Madam,

We offer the LOWEST sea freight rates in the region. Click the link below to claim your discount today.

Act now — offer expires this week!

Unsubscribe`,
    attachments: [],
    received_at: "2026-03-11T06:02:00Z",
  },
  {
    email_id: "email_501",
    from: "unknown@safqa.co.ke",
    subject: "DOCS FOR REVIEW _ 5RSG-00999",
    body: `Hi,

Please see attached. This is what we have for the booking.

Regards`,
    attachments: ["attachments/email_501_scan.txt"],
    received_at: "2026-03-10T15:24:00Z",
  },
  {
    email_id: "email_506",
    from: "ops@novakopa.lv",
    subject: "BL CHECK _ 5NVK-20481 (refer previous)",
    body: `Hi,

Following up on the previous thread — please compare the BL with the SI we shared.

Regards`,
    attachments: ["attachments/email_506_BL.txt"],
    received_at: "2026-03-10T13:05:00Z",
  },
  {
    email_id: "email_511",
    from: "docs@aprilfareast.com.my",
    subject: "SI + BL _ LOW QUALITY SCAN",
    body: `Dear Ops,

Attached is the draft BL. Apologies, the scanner at our end produced a poor copy — the container count line is barely legible.

Please let us know if you need us to resend.

Regards,
Documentation`,
    attachments: ["attachments/email_511_BL_scan.pdf"],
    received_at: "2026-03-10T11:32:00Z",
  },
  {
    email_id: "email_516",
    from: "ops@kargosmar.com",
    subject: "DRAFT BL FOR VERIFICATION _ 5AKR-70311",
    body: `Hi,

Draft BL and SI attached for the Busan shipment.

Note our SI does not state a notify party for this booking — please confirm whether that is acceptable before we finalise.

Regards,
Kargosmar Ops`,
    attachments: [
      "attachments/email_516_SI.txt",
      "attachments/email_516_BL.txt",
    ],
    received_at: "2026-03-10T10:14:00Z",
  },
];

/* ------------------------------------------------------------------ */
/* Classification map — matches the classification file exactly.      */
/* ------------------------------------------------------------------ */

const CLASSIFICATIONS: Record<string, Classification> = {
  email_001: {
    category: "BL_COMPARISON",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_002: {
    category: "INVOICE_QUERY",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_003: {
    category: "BL_COMPARISON",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_004: {
    category: "BL_COMPARISON",
    status: "MISMATCH",
    review_reason: null,
    defect_fields: ["consignee", "notify_party"],
    has_defect: true,
  },
  email_007: {
    category: "SI_REQUEST",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_013: {
    category: "BL_COMPARISON",
    status: "MISMATCH",
    review_reason: null,
    defect_fields: ["port_of_discharge"],
    has_defect: true,
  },
  email_031: {
    category: "BL_COMPARISON",
    status: "MISMATCH",
    review_reason: null,
    defect_fields: ["container_count", "gross_weight_kg"],
    has_defect: true,
  },
  email_053: {
    category: "GENERAL",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_150: {
    category: "SPAM",
    status: "OK",
    review_reason: null,
    defect_fields: [],
    has_defect: false,
  },
  email_501: {
    category: "BL_COMPARISON",
    status: "NEEDS_REVIEW",
    review_reason: "wrong_doc_type",
    defect_fields: [],
    has_defect: false,
  },
  email_506: {
    category: "BL_COMPARISON",
    status: "NEEDS_REVIEW",
    review_reason: "missing_attachment",
    defect_fields: [],
    has_defect: false,
  },
  email_511: {
    category: "BL_COMPARISON",
    status: "NEEDS_REVIEW",
    review_reason: "unreadable",
    defect_fields: [],
    has_defect: false,
  },
  email_516: {
    category: "BL_COMPARISON",
    status: "NEEDS_REVIEW",
    review_reason: "missing_value",
    defect_fields: [],
    has_defect: false,
  },
};

export const mockEmails: EmailRecord[] = EMAILS.map((email) => ({
  ...email,
  classification: CLASSIFICATIONS[email.email_id],
})).filter((email) => email.classification !== undefined);

/* ------------------------------------------------------------------ */
/* Corpus aggregates — the full 520-message run.                       */
/* Used by the dashboard charts. Replace with live data later.         */
/* ------------------------------------------------------------------ */

export const corpusStats = {
  total: 520,
  byStatus: {
    OK: 454,
    MISMATCH: 46,
    NEEDS_REVIEW: 20,
  } satisfies Record<VerificationStatus, number>,
  byCategory: {
    BL_COMPARISON: 245,
    SI_REQUEST: 128,
    INVOICE_QUERY: 62,
    GENERAL: 55,
    SPAM: 30,
  } satisfies Record<EmailCategory, number>,
  defectFields: {
    container_count: 19,
    port_of_discharge: 14,
    gross_weight_kg: 12,
    notify_party: 8,
    consignee: 7,
    shipper: 7,
    port_of_loading: 6,
  } satisfies Record<ComparisonFieldKey, number>,
  reviewReasons: {
    wrong_doc_type: 5,
    missing_attachment: 5,
    unreadable: 5,
    missing_value: 5,
  } satisfies Record<ReviewReason, number>,
};

/* Human-friendly field labels for chart axes and table headers. */
export const FIELD_LABELS: Record<ComparisonFieldKey, string> = {
  shipper: "Shipper",
  consignee: "Consignee",
  notify_party: "Notify party",
  port_of_loading: "Port of loading",
  port_of_discharge: "Port of discharge",
  container_count: "Container count",
  gross_weight_kg: "Gross weight",
};

export const REVIEW_REASON_LABELS: Record<ReviewReason, string> = {
  wrong_doc_type: "Wrong document type",
  missing_attachment: "Missing attachment",
  unreadable: "Unreadable attachment",
  missing_value: "Missing required value",
};

export const CATEGORY_LABELS: Record<EmailCategory, string> = {
  BL_COMPARISON: "BL comparison",
  SI_REQUEST: "SI request",
  INVOICE_QUERY: "Invoice query",
  GENERAL: "General",
  SPAM: "Spam",
};

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  OK: "Cleared",
  MISMATCH: "Mismatch",
  NEEDS_REVIEW: "Needs review",
};