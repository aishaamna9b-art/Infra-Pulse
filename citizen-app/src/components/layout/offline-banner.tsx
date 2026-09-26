"use client";

import { WifiOff } from "lucide-react";
import { useLanguage } from "@/features/i18n/language-provider";
import { useNetwork } from "@/features/offline/network-provider";

export function OfflineBanner() {
  const { online, syncing } = useNetwork();
  const { t } = useLanguage();

  if (online && !syncing) return null;

  return (
    <div
      role="status"
      className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950"
    >
      <span className="inline-flex items-center gap-2">
        {!online ? <WifiOff className="size-4" aria-hidden /> : null}
        {!online ? t.offline : t.syncing}
      </span>
    </div>
  );
}
