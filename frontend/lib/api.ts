import { corpusStats as mockCorpusStats, mockEmails } from "./mock-data";
import { supabase } from "./supabase";
import type { ComparisonFieldRow,DocumentComparisonRow, EmailRow } from "./supabase-types";
import type { EmailRecord } from "./types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/* ------------------------------------------------------------------ */
/* Row → domain mappers                                                */
/* ------------------------------------------------------------------ */

function toEmailRecord(row: EmailRow): EmailRecord {
  return {
    email_id: row.email_id,
    from: row.from_address,
    subject: row.subject,
    body: row.body,
    attachments: row.attachments ?? [],
    received_at: row.received_at,
    classification: {
      category: row.category,
      status: row.status,
      review_reason: row.review_reason,
      defect_fields: row.defect_fields ?? [],
      has_defect: row.has_defect,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Emails                                                              */
/* ------------------------------------------------------------------ */

export async function getEmails(): Promise<EmailRecord[]> {
  if (USE_MOCK) return mockEmails;

  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .order("received_at", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data as EmailRow[]).map(toEmailRecord);
}

export async function getEmailById(
  emailId: string,
): Promise<EmailRecord | null> {
  if (USE_MOCK) {
    return mockEmails.find((email) => email.email_id === emailId) ?? null;
  }

  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("email_id", emailId)
    .maybeSingle();

  if (error) throw error;
  return data ? toEmailRecord(data as EmailRow) : null;
}

/* ------------------------------------------------------------------ */
/* Comparison fields — used by the (upcoming) comparison page          */
/* ------------------------------------------------------------------ */

export async function getComparisonFields(
  emailId: string,
): Promise<ComparisonFieldRow[]> {
  if (USE_MOCK) return [];

  const { data, error } = await supabase
    .from("comparison_fields")
    .select("*")
    .eq("email_id", emailId);

  if (error) throw error;
  return (data ?? []) as ComparisonFieldRow[];
}
export async function getDocumentComparison(
  emailId: string,
): Promise<DocumentComparisonRow | null> {
  if (USE_MOCK) return null;

  const { data, error } = await supabase
    .from("document_comparisons")
    .select("*")
    .eq("email_id", emailId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as DocumentComparisonRow;

  return {
    ...row,
    si_fields:
      typeof row.si_fields === "string"
        ? JSON.parse(row.si_fields)
        : row.si_fields,
    bl_fields:
      typeof row.bl_fields === "string"
        ? JSON.parse(row.bl_fields)
        : row.bl_fields,
  };
}
export function getAttachmentUrl(filename: string): string {
  const storagePath = filename.startsWith("attachments/")
    ? filename.slice("attachments/".length)
    : filename;

  const { data } = supabase.storage
    .from("attachments")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/* ------------------------------------------------------------------ */
/* Dashboard aggregates                                                */
/* ------------------------------------------------------------------ */
/*                                                                     */
/* For now this still uses the mock corpus. When you want real numbers */
/* from Supabase, create a Postgres view or RPC — see the note below.  */
/* ------------------------------------------------------------------ */

export async function getCorpusStats(): Promise<typeof mockCorpusStats> {
  if (USE_MOCK) return mockCorpusStats;

  const { data, error } = await supabase
    .from("emails")
    .select("category, status, review_reason, defect_fields");

  if (error) throw error;

  const rows = data ?? [];

  const byCategory = {
    BL_COMPARISON: 0,
    SI_REQUEST: 0,
    INVOICE_QUERY: 0,
    GENERAL: 0,
    SPAM: 0,
  };

  const byStatus = {
    OK: 0,
    MISMATCH: 0,
    NEEDS_REVIEW: 0,
  };

  const defectFields = {
    container_count: 0,
    port_of_discharge: 0,
    gross_weight_kg: 0,
    notify_party: 0,
    consignee: 0,
    shipper: 0,
    port_of_loading: 0,
  };
  const reviewReasons = {
    wrong_doc_type: 0,
    missing_attachment: 0,
    unreadable: 0,
    missing_value: 0,
  };

  for (const row of rows) {
    byCategory[row.category as keyof typeof byCategory]++;
    byStatus[row.status as keyof typeof byStatus]++;

    for (const field of row.defect_fields ?? []) {
      const key = field as keyof typeof defectFields;
      defectFields[key]++;
    }

    if (row.review_reason) {
      const key = row.review_reason as keyof typeof reviewReasons;
      reviewReasons[key]++;
    }
  }

  return {
    total: rows.length,
    byCategory,
    byStatus,
    defectFields,
    reviewReasons,
  };
}