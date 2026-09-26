"use client";

import { useLanguage } from "@/features/i18n/language-provider";

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
    >
      {t.skipToContent}
    </a>
  );
}
