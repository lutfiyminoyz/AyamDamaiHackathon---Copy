export type BarTone =
  | "slate"
  | "indigo"
  | "violet"
  | "cyan"
  | "rose"
  | "emerald"
  | "amber"
  | "red";

const TONES: Record<BarTone, string> = {
  slate: "bg-slate-700",
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  cyan: "bg-cyan-500",
  rose: "bg-rose-400",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

export type BarDatum = {
  label: string;
  value: number;
  tone: BarTone;
};

export default function BarChart({
  data,
  total,
  unit = "emails",
}: {
  data: BarDatum[];
  /** Denominator for bar widths. Falls back to the max value. */
  total?: number;
  unit?: string;
}) {
  const max = total ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;

        return (
          <div
            key={d.label}
            className="grid grid-cols-[150px_1fr_44px] items-center gap-3"
          >
            <span className="truncate text-xs text-slate-600" title={d.label}>
              {d.label}
            </span>
            <div
              className="h-1.5 w-full overflow-hidden rounded-sm bg-slate-100"
              role="img"
              aria-label={`${d.label}: ${d.value} ${unit}`}
            >
              <div
                className={`h-full rounded-sm ${TONES[d.tone]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-right font-mono text-xs tabular-nums text-slate-700">
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}