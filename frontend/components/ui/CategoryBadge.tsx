import type { EmailCategory } from "@/lib/types";

type Style = { label: string; accent: string; text: string };

// Color is grouped by what the category means for the reviewer, not
// decoration: verification work gets the blue used for "cleared/active"
// elsewhere in the app, background admin is quiet slate, spam recedes.
const STYLES: Record<EmailCategory, Style> = {
  BL_COMPARISON: {
    label: "BL comparison",
    accent: "border-blue-600",
    text: "text-slate-700",
  },
  SI_REQUEST: {
    label: "SI request",
    accent: "border-blue-600",
    text: "text-slate-700",
  },
  INVOICE_QUERY: {
    label: "Invoice query",
    accent: "border-slate-400",
    text: "text-slate-600",
  },
  GENERAL: {
    label: "General",
    accent: "border-slate-300",
    text: "text-slate-500",
  },
  SPAM: {
    label: "Spam",
    accent: "border-slate-200",
    text: "text-slate-400",
  },
};

export default function CategoryBadge({
  category,
}: {
  category: EmailCategory;
}) {
  const style = STYLES[category];

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap border-l-2 py-0.5 pl-2 text-[11px] ${style.accent} ${style.text}`}
    >
      {style.label}
    </span>
  );
}