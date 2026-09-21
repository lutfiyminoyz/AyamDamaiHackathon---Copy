"use client";
import { Download, FileText, ExternalLink } from "lucide-react";
import { getAttachmentUrl } from "@/lib/api";

type AttachmentListProps = {
  attachments: string[];
};

export default function AttachmentList({
  attachments,
}: AttachmentListProps) {
  if (!attachments.length) {
    return (
      <section className="rounded-sm border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-5 py-3">
          <p className="text-xs font-medium text-slate-500">Attachments</p>
        </header>

        <div className="px-5 py-6 text-sm text-slate-500">
          No attachments.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-sm border border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-5 py-3">
        <p className="text-xs font-medium text-slate-500">
          Attachments ({attachments.length})
        </p>
      </header>

      <div className="divide-y divide-slate-100">
        {attachments.map((filename) => {
          const url = getAttachmentUrl(filename);

          return (
            <div
              key={filename}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-slate-100">
                  <FileText
                    className="h-4 w-4 text-slate-500"
                    aria-hidden="true"
                  />
                </div>

                <p className="truncate text-sm text-slate-700">
                  {filename}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>

                <button
                  type="button"
                  onClick={async () => {
                    const response = await fetch(url);
                    const blob = await response.blob();

                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");

                    link.href = blobUrl;
                    link.download = filename.replace(/^attachments\//, "");
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    window.URL.revokeObjectURL(blobUrl);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

