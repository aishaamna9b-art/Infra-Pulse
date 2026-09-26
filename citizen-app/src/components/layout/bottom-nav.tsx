"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Plus, User } from "lucide-react";
import { useLanguage } from "@/features/i18n/language-provider";
import { cn } from "@/lib/cn";

const items = [
  { href: "/home", key: "navHome", icon: Home },
  { href: "/report", key: "navReport", icon: Plus },
  { href: "/reports", key: "navStatus", icon: ClipboardList },
  { href: "/account", key: "navAccount", icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-2xl grid-cols-4 px-2 pt-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", item.href === "/report" && "rounded-full")} />
                {t[item.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
