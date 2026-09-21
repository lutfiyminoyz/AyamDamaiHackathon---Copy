import type { LucideIcon } from "lucide-react";

export type StatTone = "slate" | "blue" | "emerald" | "amber" | "red";

const ACCENT: Record<StatTone, string> = {
  slate: "border-slate-900",
  blue: "border-blue-600",
  emerald: "border-emerald-600",
  amber: "border-amber-500",
  red: "border-red-600",
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "slate",
  hint,
}: StatCardProps) {
  return (
    <div className={`border-t-2 ${ACCENT[tone]} pt-4`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon
          className="h-3.5 w-3.5 shrink-0 text-slate-400"
          aria-hidden="true"
        />
      </div>

      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>

      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}