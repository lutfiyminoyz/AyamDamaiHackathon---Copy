import type {
  ComparisonFieldKey,
  EmailCategory,
  ReviewReason,
  VerificationStatus,
} from "./types";

export type DbFieldStatus = "MATCH" | "MISMATCH" | "MISSING" | "LOW_CONFIDENCE";

export interface EmailRow {
  email_id: string;
  from_address: string;
  subject: string;
  body: string;
  received_at: string | null;
  attachments: string[];
  category: EmailCategory;
  status: VerificationStatus;
  review_reason: ReviewReason | null;
  defect_fields: ComparisonFieldKey[];
  has_defect: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComparisonFieldRow {
  email_id: string;
  field: ComparisonFieldKey;
  si_value: string | null;
  bl_value: string | null;
  status: DbFieldStatus;
}

export interface DocumentComparisonRow {
  email_id: string;
  si_file: string | null;
  bl_file: string | null;
  status: VerificationStatus;
  review_reason: ReviewReason | null;
  defect_fields: ComparisonFieldKey[];
  review_fields: ComparisonFieldKey[];
  si_fields: Record<string, string | null>;
  bl_fields: Record<string, string | null>;
  created_at: string;
  updated_at: string;
}