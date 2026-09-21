"use client";

import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/emails/") && pathname.endsWith("/comparison")) {
    return "Document Comparison";
  }
  if (pathname.startsWith("/emails/")) return "Email Detail";
  if (pathname.startsWith("/reviews/")) return "Review Case";

  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/inbox")) return "Inbox";
  if (pathname.startsWith("/reviews")) return "Reviews";
  if (pathname.startsWith("/documents")) return "Documents";
  if (pathname.startsWith("/settings")) return "Settings";

  return "SDOC";
}

export default function Topbar({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h1>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* <div className="relative hidden md:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search emails, BL, SI…"
              className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none lg:w-72"
            />
          </div> */}

          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 py-1 pl-1 pr-2 sm:pr-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[11px] font-semibold text-white">
              AR
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold leading-tight text-slate-900">
                Aisyah Rahman
              </span>
              <span className="block text-[11px] leading-tight text-slate-500">
                Shipping Operations
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}