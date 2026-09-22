import Link from "next/link";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { notFound } from "next/navigation";
import { getDocumentComparison, getEmailById } from "@/lib/api";
import DocumentViewer from "@/components/email/DocumentViewer";

type PageProps = {
  params: Promise<{ id: string }>;
};

const reviewReasonLabels: Record<string, string> = {
  unreadable: "Unreadable attachment",
  missing_attachment: "Missing attachment",
  missing_value: "Missing field value",
  wrong_doc_type: "Wrong document type",
};

const getReviewReasonLabel = (reason: string | null | undefined) =>
  reason
    ? reviewReasonLabels[reason] ?? reason.replace(/_/g, " ")
    : "Document-level review";

const getFieldLabel = (field: string) =>
  field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

export default async function ReviewPage({ params }: PageProps) {
  const { id } = await params;

  const [email, comparison] = await Promise.all([
    getEmailById(id),
    getDocumentComparison(id),
  ]);

  if (!email || !comparison) notFound();

  // Defensive: treat missing/null as an empty list rather than crashing.
  const reviewFields = comparison.review_fields ?? [];

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
          Human review
        </h1>
        <p className="mt-1 text-sm text-slate-500">{email.subject}</p>
      </header>

      <section className="rounded-sm border border-amber-200 bg-amber-50/60 p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <h2 className="text-sm font-semibold text-amber-900">
              Verification requires human review
            </h2>

            <p className="mt-1 text-xs text-amber-800">
              {getReviewReasonLabel(comparison.review_reason)}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-sm border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Review details
          </h2>
        </header>

        <dl className="divide-y divide-slate-100">
          <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-xs">
            <dt className="text-slate-500">Status</dt>
            <dd className="font-mono font-medium text-amber-700">
              {comparison.status}
            </dd>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-xs">
            <dt className="text-slate-500">SI attachment</dt>
            <dd className="font-mono text-slate-700">
              {comparison.si_file ?? "Missing"}
            </dd>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-xs">
            <dt className="text-slate-500">BL attachment</dt>
            <dd className="font-mono text-slate-700">
              {comparison.bl_file ?? "Missing"}
            </dd>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4 px-5 py-4 text-xs">
            <dt className="text-slate-500">Review fields</dt>
            <dd className="font-mono text-slate-700">
              {reviewFields.length > 0
                ? reviewFields.map(getFieldLabel).join(", ")
                : "Document-level review"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DocumentViewer
          filename={comparison.si_file}
          title="Shipping Instruction (SI)"
        />

        <DocumentViewer
          filename={comparison.bl_file}
          title="Bill of Lading (BL)"
        />
      </div>

      <section className="rounded-sm border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Recommended action
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Open and verify the source attachment manually before approving
          this shipment document.
        </p>

        <Link
          href={`/emails/${id}`}
          className="mt-4 inline-flex items-center rounded-sm bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
        >
          Return to email
        </Link>
      </section>
    </div>
  );
}