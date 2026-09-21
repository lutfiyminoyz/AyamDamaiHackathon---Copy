
import {
  CircleCheck,
  ClipboardCheck,
  Inbox,
  TriangleAlert,
} from "lucide-react";
import BarChart, {
  type BarDatum,
} from "@/components/dashboard/BarChart";
import StatGrid, { type Stat } from "@/components/dashboard/StatGrid";
import { getCorpusStats } from "@/lib/api";
import {
  CATEGORY_LABELS,
  FIELD_LABELS,
  REVIEW_REASON_LABELS,
} from "@/lib/mock-data";
import type { EmailCategory } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getCorpusStats();

  const total = stats.total;

  const statCards: Stat[] = [
    {
      label: "Total emails",
      value: stats.total,
      icon: Inbox,
      tone: "slate",
      hint: "Processed this run",
    },
    {
      label: "Cleared",
      value: stats.byStatus.OK,
      icon: CircleCheck,
      tone: "emerald",
      hint: `${pct(stats.byStatus.OK, total)}% of all emails`,
    },
    {
      label: "Mismatches",
      value: stats.byStatus.MISMATCH,
      icon: TriangleAlert,
      tone: "red",
      hint: `${pct(stats.byStatus.MISMATCH, total)}% flagged`,
    },
    {
      label: "Needs review",
      value: stats.byStatus.NEEDS_REVIEW,
      icon: ClipboardCheck,
      tone: "amber",
      hint: `${pct(stats.byStatus.NEEDS_REVIEW, total)}% queued`,
    },
  ];

  const categoryData: BarDatum[] = (
    Object.keys(stats.byCategory) as (keyof typeof stats.byCategory)[]
  ).map((key) => ({
    label: CATEGORY_LABELS[key],
    value: stats.byCategory[key],
    tone: categoryTone(key),
  }));

  const statusData: BarDatum[] = [
    { label: "Cleared", value: stats.byStatus.OK, tone: "emerald" },
    { label: "Mismatch", value: stats.byStatus.MISMATCH, tone: "red" },
    { label: "Needs review", value: stats.byStatus.NEEDS_REVIEW, tone: "amber" },
  ];

  const defectData: BarDatum[] = (
    Object.keys(stats.defectFields) as (keyof typeof stats.defectFields)[]
  )
    .map((key) => ({
      label: FIELD_LABELS[key],
      value: stats.defectFields[key],
      tone: "red" as const,
    }))
    .sort((a, b) => b.value - a.value);

  const reasonData: BarDatum[] = (
    Object.keys(stats.reviewReasons) as (keyof typeof stats.reviewReasons)[]
  ).map((key) => ({
    label: REVIEW_REASON_LABELS[key],
    value: stats.reviewReasons[key],
    tone: "amber",
  }));

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900">
            Operations overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Aggregate results from the latest document verification run.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500">
          Run 5RSG · {total.toLocaleString("en-US")} messages
        </span>
      </div>

      <StatGrid stats={statCards} />

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
        <ChartPanel
          title="Emails by category"
          caption="Distribution of the classifier's output"
        >
          <BarChart data={categoryData} total={total} />
        </ChartPanel>

        <ChartPanel
          title="Emails by status"
          caption="Outcome after SI / BL comparison"
        >
          <BarChart data={statusData} total={total} />
        </ChartPanel>

        <ChartPanel
          title="Most common defect fields"
          caption={`Field-level mismatches across ${stats.byStatus.MISMATCH} flagged documents`}
        >
          <BarChart data={defectData} unit="mismatches" />
        </ChartPanel>

        <ChartPanel
          title="Review reasons"
          caption={`Why ${stats.byStatus.NEEDS_REVIEW} emails were escalated to a human`}
        >
          <BarChart data={reasonData} unit="cases" />
        </ChartPanel>
      </div>
    </div>
  );
}

function ChartPanel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white p-5">
      <header className="mb-5">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{caption}</p>
      </header>
      {children}
    </section>
  );
}

function pct(value: number, total: number): string {
  if (total === 0) return "0";
  return ((value / total) * 100).toFixed(1).replace(/\.0$/, "");
}

function categoryTone(key: EmailCategory): BarDatum["tone"] {
  switch (key) {
    case "BL_COMPARISON":
      return "indigo";
    case "SI_REQUEST":
      return "violet";
    case "INVOICE_QUERY":
      return "cyan";
    case "GENERAL":
      return "slate";
    case "SPAM":
      return "rose";
  }
}

// Only used for its type above — never invoked at runtime.
function getCorpusStatsSync() {
  return { byCategory: {} as Record<string, number> };
}