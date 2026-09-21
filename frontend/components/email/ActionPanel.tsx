import Link from "next/link";
import { ArrowRight, ArrowUpRight, Info, TriangleAlert } from "lucide-react";
import { REVIEW_REASON_LABELS } from "@/lib/mock-data";
import type { EmailCategory, EmailRecord } from "@/lib/types";

export default function ActionPanel({ email }: { email: EmailRecord }) {
  const c = email.classification;

  // BL_COMPARISON + NEEDS_REVIEW → amber escalation panel
  if (c.category === "BL_COMPARISON" && c.status === "NEEDS_REVIEW") {
    const reason = c.review_reason
      ? REVIEW_REASON_LABELS[c.review_reason]
      : "Requires a human decision";

    return (
      <section className="rounded-sm border border-amber-200 bg-amber-50/50 p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-amber-900">
              Human review required
            </h2>
            <p className="mt-1 text-xs text-amber-800">{reason}</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              The system could not reliably verify this document. A reviewer
              needs to check the source files.
            </p>
          </div>
        </div>

        <Link
          href={`/reviews/${email.email_id}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-amber-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-amber-800"
        >
          Review case
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  // BL_COMPARISON + OK or MISMATCH → link to comparison
  if (c.category === "BL_COMPARISON") {
    const verb = c.status === "MISMATCH" ? "View mismatches" : "View comparison";

    return (
      <section className="rounded-sm border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Document verification
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          This message contains a Shipping Instruction and a draft Bill of
          Lading. Field-level comparison is available.
        </p>

        <Link
          href={`/emails/${email.email_id}/comparison`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-slate-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-slate-800"
        >
          {verb}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    );
  }

  // Everything else → informational state
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <Info
          className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">
            {categoryHeading(c.category)}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {categoryDescription(c.category)}
          </p>
        </div>
      </div>

      <Link
        href="/inbox"
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-500"
      >
        Back to inbox
        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </section>
  );
}

function categoryHeading(category: EmailCategory): string {
  switch (category) {
    case "SI_REQUEST":
      return "Shipping Instruction request";
    case "INVOICE_QUERY":
      return "Invoice enquiry";
    case "GENERAL":
      return "General correspondence";
    case "SPAM":
      return "Flagged as spam";
    case "BL_COMPARISON":
      // Handled above; kept for exhaustiveness.
      return "Document verification";
  }
}

function categoryDescription(category: EmailCategory): string {
  switch (category) {
    case "SI_REQUEST":
      return "A Shipping Instruction has been requested. No document comparison is applicable to this message.";
    case "INVOICE_QUERY":
      return "The sender is asking a question about an invoice or charge. No document comparison is applicable.";
    case "GENERAL":
      return "No document action is required for this message.";
    case "SPAM":
      return "The classifier marked this message as spam. No further processing is scheduled.";
    case "BL_COMPARISON":
      return "No comparison is available for this message.";
  }
}