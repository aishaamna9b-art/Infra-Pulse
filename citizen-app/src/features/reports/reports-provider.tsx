"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAllReports, saveReport } from "@/lib/db";
import type { StoredReport } from "@/types/report";

type ReportsContextValue = {
  reports: StoredReport[];
  ready: boolean;
  refresh: () => Promise<void>;
  upsert: (report: Omit<StoredReport, "synced"> & { synced?: 0 | 1 }) => Promise<StoredReport>;
};

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<StoredReport[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    let next = await getAllReports();
    
    // Fetch latest status for synced reports
    let updated = false;
    for (const report of next) {
      if (report.synced === 1 && report.masterTicketId) {
        try {
          const res = await fetch(`/api/v1/master_tickets/${report.masterTicketId}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data.status && data.status !== report.status) {
              report.status = data.status;
              await saveReport(report);
              updated = true;
            }
          }
        } catch (e) {
          console.error("Failed to fetch report status", e);
        }
      }
    }
    
    if (updated) {
      next = await getAllReports();
    }

    setReports(next);
    setReady(true);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const upsert = useCallback(
    async (report: Omit<StoredReport, "synced"> & { synced?: 0 | 1 }) => {
      const saved = await saveReport(report);
      await refresh();
      return saved;
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ reports, ready, refresh, upsert }),
    [ready, refresh, reports, upsert],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error("useReports must be used within ReportsProvider");
  }
  return context;
}
