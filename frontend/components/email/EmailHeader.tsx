import CategoryBadge from "@/components/ui/CategoryBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/format";
import type { EmailRecord } from "@/lib/types";

export default function EmailHeader({ email }: { email: EmailRecord }) {
  const c = email.classification;

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-500">
        <span>{email.email_id}</span>
        <span aria-hidden="true">·</span>
        <span>{formatDateTime(email.received_at ?? null)}</span>
      </div>

      <h1 className="text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-2xl">
        {email.subject}
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <CategoryBadge category={c.category} />
        <StatusBadge status={c.status} />
      </div>
    </header>
  );
}