// app/compose/page.tsx
"use client";

import { useState } from "react";

type PipelineResult = {
  email?: {
    email_id: string;
    category: string;
    status: string;
    has_defect: boolean;
    defect_fields: string[];
    review_reason: string | null;
  };
  comparison?: {
    status: string;
    si_file: string | null;
    bl_file: string | null;
    defect_fields: string[];
    review_fields: string[];
    si_fields: Record<string, unknown> | null;
    bl_fields: Record<string, unknown> | null;
  } | null;
  uploaded_files?: { path: string; filename: string }[];
  error?: string;
};

export default function ComposePage() {
  const [fromAddress, setFromAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Please attach at least one file.");
      return;
    }

    setSubmitting(true);
    setResult(null);

    const fd = new FormData();
    fd.append("from_address", fromAddress);
    fd.append("subject", subject);
    fd.append("body", body);
    files.forEach((f) => fd.append("files", f));

    try {
      const res = await fetch("/api/send", { method: "POST", body: fd });
      const data = (await res.json()) as PipelineResult;
      setResult(data);

      if (res.ok) {
        // clear form on success
        setFromAddress("");
        setSubject("");
        setBody("");
        setFiles([]);
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">Compose email</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">From</label>
          <input
            type="email"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            placeholder="ops@example.com"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Please verify attached SI and BL"
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Attached for checking."
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Attachments</label>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full"
          />
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-gray-600">
              {files.map((f, i) => (
                <li key={i}>{f.name} — {(f.size / 1024).toFixed(1)} KB</li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Processing…" : "Send"}
        </button>
      </form>

      {result && (
        <div className="mt-8 rounded border p-4">
          <h2 className="mb-2 font-semibold">Result</h2>
          {result.error ? (
            <pre className="whitespace-pre-wrap text-sm text-red-600">
              {result.error}
            </pre>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-medium">
                  {result.email?.email_id} — {result.email?.category}
                </div>
                <div>
                  Status: <b>{result.email?.status}</b>
                  {result.email?.has_defect && (
                    <span className="ml-2 text-red-600">
                      defects: {result.email.defect_fields.join(", ")}
                    </span>
                  )}
                </div>
                {result.email?.review_reason && (
                  <div>Reason: {result.email.review_reason}</div>
                )}
              </div>

              {result.comparison && (
                <div className="rounded bg-gray-50 p-3">
                  <div className="font-medium">Comparison</div>
                  <div>
                    SI file: {result.comparison.si_file ?? "—"} · BL file:{" "}
                    {result.comparison.bl_file ?? "—"}
                  </div>
                  {result.comparison.defect_fields.length > 0 && (
                    <div className="text-red-600">
                      Defect fields: {result.comparison.defect_fields.join(", ")}
                    </div>
                  )}
                  {result.comparison.review_fields.length > 0 && (
                    <div className="text-amber-600">
                      Review fields: {result.comparison.review_fields.join(", ")}
                    </div>
                  )}
                </div>
              )}

              <details>
                <summary className="cursor-pointer">Raw response</summary>
                <pre className="mt-2 overflow-auto rounded bg-black/5 p-2 text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </main>
  );
}