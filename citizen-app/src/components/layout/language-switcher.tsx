"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/features/i18n/language-provider";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const next = lang === "en" ? "ta" : "en";
  const label = lang === "en" ? t.switchToTamil : t.switchToEnglish;

  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon" : "sm"}
      onClick={() => setLang(next)}
      aria-label={label}
    >
      <Globe className="size-4" />
      {compact ? <span className="sr-only">{label}</span> : <span>{lang === "en" ? "தமிழ்" : "English"}</span>}
    </Button>
  );
}
