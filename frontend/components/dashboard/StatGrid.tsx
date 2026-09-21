import type { LucideIcon } from "lucide-react";

export type StatTone = "slate" | "emerald" | "red" | "amber";

const ACCENT: Record<StatTone, string> = {
  slate: "border-slate-900",
  emerald: "border-emerald-600",
  red: "border-red-600",
  amber: "border-amber-500",
};

export type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatTone;
  hint: string;
};

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div key={stat.label} className={`border-t-2 ${ACCENT[stat.tone]} pt-4`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-slate-500">
                {stat.label}
              </p>
              <Icon
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-slate-900">
              {stat.value.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.hint}</p>
          </div>
        );
      })}
    </div>
  );
}