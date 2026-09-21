import Link from "next/link";
import { ArrowLeft } from "lucide-react";
//import { notFound } from "next/navigation";
import { getDocumentComparison, getEmailById } from "@/lib/api";
//import AttachmentList from "@/components/email/AttachmentList";
import DocumentViewer from "@/components/email/DocumentViewer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ComparisonPage({ params }: PageProps) {
  const { id } = await params;

  const [email, comparison] = await Promise.all([
    getEmailById(id),
    getDocumentComparison(id),
  ]);

  if (!email || !comparison) {
    return <div>Comparison data not found.</div>;
  }

  const fields = Object.keys(comparison.si_fields);
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
    field
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

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

      {/* --- Section 1: Comparison Table Card --- */}
      <section className="rounded-sm border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                SI vs Bill of Lading
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {comparison.si_file ?? "No SI"} → {comparison.bl_file ?? "No BL"}
              </p>
            </div>

            {comparison.status === "MISMATCH" ? (
              <span className="rounded-sm bg-red-50 px-2.5 py-1 font-mono text-[11px] font-medium text-red-700">
                MISMATCH
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
                const isMismatch = comparison.defect_fields.includes(
                  field as (typeof comparison.defect_fields)[number],
                );

                return (
                  <tr
                    key={field}
                    className={isMismatch ? "bg-red-50/70" : "bg-white"}
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
                          : "text-slate-600"
                      }`}
                    >
                      {comparison.si_fields[field] ?? "—"}
                    </td>

                    <td
                      className={`px-5 py-3 ${
                        isMismatch
                          ? "font-medium text-red-800"
                          : "text-slate-600"
                      }`}
                    >
                      {comparison.bl_fields[field] ?? "—"}
                    </td>

                    <td className="px-5 py-3">
                      {isMismatch ? (
                        <span className="font-mono text-[11px] font-semibold text-red-700">
                          ✕ MISMATCH
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
          filename={comparison.si_file}
          title="Shipping Instruction (SI)"
        />

        <DocumentViewer
          filename={comparison.bl_file}
          title="Bill of Lading (BL)"
        />
      </section>
    </div>
  );
}