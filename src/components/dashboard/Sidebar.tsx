"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  RxHome,
  RxCalendar,
  RxPerson,
  RxStar,
  RxFileText,
  RxBarChart,
  RxBell,
  RxGear,
  RxClock,
} from "react-icons/rx";
import type { ComponentType } from "react";
import type { BloomRole } from "@/lib/supabase/types";

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  roles?: BloomRole[];
}

const allItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: RxHome },
  { href: "/dashboard/reservierungen", label: "Reservierungen", icon: RxCalendar },
  { href: "/dashboard/gaeste", label: "Gäste", icon: RxPerson, roles: ["owner", "manager"] },
  { href: "/dashboard/schichten", label: "Schichten", icon: RxClock, roles: ["owner", "manager"] },
  { href: "/dashboard/events", label: "Events", icon: RxStar, roles: ["owner", "manager"] },
  { href: "/dashboard/content", label: "Inhalte", icon: RxFileText, roles: ["owner", "manager", "marketing"] },
  { href: "/dashboard/analytics", label: "Analytics", icon: RxBarChart, roles: ["owner", "manager"] },
  { href: "/dashboard/benachrichtigungen", label: "Benachrichtigungen", icon: RxBell, roles: ["owner", "manager"] },
  { href: "/dashboard/einstellungen", label: "Einstellungen", icon: RxGear, roles: ["owner", "manager"] },
];

function filterItems(role: BloomRole | null): NavItem[] {
  if (!role) return [];
  if (role === "owner" || role === "manager") return allItems;
  return allItems.filter((item) => !item.roles || item.roles.includes(role));
}

export function Sidebar({ role }: { role: BloomRole | null }) {
  const pathname = usePathname();
  const items = filterItems(role);
  return (
    <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 border-r border-border-soft bg-bloom-ink/80 backdrop-blur-md z-30">
      <div className="px-6 py-6 border-b border-border-soft">
        <Link href="/dashboard" className="flex items-center gap-3 font-display text-bloom-cream">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-bloom-ochre" />
          <div className="leading-tight">
            <div className="text-xl">Bloom OS</div>
            <div className="text-[0.6rem] uppercase tracking-[0.32em] text-text-muted">
              Hospitality
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((it) => {
          const active =
            it.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-input)] text-sm transition",
                active
                  ? "bg-surface-card text-bloom-cream border border-border-soft"
                  : "text-text-secondary hover:text-bloom-cream hover:bg-surface-card/60",
              )}
            >
              <Icon size={16} className="opacity-80" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-border-soft text-xs text-text-muted">
        <Link href="/" className="hover:text-bloom-cream">
          ← Zurück zur Webseite
        </Link>
      </div>
    </aside>
  );
}

export function MobileBottomNav({ role }: { role: BloomRole | null }) {
  const pathname = usePathname();
  const items = filterItems(role);
  const mobileItems = items.slice(0, role === "staff" ? 3 : 5);
  const gridCols = mobileItems.length === 3 ? "grid-cols-3" : "grid-cols-5";

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bloom-ink/95 backdrop-blur-md border-t border-border-soft">
      <ul className={cn("grid", gridCols)}>
        {mobileItems.map((it) => {
          const active =
            it.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(it.href);
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[0.6rem] uppercase tracking-[0.18em]",
                  active ? "text-bloom-ochre" : "text-text-muted",
                )}
              >
                <Icon size={18} />
                <span className="truncate">{it.label.slice(0, 7)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
