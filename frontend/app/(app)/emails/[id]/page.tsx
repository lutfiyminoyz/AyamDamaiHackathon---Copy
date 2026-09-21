import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ActionPanel from "@/components/email/ActionPanel";
import AttachmentList from "@/components/email/AttachmentList";
import EmailHeader from "@/components/email/EmailHeader";
import { getEmailById } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const email = await getEmailById(id);
  return { title: email ? email.subject : "Email not found" };
}

export default async function EmailDetailPage({ params }: PageProps) {
  const { id } = await params;
  const email = await getEmailById(id);

  if (!email) notFound();

  return (
    <div className="space-y-8">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Inbox
      </Link>

      <EmailHeader email={email} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="rounded-sm border border-slate-200 bg-white">
            <header className="border-b border-slate-200 px-5 py-3">
              <p className="text-xs font-medium text-slate-500">Message</p>
            </header>

            <div className="space-y-4 px-5 py-4">
              <dl className="grid grid-cols-[70px_1fr] gap-x-3 gap-y-1.5 text-xs">
                <dt className="text-slate-500">From</dt>
                <dd className="break-all font-mono text-slate-700">
                  {email.from}
                </dd>

                {email.received_at ? (
                  <>
                    <dt className="text-slate-500">Received</dt>
                    <dd className="font-mono text-slate-700">
                      {formatDateTime(email.received_at)}
                    </dd>
                  </>
                ) : null}
              </dl>

              <div className="border-t border-slate-100" />

              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {email.body}
              </pre>
            </div>
          </section>

          <AttachmentList attachments={email.attachments} />
        </div>

        <aside className="space-y-6">
          <ActionPanel email={email} />
        </aside>
      </div>
    </div>
  );
}