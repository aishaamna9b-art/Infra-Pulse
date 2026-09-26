import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { StoredReport } from "@/types/report";

interface CitizenAppDB extends DBSchema {
  complaints: {
    key: string;
    value: StoredReport;
    indexes: { "by-sync-status": number };
  };
}

const DB_NAME = "infra-pulse-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<CitizenAppDB>> | null = null;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<CitizenAppDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("complaints")) {
          const store = db.createObjectStore("complaints", { keyPath: "id" });
          store.createIndex("by-sync-status", "synced");
        }
      },
    });
  }
  return dbPromise;
}

export async function saveReport(report: Omit<StoredReport, "synced"> & { synced?: 0 | 1 }) {
  const db = await initDB();
  const value: StoredReport = {
    ...report,
    synced: report.synced ?? 0,
  };
  await db.put("complaints", value);
  return value;
}

export async function getUnsyncedReports() {
  const db = await initDB();
  return db.getAllFromIndex("complaints", "by-sync-status", 0);
}

export async function getAllReports() {
  const db = await initDB();
  const reports = await db.getAll("complaints");
  return reports.sort((a, b) => b.timestamp - a.timestamp);
}

export async function getReport(id: string) {
  const db = await initDB();
  return db.get("complaints", id);
}

export async function markAsSynced(
  id: string,
  extras?: Pick<StoredReport, "backendReportId" | "masterTicketId" | "isDuplicate">,
) {
  const db = await initDB();
  const report = await db.get("complaints", id);
  if (!report) return;
  await db.put("complaints", {
    ...report,
    ...extras,
    synced: 1,
    lastError: undefined,
  });
}

export async function markSyncFailed(id: string, lastError: string) {
  const db = await initDB();
  const report = await db.get("complaints", id);
  if (!report) return;
  await db.put("complaints", { ...report, lastError });
}

export const getAllComplaints = getAllReports;
export const saveComplaint = saveReport;
export const getUnsyncedComplaints = getUnsyncedReports;
