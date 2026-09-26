"use client";

import { LanguageProvider } from "@/features/i18n/language-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { ReportsProvider } from "@/features/reports/reports-provider";
import { NetworkProvider } from "@/features/offline/network-provider";
import { ToastProvider } from "@/components/ui/toast";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <ReportsProvider>
            <NetworkProvider>{children}</NetworkProvider>
          </ReportsProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
