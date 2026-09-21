"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CategoryBadge from "@/components/ui/CategoryBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { REVIEW_REASON_LABELS } from "@/lib/mock-data";
import type {
  EmailCategory,
  EmailRecord,
  VerificationStatus,
} from "@/lib/types";
import { ArrowUpRight, ChevronDown, Paperclip, Search } from "lucide-react";

type CategoryFilter = EmailCategory | "ALL";
type StatusFilter = VerificationStatus | "ALL";

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "ALL",
  "BL_COMPARISON",
  "SI_REQUEST",
  "INVOICE_QUERY",
  "GENERAL",
  "SPAM",
];

const STATUS_OPTIONS: StatusFilter[] = [
  "ALL",
  "OK",
  "MISMATCH",
  "NEEDS_REVIEW",
];

export default function InboxTable({ emails }: { emails: EmailRecord[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawCategory = searchParams.get("category");
  const category: CategoryFilter =
    rawCategory && CATEGORY_OPTIONS.includes(rawCategory as CategoryFilter)
      ? (rawCategory as CategoryFilter)
      : "ALL";

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  function setCategory(next: CategoryFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "ALL") params.delete("category");
    else params.set("category", next);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return emails.filter((email) => {
      if (category !== "ALL" && email.classification.category !== category) {
        return false;
      }
      if (status !== "ALL" && email.classification.status !== status) {
        return false;
      }
      if (!q) return true;

      return (
        email.subject.toLowerCase().includes(q) ||
        email.from.toLowerCase().includes(q) ||
        email.email_id.toLowerCase().includes(q)
      );
    });
  }, [emails, query, category, status]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Received Emails
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length.toLocaleString("en-US")} of{" "}
            {emails.length.toLocaleString("en-US")} messages
            {category !== "ALL" ? (
              <>
                {" "}
                · filtered by{" "}
                <span className="font-mono text-xs text-slate-700">
                  {category}
                </span>
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 rounded-sm border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_180px_180px]">
        <label className="relative">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, sender, or ID…"
            className="h-9 w-full rounded-sm border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            className="h-9 w-full cursor-pointer appearance-none rounded-sm border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "All categories" : option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </label>

        <label className="relative">
          <span className="sr-only">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="h-9 w-full cursor-pointer appearance-none rounded-sm border border-slate-200 bg-slate-50 pl-3 pr-9 text-sm text-slate-700 focus:border-slate-900 focus:bg-white focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "All statuses" : option}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </label>
      </div>

      <section className="rounded-sm border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            No messages match these filters.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((email) => {
              const c = email.classification;
              const attachmentCount = email.attachments.length;

              return (
                <li key={email.email_id}>
                  <Link
                    href={`/emails/${email.email_id}`}
                    className="group grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-[11px] text-slate-500">
                          {email.email_id}
                        </span>
                        <span className="truncate font-mono text-[11px] text-slate-500">
                          {email.from}
                        </span>
                      </div>

                      <p className="line-clamp-1 text-sm font-medium text-slate-900">
                        {email.subject}
                      </p>

                      <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {email.body.split("\n")[0]}
                      </p>

                      {c.review_reason ? (
                        <p className="font-mono text-[11px] text-amber-700">
                          {REVIEW_REASON_LABELS[c.review_reason]}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 sm:pl-4">
                      <div className="flex items-center gap-3">
                        <CategoryBadge category={c.category} />
                        <StatusBadge status={c.status} />
                      </div>

                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <Paperclip className="h-3 w-3" aria-hidden="true" />
                        {attachmentCount}
                      </span>

                      <ArrowUpRight
                        className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-slate-700"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}