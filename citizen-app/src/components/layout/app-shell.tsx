"use client";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OfflineBanner } from "@/components/layout/offline-banner";
import { useAuth } from "@/features/auth/auth-provider";
import { useLanguage } from "@/features/i18n/language-provider";
import { Spinner } from "@/components/ui/display";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, session } = useAuth();
  const { t } = useLanguage();

  if (!ready || !session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner label={t.loading} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pb-24">
      <OfflineBanner />
      <AppHeader />
      <div className="mx-auto w-full max-w-2xl px-4 py-6">{children}</div>
      <BottomNav />
    </div>
  );
}
