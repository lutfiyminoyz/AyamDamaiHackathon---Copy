import { Suspense } from "react";
import InboxTable from "@/components/email/InboxTable";
import { getEmails } from "@/lib/api";

export const metadata = { title: "Inbox" };
export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const emails = await getEmails();

  return (
    <Suspense
      fallback={
        <p className="text-sm text-slate-500">Loading inbox…</p>
      }
    >
      <InboxTable emails={emails} />
    </Suspense>
  );
}