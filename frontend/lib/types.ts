export type EmailCategory =
  | "BL_COMPARISON"
  | "SI_REQUEST"
  | "INVOICE_QUERY"
  | "GENERAL"
  | "SPAM";

export type VerificationStatus = "OK" | "MISMATCH" | "NEEDS_REVIEW";

export type ReviewReason =
  | "wrong_doc_type"
  | "missing_attachment"
  | "unreadable"
  | "missing_value";

export type ComparisonFieldKey =
  | "shipper"
  | "consignee"
  | "notify_party"
  | "port_of_loading"
  | "port_of_discharge"
  | "container_count"
  | "gross_weight_kg";

/** Raw email record — matches email_XXX.json files. */
export interface Email {
  email_id: string;
  from: string;
  subject: string;
  body: string;
  /** Relative paths to attachments, e.g. "attachments/email_001_SI.txt" */
  attachments: string[];
  /** Optional — populated if the source mail server provides a timestamp. */
  received_at?: string | null;
}

/** Classification entry — matches the classification map. */
export interface Classification {
  category: EmailCategory;
  status: VerificationStatus;
  review_reason: ReviewReason | null;
  defect_fields: ComparisonFieldKey[];
  has_defect: boolean;
}

/** What the UI actually consumes: email + its classification. */
export interface EmailRecord extends Email {
  classification: Classification;
}