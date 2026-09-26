"use client";

import { useCallback, useEffect, useRef, useMemo, useState, type ReactNode } from "react";
import { createContext, useContext } from "react";
import { useLanguage } from "@/features/i18n/language-provider";
import { useReports } from "@/features/reports/reports-provider";
import { useToast } from "@/components/ui/toast";
import { flushPendingReports } from "./sync";

type NetworkContextValue = {
  online: boolean;
  syncing: boolean;
  syncNow: () => Promise<void>;
};

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const { refresh } = useReports();
  const { notify } = useToast();
  const { t } = useLanguage();
  const tRef = useRef(t);
  tRef.current = t;

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    try {
      const result = await flushPendingReports();
      await refresh();
      if (result.sent > 0 && result.failed === 0) {
        notify({ title: tRef.current.syncedNow, tone: "success" });
      } else if (result.failed > 0) {
        notify({ title: tRef.current.syncFailed, tone: "danger" });
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [notify, refresh]);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (online) {
      void syncNow();
    }
  }, [online, syncNow]);

  const value = useMemo(
    () => ({ online, syncing, syncNow }),
    [online, syncing, syncNow],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
