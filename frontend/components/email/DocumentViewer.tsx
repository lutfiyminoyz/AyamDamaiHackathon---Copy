
"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { getAttachmentUrl } from "@/lib/api";

type DocumentViewerProps = {
  filename: string | null;
  title: string;
};

export default function DocumentViewer({
  filename,
  title,
}: DocumentViewerProps) {
  if (!filename) {
    return (
      <section className="rounded-sm border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold text-slate-700">{title}</p>
        </header>

        <div className="flex h-[600px] items-center justify-center text-sm text-slate-400">
          No document available
        </div>
      </section>
    );
  }

  const url = getAttachmentUrl(filename);
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  return (
    <section className="overflow-hidden rounded-sm border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-slate-500" />

          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700">{title}</p>
            <p className="truncate font-mono text-[10px] text-slate-400">
              {filename}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <ExternalLink className="h-3 w-3" />
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
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </div>
      </header>

      <div className="bg-slate-100">
        {isPdf ? (
          <iframe
            src={url}
            title={`${title} document`}
            className="h-[600px] w-full border-0"
          />
        ) : (
          <iframe
            src={url}
            title={`${title} document`}
            className="h-[600px] w-full border-0 bg-white"
          />
        )}
      </div>
    </section>
  );
}

