import Link from "next/link";

export const metadata = {
  title: "SDOC · Shipping Document Verification",
};

const FIELDS = [
  { label: "Shipper", si: "Nordic Freight AB", bl: "Nordic Freight AB", status: "match" },
  { label: "Consignee", si: "Tanjung Bara Logistics", bl: "Tanjung Bara Logistics", status: "match" },
  { label: "Port of loading", si: "Gothenburg (SEGOT)", bl: "Gothenburg (SEGOT)", status: "match" },
  { label: "Port of discharge", si: "Penang (MYPEN)", bl: "Port Klang (MYPKG)", status: "flagged" },
  { label: "Container no.", si: "MSCU 417 208 4", bl: "MSCU 417 208 4", status: "match" },
  { label: "Gross weight", si: "18,240 kg", bl: "18,420 kg", status: "flagged" },
];

const STEPS = [
  {
    n: "01",
    title: "Request arrives",
    body: "Every email in the ops inbox is read and classified as an SI submission, a BL draft, an amendment, or something else.",
  },
  {
    n: "02",
    title: "Fields are extracted",
    body: "Seven fields required on every Bill of Lading are pulled from both the Shipping Instruction and the draft — shipper, ports, container number, weight, and more.",
  },
  {
    n: "03",
    title: "Documents are compared",
    body: "The two sets of fields are checked against each other line by line. Anything that matches exactly is marked cleared.",
  },
  {
    n: "04",
    title: "Uncertainty goes to a person",
    body: "A mismatch, an unreadable field, or a low-confidence read is never resolved by guessing — it's queued for a reviewer with the discrepancy shown.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-6xl items-center px-6">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-mono text-[15px] font-semibold tracking-tight">
              SDOC
            </span>
            <span className="hidden text-sm text-slate-500 sm:inline">
              Shipping document verification
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-6">
            <Link
              href="/inbox"
              className="text-sm text-slate-600 transition hover:text-slate-900"
            >
              Inbox
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-sm bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-lg text-[2.6rem] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Catch Bill of Lading errors before the cargo sails.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-slate-600">
              SDOC reads incoming shipping emails, extracts the fields that
              matter, and checks the draft Bill of Lading against the
              Shipping Instruction — before it goes back to the carrier.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-sm bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Open dashboard
              </Link>
              <Link
                href="/inbox"
                className="inline-flex items-center px-1 py-2.5 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900 hover:decoration-slate-500"
              >
                View the inbox
              </Link>
            </div>
          </div>

          {/* Comparison ledger — the actual product, not a stock illustration */}
          <div className="rounded-sm border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <span className="font-mono text-xs text-slate-500">
                BL-2026-04417 · SI vs. draft
              </span>
              <span className="font-mono text-xs text-amber-700">
                2 flagged
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {FIELDS.map((f) => (
                <div key={f.label} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3">
                  <span className="w-36 shrink-0 text-xs text-slate-500">
                    {f.label}
                  </span>
                  <span
                    className={`truncate font-mono text-[13px] ${
                      f.status === "flagged" ? "text-amber-800" : "text-slate-800"
                    }`}
                  >
                    {f.status === "flagged" ? f.bl : f.si}
                  </span>
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      f.status === "flagged" ? "bg-amber-500" : "bg-blue-600"
                    }`}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <span className="text-xs text-slate-500">
                Port of discharge and gross weight don't match the SI —
                routed for review.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Process — a real sequence, shown as one */}
      <section className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-sm font-medium text-slate-500">
            How a request moves through SDOC
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative pl-0">
                <div className="flex items-baseline gap-2 border-t-2 border-slate-900 pt-4">
                  <span className="font-mono text-xs text-slate-400">
                    {step.n}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}