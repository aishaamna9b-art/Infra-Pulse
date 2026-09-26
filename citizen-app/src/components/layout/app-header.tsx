"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useLanguage } from "@/features/i18n/language-provider";

export function AppHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const title = pathname.startsWith("/reports")
    ? t.statusTitle
    : pathname.startsWith("/report")
      ? t.reportTitle
      : pathname.startsWith("/account") || pathname.startsWith("/help")
        ? t.accountTitle
        : t.brand;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <BrandMark className="bg-paper text-ink" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/70">
              {t.brandKicker}
            </p>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
        </div>
        <LanguageSwitcher compact />
      </div>
    </header>
  );
}
