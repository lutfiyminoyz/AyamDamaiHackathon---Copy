import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { getDocumentComparison, getEmailById } from "@/lib/api";
import DocumentViewer from "@/components/email/DocumentViewer";

type PageProps = {
  params: Promise<{ id: string }>;
};

// Canonical field list — used as fallback when a side's fields are
// entirely missing (whole document not found).
const ALL_FIELDS = [
  "shipper",
  "consignee",
  "notify_party",
  "port_of_loading",
  "port_of_discharge",
  "vessel",
  "voyage",
  "container",
  "booking_number",
  "bill_of_lading_number",
];

const fieldLabels: Record<string, string> = {
  shipper: "Shipper",
  consignee: "Consignee",
  notify_party: "Notify Party",
  port_of_loading: "Port of Loading",
  port_of_discharge: "Port of Discharge",
  vessel: "Vessel",
  voyage: "Voyage",
  container: "Container",
  booking_number: "Booking Number",
  bill_of_lading_number: "Bill of Lading Number",
};

const getFieldLabel = (field: string) =>
  fieldLabels[field] ??
  field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

// Defensive: handles the case where si_fields/bl_fields come back from
// Supabase as a JSON string instead of a parsed object (e.g. if the
// column is `text` rather than `jsonb`, or got double-encoded on insert).
// Ideally this parsing lives in lib/api.ts's getDocumentComparison instead
// so every caller gets clean data — this is a safety net either way.
function parseFields(
  value: Record<string, unknown> | string | null | undefined,
): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      console.error("Failed to parse fields JSON:", value);
      return null;
    }
  }
  return value;
}

export default async function ComparisonPage({ params }: PageProps) {
  const { id } = await params;

  const [email, comparisonRaw] = await Promise.all([
    getEmailById(id),
    getDocumentComparison(id),
  ]);

  if (!email || !comparisonRaw) {
    return <div>Comparison data not found.</div>;
  }

  const siFields = parseFields(comparisonRaw.si_fields);
  const blFields = parseFields(comparisonRaw.bl_fields);
  const reviewFields = comparisonRaw.review_fields ?? [];
  const defectFields = comparisonRaw.defect_fields ?? [];

  // Whole-document-missing vs present-but-some-fields-null
  const siMissing = siFields == null;
  const blMissing = blFields == null;

  const needsReview = comparisonRaw.status === "NEEDS_REVIEW";
  const isMissingAttachment = comparisonRaw.review_reason === "missing_attachment";
  const isMissingValue = comparisonRaw.review_reason === "missing_value";

  // Field list: prefer whichever side has real data; fall back to the
  // canonical list only if both sides are entirely missing.
  const fieldSource = siFields ?? blFields;
  const fields =
    fieldSource && Object.keys(fieldSource).length > 0
      ? Object.keys(fieldSource)
      : ALL_FIELDS;

  return (
    <div className="space-y-8">
      <Link
        href={`/emails/${id}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Email
      </Link>

      <header>
        <p className="font-mono text-xs text-slate-500">{email.email_id}</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          Document comparison
        </h1>
        <p className="mt-1 text-sm text-slate-500">{email.subject}</p>
      </header>

      {needsReview ? (
        <section className="flex items-start gap-3 rounded-sm border border-amber-200 bg-amber-50/50 p-4">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Human review required
            </p>
            <p className="mt-1 text-xs text-amber-800">
              {isMissingAttachment &&
                `${siMissing ? "Shipping Instruction" : "Bill of Lading"} not found in attachments.`}
              {isMissingValue &&
                "One or more fields could not be extracted and need manual verification."}
              {!isMissingAttachment && !isMissingValue && comparisonRaw.review_reason
                ? `Reason: ${comparisonRaw.review_reason}`
                : null}
            </p>
          </div>
        </section>
      ) : null}

      {/* --- Section 1: Comparison Table Card --- */}
      <section className="rounded-sm border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                SI vs Bill of Lading
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {comparisonRaw.si_file ?? "No SI"} → {comparisonRaw.bl_file ?? "No BL"}
              </p>
            </div>

            {comparisonRaw.status === "MISMATCH" ? (
              <span className="rounded-sm bg-red-50 px-2.5 py-1 font-mono text-[11px] font-medium text-red-700">
                MISMATCH
              </span>
            ) : comparisonRaw.status === "NEEDS_REVIEW" ? (
              <span className="rounded-sm bg-amber-50 px-2.5 py-1 font-mono text-[11px] font-medium text-amber-700">
                NEEDS REVIEW
              </span>
            ) : (
              <span className="rounded-sm bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-700">
                OK
              </span>
            )}
          </div>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Field</th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Shipping Instruction
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Bill of Lading
                </th>
                <th className="px-5 py-3 font-medium text-slate-500">Result</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {fields.map((field) => {
                const isMismatch = defectFields.includes(
                  field as (typeof defectFields)[number],
                );
                const isReviewField = reviewFields.includes(
                  field as (typeof reviewFields)[number],
                );

                const siValue = siMissing ? null : siFields?.[field] ?? null;
                const blValue = blMissing ? null : blFields?.[field] ?? null;

                const siCellMissing = siMissing || (isReviewField && siValue == null);
                const blCellMissing = blMissing || (isReviewField && blValue == null);
                const rowFlag = isMismatch || siCellMissing || blCellMissing;

                return (
                  <tr
                    key={field}
                    className={
                      isMismatch
                        ? "bg-red-50/70"
                        : rowFlag
                          ? "bg-amber-50/40"
                          : "bg-white"
                    }
                  >
                    <td
                      className={`px-5 py-3 font-mono ${
                        isMismatch
                          ? "font-semibold text-red-800"
                          : "text-slate-700"
                      }`}
                    >
                      {getFieldLabel(field)}
                    </td>

                    <td
                      className={`px-5 py-3 ${
                        isMismatch
                          ? "font-medium text-red-800"
                          : siCellMissing
                            ? "italic text-amber-600"
                            : "text-slate-600"
                      }`}
                    >
                      {siMissing
                        ? "Missing document"
                        : siValue == null
                          ? "Missing value"
                          : String(siValue)}
                    </td>

                    <td
                      className={`px-5 py-3 ${
                        isMismatch
                          ? "font-medium text-red-800"
                          : blCellMissing
                            ? "italic text-amber-600"
                            : "text-slate-600"
                      }`}
                    >
                      {blMissing
                        ? "Missing document"
                        : blValue == null
                          ? "Missing value"
                          : String(blValue)}
                    </td>

                    <td className="px-5 py-3">
                      {isMismatch ? (
                        <span className="font-mono text-[11px] font-semibold text-red-700">
                          ✕ MISMATCH
                        </span>
                      ) : rowFlag ? (
                        <span className="font-mono text-[11px] font-semibold text-amber-700">
                          ⚠ MISSING
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] text-emerald-700">
                          ✓ MATCH
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Section 2: Document Viewers Grid --- */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DocumentViewer
          filename={comparisonRaw.si_file}
          title="Shipping Instruction (SI)"
        />

        <DocumentViewer
          filename={comparisonRaw.bl_file}
          title="Bill of Lading (BL)"
        />
      </section>
    </div>
  );
}