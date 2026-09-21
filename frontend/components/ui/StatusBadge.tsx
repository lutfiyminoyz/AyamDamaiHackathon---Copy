import type { VerificationStatus } from "@/lib/types";

type Style = { label: string; dot: string; text: string };

// These three states carry real urgency, so — unlike the category
// badge — a semantic color is doing genuine work here, not decoration.
const STYLES: Record<VerificationStatus, Style> = {
  OK: { label: "Cleared", dot: "bg-emerald-500", text: "text-slate-700" },
  MISMATCH: { label: "Mismatch", dot: "bg-red-500", text: "text-red-700" },
  NEEDS_REVIEW: {
    label: "Needs review",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
};

export default function StatusBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const style = STYLES[status];

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px]">
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
        aria-hidden="true"
      />
      <span className={style.text}>{style.label}</span>
    </span>
  );
}