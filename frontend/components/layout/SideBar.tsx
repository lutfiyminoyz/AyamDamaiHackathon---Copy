"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  Settings,
  Ship,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SubItem = {
  label: string;
  href: string;
  /** URL category value; null for the "All emails" entry. */
  matchCategory: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  soon?: boolean;
  children?: SubItem[];
};

const INBOX_CHILDREN: SubItem[] = [
  {
    label: "All emails",
    href: "/inbox",
    matchCategory: null,
  },
  {
    label: "BL comparison",
    href: "/inbox?category=BL_COMPARISON",
    matchCategory: "BL_COMPARISON",
  },
  {
    label: "SI request",
    href: "/inbox?category=SI_REQUEST",
    matchCategory: "SI_REQUEST",
  },
  {
    label: "Invoice query",
    href: "/inbox?category=INVOICE_QUERY",
    matchCategory: "INVOICE_QUERY",
  },
  {
    label: "General",
    href: "/inbox?category=GENERAL",
    matchCategory: "GENERAL",
  },
  {
    label: "Spam",
    href: "/inbox?category=SPAM",
    matchCategory: "SPAM",
  },
];

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox, children: INBOX_CHILDREN },
  { label: "Documents", href: "/documents", icon: FileText, soon: true },
  { label: "Reviews", href: "/reviews", icon: ClipboardCheck },
  { label: "Settings", href: "/settings", icon: Settings, soon: true },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const onInbox = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const [inboxExpanded, setInboxExpanded] = useState(onInbox);

  // Auto-expand whenever the user navigates into an inbox route.
  useEffect(() => {
    if (onInbox) setInboxExpanded(true);
  }, [onInbox]);

  function isParentActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function isChildActive(child: SubItem): boolean {
    if (pathname !== "/inbox") return false;
    if (child.matchCategory === null) return currentCategory === null;
    return currentCategory === child.matchCategory;
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Ship className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight tracking-tight text-slate-900">
              SDOC
            </p>
            <p className="truncate text-[11px] leading-tight text-slate-500">
              Document verification
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Workspace
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            if (item.soon) {
              return (
                <div
                  key={item.href}
                  title="Available in a later phase"
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    Soon
                  </span>
                </div>
              );
            }

            /* ---- Expandable parent (Inbox) ---- */
            if (item.children) {
              const parentActive = isParentActive(item.href);
              const expanded = inboxExpanded;

              return (
                <div key={item.href}>
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        parentActive
                          ? "font-semibold text-blue-700"
                          : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setInboxExpanded((v) => !v)}
                      aria-label={
                        expanded ? "Collapse Inbox" : "Expand Inbox"
                      }
                      aria-expanded={expanded}
                      className={`mr-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition hover:bg-slate-100 ${
                        parentActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    >
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          expanded ? "rotate-90" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {expanded ? (
                    <ul className="mt-0.5 space-y-0.5 pl-9 pr-2">
                      {item.children.map((child) => {
                        const childActive = isChildActive(child);

                        return (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              onClick={onClose}
                              className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                                childActive
                                  ? "bg-slate-100 font-semibold text-slate-900"
                                  : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                              }`}
                            >
                              <span
                                className={`h-1 w-1 shrink-0 rounded-full ${
                                  childActive
                                    ? "bg-blue-600"
                                    : "bg-slate-300"
                                }`}
                                aria-hidden="true"
                              />
                              {child.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            }

            /* ---- Simple link (Dashboard, Reviews) ---- */
            const active = isParentActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-blue-50 font-semibold text-blue-700"
                    : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="shrink-0 border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              AR
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                Aisyah Rahman
              </p>
              <p className="truncate text-[11px] leading-tight text-slate-500">
                Shipping operations
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}